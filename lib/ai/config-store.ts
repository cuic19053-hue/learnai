/**
 * Server-side admin config for AI providers. Process-local today;
 * swap to a DB row when persistence lands — the API surface is stable.
 *
 * What lives here:
 *   - the per-instance ProviderConfig[] (priority chain)
 *   - env-var fallback seeding (OLLABRIDGE_*, OPENAI_API_KEY, XAI_API_KEY,
 *     ANTHROPIC_API_KEY) so admins who prefer env over UI still work
 *   - the OllaBridge pairing-code roundtrip (issue + claim)
 */

import "server-only";
import {
  defaultProviderConfig,
  PROVIDER_CATALOGUE,
  type ProviderConfig,
  type ProviderId,
} from "./providers";

/* ── In-memory store ──────────────────────────────────────────────── */
let providers: ProviderConfig[] | null = null;

function seedFromEnv(): ProviderConfig[] {
  const seeded = defaultProviderConfig();

  // OllaBridge — adopt env overrides if present.
  const obIdx = seeded.findIndex((p) => p.id === "ollabridge");
  if (obIdx >= 0) {
    if (process.env.OLLABRIDGE_URL) seeded[obIdx]!.baseUrl = process.env.OLLABRIDGE_URL;
    if (process.env.OLLABRIDGE_MODEL) seeded[obIdx]!.model = process.env.OLLABRIDGE_MODEL;
    if (process.env.OLLABRIDGE_TOKEN) seeded[obIdx]!.apiKey = process.env.OLLABRIDGE_TOKEN;
  }

  // OpenAI — auto-enable when OPENAI_API_KEY is set.
  if (process.env.OPENAI_API_KEY) {
    seeded.push({
      id: "openai",
      baseUrl: PROVIDER_CATALOGUE.openai.defaultBaseUrl,
      model: PROVIDER_CATALOGUE.openai.defaultModel,
      apiKey: process.env.OPENAI_API_KEY,
      priority: 2,
      enabled: true,
      lastTestStatus: "untested",
    });
  }

  // Anthropic — same.
  if (process.env.ANTHROPIC_API_KEY) {
    seeded.push({
      id: "anthropic",
      baseUrl: PROVIDER_CATALOGUE.anthropic.defaultBaseUrl,
      model: PROVIDER_CATALOGUE.anthropic.defaultModel,
      apiKey: process.env.ANTHROPIC_API_KEY,
      priority: seeded.length + 1,
      enabled: true,
      lastTestStatus: "untested",
    });
  }

  // xAI Grok — same.
  if (process.env.XAI_API_KEY) {
    seeded.push({
      id: "xai",
      baseUrl: PROVIDER_CATALOGUE.xai.defaultBaseUrl,
      model: PROVIDER_CATALOGUE.xai.defaultModel,
      apiKey: process.env.XAI_API_KEY,
      priority: seeded.length + 1,
      enabled: true,
      lastTestStatus: "untested",
    });
  }

  return seeded;
}

export function listProviders(): ProviderConfig[] {
  if (providers === null) providers = seedFromEnv();
  return providers.slice().sort((a, b) => a.priority - b.priority);
}

export function setProviders(next: ProviderConfig[]): void {
  // Normalise priorities so they are 1..N contiguous after every save.
  providers = next
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((p, i) => ({ ...p, priority: i + 1 }));
}

export function upsertProvider(patch: ProviderConfig): ProviderConfig[] {
  const current = listProviders();
  const idx = current.findIndex((p) => p.id === patch.id);
  if (idx >= 0) {
    current[idx] = { ...current[idx], ...patch };
  } else {
    current.push({ ...patch, priority: patch.priority || current.length + 1 });
  }
  setProviders(current);
  return listProviders();
}

export function removeProvider(id: ProviderId): ProviderConfig[] {
  if (id === "ollabridge") {
    // OllaBridge is bundled — we disable it instead of removing so the
    // default chat path always has at least one entry.
    const current = listProviders();
    const idx = current.findIndex((p) => p.id === id);
    if (idx >= 0) current[idx] = { ...current[idx], enabled: false };
    setProviders(current);
    return listProviders();
  }
  const filtered = listProviders().filter((p) => p.id !== id);
  setProviders(filtered);
  return listProviders();
}

/** Returns the enabled providers in priority order. */
export function activeProviders(): ProviderConfig[] {
  return listProviders().filter((p) => p.enabled);
}

/* ──────────────────────────────────────────────────────────────────
   OllaBridge device pairing
   ──────────────────────────────────────────────────────────────────
   The pairing code is issued by OllaBridge's dashboard at
   https://ruslanmv-ollabridge.hf.space — we don't issue it.
   The admin pastes the code into our UI; the API route in
   app/api/admin/providers/pairing persists it on the OllaBridge
   ProviderConfig and immediately probes the connection.
   ────────────────────────────────────────────────────────────────── */
