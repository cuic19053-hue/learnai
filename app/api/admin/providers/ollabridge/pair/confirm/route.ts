/**
 * POST /api/admin/providers/ollabridge/pair/confirm
 *
 * Primary pairing mode: the PC (running `ollabridge pair`) printed a
 * user_code on its own screen; the admin types it into the LearnAI
 * Admin · Providers screen here.
 *
 * We don't get the device_token directly — the PC owns the device_code
 * and is responsible for the poll that yields the token. We just
 * approve the user_code with the cloud (scoped to this admin's user
 * id via X-User-Id) and respond OK; the PC's next /device/poll round
 * will receive the token automatically.
 *
 * If the admin wants to ALSO use this paired PC's compute from the
 * LearnAI server, the PC can later report its token via a separate
 * flow (or the admin can use the secondary "generate code" mode).
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  DEFAULT_CONFIG,
  deviceConfirm,
  isValidUserCode,
  normaliseUserCode,
  OllabridgeError,
} from "@/lib/ollabridge/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  userCode: z.string().min(8).max(12),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false as const, status: 401, message: "Sign in required." };
  if (user.role !== "ADMIN") return { ok: false as const, status: 403, message: "Admin only." };
  return { ok: true as const, userId: user.id };
}

export const POST = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);

  const body = BodySchema.parse(await req.json());
  const userCode = normaliseUserCode(body.userCode);
  if (!isValidUserCode(userCode)) {
    return fail(400, "Code must be in the format ABCD-1234.");
  }

  try {
    await deviceConfirm(userCode, {
      ...DEFAULT_CONFIG,
      userId: guard.userId,
    });
    return ok({
      status: "approved",
      userCode,
      note: "The PC's next /device/poll round will receive its device_token.",
    });
  } catch (err) {
    if (err instanceof OllabridgeError) {
      return fail(err.status, err.message, { waking: err.waking });
    }
    throw err;
  }
});
