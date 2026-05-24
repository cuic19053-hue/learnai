/**
 * Per-provider monthly spend dashboard.
 *
 *   GET /api/admin/providers/spend
 *     Returns the current month's running totals per provider plus
 *     the configured monthly cap and the % used so the admin UI can
 *     surface 50/80/95% alerts.
 *
 *   POST /api/admin/providers/spend
 *     Body: { providerId: string, action: "reset" }
 *     Reset the current month's bucket for one provider (e.g. after a
 *     billing correction).
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { activeProviders } from "@/lib/ai/config-store";
import { resetSpend, spendSummary } from "@/lib/ai/spend-tracker";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false as const, status: 401, message: "Sign in required." };
  if (user.role !== "ADMIN") return { ok: false as const, status: 403, message: "Admin only." };
  return { ok: true as const, userId: user.id };
}

export const GET = handler(async () => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const providers = activeProviders();
  const items = spendSummary(providers);
  return ok({ items });
});

const PostSchema = z.object({
  providerId: z.string().min(1).max(40),
  action: z.enum(["reset"]),
});

export const POST = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const body = PostSchema.parse(await req.json());
  if (body.action === "reset") {
    const prior = resetSpend(body.providerId);
    return ok({ providerId: body.providerId, action: "reset", priorSpendUsd: prior.spendUsd });
  }
  return fail(400, "Unknown action.");
});
