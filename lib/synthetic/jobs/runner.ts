/**
 * Job runner — generates a quiz for one job, in the background.
 *
 * Architecture:
 *   - A small hand-rolled semaphore caps in-flight LLM calls per job
 *     so we don't hammer the provider (or hit 429s on paid tiers).
 *   - Each chunk is generated, validated, canonicalized, and emitted
 *     as a `question` event the moment it lands. Order is preserved
 *     by the producer index, not by completion order.
 *   - Failed chunks are retried with exponential backoff, then
 *     dropped with a `chunk_failed` event so the UI can show what
 *     happened.
 *   - A `cancel` flag set on the registry short-circuits scheduling
 *     before each chunk; in-flight calls finish but no further work
 *     is started.
 *   - On completion we build the `CanonicalQuiz`, cache it, emit a
 *     `done` event, and update the job state. The whole quiz is
 *     also retrievable via the snapshot endpoint after the SSE has
 *     closed.
 */

import "server-only";
import { ChunkGenerationError, generateForChunk } from "../generate";
import { JobFilter } from "../filter";
import { buildCanonicalQuiz, canonicalizeQuestion } from "../persistence/canonicalize";
import { getCachedQuiz, putCachedQuiz } from "../persistence/quiz-cache";
import { quizIdFor } from "../persistence/canonicalize";
import { emit, getJob, isCancelled, setError, setQuiz, setStatus } from "./registry";
import type { CanonicalQuestion, Chunk, SourceInput } from "../types";

const DEFAULT_CONCURRENCY = 4;
const DEFAULT_RETRIES = 2;
const RETRY_BACKOFF_MS = [1_000, 3_000];

export type RunOptions = {
  /** Max LLM calls in flight at any moment for this job. */
  concurrency?: number;
  /** Per-chunk retry budget on AiProviderError. */
  retries?: number;
  /** Public input — needed to record the source kind/filename on the quiz. */
  sourceInput: SourceInput;
};

/**
 * Tiny semaphore. Resolves the next waiter as soon as one of the
 * currently-running tasks finishes.
 */
