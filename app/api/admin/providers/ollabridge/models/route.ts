/**
 * GET /api/admin/providers/ollabridge/models
 *
 * Proxies `/v1/models` so the admin model-routing table renders the
 * real model list instead of the aspirational hard-coded one. The
 * CPU-basic Space ships only `qwen2.5:0.5b` today; this endpoint
 * surfaces whatever is actually published.
 *
 * Cached for 15 s so the routing-table screen can re-render without
 * hammering the cloud.
 */

import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listModels, OllabridgeError, type ModelInfo } from "@/lib/ollabridge/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const CACHE_TTL_MS = 15_000;
let cache: { fetchedAt: number; models: ModelInfo[] } | null = null;

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

  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return ok({ models: cache.models, cached: true });
  }

  try {
    const models = await listModels();
    cache = { fetchedAt: Date.now(), models };
    return ok({ models, cached: false });
  } catch (err) {
    if (err instanceof OllabridgeError) {
      return fail(err.status, err.message, { waking: err.waking });
    }
    throw err;
  }
});
