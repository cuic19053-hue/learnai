import { NextResponse } from "next/server";
import { ZodError } from "zod";

/**
 * Standard JSON success envelope.
 */
export function ok<T>(data: T, init?: ResponseInit): NextResponse {
  return NextResponse.json({ ok: true, ...data }, init);
}

/**
 * Standard JSON error envelope. Hides internal details from the client
 * but logs them server-side.
 */
export function fail(
  status: number,
  message: string,
  details?: unknown,
): NextResponse {
  return NextResponse.json({ ok: false, error: message, details }, { status });
}

/**
 * Wrap a route handler so all uncaught errors return a typed JSON envelope
 * instead of a 500 HTML page. Validation errors (Zod) get 400.
 */
export function handler<T extends (req: Request, ctx?: any) => Promise<Response>>(
  fn: T,
): T {
  return (async (req: Request, ctx?: any) => {
    try {
      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof ZodError) {
        return fail(400, "Invalid request body", err.flatten());
      }
      // eslint-disable-next-line no-console
      console.error("[api] unhandled error:", err);
      const message = err instanceof Error ? err.message : "Unexpected server error";
      return fail(500, message);
    }
  }) as T;
}

/**
 * Best-effort client identifier from common reverse-proxy headers.
 * Falls back to "anonymous" when nothing is available (local dev).
 */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return (
    req.headers.get("x-real-ip") ??
    req.headers.get("cf-connecting-ip") ??
    "anonymous"
  );
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/**
 * Tiny in-memory token bucket. Suitable for single-instance deployments and
 * for rejecting obviously abusive bursts. Replace with Redis/Upstash for
 * multi-region production traffic.
 */
export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number },
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    const bucket = { count: 1, resetAt: now + options.windowMs };
    buckets.set(key, bucket);
    return { allowed: true, remaining: options.limit - 1, resetAt: bucket.resetAt };
  }
  existing.count += 1;
  const allowed = existing.count <= options.limit;
  return {
    allowed,
    remaining: Math.max(0, options.limit - existing.count),
    resetAt: existing.resetAt,
  };
}
