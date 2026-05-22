/**
 * In-memory store + cache for generated WikiTests.
 *
 * Two indices for the same record:
 *   - by testId (stable, addressable URL)  → loaded on /learn/wiki/[testId]
 *   - by hash(url + lang + difficulty + format + count)  → 24h cache hit
 *
 * testId is itself the hash (deterministic), so the same inputs always
 * round-trip to the same URL. Two users asking for "Calculus · 10
 * intermediate MCQ" share the same generated test — zero LLM spend
 * on the second call.
 *
 * This module is intentionally process-local. For a multi-instance
 * deployment, swap the Maps for Redis with the same key shape and
 * the rest of the code is unchanged.
 */

import "server-only";
import { createHash } from "node:crypto";
import type { ArticleSection, Difficulty, Format, WikiTest } from "./types";

const TTL_MS = 24 * 60 * 60 * 1000;

/**
 * Internal record. The article sections live here so the Train page can
 * render the source text without re-fetching Wikipedia, but they are NOT
 * shipped on the public JSON API (which returns just WikiTest).
 */
export type StoredWikiTest = WikiTest & { sections: ArticleSection[] };

type Entry = { value: StoredWikiTest; expiresAt: number };

const byId = new Map<string, Entry>();

function gc(): void {
  const now = Date.now();
  for (const [k, v] of byId) {
    if (v.expiresAt <= now) byId.delete(k);
  }
}

export type CacheKeyInput = {
  url: string;
  lang: string;
  difficulty: Difficulty;
  format: Format;
  count: number;
};

/**
 * Stable hash for both the cache lookup AND the public testId. Keeping
 * them equal means the same inputs deduplicate across users.
 */
export function hashKey(input: CacheKeyInput): string {
  const canonical = `${input.url}|${input.lang}|${input.difficulty}|${input.format}|${input.count}`;
  return createHash("sha256").update(canonical).digest("hex").slice(0, 24);
}

/** Public-shape lookup — strips internal sections before returning. */
export function getCachedTest(id: string): WikiTest | null {
  const full = getStoredTest(id);
  if (!full) return null;
  const { sections: _sections, ...publicTest } = full;
  return publicTest;
}

/** Server-only lookup with full article sections for the Train page. */
export function getStoredTest(id: string): StoredWikiTest | null {
  gc();
  const hit = byId.get(id);
  if (!hit) return null;
  if (hit.expiresAt <= Date.now()) {
    byId.delete(id);
    return null;
  }
  return hit.value;
}

export function putCachedTest(test: StoredWikiTest): void {
  byId.set(test.id, { value: test, expiresAt: Date.now() + TTL_MS });
}

/** Diagnostics — exposed on a health endpoint later if needed. */
export function cacheStats(): { size: number } {
  gc();
  return { size: byId.size };
}
