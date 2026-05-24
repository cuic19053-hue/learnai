/**
 * Temporary upload store — short-lived in-memory holding pen for
 * multipart uploads while the wizard transitions from "file selected"
 * to "job created".
 *
 * The flow is:
 *   1. UI POSTs the file to `/api/synthetic/upload`.
 *   2. That route validates size + MIME, stashes the bytes here, and
 *      returns an opaque `uploadId`.
 *   3. UI then POSTs `{kind: "upload", uploadId, mime, filename}` to
 *      `/api/synthetic/jobs`, which calls `takeUpload()` once.
 *
 * Files are evicted after a short TTL or once they've been taken, so
 * a stale id can't be replayed and stale buffers don't camp on memory.
 * This is a single-instance pattern (same compromise as `lib/api.ts`
 * `rateLimit`). For multi-instance, swap the Map for object storage
 * with the same key shape.
 */

import "server-only";
import { randomUUID } from "node:crypto";

/** Maximum buffer size we'll hold in memory at all. */
export const UPLOAD_MAX_BYTES = 2 * 1024 * 1024;
/** TTL applied to every put — keep small to bound memory. */
const TTL_MS = 5 * 60_000;
/** GC sweep interval. */
const GC_MS = 60_000;

type Entry = {
  buffer: Buffer;
  filename: string;
  mime: string;
  expiresAt: number;
};

const store = new Map<string, Entry>();
let gcStarted = false;

function startGc(): void {
  if (gcStarted || typeof globalThis.setInterval !== "function") return;
  gcStarted = true;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [id, entry] of store) {
      if (entry.expiresAt <= now) store.delete(id);
    }
  }, GC_MS);
  // Don't keep the process alive just for the GC.
  (timer as unknown as { unref?: () => void }).unref?.();
}

export function putUpload(input: { buffer: Buffer; filename: string; mime: string }): string {
  if (input.buffer.byteLength > UPLOAD_MAX_BYTES) {
    throw new Error(
      `Upload exceeds the ${UPLOAD_MAX_BYTES.toLocaleString()}-byte limit (got ${input.buffer.byteLength}).`
    );
  }
  startGc();
  const id = randomUUID();
  store.set(id, {
    buffer: input.buffer,
    filename: input.filename.slice(0, 200),
    mime: input.mime,
    expiresAt: Date.now() + TTL_MS,
  });
  return id;
}

/**
 * Read-and-delete: returns the upload exactly once. The caller is
 * responsible for clearing the buffer when done if it wants the bytes
 * GC'd before the next major collection.
 */
export function takeUpload(
  id: string
): { buffer: Buffer; filename: string; mime: string } | undefined {
  const entry = store.get(id);
  if (!entry) return undefined;
  store.delete(id);
  if (entry.expiresAt <= Date.now()) return undefined;
  return { buffer: entry.buffer, filename: entry.filename, mime: entry.mime };
}

export function uploadStats(): { count: number; bytes: number } {
  let bytes = 0;
  for (const entry of store.values()) bytes += entry.buffer.byteLength;
  return { count: store.size, bytes };
}
