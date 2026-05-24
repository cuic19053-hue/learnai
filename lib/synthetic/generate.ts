/**
 * Per-chunk generator — wraps one LLM call, validates the response
 * with zod, and returns the raw `SynthQuestion[]` for the chunk.
 *
 * Filtering (citation integrity, dedup, length sanity) is deliberately
 * NOT done here — that's the runner's job, because dedup is stateful
 * across chunks. This keeps `generateForChunk` pure-ish: same input
 * (cached) returns the same output.
 *
 * The per-chunk cache key includes `PROMPT_VERSION` so cached answers
 * are invalidated cleanly when we change prompt semantics.
 */

import "server-only";
import { z } from "zod";
import { createHash } from "node:crypto";
import { AiProviderError, jsonChat } from "@/lib/ai/provider";
import { buildChunkPrompt, PROMPT_VERSION } from "./prompts";
import type { Chunk, QuizConfig, SynthQuestion } from "./types";

const RawQuestionSchema = z.object({
  kind: z.enum(["multiple_choice", "true_false", "short_answer"]),
  prompt: z.string().min(1).max(1_500),
  options: z.array(z.string().min(1).max(400)).max(8).optional(),
  correctIndex: z.number().int().min(0).max(7).optional(),
  expectedAnswer: z.string().min(1).max(400).optional(),
  explanation: z.string().min(1).max(1_500),
  citation: z.string().min(1).max(1_500),
});

const RawResponseSchema = z.object({
  questions: z.array(RawQuestionSchema).max(8),
});

export class ChunkGenerationError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ChunkGenerationError";
  }
}

export type GenerateOptions = {
  /** Total wall-clock budget for the LLM call. */
  timeoutMs?: number;
  /** Pass-through to the AI provider chain. */
  temperature?: number;
  /** Max tokens for the JSON response. */
  maxTokens?: number;
  /** Stable id used by the cache layer. */
  documentTitle: string;
};

// ─── Per-chunk cache ───────────────────────────────────────────────
// Module-local map keyed by hash(chunk.text + prompt-version + config).
// Same TTL as the rest of the synthetic-pipeline caches.

type CacheEntry = { questions: SynthQuestion[]; expiresAt: number };
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function cacheKey(chunk: Chunk, config: QuizConfig): string {
  return createHash("sha256")
    .update(
      [
        PROMPT_VERSION,
        chunk.text,
        config.difficulty,
        config.types.slice().sort().join(","),
        String(config.questionsPerChunk),
        config.language,
        (config.focusKeywords ?? []).slice().sort().join(","),
      ].join("|")
    )
    .digest("hex");
}

function gcCache(): void {
  const now = Date.now();
  for (const [k, v] of cache) if (v.expiresAt <= now) cache.delete(k);
}

export async function generateForChunk(
  chunk: Chunk,
  config: QuizConfig,
  options: GenerateOptions
): Promise<SynthQuestion[]> {
  gcCache();
  const key = cacheKey(chunk, config);
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) {
    return hit.questions;
  }

  const messages = buildChunkPrompt({
    chunk,
    documentTitle: options.documentTitle,
    questionsPerChunk: config.questionsPerChunk,
    types: config.types,
    difficulty: config.difficulty,
    focusKeywords: config.focusKeywords,
    language: config.language,
  });

  let raw: unknown;
  try {
    raw = await jsonChat<unknown>(messages, {
      maxTokens: options.maxTokens ?? 700,
      temperature: options.temperature ?? 0.3,
      timeoutMs: options.timeoutMs ?? 25_000,
    });
  } catch (err) {
    if (err instanceof AiProviderError) {
      throw new ChunkGenerationError(err.message, err.status);
    }
    throw err;
  }

  const parsed = RawResponseSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ChunkGenerationError("AI returned malformed JSON for this chunk.", 502);
  }

  // Cap to the configured per-chunk budget on the producer side too —
  // the LLM occasionally returns extras.
  const limited = parsed.data.questions.slice(0, config.questionsPerChunk);
  const enriched: SynthQuestion[] = limited.map((q) => ({
    kind: q.kind,
    prompt: q.prompt,
    options: q.options,
    correctIndex: q.correctIndex,
    expectedAnswer: q.expectedAnswer,
    explanation: q.explanation,
    citation: q.citation,
    sourceChunkId: chunk.id,
  }));

  cache.set(key, { questions: enriched, expiresAt: Date.now() + CACHE_TTL_MS });
  return enriched;
}

/** Diagnostics surface; used by the health route. */
export function generatorStats(): { cacheSize: number } {
  gcCache();
  return { cacheSize: cache.size };
}
