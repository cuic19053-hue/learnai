/**
 * Server-Sent Events helper for the synthetic-quiz job stream.
 *
 * Wraps `lib/synthetic/jobs/registry`'s pub/sub in a `ReadableStream`
 * suitable for a Next.js route handler. The handler returns it as
 * the body of a 200 response with the SSE headers.
 *
 * Wire format (one frame per event):
 *
 *   event: question
 *   data: {"type":"question","index":0,"question":{...}}
 *
 * Heartbeat comments (`: ping`) every 15 s keep proxies from killing
 * idle connections during long generations.
 */

import "server-only";
import { subscribe } from "./registry";
import type { JobEvent } from "../types";

const HEARTBEAT_MS = 15_000;

/**
 * Build an SSE Response for the given jobId. Closes when the runner
 * emits `done` or `error`, or when the client disconnects (the abort
 * signal is wired by the route handler).
 */
export function sseResponseForJob(jobId: string, abortSignal?: AbortSignal): Response {
  const encoder = new TextEncoder();
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;

  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const write = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };

      const send = (event: JobEvent) => {
        const lines = [`event: ${event.type}`, `data: ${JSON.stringify(event)}`, "", ""].join("\n");
        write(lines);
      };

      // Heartbeat — comment lines are ignored by EventSource consumers.
      heartbeat = setInterval(() => write(`: ping ${Date.now()}\n\n`), HEARTBEAT_MS);
      (heartbeat as unknown as { unref?: () => void }).unref?.();

      // Initial retry hint for EventSource.
      write("retry: 5000\n\n");

      const unsubscribe = subscribe(jobId, (event) => {
        send(event);
        if (event.type === "done" || event.type === "error") {
          close();
        }
      });

      const close = () => {
        if (closed) return;
        closed = true;
        unsubscribe();
        if (heartbeat) clearInterval(heartbeat);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      };

      if (abortSignal) {
        if (abortSignal.aborted) close();
        else abortSignal.addEventListener("abort", close, { once: true });
      }
    },
    cancel() {
      closed = true;
      if (heartbeat) clearInterval(heartbeat);
    },
  });

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
