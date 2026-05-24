/**
 * POST /api/admin/certifications/questions/bulk
 *
 * Bulk operations on a set of question ids — used by the add-cert
 * wizard's Step 4 review screen to:
 *
 *   - mark many at once as reviewed (`action: "review"`)
 *   - approve & publish many at once (`action: "publish"`)
 *   - unpublish many at once (`action: "unpublish"`)
 *   - delete rejected drafts (`action: "delete"`)
 *
 * Ids must belong to the same `certificationId` (server-enforced) so
 * an admin can't accidentally batch across certs.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  certificationId: z.string().cuid(),
  action: z.enum(["review", "publish", "unpublish", "delete"]),
  ids: z.array(z.string().cuid()).min(1).max(200),
});

export const POST = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const body = BodySchema.parse(await req.json());

  // Restrict to questions that actually belong to the cert.
  const where = { id: { in: body.ids }, certificationId: body.certificationId };

  if (body.action === "delete") {
    const result = await prisma.certificationQuestion.deleteMany({ where });
    return ok({ action: body.action, affected: result.count });
  }

  const data =
    body.action === "review"
      ? { isReviewed: true, reviewedBy: guard.userId }
      : body.action === "publish"
        ? { isReviewed: true, isPublished: true, reviewedBy: guard.userId }
        : /* unpublish */ { isPublished: false };

  const result = await prisma.certificationQuestion.updateMany({ where, data });
  return ok({ action: body.action, affected: result.count });
});
