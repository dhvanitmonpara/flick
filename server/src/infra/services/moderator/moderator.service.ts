import NodeCache from "node-cache";
import { franc } from "franc";
import { env } from "@/config/env";
import {
  getBannedWordsVersion,
  listBannedWords,
  type BannedWordRecord,
  type BannedWordSeverity,
} from "@/modules/moderation/words/words-moderation.repo";
import { AhoCorasick } from "./aho-corasick";
import { isBoundaryMatch, normalizeText } from "./normalize";

// --- Types ---

export type ModerationMatch = {
  word: string;
  start: number;
  end: number;
  severity: BannedWordSeverity;
};

export type ModerationViolation = {
  code: "CONTENT_MODERATION_VIOLATION" | "CONTENT_POLICY_VIOLATION";
  source: "dynamic" | "validator";
  matches: ModerationMatch[];
  reasons: string[];
};

export type IntegratedModerationResult = {
  allowed: boolean;
  violation: ModerationViolation | null;
};

type CompiledWord = {
  word: string;
  strictMode: boolean;
  severity: BannedWordSeverity;
  normalizedWord: string;
};

type CompiledModerationSet = {
  strictMatcher: AhoCorasick;
  normalMatcher: AhoCorasick;
  strictWords: CompiledWord[];
  normalWords: CompiledWord[];
};

// --- Cache & Constants ---

const moderationCache = new NodeCache({
  stdTTL: 3600, // 1 hour TTL
  maxKeys: 10000,
  useClones: false,
});

