/**
 * DOCX source extractor — lazily imports `mammoth`. Mirrors the
 * pdf.ts pattern: if the optional dependency is missing the API
 * answers 415 with an install hint rather than blowing up.
 *
 * Install with: `npm install mammoth`
 */

import "server-only";
import { createHash } from "node:crypto";
import { normalizeText, paragraphsOf } from "./text";
import type { ExtractedSource } from "../types";

const MIN_CHARS = 80;
const MAX_CHARS = 200_000;

export class DocxExtractionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly remediation?: string
  ) {
    super(message);
    this.name = "DocxExtractionError";
  }
}

async function loadMammoth(): Promise<
  ((opts: { buffer: Buffer }) => Promise<{ value: string }>) | null
> {
  try {
    const mod = await import("mammoth" /* webpackIgnore: true */ as string).catch(() => null);
    if (!mod) return null;
    const fn = (mod as { extractRawText?: unknown }).extractRawText;
    if (typeof fn !== "function") return null;
    return fn as (opts: { buffer: Buffer }) => Promise<{ value: string }>;
  } catch {
    return null;
  }
}

export async function extractDocx(buffer: Buffer, filename: string): Promise<ExtractedSource> {
  const extractRawText = await loadMammoth();
  if (!extractRawText) {
    throw new DocxExtractionError(
      "DOCX extraction is not available in this deployment.",
      415,
      "Install the optional dependency: `npm install mammoth`"
    );
  }

  let result: { value: string };
  try {
    result = await extractRawText({ buffer });
  } catch (err) {
    throw new DocxExtractionError(
      `Couldn't read this DOCX (${err instanceof Error ? err.message : "unknown error"}).`,
      422
    );
  }

  const normalized = normalizeText(result.value);
  if (normalized.length < MIN_CHARS) {
    throw new DocxExtractionError(
      `Extracted DOCX text is too short (${normalized.length} characters).`,
      422
    );
  }
  if (normalized.length > MAX_CHARS) {
    throw new DocxExtractionError(
      `DOCX text exceeds the ${MAX_CHARS.toLocaleString()}-character limit. Trim it and try again.`,
      413
    );
  }

  const paragraphs = paragraphsOf(normalized);
  const title = filename
    .replace(/\.docx?$/i, "")
    .slice(0, 160)
    .trim();

  return {
    title: title || "Uploaded DOCX",
    language: "en",
    paragraphs,
    charCount: normalized.length,
    fetchedAt: new Date().toISOString(),
    fingerprint: createHash("sha256").update(normalized).digest("hex"),
  };
}
