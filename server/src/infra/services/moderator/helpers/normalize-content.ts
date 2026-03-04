export function normalizeContent(text: string): string {
  return text
    .toLowerCase()
    .replace(/[!1]/g, "i")
    .replace(/[@4]/g, "a")
    .replace(/\$/g, "s")
    .replace(/0/g, "o")
    .replace(/\s+/g, " ")
    .trim();
}
