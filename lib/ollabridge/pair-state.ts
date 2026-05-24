/**
 * Process-local store of pending OllaBridge pairings.
 *
 * The browser-side pairing flow is:
 *   1. POST /api/admin/providers/ollabridge/pair/start
 *      Server calls OllaBridge `/device/start`, stashes the
 *      `device_code` here keyed by `user_code` + admin user id,
 *      and returns ONLY the `user_code` to the browser.
 *   2. Browser polls /api/admin/providers/ollabridge/pair/poll
 *      with `userCode`. Server looks up the `device_code` here
 *      and calls OllaBridge `/device/poll`.
 *   3. On approval the server saves the resulting `device_token`
 *      into the OllaBridge ProviderConfig and clears this entry.
 *
 * Single-instance store, same trade-off as the rate limiter
 * (`lib/api.ts:rateLimit`) and the job registry. Swap for Redis
 * with the same key shape when moving multi-instance.
 */

import "server-only";

const TTL_MS = 12 * 60_000; // pairing codes expire at 10 min upstream + slack
const GC_MS = 60_000;

export type PendingPair = {
  deviceCode: string;
  adminUserId: string;
  verificationUrl: string;
  expiresAt: number;
};

const pending = new Map<string, PendingPair>();
let gcStarted = false;

function startGc(): void {
  if (gcStarted || typeof globalThis.setInterval !== "function") return;
  gcStarted = true;
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of pending) if (v.expiresAt <= now) pending.delete(k);
  }, GC_MS);
  (timer as unknown as { unref?: () => void }).unref?.();
}

function key(userCode: string): string {
  return userCode.trim().toUpperCase();
}

export function rememberPendingPair(userCode: string, value: PendingPair): void {
  startGc();
  pending.set(key(userCode), {
    ...value,
    expiresAt: Math.min(value.expiresAt, Date.now() + TTL_MS),
  });
}

export function takePendingPair(userCode: string): PendingPair | undefined {
  return pending.get(key(userCode));
}

export function clearPendingPair(userCode: string): void {
  pending.delete(key(userCode));
}

export function pendingPairStats(): { count: number } {
  return { count: pending.size };
}
