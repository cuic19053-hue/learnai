/**
 * GET /api/certifications/:slug
 *
 * Detail view for a single certification. Returns the cert row plus
 * its domains, vendor-owned official sources, and live counts.
 *
 * DB-first with legacy JSON-pack fallback so file-only installs keep
 * rendering. The legacy adapter returns the same envelope with
 * empty domains/sources arrays so the frontend doesn't need to
 * branch on the source.
 */

import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { getCertificationBySlug } from "@/lib/certifications/db";
import { legacyGetCertificationBySlug } from "@/lib/certifications/legacy-bridge";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const limit = rateLimit(`cert:detail:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many certification requests.");

  const { slug } = await ctx.params;

  // DB first.
  try {
    const dbRow = await getCertificationBySlug(slug);
    if (dbRow && dbRow.isPublished) {
      return ok({
        source: "db",
        certification: {
          id: dbRow.id,
          slug: dbRow.slug,
          code: dbRow.code,
          title: dbRow.title,
          vendor: dbRow.vendor,
          level: dbRow.level,
          status: dbRow.status,
          shortDescription: dbRow.shortDescription,
          fullDescription: dbRow.fullDescription,
          officialUrl: dbRow.officialUrl,
          examGuideUrl: dbRow.examGuideUrl,
          learningPathUrl: dbRow.learningPathUrl,
          retiredAt: dbRow.retiredAt,
          replacementSlug: dbRow.replacementSlug,
        },
        domains: dbRow.domains.map((d) => ({
          id: d.id,
          name: d.name,
          description: d.description,
          weightPercent: d.weightPercent,
          sortOrder: d.sortOrder,
        })),
        sources: dbRow.sources.map((s) => ({
          id: s.id,
          title: s.title,
          url: s.url,
          domain: s.domain,
          sourceType: s.sourceType,
          isPrimary: s.isPrimary,
          pageLastUpdated: s.pageLastUpdated,
          lastFetchedAt: s.lastFetchedAt,
        })),
        stats: {
          questionCount: dbRow._count.questions,
          sourceCount: dbRow._count.sources,
          domainCount: dbRow._count.domains,
        },
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[certifications] DB detail failed, trying legacy", err);
  }

  // Legacy fallback (file pack).
  const legacy = await legacyGetCertificationBySlug(slug);
  if (legacy) return ok({ source: "legacy", ...legacy });

  return fail(404, `Unknown certification: ${slug}`);
});
