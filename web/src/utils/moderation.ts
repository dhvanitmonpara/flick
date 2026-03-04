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
};

type NormalizeMode = "strict" | "normal";

type NormalizedText = {
  normalized: string;
  indexMap: number[];
};

const LEET_MAP: Record<string, string> = {
  "@": "a",
  "4": "a",
  "3": "e",
  "1": "i",
  "!": "i",
  "0": "o",
  "$": "s",
  "5": "s",
  "+": "t",
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

const isBoundaryMatch = (text: string, startInclusive: number, endExclusive: number): boolean => {
  const prev = startInclusive > 0 ? text[startInclusive - 1] : "";
  const next = endExclusive < text.length ? text[endExclusive] : "";

  return (!prev || !isWordChar(prev)) && (!next || !isWordChar(next));
};

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

const compileMatcher = (config: { strictWords: string[]; normalWords: string[] }): CompiledMatcher => {
  const strictPatterns: PatternPayload[] = config.strictWords
    .map((word) => {
      const pattern = normalizeText(word, "strict").normalized;
      return {
        word,
        pattern,
        mode: "strict" as const,
      };
    })
    .filter((item) => item.pattern.length > 0);

  const normalPatterns: PatternPayload[] = config.normalWords
    .map((word) => {
      const pattern = normalizeText(word, "normal").normalized;
      return {
        word,
        pattern,
        mode: "normal" as const,
      };
    })
    .filter((item) => item.pattern.length > 0);

  return {
    strict: new AhoCorasick(strictPatterns),
    normal: new AhoCorasick(normalPatterns),
  };
};

export async function loadModerationConfig(): Promise<void> {
  const now = Date.now();
  if (matcher !== null && now - lastFetchTime < CACHE_TTL_MS) {
    return;
  }

  if (configPromise) {
    return configPromise;
  }

  configPromise = (async () => {
    try {
      const response = await moderationApi.getConfig();
      const data = response.data as { strictWords?: string[]; normalWords?: string[] };

      matcher = compileMatcher({
        strictWords: Array.isArray(data.strictWords) ? data.strictWords : [],
        normalWords: Array.isArray(data.normalWords) ? data.normalWords : [],
      });
      lastFetchTime = Date.now();
    } catch {
      if (!matcher) {
        matcher = compileMatcher({ strictWords: [], normalWords: [] });
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

const dedupeAndSort = (matches: ModerationMatch[]): ModerationMatch[] => {
  const seen = new Set<string>();
  const unique: ModerationMatch[] = [];

  for (const match of matches) {
    const key = `${match.word}:${match.start}:${match.end}`;
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(match);
  }

  unique.sort((a, b) => a.start - b.start || a.end - b.end);
  return unique;
};

export const moderateText = (text: string): ModerationResult => {
  if (!matcher) {
    return { allowed: true, matches: [] };
  }

  const strictNormalized = normalizeText(text, "strict");
  const normalNormalized = normalizeText(text, "normal");
  const found: ModerationMatch[] = [];

  for (const match of matcher.strict.search(strictNormalized.normalized)) {
    const start = strictNormalized.indexMap[match.start];
    const endIndex = strictNormalized.indexMap[match.end - 1];

    if (start === undefined || endIndex === undefined) {
      continue;
    }

    const end = endIndex + 1;
    if (!isBoundaryMatch(text, start, end)) {
      continue;
    }

    found.push({
      word: match.payload.word,
      start,
      end,
      mode: "strict",
    });
  }

  for (const match of matcher.normal.search(normalNormalized.normalized)) {
    const start = normalNormalized.indexMap[match.start];
    const endIndex = normalNormalized.indexMap[match.end - 1];

    if (start === undefined || endIndex === undefined) {
      continue;
    }

    const end = endIndex + 1;
    if (!isBoundaryMatch(text, start, end)) {
      continue;
    }

    found.push({
      word: match.payload.word,
      start,
      end,
      mode: "normal",
    });
  }

  const matches = dedupeAndSort(found);

  return {
    allowed: matches.length === 0,
    matches,
  };
};

export const validateText = (text: string): { allowed: boolean; reason?: string; matches: ModerationMatch[] } => {
  const result = moderateText(text);
  if (result.allowed) {
    return { allowed: true, matches: [] };
  }

  return {
    allowed: false,
    matches: result.matches,
    reason: `contains banned word(s): ${result.matches.map((match) => match.word).join(", ")}`,
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
      parts.push({
        value: text.slice(cursor, match.start),
        flagged: false,
        key: `plain-${cursor}`,
      });
    }

    parts.push({
      value: text.slice(match.start, match.end),
      flagged: true,
      key: `flag-${match.start}-${match.end}`,
    });

    cursor = match.end;
  }

  if (cursor < text.length) {
    parts.push({
      value: text.slice(cursor),
      flagged: false,
      key: `plain-${cursor}`,
    });
  }

  return parts;
};

export const censorText = (text: string): string => {
  const result = moderateText(text);
  if (result.allowed) {
    return text;
  }
  return splitTextByMatches(text, result.matches)
    .map((part) => (part.flagged ? "*".repeat(part.value.length) : part.value))
    .join("");
};
