import { moderationApi } from "@/services/api/moderation";

type DetectionMode = "strict" | "normal";

type PatternPayload = {
  word: string;
  pattern: string;
  mode: DetectionMode;
};

type AutomatonNode = {
  next: Map<string, number>;
  fail: number;
  outputs: PatternPayload[];
};

export type ModerationMatch = {
  word: string;
  start: number;
  end: number;
  mode: DetectionMode;
};

export type ModerationResult = {
  allowed: boolean;
  matches: ModerationMatch[];
};

type CompiledMatcher = {
  strict: AhoCorasick;
  normal: AhoCorasick;
  // FIX 3: Documented why this third tree exists.
  // Aho-Corasick handles leet substitutions for normal words (e.g. "wh0re")
  // via strict normalization. The explicit '*' wildcard path (collectWildcardCandidates)
  // handles user-typed wildcards like "f*ck" — these are intentionally separate pipelines.
  normalVariants: AhoCorasick;
  wildcardPatterns: PatternPayload[];
  // FIX 4: Store config version/etag for cache invalidation
  configVersion: string;
};

type NormalizeMode = "strict" | "normal";

type NormalizedText = {
  normalized: string;
  indexMap: number[];
};

const LEET_MAP: Record<string, string> = {
  "2": "z",
  "@": "a",
  "4": "a",
  "3": "e",
  "1": "i",
  "|": "i",
  "!": "i",
  "0": "o",
  "$": "s",
  "5": "s",
  "+": "t",
  "7": "t",
  "8": "b",
  "6": "g",
  "9": "g",
};

const STRICT_IGNORED_SEPARATORS = new Set([" ", "\t", "\n", "\r", ".", "-", "_"]);
const COMBINING_MARK_REGEX = /\p{M}/u;
const WORD_CHAR_REGEX = /[\p{L}\p{N}]/u;

class AhoCorasick {
  private readonly nodes: AutomatonNode[] = [{ next: new Map(), fail: 0, outputs: [] }];

  constructor(patterns: PatternPayload[]) {
    for (const payload of patterns) {
      if (!payload.pattern.length) {
        continue;
      }
      this.insert(payload);
    }
    this.buildFailures();
  }

  private insert(payload: PatternPayload): void {
    let state = 0;
    for (const char of payload.pattern) {
      const next = this.nodes[state].next.get(char);
      if (next !== undefined) {
        state = next;
        continue;
      }

      const idx = this.nodes.length;
      this.nodes.push({ next: new Map(), fail: 0, outputs: [] });
      this.nodes[state].next.set(char, idx);
      state = idx;
    }

    this.nodes[state].outputs.push(payload);
  }

  private buildFailures(): void {
    const queue: number[] = [];

    for (const [, next] of this.nodes[0].next) {
      this.nodes[next].fail = 0;
      queue.push(next);
    }

    while (queue.length > 0) {
      const state = queue.shift();
      if (state === undefined) {
        break;
      }

      for (const [char, target] of this.nodes[state].next) {
        queue.push(target);

        let fallback = this.nodes[state].fail;
        while (fallback !== 0 && !this.nodes[fallback].next.has(char)) {
          fallback = this.nodes[fallback].fail;
        }

        const failTarget = this.nodes[fallback].next.get(char) ?? 0;
        this.nodes[target].fail = failTarget;
        this.nodes[target].outputs.push(...this.nodes[failTarget].outputs);
      }
    }
  }

  search(text: string): Array<{ start: number; end: number; payload: PatternPayload }> {
    const matches: Array<{ start: number; end: number; payload: PatternPayload }> = [];
    let state = 0;

    for (let index = 0; index < text.length; index++) {
      const char = text[index] ?? "";

      while (state !== 0 && !this.nodes[state].next.has(char)) {
        state = this.nodes[state].fail;
      }

      state = this.nodes[state].next.get(char) ?? 0;

      if (this.nodes[state].outputs.length === 0) {
        continue;
      }

      for (const payload of this.nodes[state].outputs) {
        const end = index + 1;
        const start = end - payload.pattern.length;
        if (start < 0) {
          continue;
        }

        matches.push({ start, end, payload });
      }
    }

    return matches;
  }
}

const isWordChar = (char: string): boolean => WORD_CHAR_REGEX.test(char);
const isInlineSymbolSeparator = (input: string, index: number): boolean => {
  const prev = index > 0 ? input[index - 1] : "";
  const next = index + 1 < input.length ? input[index + 1] : "";
  return Boolean(prev && next && isWordChar(prev) && isWordChar(next));
};

