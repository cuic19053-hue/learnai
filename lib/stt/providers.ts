/**
 * STT provider catalogue + active-chain seeding from env vars.
 *
 * Mirrors `lib/ai/config-store.ts` but smaller. Seed comes from:
 *   - OPENAI_API_KEY        → openai-whisper
 *   - AZURE_SPEECH_KEY      → azure-speech (also needs AZURE_SPEECH_REGION)
 *   - LOCAL_WHISPER_URL     → local-whisper (e.g. a self-hosted faster-whisper)
 *
 * Admin overrides are a future PR; for the MVP env-var configuration
 * is enough — the same model the rate limiter and ai/config-store
 * already use.
 */

import "server-only";
import type { SttProviderConfig } from "./types";

export function activeSttProviders(): SttProviderConfig[] {
  const out: SttProviderConfig[] = [];
  if (process.env.OPENAI_API_KEY) {
    out.push({
      id: "openai-whisper",
      baseUrl: "https://api.openai.com/v1",
      model: process.env.OPENAI_STT_MODEL || "whisper-1",
      apiKey: process.env.OPENAI_API_KEY,
      priority: 1,
      enabled: true,
    });
  }
  if (process.env.AZURE_SPEECH_KEY && process.env.AZURE_SPEECH_REGION) {
    out.push({
      id: "azure-speech",
      baseUrl: `https://${process.env.AZURE_SPEECH_REGION}.api.cognitive.microsoft.com`,
      model: "default",
      apiKey: process.env.AZURE_SPEECH_KEY,
      priority: 2,
      enabled: true,
    });
  }
  if (process.env.LOCAL_WHISPER_URL) {
    out.push({
      id: "local-whisper",
      baseUrl: process.env.LOCAL_WHISPER_URL,
      model: process.env.LOCAL_WHISPER_MODEL || "base",
      priority: 3,
      enabled: true,
    });
  }
  return out.sort((a, b) => a.priority - b.priority);
}
