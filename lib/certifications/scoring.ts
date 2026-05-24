/**
 * Pure scoring helpers for certification quiz answers.
 *
 * Keeping these pure (no imports beyond pure language) means the
 * session route handlers can be tested without a database, and the
 * client can use the same comparison rules for optimistic UI hints
 * if it ever needs them.
 */

/** Normalize an answer set: trimmed, upper-cased, deduped, sorted. */
export function normalizeAnswers(values: string[]): string[] {
  const seen = new Set<string>();
  for (const v of values) {
    if (v == null) continue;
    const norm = v.trim().toUpperCase();
    if (norm.length > 0) seen.add(norm);
  }
  return [...seen].sort();
}

/**
 * True if the learner's selection matches the correct answer set
 * exactly. Order-insensitive and case-insensitive.
 */
export function isCorrectAnswer(selected: string[], correct: string[]): boolean {
  const a = normalizeAnswers(selected);
  const b = normalizeAnswers(correct);
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/** 0-100 score, rounded to 2 decimal places. */
export function scorePercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 10_000) / 100;
}

/** Convenience pass/fail check against a passing threshold (default 70%). */
export function didPass(score: number, passingPercent = 70): boolean {
  return score >= passingPercent;
}
