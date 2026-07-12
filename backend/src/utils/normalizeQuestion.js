/**
 * Normalizes user questions for reliable cache matching and database lookups.
 * Trims spaces, strips excessive punctuation, and formats queries to lowercase.
 */
export function normalizeQuestion(question) {
  if (!question) return '';
  return question
    .trim()
    .toLowerCase()
    .replace(/[?,.:;!'"()]/g, '') // Strip punctuation
    .replace(/\s+/g, ' ');       // Collapse multiple spaces
}
