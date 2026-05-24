/**
 * GET /api/certifications/:slug/sources
 *
 * The vendor-owned official sources backing a certification — the
 * provenance anchor for every generated question. Exposed publicly
 * so the certification detail page can render the citation list
 * without learners needing to start a session.
 *
 * Legacy file packs predate the source model, so they return an
 * empty list with `source: "legacy"`. The new admin seed populates
 * real entries.
 */

import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async (_req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const { slug } = await ctx.params;

  try {
    const certification = await prisma.certification.findUnique({
      where: { slug },
      select: {
        id: true,
        isPublished: true,
        sources: { orderBy: [{ isPrimary: "desc" }, { title: "asc" }] },
      },
    });
    if (certification && certification.isPublished) {
      return ok({
        source: "db",
        items: certification.sources.map((s) => ({
          id: s.id,
          title: s.title,
          url: s.url,
          domain: s.domain,
          sourceType: s.sourceType,
          isPrimary: s.isPrimary,
          pageLastUpdated: s.pageLastUpdated,
          lastFetchedAt: s.lastFetchedAt,
        })),
      });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[certifications] sources read failed", err);
  }

  // Legacy file packs have no source model — return an empty list,
  // not a 404, so the frontend doesn't flicker between "missing" and
  // "empty" while the seed catches up.
  return ok({ source: "legacy", items: [] });
});

export const POST = handler(async () =>
  fail(405, "Use the admin endpoint to manage certification sources.")
);
