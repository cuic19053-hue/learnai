/**
 * Pure helpers + vendor styling for the certifications hub. The catalog
 * itself (the list of exam packs) is discovered dynamically from
 * `certifications/questions/*.json` at request time — see load.ts.
 *
 * Why split: types and pure constants live here so they're safe to
 * import from anywhere (client or server). The fs-based scanner lives
 * in load.ts and is marked server-only.
 */

import type {
  CertificationLevel,
  CertificationMeta,
  CertificationVendor,
} from "./types";

export const VENDORS: CertificationVendor[] = ["AWS", "Azure", "GCP", "IBM", "Other"];

export const VENDOR_META: Record<
  CertificationVendor,
  { label: string; emoji: string; color: string }
> = {
  AWS: { label: "Amazon Web Services", emoji: "🟧", color: "#f59e0b" },
  Azure: { label: "Microsoft Azure", emoji: "🟦", color: "#2e5bff" },
  GCP: { label: "Google Cloud", emoji: "🟥", color: "#dc2626" },
  IBM: { label: "IBM", emoji: "🟪", color: "#7c3aed" },
  Other: { label: "Other vendors", emoji: "🟩", color: "#0ea5a4" },
};

/**
 * Map a file slug to a vendor using common prefix conventions.
 * Used when a pack has no .meta.json sidecar.
 */
export function inferVendorFromSlug(slug: string): CertificationVendor {
  const up = slug.toUpperCase();
  if (/^(CLF|SAA|SAP|DOP|MLS|DVA|SOA|ANS|DBS|DAS|SCS|PAS|MLA|DEA)-/i.test(up)) return "AWS";
  if (/^(AI|DP|AZ|MS|MD|SC|MB|PL)-/i.test(up)) return "Azure";
  if (/^GCP[-_]/i.test(up)) return "GCP";
  if (/^(C\d{4}|IBM)/i.test(up)) return "IBM";
  return "Other";
}

/**
 * Default level from code suffix. Conservative — most certs are
 * Associate, so when we can't tell we say Associate.
 */
export function inferLevelFromSlug(slug: string): CertificationLevel {
  const up = slug.toUpperCase();
  if (/SAP|SOA|PAS|DOP|DEA|ANS|DAS|DBS/.test(up) || /PROFESSIONAL/i.test(slug))
    return "Professional";
  if (/FUNDAMENTALS|CLF|AI-900|AZ-900/i.test(up)) return "Fundamentals";
  if (/SPECIALTY|MLS|SCS/i.test(up)) return "Specialty";
  return "Associate";
}

/**
 * Build a CertificationMeta from a slug when no sidecar metadata exists.
 * Title falls back to the code; blurb says we don't know more.
 */
export function inferCertificationMeta(slug: string): CertificationMeta {
  const code = slug.replace(/-v\d+.*$/i, "").replace(/-mixed$/i, "");
  return {
    slug,
    code,
    title: code,
    vendor: inferVendorFromSlug(slug),
    blurb: "Practice questions imported via JSON.",
    level: inferLevelFromSlug(slug),
  };
}

export function groupByVendor(
  list: CertificationMeta[],
): Record<string, CertificationMeta[]> {
  return list.reduce<Record<string, CertificationMeta[]>>((acc, c) => {
    (acc[c.vendor] ||= []).push(c);
    return acc;
  }, {});
}
