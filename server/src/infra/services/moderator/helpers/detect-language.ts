import { franc } from "franc";

export function detectLanguage(text: string) {
  const lang = franc(text);

  if (lang === "eng") return "en";
  if (lang === "hin") return "hi";

  return "en";
}
