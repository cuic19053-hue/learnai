/**
 * Admin review endpoints for a single CertificationQuestion.
 *
 *   GET    /api/admin/certifications/questions/:id
 *     Full question including correctAnswers (admin-only).
 *
 *   PATCH  /api/admin/certifications/questions/:id
 *     Update review flags or content. Used by the admin review UI to
 *     mark a generated question as reviewed + published, or to edit
 *     the prompt/options/explanation before publishing.
 *
 *   DELETE /api/admin/certifications/questions/:id
 *     Permanently remove a question (and its answers via cascade).
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";
import { filterAllowedRefs } from "@/lib/certifications/source-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PatchSchema = z.object({
  prompt: z.string().min(10).max(2_000).optional(),
  options: z
    .array(z.object({ key: z.string().min(1).max(2), text: z.string().min(1).max(400) }))
    .min(2)
    .max(6)
    .optional(),
  correctAnswers: z.array(z.string().min(1).max(2)).min(1).max(4).optional(),
  explanation: z.string().min(10).max(2_000).optional(),
  officialRefs: z
    .array(
      z.object({
        title: z.string().min(1).max(400),
        url: z.string().url(),
        sourceId: z.string().optional(),
      })
    )
    .max(5)
    .optional(),
  questionType: z.enum(["SINGLE_CHOICE", "MULTI_CHOICE", "TRUE_FALSE", "SCENARIO"]).optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  tags: z.array(z.string().min(1).max(60)).max(10).optional(),
  domainId: z.string().cuid().nullable().optional(),
  isReviewed: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const GET = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const q = await prisma.certificationQuestion.findUnique({
    where: { id },
    include: {
      certification: { select: { id: true, slug: true, title: true } },
      domain: { select: { id: true, name: true } },
    },
  });
  if (!q) return fail(404, "Question not found.");
  return ok({ question: q });
});

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const body = PatchSchema.parse(await req.json());

  const existing = await prisma.certificationQuestion.findUnique({ where: { id } });
  if (!existing) return fail(404, "Question not found.");

  // Validate officialRefs against the source-policy allowlist before
  // persisting — never bypass the source gate via the admin UI.
  if (body.officialRefs) {
    const filtered = filterAllowedRefs(body.officialRefs);
    if (filtered.length !== body.officialRefs.length) {
      return fail(400, "One or more officialRefs URLs are not on the allowlist.");
    }
  }

  const updated = await prisma.certificationQuestion.update({
    where: { id },
    data: {
      prompt: body.prompt ?? undefined,
      options: body.options ? (body.options as unknown as object) : undefined,
      correctAnswers: body.correctAnswers ?? undefined,
      explanation: body.explanation ?? undefined,
      officialRefs: body.officialRefs ? (body.officialRefs as unknown as object) : undefined,
      questionType: body.questionType ?? undefined,
      difficulty: body.difficulty ?? undefined,
      tags: body.tags ?? undefined,
      domainId: body.domainId === null ? null : (body.domainId ?? undefined),
      isReviewed: body.isReviewed ?? undefined,
      isPublished: body.isPublished ?? undefined,
      reviewedBy: body.isReviewed === true ? guard.userId : undefined,
    },
  });
  return ok({ question: updated });
});

export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const result = await prisma.certificationQuestion.deleteMany({ where: { id } });
  if (result.count === 0) return fail(404, "Question not found.");
  return ok({ deleted: true });
});
