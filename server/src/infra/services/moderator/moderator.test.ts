import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compileModerationConfig, moderateTextWithCompiled } from "./moderator.service";
import { normalizeText } from "./normalize";

const buildWord = (
  word: string,
  strictMode: boolean,
  severity: "mild" | "moderate" | "severe" = "moderate"
) => ({
  id: crypto.randomUUID(),
  word,
  strictMode,
  severity,
  createdAt: new Date(),
  updatedAt: new Date(),
});

describe("normalizeText", () => {
  it("removes separators and resolves leetspeak in strict mode with index map", () => {
    const normalized = normalizeText("k.i-l_l", "strict");
    assert.equal(normalized.normalized, "kill");
    assert.equal(normalized.indexMap.length, 4);
    assert.equal(normalized.indexMap[0], 0);
  });

  it("keeps exact characters in normal mode", () => {
    const normalized = normalizeText("k1ll", "normal");
    assert.equal(normalized.normalized, "k1ll");
  });
});

describe("moderation matcher", () => {
  const compiled = compileModerationConfig([
    buildWord("kill", true, "moderate"),
    buildWord("ass", false, "mild"),
  ]);

  const detectedCases = ["kill him", "k1ll him", "k.i.l.l him", "k i l l him"];

  for (const input of detectedCases) {
    it(`detects strict obfuscation for: ${input}`, () => {
      const result = moderateTextWithCompiled(input, compiled);
      assert.equal(result.allowed, false);
      assert.equal(result.matches.some((match) => match.word === "kill"), true);
    });
  }

  it("does not trigger false positive for assistant", () => {
    const result = moderateTextWithCompiled("assistant", compiled);
    assert.equal(result.allowed, true);
  });

  it("does not trigger false positive for passion", () => {
    const result = moderateTextWithCompiled("passion", compiled);
    assert.equal(result.allowed, true);
  });

  it("does not trigger false positive for skillful", () => {
    const result = moderateTextWithCompiled("skillful", compiled);
    assert.equal(result.allowed, true);
  });

  it("keeps normal-mode words exact only", () => {
    const normalOnlyCompiled = compileModerationConfig([buildWord("bitch", false, "mild")]);

    assert.equal(moderateTextWithCompiled("you are a bitch", normalOnlyCompiled).allowed, false);
    assert.equal(moderateTextWithCompiled("you are a b1tch", normalOnlyCompiled).allowed, true);
    assert.equal(moderateTextWithCompiled("you are a b.i.t.c.h", normalOnlyCompiled).allowed, true);
  });
});
