/**
 * GET /api/admin/providers/ollabridge/info
 *
 * Live capability + health probe for the OllaBridge admin screen.
 * Aggregates four upstream calls into one envelope the Admin ·
 * Providers panel polls every 30 s:
 *
 *   - /pair/info   → pairing_enabled / pairing_available / device_count
 *   - /v1/models   → published model list (drives the routing table)
 *   - /health      → status + version (drives the health pill)
 *   - current stored ProviderConfig (whether the admin has paired)
 *
 * Each upstream call is best-effort; one failure doesn't tank the
 * whole envelope — the screen renders partial state with a clear
 * `error` field per section.
 */

import { fail, handler, ok } from "@/lib/api";
import { listProviders } from "@/lib/ai/config-store";
import { health, listModels, OllabridgeError, pairInfo } from "@/lib/ollabridge/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false as const, status: 401, message: "Sign in required." };
  if (user.role !== "ADMIN") return { ok: false as const, status: 403, message: "Admin only." };
  return { ok: true as const, userId: user.id };
}

type SectionResult<T> = { ok: true; value: T } | { ok: false; error: string; status: number };

function settled<T>(p: Promise<T>): Promise<SectionResult<T>> {
  return p
    .then((value) => ({ ok: true as const, value }))
    .catch((err) => ({
      ok: false as const,
      error: err instanceof Error ? err.message : "unknown",
      status: err instanceof OllabridgeError ? err.status : 502,
    }));
}

export const GET = handler(async () => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);

  // Single round-trip set — three parallel calls, all best-effort.
  const [pairing, models, h] = await Promise.all([
    settled(pairInfo()),
    settled(listModels()),
    settled(health()),
  ]);

  const stored = listProviders().find((p) => p.id === "ollabridge");

  return ok({
    pairing: pairing.ok ? pairing.value : { error: pairing.error, status: pairing.status },
    models: models.ok ? models.value : { error: models.error, status: models.status },
    health: h.ok ? h.value : { status: "unreachable", error: h.error },
    stored: stored
      ? {
          enabled: stored.enabled,
          priority: stored.priority,
          baseUrl: stored.baseUrl,
          model: stored.model,
          pairingDeviceId: stored.pairingDeviceId ?? null,
          hasDeviceToken: Boolean(stored.apiKey),
          lastTestStatus: stored.lastTestStatus ?? "untested",
          lastTestMessage: stored.lastTestMessage,
          lastTestedAt: stored.lastTestedAt,
        }
      : null,
  });
});
