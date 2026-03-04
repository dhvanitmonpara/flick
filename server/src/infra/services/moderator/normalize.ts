export type NormalizeMode = "strict" | "normal";

export type NormalizedText = {
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

export const isWordChar = (char: string): boolean => WORD_CHAR_REGEX.test(char);

const mapStrictChar = (char: string): string => LEET_MAP[char] ?? char;

const decomposeChar = (char: string): string => char.normalize("NFKD").toLowerCase();

export function normalizeText(input: string, mode: NormalizeMode): NormalizedText {
  const normalizedChars: string[] = [];
  const indexMap: number[] = [];

  for (let originalIndex = 0; originalIndex < input.length; originalIndex++) {
    const sourceChar = input[originalIndex] ?? "";
    const decomposed = decomposeChar(sourceChar);

    for (const decomposedChar of decomposed) {
      if (COMBINING_MARK_REGEX.test(decomposedChar)) {
        continue;
      }

      if (mode === "strict") {
        if (STRICT_IGNORED_SEPARATORS.has(decomposedChar)) {
          continue;
        }

        const mapped = mapStrictChar(decomposedChar);
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
}

export function isBoundaryMatch(text: string, startInclusive: number, endExclusive: number): boolean {
  const prev = startInclusive > 0 ? text[startInclusive - 1] : "";
  const next = endExclusive < text.length ? text[endExclusive] : "";

  return (!prev || !isWordChar(prev)) && (!next || !isWordChar(next));
}
