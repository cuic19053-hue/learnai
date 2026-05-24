/**
 * Full-quiz in-memory cache. The complement to the per-chunk cache
 * in `generate.ts`: when the same source + config is requested
 * again (even with a fresh job id) we short-circuit and return the
 * already-built quiz.
 *
 * Same single-instance trade-off as the rest of the module —
 * swap for Redis when going multi-instance, with the same key shape.
 */

import "server-only";
import type { CanonicalQuiz } from "../types";

const TTL_MS = 24 * 60 * 60 * 1000;

type Entry = { quiz: CanonicalQuiz; expiresAt: number };

const cache = new Map<string, Entry>();

function gc(): void {
  const now = Date.now();
  for (const [k, v] of cache) if (v.expiresAt <= now) cache.delete(k);
}

export function getCachedQuiz(id: string): CanonicalQuiz | undefined {
  gc();
  return cache.get(id)?.quiz;
}

export function putCachedQuiz(quiz: CanonicalQuiz): void {
  gc();
  cache.set(quiz.id, { quiz, expiresAt: Date.now() + TTL_MS });
}

export function quizCacheStats(): { count: number } {
  gc();
  return { count: cache.size };
}
