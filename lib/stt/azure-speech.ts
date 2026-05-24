/**
 * Azure AI Speech short-audio transcription.
 *
 * Uses the "Conversation Transcription / Speech-to-text REST API for
 * short audio" endpoint. Audio must be ≤ 60s and one of the
 * supported formats (WAV/PCM at 16 kHz preferred). For longer clips
 * use the batch transcription API — out of scope here.
 */

import "server-only";
import { SttProviderError, type SttProviderConfig, type SttRequest, type SttResult } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;

export async function transcribeAzure(
  config: SttProviderConfig,
  req: SttRequest
): Promise<SttResult> {
  if (!config.apiKey) {
    throw new SttProviderError("Azure Speech requires a subscription key.", 500, "azure-speech");
  }
  const language = req.language ?? "en-US";
  const url = `${config.baseUrl.replace(/\/+$/, "")}/sts/v1.0/recognition/conversation/cognitiveservices/v1?language=${encodeURIComponent(language)}`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), req.timeoutMs ?? DEFAULT_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": config.apiKey,
        "Content-Type": req.mime || "audio/wav; codecs=audio/pcm; samplerate=16000",
        Accept: "application/json",
      },
      body: new Uint8Array(req.audio),
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new SttProviderError("Azure Speech timed out.", 504, "azure-speech");
    }
    throw new SttProviderError(
      `Azure Speech request failed: ${(err as Error).message}`,
      502,
      "azure-speech"
    );
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new SttProviderError(
      `Azure Speech returned ${resp.status}: ${text.slice(0, 200)}`,
      resp.status >= 500 ? 502 : resp.status,
      "azure-speech"
    );
  }
  type AzureResponse = {
    RecognitionStatus?: string;
    DisplayText?: string;
    NBest?: Array<{ Display?: string; Lexical?: string }>;
  };
  const json = (await resp.json().catch(() => ({}))) as AzureResponse;
  const text = json.DisplayText ?? json.NBest?.[0]?.Display ?? json.NBest?.[0]?.Lexical;
  if (!text || json.RecognitionStatus !== "Success") {
    throw new SttProviderError(
      `Azure Speech recognition status: ${json.RecognitionStatus ?? "unknown"}`,
      502,
      "azure-speech"
    );
  }
  return {
    text: text.trim(),
    language,
    providerId: "azure-speech",
  };
}
