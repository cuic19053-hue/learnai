/**
 * POST /api/stt
 *
 * Multipart speech-to-text endpoint. Expected form fields:
 *   - file        the audio Blob (audio/webm, audio/mp3, audio/wav, ...)
 *   - language?   optional BCP-47 language hint (e.g. "en", "es", "es-MX")
 *
 * Runs the audio through the STT provider chain (Whisper API → Azure
 * → local Whisper, depending on what's configured) and returns the
 * transcribed text. The same fallback semantics as the chat provider
 * chain: a 5xx from one provider triggers the next.
 *
 * Used by:
 *   - Mock defense (item 36): committee captures spoken answers.
 *   - Interview training: spoken response transcription.
 *   - Project wizard "speak your topic" affordance.
 */

import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { STT_MAX_BYTES, SttProviderError, transcribe } from "@/lib/stt";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SUPPORTED_PREFIXES = ["audio/", "video/webm", "video/mp4"];

export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`stt:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) {
    return fail(429, "Too many transcription requests. Try again in a minute.");
  }

  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > STT_MAX_BYTES + 4_096) {
    return fail(413, `Upload exceeds the ${STT_MAX_BYTES.toLocaleString()}-byte limit.`);
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch (err) {
    return fail(
      400,
      `Invalid multipart payload: ${err instanceof Error ? err.message : "unknown"}.`
    );
  }

  const entry = form.get("file");
  if (!entry || typeof entry === "string") {
    return fail(400, 'Missing "file" field in multipart form data.');
  }
  const file = entry as File;
  const mime = file.type || "audio/webm";
  if (!SUPPORTED_PREFIXES.some((p) => mime.startsWith(p))) {
    return fail(415, `Unsupported audio type: ${mime}.`);
  }
  if (file.size > STT_MAX_BYTES) {
    return fail(413, `Audio exceeds the ${STT_MAX_BYTES.toLocaleString()}-byte limit.`);
  }

  const language = (form.get("language") as string | null) || undefined;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    const result = await transcribe({
      audio: buffer,
      mime,
      filename: file.name || "audio.webm",
      language: language?.slice(0, 8),
    });
    return ok({
      text: result.text,
      language: result.language,
      durationSec: result.durationSec,
      providerId: result.providerId,
    });
  } catch (err) {
    if (err instanceof SttProviderError) {
      return fail(err.status, err.message, { providerId: err.providerId });
    }
    throw err;
  }
});
