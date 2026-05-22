/**
 * Cookie persistence for ProgressState.
 *
 * Client-only helpers (document.cookie) live here. The matching
 * server-side reader (using next/headers cookies()) is intentionally
 * not in this module so it can stay client-safe.
 */

import { DEFAULT_PROGRESS, PROGRESS_COOKIE, type ProgressState } from "./types";
import { safeParseProgress } from "./engine";

/** ~30 days; renewed on every write. */
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

export function readProgressClient(): ProgressState {
  if (typeof document === "undefined") return DEFAULT_PROGRESS;
  const cookies = document.cookie.split("; ");
  const match = cookies.find((c) => c.startsWith(`${PROGRESS_COOKIE}=`));
  if (!match) return DEFAULT_PROGRESS;
  const value = match.slice(PROGRESS_COOKIE.length + 1);
  try {
    return safeParseProgress(JSON.parse(decodeURIComponent(value)));
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function writeProgressClient(state: ProgressState): void {
  if (typeof document === "undefined") return;
  const value = encodeURIComponent(JSON.stringify(state));
  const secure =
    typeof window !== "undefined" && window.location?.protocol === "https:";
  const attrs = [
    `${PROGRESS_COOKIE}=${value}`,
    "Path=/",
    `Max-Age=${MAX_AGE_SEC}`,
    "SameSite=Lax",
  ];
  if (secure) attrs.push("Secure");
  document.cookie = attrs.join("; ");
}
