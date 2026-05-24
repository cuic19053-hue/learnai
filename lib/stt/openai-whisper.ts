/**
 * OpenAI Whisper API STT adapter.
 *
 * Posts the audio buffer as multipart/form-data to
 * `/audio/transcriptions` with the configured model. Returns the
 * transcription text (and language when verbose_json is requested).
 */

import "server-only";
import { SttProviderError, type SttProviderConfig, type SttRequest, type SttResult } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

export async function transcribeOpenAi(
  config: SttProviderConfig,
  req: SttRequest
): Promise<SttResult> {
  if (!config.apiKey) {
    throw new SttProviderError("OpenAI Whisper requires an API key.", 500, "openai-whisper");
  }
  const filename = req.filename ?? "audio.webm";
  const form = new FormData();
  form.set(
    "file",
    new Blob([new Uint8Array(req.audio)], { type: req.mime || "audio/webm" }),
    filename
  );
  form.set("model", config.model);
  form.set("response_format", "verbose_json");
  if (req.language) form.set("language", req.language);

  const url = `${config.baseUrl.replace(/\/+$/, "")}/audio/transcriptions`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}` },
      body: form,
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new SttProviderError("Whisper transcription timed out.", 504, "openai-whisper");
    }
    throw new SttProviderError(
      `Whisper request failed: ${(err as Error).message}`,
      502,
      "openai-whisper"
    );
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new SttProviderError(
      `Whisper returned ${resp.status}: ${text.slice(0, 200)}`,
      resp.status >= 500 ? 502 : resp.status,
      "openai-whisper"
    );
  }
  type WhisperResponse = { text?: string; language?: string; duration?: number };
  const json = (await resp.json().catch(() => ({}))) as WhisperResponse;
  if (!json.text) {
    throw new SttProviderError("Whisper returned no transcription.", 502, "openai-whisper");
  }
  return {
    text: json.text.trim(),
    language: json.language,
    durationSec: typeof json.duration === "number" ? json.duration : undefined,
    providerId: "openai-whisper",
  };
}