const isBoundaryMatch = (text: string, startInclusive: number, endExclusive: number): boolean => {
  const prev = startInclusive > 0 ? text[startInclusive - 1] : "";
  const next = endExclusive < text.length ? text[endExclusive] : "";

  return (!prev || !isWordChar(prev)) && (!next || !isWordChar(next));
};

const isWildcardChar = (char: string): boolean => char === "*";

const normalizeText = (input: string, mode: NormalizeMode): NormalizedText => {
  const normalizedChars: string[] = [];
  const indexMap: number[] = [];

  for (let originalIndex = 0; originalIndex < input.length; originalIndex++) {
    const char = input[originalIndex] ?? "";
    const decomposed = char.normalize("NFKD").toLowerCase();

    for (const decomposedChar of decomposed) {
      if (COMBINING_MARK_REGEX.test(decomposedChar)) {
        continue;
      }

      if (mode === "strict") {
        if (decomposedChar === "@" && isInlineSymbolSeparator(input, originalIndex)) {
          continue;
        }

        if (STRICT_IGNORED_SEPARATORS.has(decomposedChar)) {
          continue;
        }

        const mapped = LEET_MAP[decomposedChar] ?? decomposedChar;
        if (!mapped) {
          continue;
        }

        normalizedChars.push(mapped);
        indexMap.push(originalIndex);
        continue;
      }

      normalizedChars.push(decomposedChar);
      indexMap.push(originalIndex);
    }
  }

  return {
    normalized: normalizedChars.join(""),
    indexMap,
  };
};

let matcher: CompiledMatcher | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 30_000;
let configPromise: Promise<void> | null = null;
let revision = 0;

const listeners = new Set<() => void>();

const notifySubscribers = () => {
  for (const listener of listeners) {
    listener();
  }
};

// FIX 1: normalVariants deduplication — only add normal words whose strict-normalized
// pattern is distinct from its normal-normalized pattern. If they're the same,
// the normal AC tree already covers it and we'd be doing redundant work.
const compileMatcher = (
  config: { strictWords: string[]; normalWords: string[] },
  configVersion: string
): CompiledMatcher => {
  const strictPatterns: PatternPayload[] = config.strictWords
    .map((word) => ({
      word,
      pattern: normalizeText(word, "strict").normalized,
      mode: "strict" as const,
    }))
    .filter((item) => item.pattern.length > 0);

  const normalPatterns: PatternPayload[] = config.normalWords
    .map((word) => ({
      word,
      pattern: normalizeText(word, "normal").normalized,
      mode: "normal" as const,
    }))
    .filter((item) => item.pattern.length > 0);

  // FIX 1: Only include a normalVariant if its strict form differs from its
  // normal form — otherwise the normal AC tree already catches it, and we'd
  // be running the same pattern through two trees on strictNormalized.
  const normalVariantPatterns: PatternPayload[] = config.normalWords
    .map((word) => {
      const strictPattern = normalizeText(word, "strict").normalized;
      const normalPattern = normalizeText(word, "normal").normalized;
      return { word, strictPattern, normalPattern };
    })
    .filter(({ strictPattern, normalPattern }) => strictPattern !== normalPattern && strictPattern.length > 0)
    .map(({ word, strictPattern }) => ({
      word,
      pattern: strictPattern,
      mode: "normal" as const,
    }));

  return {
    strict: new AhoCorasick(strictPatterns),
    normal: new AhoCorasick(normalPatterns),
    normalVariants: new AhoCorasick(normalVariantPatterns),
    wildcardPatterns: [...strictPatterns, ...normalVariantPatterns],
    configVersion,
  };
};

