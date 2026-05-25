/**
 * Env normalisation that MUST run before any module that reads
 * `process.env.NEXTAUTH_URL` at import time (most notably the
 * `next-auth` bundle, which builds a parsed URL in module-init code
 * with `??` — so an empty-string env var passes through and crashes
 * the build with `TypeError: Invalid URL` while prerendering any
 * static page that touches the auth tree).
 *
 * Import this at the very top of:
 *   - `app/layout.tsx`  (so every server-rendered page is covered)
 *   - `lib/auth.ts`     (defence in depth — the canonical NextAuth gate)
 *
 * The fix is intentionally narrow: it only clears env vars that are
 * present but empty. Real values pass through unchanged.
 */

function dropIfEmpty(name: string): void {
  const v = process.env[name];
  if (typeof v === "string" && v.trim().length === 0) {
    delete process.env[name];
  }
}

// NextAuth + Vercel auto-detect chain — any of these as "" breaks
// the upstream URL parser.
dropIfEmpty("NEXTAUTH_URL");
dropIfEmpty("NEXTAUTH_URL_INTERNAL");
dropIfEmpty("VERCEL_URL");
dropIfEmpty("NEXT_PUBLIC_SITE_URL");

export {};
