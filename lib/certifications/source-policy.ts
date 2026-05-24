/**
 * Source-policy gate for the certifications question bank.
 *
 * Original (AI-generated) practice questions MUST cite vendor-owned
 * official sources only — no exam dumps, no third-party brain dumps,
 * no leaked PDFs. This module is the central allowlist + helpers
 * the question-generator route and the admin ingester both run
 * URLs through before persisting.
 *
 * Adding a new vendor: append the canonical documentation host(s)
 * to `ALLOWED_CERTIFICATION_SOURCE_DOMAINS`. Wildcards aren't
 * supported on purpose — we want each host explicit and reviewable.
 */

/**
 * Vendor-owned hosts the platform accepts as official certification
 * sources. Hostname must match exactly (case-insensitive).
 */
export const ALLOWED_CERTIFICATION_SOURCE_DOMAINS: ReadonlyArray<string> = [
  // AWS
  "docs.aws.amazon.com",
  "aws.amazon.com",
  // Microsoft / Azure
  "learn.microsoft.com",
  "docs.microsoft.com",
  "microsoft.com",
  // Google Cloud
  "cloud.google.com",
  "developers.google.com",
  // IBM
  "www.ibm.com",
  "ibm.com",
  "cloud.ibm.com",
];

/**
 * Phrases that, if present in a URL or page title, suggest a
 * third-party exam-dump source. Used as a defense-in-depth check on
 * top of the host allowlist — flags pages even if they happen to live
 * on a vendor mirror.
 */
const FORBIDDEN_TERM_RE = /(exam.?dump|braindump|dumps?\.\w+|leaked|test.?bank|cracked)/i;

export function isAllowedOfficialSource(url: string): boolean {
  let host: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    host = parsed.hostname.toLowerCase();
  } catch {
    return false;
  }
  if (!ALLOWED_CERTIFICATION_SOURCE_DOMAINS.includes(host)) return false;
  if (FORBIDDEN_TERM_RE.test(url)) return false;
  return true;
}

/**
 * Extract a normalized hostname from a URL, or return null if the URL
 * is malformed. Used when seeding sources so admins don't have to
 * type the `domain` field by hand.
 */
export function safeHostname(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Filter a list of candidate refs down to those that satisfy the
 * source policy. Used by the question generator before persisting
 * `officialRefs`.
 */
export function filterAllowedRefs<T extends { url: string }>(refs: T[]): T[] {
  return refs.filter((r) => isAllowedOfficialSource(r.url));
}
