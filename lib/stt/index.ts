/**
 * STT entry point — multi-provider fallback chain.
 *
 * Mirrors the design of `lib/ai/provider.ts`. Walks the configured
 * STT providers in priority order and returns the first successful
 * transcription. Falls through on `SttProviderError`; surfaces the
 * last failure when every provider has failed.
 */

import "server-only";
import { transcribeAzure } from "./azure-speech";
import { transcribeLocalWhisper } from "./local-whisper";
import { transcribeOpenAi } from "./openai-whisper";
import { activeSttProviders } from "./providers";
import { SttProviderError, type SttRequest, type SttResult } from "./types";

export { SttProviderError } from "./types";
export type { SttRequest, SttResult } from "./types";

/** Hard upload-size cap to keep memory bounded. ~12 MB raw audio. */
export const STT_MAX_BYTES = 12 * 1024 * 1024;

export async function transcribe(req: SttRequest): Promise<SttResult> {
  if (req.audio.byteLength > STT_MAX_BYTES) {
    throw new SttProviderError(
      `Audio exceeds the ${STT_MAX_BYTES.toLocaleString()}-byte limit (got ${req.audio.byteLength}).`,
      413
    );
  }
  const chain = activeSttProviders();
  if (chain.length === 0) {
    throw new SttProviderError(
      "No STT providers are configured. Set one of OPENAI_API_KEY, AZURE_SPEECH_KEY+AZURE_SPEECH_REGION, or LOCAL_WHISPER_URL.",
      503
    );
  }

  const errors: Array<{ provider: string; message: string; status: number }> = [];
  for (const config of chain) {
    if (!config.enabled) continue;
    try {
      switch (config.id) {
        case "openai-whisper":
          return await transcribeOpenAi(config, req);
        case "azure-speech":
          return await transcribeAzure(config, req);
        case "local-whisper":
          return await transcribeLocalWhisper(config, req);
        default: {
          // Defensive — new provider id added to the type but no adapter yet.
          throw new SttProviderError(`Unknown STT provider: ${config.id}`, 500);
        }
      }
    } catch (err) {
      if (err instanceof SttProviderError) {
        errors.push({ provider: config.id, message: err.message, status: err.status });
        continue;
      }
      throw err;
    }
  }
  const last = errors[errors.length - 1];
  throw new SttProviderError(
    `All ${chain.length} STT providers failed. Last (${last?.provider ?? "unknown"}): ${last?.message ?? "no providers"}`,
    last?.status ?? 503
  );
}
