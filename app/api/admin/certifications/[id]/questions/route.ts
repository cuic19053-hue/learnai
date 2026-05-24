/**
 * GET /api/admin/certifications/:id/questions
 *
 * Admin-view list of questions for a certification, including
 * `correctAnswers` and review flags. Used by the add-cert wizard's
 * Step 4 preview ("here are the N generated questions — flip the
 * keepers to reviewed, then publish").
 *
 * Query params:
 *   ?reviewed=true|false   only reviewed (or only unreviewed)
 *   ?published=true|false  only published (or only drafts)
 *   ?difficulty=EASY|MEDIUM|HARD
 *   ?domainId=<cuid>
 *   ?limit=50&offset=0
 *
 * Returns questions ordered newest-first so freshly-generated
 * batches surface at the top of the review queue.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const boolEnum = z.enum(["true", "false"]).transform((v) => v === "true");

const QuerySchema = z.object({
  reviewed: boolEnum.optional(),
  published: boolEnum.optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  domainId: z.string().cuid().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

export const GET = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const query = QuerySchema.parse(Object.fromEntries(url.searchParams.entries()));

  const where = {
    certificationId: id,
    ...(query.reviewed !== undefined ? { isReviewed: query.reviewed } : {}),
    ...(query.published !== undefined ? { isPublished: query.published } : {}),
    ...(query.difficulty ? { difficulty: query.difficulty } : {}),
    ...(query.domainId ? { domainId: query.domainId } : {}),
  };

  const [items, total, byStatus] = await Promise.all([
    prisma.certificationQuestion.findMany({
      where,
      orderBy: [{ createdAt: "desc" }],
      take: query.limit,
      skip: query.offset,
      include: {
        domain: { select: { id: true, name: true } },
      },
    }),
    prisma.certificationQuestion.count({ where: { certificationId: id } }),
    Promise.all([
      prisma.certificationQuestion.count({
        where: { certificationId: id, isReviewed: true, isPublished: true },
      }),
      prisma.certificationQuestion.count({
        where: { certificationId: id, isReviewed: true, isPublished: false },
      }),
      prisma.certificationQuestion.count({
        where: { certificationId: id, isReviewed: false },
      }),
    ]),
  ]);

  return ok({
    items,
    total,
    counts: {
      published: byStatus[0],
      readyToPublish: byStatus[1],
      unreviewed: byStatus[2],
    },
    paging: { limit: query.limit, offset: query.offset },
  });
});
