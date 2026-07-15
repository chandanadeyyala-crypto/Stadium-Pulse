export function normalizeQuestion(question) {
  if (!question) return '';
  return question
    .trim()
    .toLowerCase()
    .replace(/[?,.:;!'"()]/g, '')
    .replace(/\s+/g, ' ');
}