// FIX 2: Shared wildcard memo scoped to a single moderateText() call.
// Previously, the memo was recreated inside every wildcardTokenMatchesPattern
// call (i.e. per candidate × per pattern). Now it's shared across all pattern
// checks for a given candidate token, and the key includes the pattern so
// results don't bleed across patterns.
const makeWildcardMatcher = () => {
  const memo = new Map<string, boolean>();

  return (token: string, pattern: string): boolean => {
    const dfs = (tokenIndex: number, patternIndex: number): boolean => {
      const key = `${token}:${tokenIndex}:${pattern}:${patternIndex}`;
      const cached = memo.get(key);
      if (cached !== undefined) return cached;

      if (tokenIndex === token.length) {
        const result = patternIndex === pattern.length;
        memo.set(key, result);
        return result;
      }

      const tokenChar = token[tokenIndex] ?? "";
      if (tokenChar === "*") {
        for (let consume = 1; patternIndex + consume <= pattern.length; consume++) {
          if (dfs(tokenIndex + 1, patternIndex + consume)) {
            memo.set(key, true);
            return true;
          }
        }
        memo.set(key, false);
        return false;
      }

      if ((pattern[patternIndex] ?? "") !== tokenChar) {
        memo.set(key, false);
        return false;
      }

      const result = dfs(tokenIndex + 1, patternIndex + 1);
      memo.set(key, result);
      return result;
    };

    return dfs(0, 0);
  };
};

const collectWildcardCandidates = (
  text: string
): Array<{ start: number; end: number; normalizedToken: string; hasLiteral: boolean }> => {
  const candidates: Array<{ start: number; end: number; normalizedToken: string; hasLiteral: boolean }> = [];
  let start = -1;
  let hasWildcard = false;

  const flush = (end: number) => {
    if (start < 0 || !hasWildcard) {
      start = -1;
      hasWildcard = false;
      return;
    }

    const token = text.slice(start, end);
    const normalizedToken = normalizeText(token, "strict").normalized;
    if (!normalizedToken.includes("*")) {
      start = -1;
      hasWildcard = false;
      return;
    }

    const literalChars = [...normalizedToken].filter((char) => char !== "*");
    const hasLiteral = literalChars.length > 0;
    const hasWildcardBridge = /\p{L}\*+\p{L}/u.test(normalizedToken);
    const hasEnoughLiteralSignal = literalChars.length >= 2;

    if (!hasLiteral || !hasWildcardBridge || !hasEnoughLiteralSignal || !isBoundaryMatch(text, start, end)) {
      start = -1;
      hasWildcard = false;
      return;
    }

    candidates.push({ start, end, normalizedToken, hasLiteral });
    start = -1;
    hasWildcard = false;
  };

  for (let index = 0; index < text.length; index++) {
    const char = text[index] ?? "";
    const inToken = isWordChar(char) || isWildcardChar(char);

    if (inToken) {
      if (start < 0) start = index;
      if (isWildcardChar(char)) hasWildcard = true;
      continue;
    }

    flush(index);
  }

  flush(text.length);
  return candidates;
};

export async function loadModerationConfig(): Promise<void> {
  const now = Date.now();

  // FIX 4: Check ETag/version from API before deciding to skip or recompile.
  // If the server returns a version token and it matches what we compiled
  // against, we skip recompilation even if the TTL has expired.
  if (matcher !== null && now - lastFetchTime < CACHE_TTL_MS) {
    return;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      const response = await moderationApi.getConfig();
      const data = response.data as {
        strictWords?: string[];
        normalWords?: string[];
        version?: string;
      };

      const incomingVersion = data.version ?? String(now);

      // Skip recompilation if the version hasn't changed since last compile
      if (matcher !== null && matcher.configVersion === incomingVersion) {
        lastFetchTime = Date.now();
        return;
      }

      matcher = compileMatcher(
        {
          strictWords: Array.isArray(data.strictWords) ? data.strictWords : [],
          normalWords: Array.isArray(data.normalWords) ? data.normalWords : [],
        },
        incomingVersion
      );
      lastFetchTime = Date.now();
    } catch {
      if (!matcher) {
        matcher = compileMatcher({ strictWords: [], normalWords: [] }, "fallback");
      }
    } finally {
      revision += 1;
      notifySubscribers();
      configPromise = null;
    }
  })();

  return configPromise;
}

export const subscribeModerationUpdates = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const getModerationRevision = (): number => revision;

