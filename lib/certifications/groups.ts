/**
 * Group certification packs by version family for the hub.
 *
 * The catalog stores one row per version (e.g. `aws-saa-c03`,
 * `aws-saa-c03-v2`, `aws-saa-c03-v3`). For the hub we want one card
 * per certification, with a version dropdown — never three cards for
 * the "same" exam. This groups by the version-base slug (everything
 * before the `-v<N>` suffix) and picks the latest version as the
 * card's headline metadata.
 */

import type { CertificationMeta } from "./types";

export type VersionEntry = {
  slug: string;
  version: number;
  /** Total question count for this specific version. */
  questions: number;
  /** Provided so future statuses can flow through; for now everything
   *  discoverable is Published (DRAFT/ARCHIVED don't reach the hub). */
  status: "Latest" | "Published" | "Draft" | "Archived";
};

export type CertificationGroup = {
  /** Stable base slug shared by every version in the group. */
  baseSlug: string;
  code: string;
  title: string;
  vendor: string;
  level: string;
  blurb: string;
  /** Total questions summed across every version. */
  totalQuestions: number;
  versions: VersionEntry[];
  /** Convenience: the highest-version entry, used for "Start latest". */
  latest: VersionEntry;
};

const VERSION_SUFFIX = /-v(\d+)$/i;

function splitSlug(slug: string): { base: string; version: number } {
  const m = slug.match(VERSION_SUFFIX);
  if (m) return { base: slug.slice(0, -m[0].length), version: Number(m[1]) || 1 };
  return { base: slug, version: 1 };
}

export function groupCertifications(
  cards: ReadonlyArray<CertificationMeta & { questions: number }>
): CertificationGroup[] {
  const groups = new Map<string, CertificationGroup>();

  for (const card of cards) {
    const { base, version } = splitSlug(card.slug);
    const entry: VersionEntry = {
      slug: card.slug,
      version,
      questions: card.questions ?? 0,
      status: "Published",
    };
    const existing = groups.get(base);
    if (!existing) {
      groups.set(base, {
        baseSlug: base,
        code: card.code,
        title: card.title,
        vendor: card.vendor,
        level: card.level,
        blurb: card.blurb,
        totalQuestions: entry.questions,
        versions: [entry],
        latest: entry,
      });
      continue;
    }
    existing.versions.push(entry);
    existing.totalQuestions += entry.questions;
    // Prefer the latest version's metadata (titles / blurbs sometimes
    // get rewritten across versions; the newest is canonical).
    if (entry.version > existing.latest.version) {
      existing.code = card.code;
      existing.title = card.title;
      existing.vendor = card.vendor;
      existing.level = card.level;
      existing.blurb = card.blurb;
      existing.latest = entry;
    }
  }

  // Sort versions newest-first inside each group; mark the top one as
  // "Latest" so the dropdown can show the badge without a recompute.
  for (const g of groups.values()) {
    g.versions.sort((a, b) => b.version - a.version);
    if (g.versions[0]) g.versions[0].status = "Latest";
  }

  return Array.from(groups.values());
}
