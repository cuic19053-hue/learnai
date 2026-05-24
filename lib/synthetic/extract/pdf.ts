/**
 * PDF source extractor — lazily imports `pdf-parse` so the rest of
 * the synthetic pipeline works in a fresh environment that hasn't
 * installed the optional dependency yet.
 *
 * When pdf-parse is missing the API responds with a clean 415 +
 * remediation hint instead of an opaque module-not-found stack trace.
 *
 * Install with: `npm install pdf-parse @types/pdf-parse`
 */

import "server-only";
import { createHash } from "node:crypto";
import { normalizeText, paragraphsOf } from "./text";
import type { ExtractedSource } from "../types";

const MIN_CHARS = 80;
const MAX_CHARS = 200_000;

export class PdfExtractionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly remediation?: string
  ) {
    super(message);
    this.name = "PdfExtractionError";
  }
}

/**
 * Lazily resolve `pdf-parse`. Returns `null` if it isn't installed so
 * the caller can surface a friendly 415.
 */
async function loadPdfParse(): Promise<
  ((buf: Buffer) => Promise<{ text: string; info?: { Title?: string } }>) | null
> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = await import("pdf-parse" /* webpackIgnore: true */ as string).catch(() => null);
    if (!mod) return null;
    // pdf-parse exports a default function.
    const fn = (mod as { default?: unknown }).default ?? mod;
    if (typeof fn !== "function") return null;
    return fn as (buf: Buffer) => Promise<{ text: string; info?: { Title?: string } }>;
  } catch {
    return null;
  }
}

export async function extractPdf(buffer: Buffer, filename: string): Promise<ExtractedSource> {
  const pdfParse = await loadPdfParse();
  if (!pdfParse) {
    throw new PdfExtractionError(
      "PDF extraction is not available in this deployment.",
      415,
      "Install the optional dependency: `npm install pdf-parse @types/pdf-parse`"
    );
  }

  let parsed: { text: string; info?: { Title?: string } };
  try {
    parsed = await pdfParse(buffer);
  } catch (err) {
    throw new PdfExtractionError(
      `Couldn't read this PDF (${err instanceof Error ? err.message : "unknown error"}). The file may be encrypted, image-only, or corrupted.`,
      422
    );
  }

  const normalized = normalizeText(parsed.text);
  if (normalized.length < MIN_CHARS) {
    throw new PdfExtractionError(
      `Extracted PDF text is too short (${normalized.length} characters). Image-only PDFs need OCR first.`,
      422
    );
  }
  if (normalized.length > MAX_CHARS) {
    throw new PdfExtractionError(
      `PDF text exceeds the ${MAX_CHARS.toLocaleString()}-character limit. Try uploading a smaller excerpt.`,
      413
    );
  }

  const paragraphs = paragraphsOf(normalized);
  const title = (parsed.info?.Title ?? filename.replace(/\.pdf$/i, "")).slice(0, 160).trim();

  return {
    title: title || "Uploaded PDF",
    language: "en",
    paragraphs,
    charCount: normalized.length,
    fetchedAt: new Date().toISOString(),
    fingerprint: createHash("sha256").update(normalized).digest("hex"),
  };
}