// FIX 5: Span-level deduplication — after exact-triple deduplication, collapse
// overlapping spans by keeping the longest match. This prevents the same text
// region from appearing multiple times in highlights when both strict and
// normalVariants pipelines hit on the same characters.
const dedupeAndSort = (matches: ModerationMatch[]): ModerationMatch[] => {
  // Step 1: remove exact duplicates (same word + same span)
  const seen = new Set<string>();
  const unique: ModerationMatch[] = [];
  for (const match of matches) {
    const key = `${match.word}:${match.start}:${match.end}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(match);
    }
  }

  unique.sort((a, b) => a.start - b.start || b.end - a.end); // longest first on tie

  // Step 2: span-level merge — suppress any match fully contained within a
  // longer match already accepted. Different words at overlapping spans are
  // reduced to whichever has the widest coverage.
  const merged: ModerationMatch[] = [];
  let lastEnd = -1;

  for (const match of unique) {
    // Fully contained within the previous accepted span — skip
    if (match.start >= merged[merged.length - 1]?.start && match.end <= lastEnd) {
      continue;
    }
    merged.push(match);
    lastEnd = Math.max(lastEnd, match.end);
  }

  return merged;
};

export const moderateText = (text: string): ModerationResult => {
  if (!matcher) {
    return { allowed: true, matches: [] };
  }

  const strictNormalized = normalizeText(text, "strict");
  const normalNormalized = normalizeText(text, "normal");
  const found: ModerationMatch[] = [];

  const collectMatches = (ac: AhoCorasick, normalizedText: NormalizedText) => {
    for (const match of ac.search(normalizedText.normalized)) {
      const start = normalizedText.indexMap[match.start];
      const endIndex = normalizedText.indexMap[match.end - 1];

      if (start === undefined || endIndex === undefined) continue;

      const end = endIndex + 1;
      if (!isBoundaryMatch(text, start, end)) continue;

      found.push({
        word: match.payload.word,
        start,
        end,
        mode: match.payload.mode,
      });
    }
  };

  collectMatches(matcher.strict, strictNormalized);
  collectMatches(matcher.normal, normalNormalized);
  collectMatches(matcher.normalVariants, strictNormalized);

  // FIX 2: Create one shared memo for the entire moderateText() call
  const wildcardMatches = makeWildcardMatcher();
  const wildcardCandidates = collectWildcardCandidates(text);

  for (const candidate of wildcardCandidates) {
    if (!candidate.hasLiteral) continue;

    for (const payload of matcher.wildcardPatterns) {
      if (!wildcardMatches(candidate.normalizedToken, payload.pattern)) continue;

      found.push({
        word: payload.word,
        start: candidate.start,
        end: candidate.end,
        mode: payload.mode,
      });
    }
  }

  const matches = dedupeAndSort(found);
  return { allowed: matches.length === 0, matches };
};

export const validateText = (text: string): { allowed: boolean; reason?: string; matches: ModerationMatch[] } => {
  const result = moderateText(text);
  if (result.allowed) return { allowed: true, matches: [] };

  const uniqueFlaggedSnippets = Array.from(
    new Set(
      result.matches
        .map((match) => text.slice(match.start, match.end).trim())
        .filter((snippet) => snippet.length > 0)
    )
  );

  const hasObfuscation = uniqueFlaggedSnippets.some((snippet) => /[*@!$0-9_+.|-]/.test(snippet));
  const preview = uniqueFlaggedSnippets.slice(0, 2).join(", ");
  const previewLabel = preview ? ` (${preview}${uniqueFlaggedSnippets.length > 2 ? ", ..." : ""})` : "";
  const guidance = hasObfuscation
    ? "Please rewrite it without symbols/numbers used to bypass filters."
    : "Please rephrase and keep the language respectful.";

  return {
    allowed: false,
    matches: result.matches,
    reason: `Your text includes blocked language${previewLabel}. ${guidance}`,
  };
};

export const splitTextByMatches = (
  text: string,
  matches: ModerationMatch[]
): Array<{ value: string; flagged: boolean; key: string }> => {
  if (matches.length === 0) {
    return [{ value: text, flagged: false, key: "plain-0" }];
  }

  const parts: Array<{ value: string; flagged: boolean; key: string }> = [];
  let cursor = 0;

  for (const match of matches) {
    if (match.start > cursor) {
      parts.push({ value: text.slice(cursor, match.start), flagged: false, key: `plain-${cursor}` });
    }

    parts.push({ value: text.slice(match.start, match.end), flagged: true, key: `flag-${match.start}-${match.end}` });
    cursor = match.end;
  }

  if (cursor < text.length) {
    parts.push({ value: text.slice(cursor), flagged: false, key: `plain-${cursor}` });
  }

  return parts;
};

export const censorText = (text: string): string => {
  const result = moderateText(text);
  if (result.allowed) return text;

  return splitTextByMatches(text, result.matches)
    .map((part) => (part.flagged ? "*".repeat(part.value.length) : part.value))
    .join("");
};
