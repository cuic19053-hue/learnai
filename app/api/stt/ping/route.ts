/**
 * GET /api/stt/ping
 *
 * Health probe for the STT provider chain. Reports which providers
 * are configured (by id, no keys) so the admin overview can show
 * STT alongside the existing /api/ai/ping signal.
 */

import { handler, ok } from "@/lib/api";
import { activeSttProviders } from "@/lib/stt/providers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async () => {
  const chain = activeSttProviders();
  return ok({
    reachable: chain.length > 0,
    chain: chain.map((p) => ({
      id: p.id,
      priority: p.priority,
      enabled: p.enabled,
      baseUrl: p.baseUrl,
    })),
  });
});
