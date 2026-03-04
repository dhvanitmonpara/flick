export function isSpam(text: string) {
  if (text.length > 5000) return true;

  const links = (text.match(/https?:\/\//g) || []).length;
  if (links > 3) return true;

  const repeated = /(.)\1{8,}/;
  if (repeated.test(text)) return true;

  return false;
}