/**
 * Version-label helpers for certification packs.
 *
 * v1 keeps versioning off-schema: a pack's "version" is derived from
 * its slug. The first pack for a given code uses an un-suffixed slug
 * (e.g. `aws-saa-c03`); subsequent revisions append `-v2`, `-v3`, etc.
 * Display logic shows the parsed version on cards so users can tell
 * iterations apart without a column migration.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

const VERSION_SUFFIX = /-v(\d+)$/i;

export function parseVersion(slug: string): { base: string; version: number } {
  const m = slug.match(VERSION_SUFFIX);
  if (m) {
    return { base: slug.slice(0, -m[0].length), version: Number(m[1]) || 1 };
  }
  return { base: slug, version: 1 };
}

export function formatVersionLabel(slug: string): string {
  return `v${parseVersion(slug).version}`;
}

export async function nextVersionSlug(baseSlug: string): Promise<string> {
  const { base } = parseVersion(baseSlug);
  const siblings = await prisma.certification.findMany({
    where: {
      OR: [{ slug: base }, { slug: { startsWith: `${base}-v` } }],
    },
    select: { slug: true },
  });
  let maxVersion = 0;
  for (const sib of siblings) {
    maxVersion = Math.max(maxVersion, parseVersion(sib.slug).version);
  }
  return `${base}-v${maxVersion + 1}`;
}
