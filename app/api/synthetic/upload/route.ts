/**
 * POST /api/synthetic/upload
 *
 * Accepts a single multipart file (`file` field). Validates size +
 * MIME, stashes the bytes in the in-memory upload store, and returns
 * an opaque `uploadId` that the wizard then submits in the create-job
 * payload as `{kind: "upload", uploadId, mime, filename}`.
 *
 * The store TTL is short (5 minutes) and a successful `takeUpload`
 * clears the buffer, so a stale id can't be replayed indefinitely.
 */

import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { putUpload, UPLOAD_MAX_BYTES } from "@/lib/synthetic/jobs/upload-store";
import { SUPPORTED_UPLOAD_MIMES } from "@/lib/synthetic/extract";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`synthetic:upload:${clientIp(req)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.allowed) {
    return fail(429, "Too many uploads. Try again in a minute.");
  }

  // Quick content-length pre-check before reading the body.
  const lengthHeader = req.headers.get("content-length");
  if (lengthHeader && Number(lengthHeader) > UPLOAD_MAX_BYTES + 4_096) {
    return fail(413, `Upload exceeds the ${UPLOAD_MAX_BYTES.toLocaleString()}-byte limit.`);
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
  const mime = file.type || "application/octet-stream";
  if (!SUPPORTED_UPLOAD_MIMES.has(mime)) {
    return fail(415, `Unsupported file type: ${mime}.`, {
      supported: Array.from(SUPPORTED_UPLOAD_MIMES),
    });
  }
  if (file.size > UPLOAD_MAX_BYTES) {
    return fail(413, `Upload exceeds the ${UPLOAD_MAX_BYTES.toLocaleString()}-byte limit.`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const uploadId = putUpload({
    buffer,
    filename: file.name || "upload",
    mime,
  });

  return ok({
    uploadId,
    mime,
    filename: file.name || "upload",
    bytes: buffer.byteLength,
  });
});
