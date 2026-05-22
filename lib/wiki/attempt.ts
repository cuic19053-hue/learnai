/**
 * Client-side attempt storage for WikiTest. Lives in sessionStorage so
 * results survive a hard refresh on the report page but get cleared
 * when the tab closes — keeps the cache local and private.
 */

import type { WikiAttempt } from "./types";

function key(testId: string): string {
  return `learnai_wikitest_attempt_${testId}`;
}

export function saveAttempt(testId: string, attempt: WikiAttempt): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key(testId), JSON.stringify(attempt));
  } catch {
    // sessionStorage full or unavailable — silently drop. The report
    // page will show a "no attempt found" message and route back to
    // the test detail.
  }
}

export function loadAttempt(testId: string): WikiAttempt | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(key(testId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WikiAttempt;
    if (parsed.testId !== testId) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearAttempt(testId: string): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(key(testId));
  } catch {
    // ignore
  }
}
