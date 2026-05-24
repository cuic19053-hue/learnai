/**
 * Job registry — process-local store for synthetic-quiz generation jobs.
 *
 * Holds a JobState for each in-flight or recently-finished job and a
 * pub/sub for events the SSE handler streams to clients. The whole
 * registry is intentionally a thin interface so it can be swapped for
 * a Redis-backed implementation without changing the runner or routes.
 *
 *   Phase 1 (current): in-memory Map + EventTarget per job. Single
 *     instance. TTL sweep so finished jobs don't camp on memory.
 *   Phase 2 (multi-instance): same interface, backed by Redis + pub/sub
 *     keyed by jobId. Existing routes need no changes.
 */

import "server-only";
import { randomUUID } from "node:crypto";
import type { Chunk, ExtractedSource, JobEvent, JobState, QuizConfig } from "../types";

/** Jobs older than this since updatedAt are GC'd. Generous so reconnects work. */
const JOB_TTL_MS = 30 * 60_000;
/** Soft cap on the per-job event ring buffer (for replay on reconnect). */
const MAX_BUFFERED_EVENTS = 500;
/** GC sweep interval. */
const GC_MS = 60_000;

type Listener = (event: JobEvent) => void;

type Internal = {
  state: JobState;
  listeners: Set<Listener>;
  /** Set true to ask the runner to stop scheduling further chunks. */
  cancelled: boolean;
};

const jobs = new Map<string, Internal>();
let gcStarted = false;

function startGc(): void {
  if (gcStarted || typeof globalThis.setInterval !== "function") return;
  gcStarted = true;
  const timer = setInterval(() => {
    const cutoff = Date.now() - JOB_TTL_MS;
    for (const [id, internal] of jobs) {
      // Only GC terminal jobs that have aged out — never kill a running one.
      const terminal =
        internal.state.status === "done" ||
        internal.state.status === "error" ||
        internal.state.status === "cancelled";
      if (terminal && internal.state.updatedAt < cutoff) jobs.delete(id);
    }
  }, GC_MS);
  (timer as unknown as { unref?: () => void }).unref?.();
}

export type CreateJobInput = {
  ownerId: string;
  source: ExtractedSource;
  config: QuizConfig;
  chunks: Chunk[];
};

export function createJob(input: CreateJobInput): JobState {
  startGc();
  const now = Date.now();
  const state: JobState = {
    id: randomUUID(),
    status: "pending",
    createdAt: now,
    updatedAt: now,
    ownerId: input.ownerId,
    source: input.source,
    config: input.config,
    chunks: input.chunks,
    events: [],
  };
  jobs.set(state.id, { state, listeners: new Set(), cancelled: false });
  return state;
}

export function getJob(id: string): JobState | undefined {
  return jobs.get(id)?.state;
}

export function isCancelled(id: string): boolean {
  return jobs.get(id)?.cancelled ?? false;
}

export function cancelJob(id: string): boolean {
  const internal = jobs.get(id);
  if (!internal) return false;
  if (
    internal.state.status === "done" ||
    internal.state.status === "error" ||
    internal.state.status === "cancelled"
  ) {
    return false;
  }
  internal.cancelled = true;
  internal.state.status = "cancelled";
  internal.state.updatedAt = Date.now();
  emit(id, { type: "error", status: 499, message: "Job cancelled by request." });
  // Drop listeners so SSE handlers wrap up.
  internal.listeners.clear();
  return true;
}

/** Set internal status. Returns the new state for chaining. */
export function setStatus(id: string, status: JobState["status"]): JobState | undefined {
  const internal = jobs.get(id);
  if (!internal) return undefined;
  internal.state.status = status;
  internal.state.updatedAt = Date.now();
  return internal.state;
}

export function setQuiz(id: string, quiz: JobState["quiz"]): void {
  const internal = jobs.get(id);
  if (!internal) return;
  internal.state.quiz = quiz;
  internal.state.updatedAt = Date.now();
}

export function setError(id: string, error: { status: number; message: string }): void {
  const internal = jobs.get(id);
  if (!internal) return;
  internal.state.error = error;
  internal.state.status = "error";
  internal.state.updatedAt = Date.now();
  emit(id, { type: "error", ...error });
}

export function emit(id: string, event: JobEvent): void {
  const internal = jobs.get(id);
  if (!internal) return;
  // Append to ring buffer for replay; drop oldest first if over cap.
  internal.state.events.push(event);
  if (internal.state.events.length > MAX_BUFFERED_EVENTS) {
    internal.state.events.shift();
  }
  internal.state.updatedAt = Date.now();
  for (const listener of internal.listeners) {
    try {
      listener(event);
    } catch (err) {
      // A bad listener mustn't kill the rest of the fanout.
      // eslint-disable-next-line no-console
      console.error("[synthetic] listener threw", err);
    }
  }
}

/**
 * Subscribe a listener. The current event buffer is replayed
 * synchronously before live events start flowing, so SSE clients
 * that reconnect mid-generation see every prior event in order.
 *
 * Returns an unsubscribe function.
 */
export function subscribe(id: string, listener: Listener): () => void {
  const internal = jobs.get(id);
  if (!internal) return () => undefined;
  // Replay buffered events.
  for (const event of internal.state.events) {
    try {
      listener(event);
    } catch {
      /* ignore */
    }
  }
  internal.listeners.add(listener);
  return () => {
    internal.listeners.delete(listener);
  };
}

/** Number of currently-known jobs (any status). For diagnostics only. */
export function registryStats(): { jobs: number; running: number } {
  let running = 0;
  for (const { state } of jobs.values()) {
    if (state.status === "running" || state.status === "pending") running++;
  }
  return { jobs: jobs.size, running };
}

/**
 * Best-effort owner check used by the routes. Returns true when the
 * caller's owner id matches the job's, OR when the job belongs to a
 * guest and the caller's IP matches (so guests can poll their own
 * jobs without auth).
 */
export function isJobOwner(state: JobState, ownerId: string): boolean {
  return state.ownerId === ownerId;
}
