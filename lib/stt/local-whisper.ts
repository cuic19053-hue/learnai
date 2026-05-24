/**
 * Self-hosted Whisper adapter.
 *
 * Posts to a configurable OpenAI-compatible Whisper endpoint
 * (`LOCAL_WHISPER_URL`). Compatible with faster-whisper-server,
 * whisper-asr-webservice, and similar projects.
 */

import "server-only";
import { SttProviderError, type SttProviderConfig, type SttRequest, type SttResult } from "./types";

const DEFAULT_TIMEOUT_MS = 45_000;

export async function transcribeLocalWhisper(
  config: SttProviderConfig,
  req: SttRequest
): Promise<SttResult> {
  const filename = req.filename ?? "audio.webm";
  const form = new FormData();
  form.set(
    "file",
    new Blob([new Uint8Array(req.audio)], { type: req.mime || "audio/webm" }),
    filename
  );
  form.set("model", config.model || "base");
  form.set("response_format", "verbose_json");
  if (req.language) form.set("language", req.language);

  const url = `${config.baseUrl.replace(/\/+$/, "")}/v1/audio/transcriptions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : undefined,
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new SttProviderError("Local Whisper timed out.", 504, "local-whisper");
    }
    throw new SttProviderError(
      `Local Whisper request failed: ${(err as Error).message}`,
      502,
      "local-whisper"
    );
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new SttProviderError(
      `Local Whisper returned ${resp.status}: ${text.slice(0, 200)}`,
      resp.status >= 500 ? 502 : resp.status,
      "local-whisper"
    );
  }
  type WhisperResponse = { text?: string; language?: string; duration?: number };
  const json = (await resp.json().catch(() => ({}))) as WhisperResponse;
  if (!json.text) {
    throw new SttProviderError("Local Whisper returned no transcription.", 502, "local-whisper");
  }
  return {
    text: json.text.trim(),
    language: json.language,
    durationSec: typeof json.duration === "number" ? json.duration : undefined,
    providerId: "local-whisper",
  };
}
