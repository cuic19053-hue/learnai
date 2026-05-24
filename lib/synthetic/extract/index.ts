/**
 * Extractor dispatch — single entry point for every source kind.
 *
 * The rest of the synthetic pipeline never branches on `SourceInput.kind`;
 * it asks `extractSource(input)` and gets back the same `ExtractedSource`
 * shape regardless of whether the bytes came from Wikipedia, a PDF
 * upload, or a paste box.
 *
 * Uploads are looked up by `uploadId` in the temporary upload store —
 * the multipart endpoint writes the file there and hands the wizard an
 * id, so this module never has to touch `formData()` itself.
 */

import "server-only";
import type { ExtractedSource, SourceInput } from "../types";
import { extractDocx, DocxExtractionError } from "./docx";
import { extractPdf, PdfExtractionError } from "./pdf";
import { extractText, TextExtractionError } from "./text";
import { extractWiki, WikiSourceError } from "./wiki";
import { takeUpload } from "../jobs/upload-store";

export class ExtractionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly remediation?: string
  ) {
    super(message);
    this.name = "ExtractionError";
  }
}

/**
 * MIME types the upload extractor knows how to read. The multipart
 * endpoint enforces the same list as a first line of defense.
 */
export const SUPPORTED_UPLOAD_MIMES = new Set<string>([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "text/markdown",
]);

export async function extractSource(input: SourceInput): Promise<ExtractedSource> {
  try {
    switch (input.kind) {
      case "wiki":
        return await extractWiki(input);
      case "text":
        return await extractText(input);
      case "upload": {
        const file = takeUpload(input.uploadId);
        if (!file) {
          throw new ExtractionError(
            "Uploaded file is not available — it may have expired. Re-upload and try again.",
            410
          );
        }
        if (input.mime === "application/pdf") return await extractPdf(file.buffer, file.filename);
        if (
          input.mime ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          input.mime === "application/msword"
        ) {
          return await extractDocx(file.buffer, file.filename);
        }
        if (input.mime.startsWith("text/")) {
          return await extractText({
            kind: "text",
            body: file.buffer.toString("utf-8"),
            title: file.filename,
          });
        }
        throw new ExtractionError(`Unsupported upload type: ${input.mime}`, 415);
      }
      default: {
        const exhaustive: never = input;
        void exhaustive;
        throw new ExtractionError("Unknown source kind.", 400);
      }
    }
  } catch (err) {
    // Normalize known extractor errors into ExtractionError so the
    // API layer has a single error type to inspect.
    if (err instanceof ExtractionError) throw err;
    if (err instanceof WikiSourceError || err instanceof TextExtractionError) {
      throw new ExtractionError(err.message, err.status);
    }
    if (err instanceof PdfExtractionError || err instanceof DocxExtractionError) {
      throw new ExtractionError(err.message, err.status, err.remediation);
    }
    throw err;
  }
}
