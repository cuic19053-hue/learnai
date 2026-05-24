/**
 * Shared types for the speech-to-text subsystem.
 *
 * Mirrors the shape of `lib/ai/*` — a small provider chain with
 * fallback, so a deployment can mix a paid cloud STT (OpenAI Whisper
 * API, Azure Speech) with a self-hosted backstop and still answer
 * 200 even when one tier is down.
 */

export type SttProviderId = "openai-whisper" | "azure-speech" | "local-whisper";

export type SttProviderConfig = {
  id: SttProviderId;
  /** Optional human-friendly label for the admin UI. */
  label?: string;
  /** Effective base URL. */
  baseUrl: string;
  /** Model id (e.g. "whisper-1"). */
  model: string;
  /** API key — never returned by the admin GET endpoint. */
  apiKey?: string;
  priority: number;
  enabled: boolean;
};

export type SttRequest = {
  /** Raw audio buffer (caller already decoded the multipart). */
  audio: Buffer;
  /** Audio content type (e.g. "audio/webm", "audio/mp3"). */
  mime: string;
  /** Original filename — providers sometimes use the extension. */
  filename?: string;
  /** Optional BCP-47 language hint (e.g. "en", "es"). */
  language?: string;
  /** Total wall-clock budget. */
  timeoutMs?: number;
};

export type SttResult = {
  text: string;
  language?: string;
  durationSec?: number;
  providerId: SttProviderId;
};

export class SttProviderError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly providerId?: SttProviderId
  ) {
    super(message);
    this.name = "SttProviderError";
  }
}
