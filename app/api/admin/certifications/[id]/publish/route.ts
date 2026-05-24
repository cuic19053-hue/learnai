/**
 * Step 4 of the add-cert admin wizard: PUBLISH.
 *
 *   POST /api/admin/certifications/:id/publish
 *     Body: { publishQuestions?: boolean, status?: "ACTIVE"|"BETA" }
 *
 *   - Flips the certification to isPublished=true and status to ACTIVE
 *     (or BETA if requested).
 *   - When publishQuestions=true (default), bulk-publishes every
 *     `isReviewed=true` question for this cert. Unreviewed questions
 *     are left alone — the admin must review them first via
 *     /api/admin/certifications/questions/:id PATCH.
 *
 *   POST /api/admin/certifications/:id/publish (with status="DRAFT")
 *     Un-publish — useful for emergencies (bad question slipped
 *     through review). Sets isPublished=false but keeps questions
 *     untouched.
 *
 * Refuses to publish a cert that has zero published-and-reviewed
 * questions and no other questions ready to publish — there'd be
 * nothing for the learner to do.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  publishQuestions: z.boolean().default(true),
  status: z.enum(["ACTIVE", "BETA", "DRAFT"]).default("ACTIVE"),
});

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const body = BodySchema.parse(await req.json().catch(() => ({})));

  const cert = await prisma.certification.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      status: true,
      isPublished: true,
      _count: { select: { questions: true, sources: true } },
    },
  });
  if (!cert) return fail(404, "Certification not found.");

  if (body.status === "DRAFT") {
    const updated = await prisma.certification.update({
      where: { id },
      data: { isPublished: false, status: "DRAFT" },
    });
    return ok({ certification: updated, unpublished: true });
  }

  // Publish path — verify there's content to serve.
  if (cert._count.sources === 0) {
    return fail(409, "Cannot publish a certification with zero official sources.");
  }
  const alreadyPublished = await prisma.certificationQuestion.count({
    where: { certificationId: id, isPublished: true },
  });
  const ready = await prisma.certificationQuestion.count({
    where: { certificationId: id, isReviewed: true, isPublished: false },
  });
  if (alreadyPublished === 0 && ready === 0) {
    return fail(
      409,
      "No reviewed questions ready to publish. Review at least a few questions before publishing the certification."
    );
  }

  // Bulk-publish reviewed-but-not-yet-published questions if requested.
  let publishedCount = 0;
  if (body.publishQuestions) {
    const result = await prisma.certificationQuestion.updateMany({
      where: { certificationId: id, isReviewed: true, isPublished: false },
      data: { isPublished: true },
    });
    publishedCount = result.count;
  }

  const updated = await prisma.certification.update({
    where: { id },
    data: { isPublished: true, status: body.status },
  });

  // eslint-disable-next-line no-console
  console.info(
    JSON.stringify({
      event: "certifications.publish",
      id,
      slug: cert.slug,
      status: body.status,
      questionsPublished: publishedCount,
      alreadyPublished,
    })
  );

  return ok({
    certification: updated,
    questionsPublished: publishedCount,
    alreadyPublished,
  });
});
