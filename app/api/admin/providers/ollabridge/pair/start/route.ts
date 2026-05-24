/**
 * POST /api/admin/providers/ollabridge/pair/start
 *
 * "Generate a pairing code on this admin UI" (secondary mode in
 * OllaBridgeConfig — for headless PCs that can't display a code).
 *
 * Calls OllaBridge's `/device/start`, stashes the `device_code` in a
 * short-lived server-side map keyed by the returned `user_code`, and
 * returns the user-visible code + expiry to the admin's browser.
 *
 * The admin then tells the headless PC to call /device/pair-simple
 * with this code (or our admin UI polls `/poll` periodically — see
 * the `/poll` route).
 *
 * device_code is intentionally NOT returned to the browser — it's a
 * credential the cloud uses to authorise the eventual pairing. Only
 * the user_code is safe to show.
 */

import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deviceStart, OllabridgeError } from "@/lib/ollabridge/client";
import { rememberPendingPair } from "@/lib/ollabridge/pair-state";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false as const, status: 401, message: "Sign in required." };
  if (user.role !== "ADMIN") return { ok: false as const, status: 403, message: "Admin only." };
  return { ok: true as const, userId: user.id };
}

export const POST = handler(async () => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);

  try {
    const started = await deviceStart();
    // Save the device_code privately so the next /poll call doesn't
    // require the browser to handle (or even see) it.
    rememberPendingPair(started.user_code, {
      deviceCode: started.device_code,
      adminUserId: guard.userId,
      verificationUrl: started.verification_url,
      expiresAt: Date.now() + started.expires_in * 1000,
    });
    return ok({
      userCode: started.user_code,
      verificationUrl: started.verification_url,
      expiresIn: started.expires_in,
    });
  } catch (err) {
    if (err instanceof OllabridgeError) {
      return fail(err.status, err.message, { waking: err.waking });
    }
    throw err;
  }
});
