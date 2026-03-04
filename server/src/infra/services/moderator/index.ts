import { env } from "@/config/env";
import { ValidationResult } from "./types";
import { detectLanguage, isSpam, normalizeContent } from "./helpers";
import { THRESHOLDS } from "./thresholds";

const PERSPECTIVE_API_URL = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${env.PERSPECTIVE_API_KEY}`;
const moderationCache = new Map<string, ValidationResult>();

export async function validateContent(
  content: string
): Promise<ValidationResult> {
  if (!content || !content.trim()) {
    return { allowed: true };
  }

  const normalized = normalizeContent(content);

  if (moderationCache.has(normalized)) {
    return moderationCache.get(normalized)!;
  }

  if (isSpam(normalized)) {
    return { allowed: false, reasons: ["SPAM"] };
  }

  const selfHarmRegex =
    /\b(kys|kill\s*(yourself|urself)|go\s*die|commit\s*suicide|end\s*your\s*life)\b/i;

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
      return { allowed: false, reasons: ["moderation service error"] };
    }

    data = await res.json();
  } catch (err) {
    console.error("Perspective API error:", err);
    return { allowed: false, reasons: ["moderation service unavailable"] };
  }

  const scores = data.attributeScores as Record<
    string,
    { summaryScore: { value: number } }
  >;

  const spans: Array<{ start: number; end: number; attribute: string }> = (
    data.spanAnnotations || []
  ).map((a: any) => ({
    start: a.span.start,
    end: a.span.end,
    attribute: a.attributeType,
  }));

  const reasons: string[] = [];

  const personalPronouns =
    /\b(you|your|tum|tera|teri|tumhara|tumhari|aap)\b/i;

  const mentionRegex = /@\w+/;

  for (const [attr, info] of Object.entries(scores)) {
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

  const result = { allowed: reasons.length === 0, reasons }
  moderationCache.set(normalized, result);

  return result;
}