/**
 * POST /api/certifications/packs/:id/generate
 *
 * Run AI generation on a user-created pack. Same provider chain and
 * citation-enforcement that the admin endpoint uses, plus tight
 * per-user rate limits (cost containment) and a smaller per-call cap
 * (max 10 questions, vs 25 for admins).
 *
 * Generated questions land as `isReviewed=false, isPublished=false`
 * and stay invisible until the pack itself is published.
 */

import { z } from "zod";
import { fail, handler, ok, rateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireSignedIn } from "@/lib/certifications/user-guard";
import {
  generateQuestionsForCertification,
  QuestionGenerationError,
} from "@/lib/certifications/question-generator";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  count: z.number().int().min(1).max(10).default(5),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
});

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireSignedIn();
  if (!guard.ok) return fail(guard.status, guard.message);
  const limit = rateLimit(`cert:packs:gen:${guard.userId}`, { limit: 6, windowMs: 60 * 60_000 });
  if (!limit.allowed) return fail(429, "Hourly generation limit reached — try again shortly.");

  const { id } = await ctx.params;
  const body = BodySchema.parse(await req.json().catch(() => ({})));

  const cert = await prisma.certification.findUnique({
    where: { id },
    select: { id: true, slug: true, isPublished: true },
  });
  if (!cert) return fail(404, "Pack not found.");
  if (cert.isPublished && guard.role !== "ADMIN") {
    return fail(403, "Pack is published — only admins can generate more questions.");
  }

  try {
    const created = await generateQuestionsForCertification({
      certificationId: cert.id,
      count: body.count,
      difficulty: body.difficulty,
    });
    return ok({
      requested: body.count,
      created: created.length,
      items: created,
      note: "Questions await review before they appear in the live drill.",
    });
  } catch (err) {
    if (err instanceof QuestionGenerationError) return fail(err.status, err.message);
    throw err;
  }
});
