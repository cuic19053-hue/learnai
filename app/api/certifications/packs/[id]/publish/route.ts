/**
 * POST /api/certifications/packs/:id/publish
 *
 * Flip a user-created pack to ACTIVE/isPublished=true. Auto-marks
 * generated questions as reviewed-and-published when the user owns
 * the pack — community packs trust the creator's review the way the
 * admin path trusts staff. Admins retain the strict review-gated
 * behaviour via the existing admin route.
 *
 * Refuses to publish a pack with no sources or zero questions.
 */

import { z } from "zod";
import { fail, handler, ok, rateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireSignedIn } from "@/lib/certifications/user-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  status: z.enum(["ACTIVE", "BETA", "DRAFT"]).default("ACTIVE"),
});

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireSignedIn();
  if (!guard.ok) return fail(guard.status, guard.message);
  const limit = rateLimit(`cert:packs:pub:${guard.userId}`, { limit: 20, windowMs: 60 * 60_000 });
  if (!limit.allowed) return fail(429, "Publish rate limit reached.");

  const { id } = await ctx.params;
  const body = BodySchema.parse(await req.json().catch(() => ({})));

  const cert = await prisma.certification.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      _count: { select: { questions: true, sources: true } },
    },
  });
  if (!cert) return fail(404, "Pack not found.");

  if (body.status === "DRAFT") {
    const updated = await prisma.certification.update({
      where: { id },
      data: { isPublished: false, status: "DRAFT" },
    });
    return ok({ certification: updated, unpublished: true });
  }

  if (cert._count.sources === 0) {
    return fail(409, "Add at least one official source before publishing.");
  }
  if (cert._count.questions === 0) {
    return fail(409, "Generate at least one question before publishing.");
  }

  const reviewed = await prisma.certificationQuestion.updateMany({
    where: { certificationId: id, isReviewed: false },
    data: { isReviewed: true },
  });
  const published = await prisma.certificationQuestion.updateMany({
    where: { certificationId: id, isPublished: false },
    data: { isPublished: true },
  });

  const updated = await prisma.certification.update({
    where: { id },
    data: { isPublished: true, status: body.status },
  });

  return ok({
    certification: updated,
    questionsReviewed: reviewed.count,
    questionsPublished: published.count,
  });
});