const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${env.PERSPECTIVE_API_KEY}`;

const THRESHOLDS: Record<string, number> = {
  TOXICITY: 0.8,
  INSULT: 0.7,
  IDENTITY_ATTACK: 0.6,
  THREAT: 0.4,
  PROFANITY: 0.6,
};

// --- Helpers ---

const dedupeAndSortMatches = (matches: ModerationMatch[]): ModerationMatch[] => {
  const seen = new Set<string>();
  const unique: ModerationMatch[] = [];

  for (const match of matches) {
    const key = `${match.word}:${match.start}:${match.end}`;
    if (seen.has(key)) continue;

    seen.add(key);
    unique.push(match);
  }

  unique.sort((a, b) => a.start - b.start || a.end - b.end);
  return unique;
};

const compileWords = (records: BannedWordRecord[]): CompiledModerationSet => {
  const strictWords: CompiledWord[] = [];
  const normalWords: CompiledWord[] = [];

  for (const entry of records) {
    const strictNormalized = normalizeText(entry.word, "strict").normalized;
    const normalNormalized = normalizeText(entry.word, "normal").normalized;

    if (entry.strictMode) {
      if (strictNormalized) {
        strictWords.push({
          word: entry.word,
          strictMode: true,
          severity: entry.severity,
          normalizedWord: strictNormalized,
        });
      }
    } else {
      if (normalNormalized) {
        normalWords.push({
          word: entry.word,
          strictMode: false,
          severity: entry.severity,
          normalizedWord: normalNormalized,
        });
      }
    }
  }

  return {
    strictWords,
    normalWords,
    strictMatcher: new AhoCorasick(
      strictWords.map((word) => ({
        word: word.word,
        severity: word.severity,
        strictMode: true,
        pattern: word.normalizedWord,
      }))
    ),
    normalMatcher: new AhoCorasick(
      normalWords.map((word) => ({
        word: word.word,
        severity: word.severity,
        strictMode: false,
        pattern: word.normalizedWord,
      }))
    ),
  };
};

export const moderateTextWithCompiled = (
  text: string,
  compiled: CompiledModerationSet
): { allowed: boolean; matches: ModerationMatch[] } => {
  const original = text ?? "";
  const strictNormalized = normalizeText(original, "strict");
  const normalNormalized = normalizeText(original, "normal");

  const detectedMatches: ModerationMatch[] = [];

  const extractMatches = (matcher: AhoCorasick, normalized: ReturnType<typeof normalizeText>) => {
    const matches = matcher.search(normalized.normalized);
    for (const match of matches) {
      const startOriginal = normalized.indexMap[match.start];
      const endOriginalIndex = normalized.indexMap[match.end - 1];

      if (startOriginal === undefined || endOriginalIndex === undefined) continue;

      const endOriginal = endOriginalIndex + 1;
      if (!isBoundaryMatch(original, startOriginal, endOriginal)) continue;

      detectedMatches.push({
        word: match.payload.word,
        start: startOriginal,
        end: endOriginal,
        severity: match.payload.severity,
      });
    }
  };

  extractMatches(compiled.strictMatcher, strictNormalized);
  extractMatches(compiled.normalMatcher, normalNormalized);

  const matches = dedupeAndSortMatches(detectedMatches);

  return {
    allowed: matches.length === 0,
    matches,
  };
};

function isSpam(text: string) {
  if (text.length > 5000) return true;

  const links = (text.match(/https?:\/\//g) || []).length;
  if (links > 3) return true;

  const repeated = /(.)\1{8,}/;
  if (repeated.test(text)) return true;

  return false;
}

function normalizeValidationContent(text: string): string {
  return text
    .toLowerCase()
    .replace(/[!1]/g, "i")
    .replace(/[@4]/g, "a")
    .replace(/\$/g, "s")
    .replace(/0/g, "o")
    .replace(/\s+/g, " ")
    .trim();
}

function detectLanguage(text: string) {
  const lang = franc(text);
  if (lang === "eng") return "en";
  if (lang === "hin") return "hi";
  return "en";
}

// --- Main Service ---

class ModeratorService {
  private compiled: CompiledModerationSet | null = null;
  private loadingPromise: Promise<void> | null = null;
  private cachedVersion: Date | null = null;
  private lastVersionCheck = 0;
  private readonly versionCheckIntervalMs = 30_000;

  private async buildMatcherFromDatabase(): Promise<void> {
    const words = await listBannedWords();
    this.compiled = compileWords(words);
    this.cachedVersion = await getBannedWordsVersion();
    this.lastVersionCheck = Date.now();
  }

  private async ensureCompiled(): Promise<void> {
    if (!this.compiled) {
      if (!this.loadingPromise) {
        this.loadingPromise = this.buildMatcherFromDatabase().finally(() => {
          this.loadingPromise = null;
        });
      }
      await this.loadingPromise;
      return;
    }

    const now = Date.now();
    if (now - this.lastVersionCheck < this.versionCheckIntervalMs) {
      return;
    }

    this.lastVersionCheck = now;
    const dbVersion = await getBannedWordsVersion();
    const cachedTs = this.cachedVersion?.getTime() ?? 0;
    const dbTs = dbVersion?.getTime() ?? 0;

    if (dbTs !== cachedTs) {
      await this.buildMatcherFromDatabase();
    }
  }

  async rebuildMatcher(): Promise<void> {
    await this.buildMatcherFromDatabase();
  }

  private async validateContent(content: string): Promise<{ allowed: boolean; reasons: string[] }> {
    if (!content || !content.trim()) return { allowed: true, reasons: [] };

    const normalized = normalizeValidationContent(content);

    const cached = moderationCache.get<{ allowed: boolean; reasons: string[] }>(normalized);
    if (cached) return cached;

    if (isSpam(normalized)) {
      return { allowed: false, reasons: ["SPAM"] };
    }

    const selfHarmRegex = /\b(kys|kill\s*(yourself|urself)|go\s*die|commit\s*suicide|end\s*your\s*life)\b/i;
    if (selfHarmRegex.test(normalized)) {
      return { allowed: false, reasons: ["SELF_HARM_ENCOURAGEMENT"] };
    }

    const language = detectLanguage(normalized);

    const body = {
      comment: { text: normalized },
      doNotStore: true,
      languages: [language],
      spanAnnotations: true,
      requestedAttributes: {
        TOXICITY: {},
        INSULT: {},
        IDENTITY_ATTACK: {},
        THREAT: {},
        PROFANITY: {},
      },
    };

    let data: any;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(PERSPECTIVE_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        // Fail-closed behavior on API error as originally implemented
        return { allowed: false, reasons: ["moderation service error"] };
      }

      data = await res.json();
    } catch (err) {
      console.error("Perspective API error:", err);
      // Fail-closed behavior
      return { allowed: false, reasons: ["moderation service unavailable"] };
    }

    const scores = data.attributeScores as Record<string, { summaryScore?: { value: number } }>;
    const spans: Array<{ start: number; end: number; attribute: string }> = (data.spanAnnotations || []).map(
      (a: any) => ({
        start: a.span.start,
        end: a.span.end,
        attribute: a.attributeType,
      })
    );

    const reasons: string[] = [];
    const personalPronouns = /\b(you|your|tum|tera|teri|tumhara|tumhari|aap)\b/i;
    const mentionRegex = /@\w+/;

    if (scores) {
      for (const [attr, info] of Object.entries(scores)) {
        if (!info?.summaryScore) continue;
        const score = info.summaryScore.value;
        const threshold = THRESHOLDS[attr] ?? 1;

        if (score < threshold) continue;

        if (attr === "INSULT") {
          let targeted = false;

          for (const span of spans.filter((s) => s.attribute === "INSULT")) {
            const ctxStart = Math.max(0, span.start - 30);
            const ctxEnd = Math.min(normalized.length, span.end + 30);
            const snippet = normalized.slice(ctxStart, ctxEnd);

            if (personalPronouns.test(snippet) || mentionRegex.test(snippet)) {
              targeted = true;
              break;
            }
          }

          if (!targeted) continue;
        }

        reasons.push(`${attr} (${(score * 100).toFixed(0)}%)`);
      }
    }

    const result = { allowed: reasons.length === 0, reasons };
    moderationCache.set(normalized, result);
    return result;
  }

  async moderateText(input: {
    text: string;
    contextText?: string;
    runValidator?: boolean;
  }): Promise<IntegratedModerationResult> {
    const text = input.text ?? "";
    const contextText = input.contextText ?? text;
    const runValidator = input.runValidator ?? true;

    await this.ensureCompiled();

    if (this.compiled) {
      const dynamicResult = moderateTextWithCompiled(contextText, this.compiled);
      if (!dynamicResult.allowed) {
        const words = Array.from(new Set(dynamicResult.matches.map((match) => match.word)));
        return {
          allowed: false,
          violation: {
            code: "CONTENT_MODERATION_VIOLATION",
            source: "dynamic",
            matches: dynamicResult.matches,
            reasons: words.length > 0 ? [`BANNED_WORDS: ${words.join(", ")}`] : ["BANNED_WORDS"],
          },
        };
      }
    }

    if (!runValidator) {
      return { allowed: true, violation: null };
    }

    const validatorResult = await this.validateContent(text);
    if (!validatorResult.allowed) {
      return {
        allowed: false,
        violation: {
          code: "CONTENT_POLICY_VIOLATION",
          source: "validator",
          matches: [],
          reasons: validatorResult.reasons ?? ["CONTENT_POLICY_VIOLATION"],
        },
      };
    }

    return { allowed: true, violation: null };
  }
}

export const moderatorService = new ModeratorService();
export default moderatorService;
export const compileModerationConfig = compileWords;