function semaphore(max: number) {
  let running = 0;
  const waiters: Array<() => void> = [];
  return {
    acquire(): Promise<void> {
      if (running < max) {
        running++;
        return Promise.resolve();
      }
      return new Promise((resolve) => waiters.push(resolve));
    },
    release(): void {
      running--;
      const next = waiters.shift();
      if (next) {
        running++;
        next();
      }
    },
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Run a single chunk with retries. Returns the canonical questions
 * to emit (possibly empty) and a `failureReason` if the chunk
 * permanently failed.
 */
async function runChunk(
  jobId: string,
  chunk: Chunk,
  documentTitle: string,
  filter: JobFilter,
  retries: number
): Promise<{ questions: CanonicalQuestion[]; failure?: string }> {
  const job = getJob(jobId);
  if (!job) return { questions: [] };

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (isCancelled(jobId)) return { questions: [] };
    try {
      const raw = await generateForChunk(chunk, job.config, { documentTitle });
      const out: CanonicalQuestion[] = [];
      for (const q of raw) {
        const result = filter.evaluate(q, chunk);
        if (result.ok) out.push(canonicalizeQuestion(result.question, chunk));
      }
      return { questions: out };
    } catch (err) {
      lastErr = err;
      if (!(err instanceof ChunkGenerationError)) {
        // Non-transient (e.g. zod failure) — don't burn the retry budget.
        break;
      }
      // 4xx errors from the provider chain aren't going to fix themselves.
      if (err.status >= 400 && err.status < 500 && err.status !== 429) break;
      if (attempt < retries) {
        await delay(RETRY_BACKOFF_MS[attempt] ?? 5_000);
      }
    }
  }
  const reason = lastErr instanceof Error ? lastErr.message : "Unknown chunk-generation error.";
  return { questions: [], failure: reason };
}

/**
 * Run a complete job to completion. Resolves when the quiz has been
 * built (or when the job has been cancelled / errored out). Safe to
 * fire-and-forget — the runner never throws to its caller; failures
 * become job-error state.
 */
export async function runJob(jobId: string, options: RunOptions): Promise<void> {
  const job = getJob(jobId);
  if (!job) return;

  // Full-quiz cache short-circuit. Same source + config = same quiz id.
  const cachedId = quizIdFor(job.source.fingerprint, job.config);
  const cached = getCachedQuiz(cachedId);
  if (cached) {
    setStatus(jobId, "running");
    emit(jobId, {
      type: "plan",
      plan: {
        totalChunks: job.chunks.length,
        estDurationSec: 1,
        sourceTitle: job.source.title,
      },
    });
    for (const [index, q] of cached.questions.entries()) {
      if (isCancelled(jobId)) return;
      emit(jobId, { type: "question", index, question: q });
    }
    setQuiz(jobId, cached);
    setStatus(jobId, "done");
    emit(jobId, { type: "done", quiz: cached });
    return;
  }

  setStatus(jobId, "running");
  emit(jobId, {
    type: "plan",
    plan: {
      totalChunks: job.chunks.length,
      estDurationSec: estimatePlanSeconds(
        job.chunks.length,
        options.concurrency ?? DEFAULT_CONCURRENCY
      ),
      sourceTitle: job.source.title,
    },
  });

  const filter = new JobFilter();
  const sem = semaphore(options.concurrency ?? DEFAULT_CONCURRENCY);
  const retries = options.retries ?? DEFAULT_RETRIES;

  // Producer ordering: keep a slot per chunk so questions are emitted
  // in chunk order even when individual LLM calls finish out of order.
  const slots: Array<CanonicalQuestion[] | "pending" | "failed"> = job.chunks.map(() => "pending");
  let done = 0;
  let failed = 0;
  let totalEmitted = 0;

  const emitProgress = () => {
    emit(jobId, { type: "progress", done, total: job.chunks.length, failed });
  };

  const flushSlot = (index: number) => {
    // Emit only when every preceding slot has finished, so output is
    // ordered. We walk forward from the first "pending" slot we can find.
    let i = slots.findIndex((s) => s === "pending");
    if (i === -1) i = slots.length;
    // i now points to the first still-pending slot. Emit everything before it.
    for (let j = 0; j < i; j++) {
      const value = slots[j];
      if (value && value !== "pending" && value !== "failed") {
        for (const q of value) {
          if (totalEmitted >= job.config.count) break;
          emit(jobId, { type: "question", index: j, question: q });
          totalEmitted++;
        }
        // Mark as flushed by replacing with an empty array.
        slots[j] = [];
      }
    }
    void index;
  };

  const tasks: Array<Promise<void>> = job.chunks.map((chunk, index) =>
    (async () => {
      await sem.acquire();
      try {
        if (isCancelled(jobId)) return;
        // Stop early once we've already accumulated more than the requested count.
        if (totalEmitted >= job.config.count) {
          slots[index] = [];
          return;
        }
        const { questions, failure } = await runChunk(
          jobId,
          chunk,
          job.source.title,
          filter,
          retries
        );
        if (failure) {
          slots[index] = "failed";
          failed++;
          emit(jobId, { type: "chunk_failed", index, reason: failure });
        } else {
          slots[index] = questions;
        }
        done++;
        emitProgress();
        flushSlot(index);
      } finally {
        sem.release();
      }
    })()
  );

  await Promise.all(tasks);
  if (isCancelled(jobId)) return;

  // Final flush in case the loop above stopped early.
  flushSlot(slots.length);
  // Collect the emitted questions (they were also accumulated as "flushed"
  // slots — i.e. empty arrays). Reconstruct the final list from the
  // event buffer.
  const final = collectEmittedQuestions(jobId);
  const quiz = buildCanonicalQuiz({
    source: job.source,
    sourceInput: options.sourceInput,
    config: job.config,
    questions: final.slice(0, job.config.count),
  });

  putCachedQuiz(quiz);
  setQuiz(jobId, quiz);
  setStatus(jobId, "done");
  emit(jobId, { type: "done", quiz });
}

function collectEmittedQuestions(jobId: string): CanonicalQuestion[] {
  const job = getJob(jobId);
  if (!job) return [];
  const out: CanonicalQuestion[] = [];
  for (const event of job.events) {
    if (event.type === "question") out.push(event.question);
  }
  return out;
}

/** Pessimistic LLM-time estimate so the UI can size its progress bar. */
function estimatePlanSeconds(chunkCount: number, concurrency: number): number {
  const perChunkSec = 8;
  return Math.max(5, Math.ceil((chunkCount / Math.max(1, concurrency)) * perChunkSec));
}

/**
 * Wrap `runJob` so the caller can fire-and-forget without leaking
 * unhandled rejections. All failures become job-error state.
 */
export function spawnJob(jobId: string, options: RunOptions): void {
  runJob(jobId, options).catch((err) => {
    // eslint-disable-next-line no-console
    console.error(`[synthetic] job ${jobId} crashed`, err);
    const message = err instanceof Error ? err.message : "Unexpected runner error.";
    setError(jobId, { status: 500, message });
  });
}
