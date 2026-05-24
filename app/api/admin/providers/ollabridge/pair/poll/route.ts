/**
 * POST /api/admin/providers/ollabridge/pair/poll
 *
 * The admin's browser polls this every 2-5 s after /pair/start to
 * find out whether the headless PC has paired yet. The actual
 * `device_code` (the upstream credential) stays on the server in
 * pair-state.ts; the browser only sees user_code → status.
 *
 * When status flips to "approved", the device_token returned by
 * OllaBridge is immediately saved into the ProviderConfig so the
 * AI provider chain can use it as a Bearer credential, and the
 * pending entry is cleared.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listProviders, upsertProvider } from "@/lib/ai/config-store";
import { PROVIDER_CATALOGUE } from "@/lib/ai/providers";
import { probeProvider } from "@/lib/ai/chat-impl";
import { clearPendingPair, takePendingPair } from "@/lib/ollabridge/pair-state";
import { devicePoll, OllabridgeError } from "@/lib/ollabridge/client";

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
  const pending = takePendingPair(body.userCode);
  if (!pending) {
    return fail(404, "No pending pairing for that code — it may have expired.");
  }
  if (pending.adminUserId !== guard.userId) {
    return fail(403, "This pairing was started by another admin.");
  }
  if (pending.expiresAt <= Date.now()) {
    clearPendingPair(body.userCode);
    return fail(410, "Pairing code expired — generate a new one.");
  }

  let result;
  try {
    result = await devicePoll(pending.deviceCode);
  } catch (err) {
    if (err instanceof OllabridgeError) {
      return fail(err.status, err.message, { waking: err.waking });
    }
    throw err;
  }

  if (result.status === "expired") {
    clearPendingPair(body.userCode);
    return ok({ status: "expired" });
  }
  if (result.status === "pending") {
    return ok({ status: "pending" });
  }

  // status === "approved" — persist the device_token onto the
  // ProviderConfig so the chat() chain can use it.
  if (!result.device_token) {
    return fail(502, "OllaBridge approved without returning a device_token.");
  }

  const current = listProviders().find((p) => p.id === "ollabridge");
  const patched = {
    id: "ollabridge" as const,
    baseUrl: current?.baseUrl ?? PROVIDER_CATALOGUE.ollabridge.defaultBaseUrl,
    model: current?.model ?? PROVIDER_CATALOGUE.ollabridge.defaultModel,
    apiKey: result.device_token,
    pairingDeviceId: result.device_id ?? null,
    priority: current?.priority ?? 1,
    enabled: true,
    monthlyCapUsd: current?.monthlyCapUsd,
    lastTestedAt: new Date().toISOString(),
    lastTestStatus: "untested" as const,
  };

  // Quick probe so the admin sees a green or red status without a
  // second click.
  const probe = await probeProvider(patched);
  upsertProvider({
    ...patched,
    lastTestStatus: probe.ok ? "ok" : "error",
    lastTestMessage: probe.ok ? undefined : probe.message,
  });
  clearPendingPair(body.userCode);

  return ok({
    status: "approved",
    deviceId: result.device_id ?? null,
    probe,
  });
});
