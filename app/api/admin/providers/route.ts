import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import {
  listProviders,
  removeProvider,
  upsertProvider,
} from "@/lib/ai/config-store";
import { PROVIDER_IDS } from "@/lib/ai/providers";

export const dynamic = "force-dynamic";

const ProviderIdSchema = z.enum(PROVIDER_IDS as [typeof PROVIDER_IDS[number], ...Array<typeof PROVIDER_IDS[number]>]);

const UpsertSchema = z.object({
  id: ProviderIdSchema,
  label: z.string().max(80).optional(),
  baseUrl: z.string().url().max(400),
  model: z.string().min(1).max(120),
  apiKey: z.string().max(400).optional(),
  priority: z.number().int().min(1).max(20),
  monthlyCapUsd: z.number().int().min(0).max(10_000).optional(),
  enabled: z.boolean(),
  pairingDeviceId: z.string().max(80).optional(),
});

/** GET — list all configured providers (admin overview). */
export const GET = handler(async () => {
  // Strip API keys from the wire — the UI shows masked dots only.
  const safe = listProviders().map((p) => ({
    ...p,
    apiKey: p.apiKey ? `${"•".repeat(8)}${p.apiKey.slice(-4)}` : undefined,
    hasApiKey: !!p.apiKey,
  }));
  return ok({ providers: safe });
});

/** POST — upsert a provider. */
export const POST = handler(async (req: Request) => {
  const body = UpsertSchema.parse(await req.json());
  const next = upsertProvider(body);
  return ok({
    providers: next.map((p) => ({
      ...p,
      apiKey: p.apiKey ? `${"•".repeat(8)}${p.apiKey.slice(-4)}` : undefined,
      hasApiKey: !!p.apiKey,
    })),
  });
});

/** DELETE — remove a provider (OllaBridge is disabled-in-place). */
export const DELETE = handler(async (req: Request) => {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return fail(400, "Missing ?id=");
  const parsed = ProviderIdSchema.safeParse(id);
  if (!parsed.success) return fail(400, "Unknown provider id");
  const next = removeProvider(parsed.data);
  return ok({
    providers: next.map((p) => ({
      ...p,
      apiKey: p.apiKey ? `${"•".repeat(8)}${p.apiKey.slice(-4)}` : undefined,
      hasApiKey: !!p.apiKey,
    })),
  });
});
