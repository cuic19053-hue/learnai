/**
 * DELETE /api/admin/certifications/:id/sources/:sourceId
 *
 * Remove a single source from a certification. Used by the add-cert
 * wizard's Step 2 ("undo that source") and by the admin source
 * editor.
 */

import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const DELETE = handler(
  async (_req: Request, ctx: { params: Promise<{ id: string; sourceId: string }> }) => {
    const guard = await requireAdmin();
    if (!guard.ok) return fail(guard.status, guard.message);
    const { id, sourceId } = await ctx.params;
    const result = await prisma.certificationSource.deleteMany({
      where: { id: sourceId, certificationId: id },
    });
    if (result.count === 0) return fail(404, "Source not found.");
    return ok({ deleted: true });
  }
);
