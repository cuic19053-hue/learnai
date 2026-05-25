/**
 * GET /api/certifications/:slug/questions
 *
 * Public question listing. Two modes:
 *
 *   ?mode=sample&size=10
 *     N random questions for a quick-drill preview. Random ordering
 *     so consecutive page loads show different subsets.
 *
 *   ?mode=page&offset=0&limit=20
 *     Stable pagination for reviewing the full bank.
 *
 * `difficulty=EASY|MEDIUM|HARD` filters in either mode.
 *
 * CRITICAL: this endpoint never returns `correctAnswers`. Grading
 * happens through the session-answer route where the learner
 * submits their attempt and receives feedback.
 */

import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { resolveQuestions } from "@/lib/certifications/resolve-questions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QuerySchema = z.object({
  mode: z.enum(["sample", "page"]).default("sample"),
  size: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).max(5_000).default(0),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
});

export const GET = handler(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const limit = rateLimit(`cert:questions:${clientIp(req)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many certification-question requests.");

  const { slug } = await ctx.params;
  const url = new URL(req.url);
  const query = QuerySchema.parse({
    mode: url.searchParams.get("mode") ?? undefined,
    size: url.searchParams.get("size") ?? undefined,
    offset: url.searchParams.get("offset") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    difficulty: url.searchParams.get("difficulty") ?? undefined,
  });

  // Shared resolver: AI-generated DB rows first, JSON file pack as
  // fallback. The response surfaces `source` so the UI can render an
  // honest "✨ AI generated" or "starter pack" indicator.
  const result =
    query.mode === "sample"
      ? await resolveQuestions(slug, {
          mode: "sample",
          size: query.size,
          difficulty: query.difficulty,
        })
      : await resolveQuestions(slug, {
          mode: "page",
          offset: query.offset,
          limit: query.limit,
          difficulty: query.difficulty,
        });

  if (result.items.length === 0) {
    return fail(404, `No questions available for certification: ${slug}`);
  }

  return ok({
    source: result.source,
    mode: query.mode,
    items: result.items,
    ...(query.mode === "page"
      ? { total: result.total, offset: query.offset, limit: query.limit }
      : {}),
  });
});
