/**
 * POST /api/admin/certifications/generate-questions
 *
 * Admin-only. Spawns AI generation of original practice questions
 * grounded in the certification's vendor-owned sources, persists
 * the results as `isReviewed=false, isPublished=false` rows for the
 * admin to triage before learners see them.
 *
 * Uses the existing AI provider chain (OllaBridge default ->
 * OpenAI/Anthropic/etc as configured), not a single SDK directly.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";
import {
  generateQuestionsForCertification,
  QuestionGenerationError,
} from "@/lib/certifications/question-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  slug: z.string().min(1).max(120),
  count: z.number().int().min(1).max(25).default(10),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  domainId: z.string().cuid().optional(),
});

export const POST = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const body = BodySchema.parse(await req.json());

  const certification = await prisma.certification.findUnique({
    where: { slug: body.slug },
    select: { id: true },
  });
  if (!certification) return fail(404, "Certification not found.");

  try {
    const created = await generateQuestionsForCertification({
      certificationId: certification.id,
      count: body.count,
      difficulty: body.difficulty,
      domainId: body.domainId,
    });

    // eslint-disable-next-line no-console
    console.info(
      JSON.stringify({
        event: "certifications.generate",
        slug: body.slug,
        requested: body.count,
        created: created.length,
        difficulty: body.difficulty,
      })
    );

    return ok({
      requested: body.count,
      created: created.length,
      items: created,
      note: "Generated questions await admin review (isReviewed=false, isPublished=false).",
    });
  } catch (err) {
    if (err instanceof QuestionGenerationError) {
      return fail(err.status, err.message);
    }
    throw err;
  }
});
