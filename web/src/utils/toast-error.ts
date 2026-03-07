import { AxiosError } from "axios";
import { toast } from "sonner";

function getModerationToastMessage(data?: Record<string, any>): string | null {
  if (!data) return null;

  const code = String(data.code || "");
  const metaReasons = Array.isArray(data.meta?.reasons)
    ? data.meta.reasons.map(String)
    : [];
  const fieldReasons = Array.isArray(data.errors)
    ? data.errors.map((e: any) => String(e?.message || ""))
    : [];
  const reasonsText = [...metaReasons, ...fieldReasons].join(" ").toUpperCase();
  const isModerationError =
    code === "CONTENT_MODERATION_VIOLATION" ||
    code === "CONTENT_POLICY_VIOLATION" ||
    /CONTENT VIOLATES MODERATION POLICY/i.test(String(data.message || ""));

  if (!isModerationError) return null;
  if (reasonsText.includes("SELF_HARM")) {
    return "We can’t allow content that encourages self-harm. If someone may be in immediate danger, contact local emergency services.";
  }
  if (reasonsText.includes("BANNED_WORDS")) {
    return "Your message contains blocked language. Please rephrase and avoid masked spellings.";
  }
  if (
    reasonsText.includes("TOXICITY") ||
    reasonsText.includes("INSULT") ||
    reasonsText.includes("THREAT") ||
    reasonsText.includes("IDENTITY_ATTACK") ||
    reasonsText.includes("PROFANITY")
  ) {
    return "Your message may violate our safety policy. Please remove harmful content and try again.";
  }

  return "This message violates our content policy. Please edit and try again.";
}

export function toastError(err: unknown, fallbackMessage: string) {
  if (err instanceof AxiosError) {
    const data = err.response?.data as Record<string, any> | undefined;
    toast.error(
      getModerationToastMessage(data) || data?.message || fallbackMessage,
    );
  } else if (err instanceof Error) {
    toast.error(err.message || fallbackMessage);
  } else {
    toast.error(fallbackMessage);
  }
  console.error("Error", err);
}
