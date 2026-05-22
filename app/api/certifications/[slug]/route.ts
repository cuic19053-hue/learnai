import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import {
  findCertification,
  loadCertificationPage,
  sampleCertification,
} from "@/lib/certifications/load";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  mode: z.enum(["page", "sample"]).default("page"),
  offset: z.coerce.number().int().min(0).max(2000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  size: z.coerce.number().int().min(1).max(50).default(10),
});

/**
 * GET /api/certifications/:slug?mode=page&offset=0&limit=20
 *   → paged list of questions for review.
 *
 * GET /api/certifications/:slug?mode=sample&size=10
 *   → random N questions for a quick-drill session.
 */
export const GET = handler(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const limit = rateLimit(`cert:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many certification requests.");

  const { slug } = await ctx.params;
  const meta = await findCertification(slug);
  if (!meta) return fail(404, `Unknown certification: ${slug}`);

  const url = new URL(req.url);
  const params = QuerySchema.parse({
    mode: url.searchParams.get("mode") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    size: url.searchParams.get("size") ?? undefined,
  });

  if (params.mode === "sample") {
    const items = await sampleCertification(slug, params.size);
    return ok({ meta, items, total: items.length, mode: "sample" });
  }
  const { items, total } = await loadCertificationPage(slug, params.offset, params.limit);
  return ok({ meta, items, total, offset: params.offset, limit: params.limit, mode: "page" });
});
