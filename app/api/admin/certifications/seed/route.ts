/**
 * POST /api/admin/certifications/seed
 *
 * Idempotently upsert every entry in `OFFICIAL_CERTIFICATION_SEED`
 * into Postgres. Run after a fresh deploy, or whenever the seed list
 * gets a new certification or new official source.
 *
 * Existing rows keep their `isPublished` flag from the seed (default
 * true) and have their core fields refreshed; existing sources are
 * upserted by (certificationId, url).
 *
 * Defense in depth: every source URL is checked against
 * `isAllowedOfficialSource` so a typo in the seed file can't smuggle
 * in a non-vendor host.
 */

import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";
import { OFFICIAL_CERTIFICATION_SEED } from "@/lib/certifications/official-seed";
import { isAllowedOfficialSource, safeHostname } from "@/lib/certifications/source-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async () => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);

  let certsUpserted = 0;
  let sourcesUpserted = 0;
  const skipped: Array<{ slug: string; url: string; reason: string }> = [];

  for (const entry of OFFICIAL_CERTIFICATION_SEED) {
    const certification = await prisma.certification.upsert({
      where: { slug: entry.slug },
      update: {
        code: entry.code,
        title: entry.title,
        vendor: entry.vendor,
        level: entry.level,
        status: entry.status,
        officialUrl: entry.officialUrl,
        officialDomain: entry.officialDomain,
        shortDescription: entry.shortDescription,
        isPublished: true,
      },
      create: {
        slug: entry.slug,
        code: entry.code,
        title: entry.title,
        vendor: entry.vendor,
        level: entry.level,
        status: entry.status,
        officialUrl: entry.officialUrl,
        officialDomain: entry.officialDomain,
        shortDescription: entry.shortDescription,
        isPublished: true,
      },
    });
    certsUpserted += 1;

    for (const source of entry.sources) {
      if (!isAllowedOfficialSource(source.url)) {
        skipped.push({ slug: entry.slug, url: source.url, reason: "url_not_in_allowlist" });
        continue;
      }
      const host = safeHostname(source.url) ?? source.domain;
      await prisma.certificationSource.upsert({
        where: {
          certificationId_url: { certificationId: certification.id, url: source.url },
        },
        update: {
          title: source.title,
          domain: host,
          sourceType: source.sourceType,
          isPrimary: source.isPrimary,
          vendorOwned: true,
        },
        create: {
          certificationId: certification.id,
          title: source.title,
          url: source.url,
          domain: host,
          sourceType: source.sourceType,
          isPrimary: source.isPrimary,
          vendorOwned: true,
        },
      });
      sourcesUpserted += 1;
    }
  }

  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      event: "certifications.seed",
      certsUpserted,
      sourcesUpserted,
      skipped: skipped.length,
    })
  );

  return ok({ certsUpserted, sourcesUpserted, skipped });
});
