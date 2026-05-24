/**
 * Plain-text extractor — for `kind: "text"` sources (the learner
 * pasted a snippet into the wizard) and as the shared post-processing
 * step used by the upload and wiki extractors.
 *
 * Responsibilities:
 *   - Decode + normalize unicode whitespace.
 *   - Collapse runs of blank lines.
 *   - Split into paragraphs while preserving offsets back into the
 *     original normalized text. Offsets are how the citation filter
 *     later proves a quoted snippet actually came from the source.
 *   - Apply a hard char ceiling so a 5 MB paste can't run away with
 *     LLM cost in a later stage.
 */

import "server-only";
import { createHash } from "node:crypto";
import type { ExtractedSource, Paragraph, SourceInput } from "../types";

/** Hard ceiling on the normalized character count we'll forward to chunking. */
const MAX_CHARS = 200_000;
/** Soft minimum below which generation isn't worth attempting. */
const MIN_CHARS = 80;

/**
 * Normalize raw text into a deterministic UTF-8 string with consistent
 * whitespace. Idempotent — running it twice produces the same output.
 */
export function normalizeText(input: string): string {
  return input
    .replace(/\r\n?/g, "\n")
    .replace(/[\u00a0\u2000-\u200b\u202f\u205f\u3000]/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split normalized text on blank lines into paragraphs and record each
 * paragraph's starting character offset in the normalized string. The
 * offset is what the chunker and the citation filter both rely on.
 */
export function paragraphsOf(normalized: string): Paragraph[] {
  const out: Paragraph[] = [];
  let offset = 0;
  for (const block of normalized.split(/\n\n+/)) {
    const trimmed = block.trim();
    if (trimmed.length === 0) {
      offset += block.length + 2;
      continue;
    }
    // Detect markdown-ish headings ("# ...", "## ...") so the chunker
    // can carry an anchor heading through to the question prompt.
    const headingMatch = trimmed.match(/^#{1,6}\s+(.+)$/);
    if (headingMatch) {
      // A standalone heading line is *attached* to the next paragraph
      // by the chunker rather than emitted as its own block. We still
      // include it here so the offsets line up.
      out.push({ heading: headingMatch[1].trim(), text: trimmed, charOffset: offset });
    } else {
      out.push({ text: trimmed, charOffset: offset });
    }
    offset += block.length + 2;
  }
  return out;
}

export class TextExtractionError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "TextExtractionError";
  }
}

/**
 * Extract the `kind: "text"` source variant. Title defaults to the
 * first line of the paste when not supplied.
 */
export async function extractText(
  input: Extract<SourceInput, { kind: "text" }>
): Promise<ExtractedSource> {
  const normalized = normalizeText(input.body);
  if (normalized.length < MIN_CHARS) {
    throw new TextExtractionError(
      `Source text is too short (${normalized.length} characters). Add at least ${MIN_CHARS}.`,
      422
    );
  }
  if (normalized.length > MAX_CHARS) {
    throw new TextExtractionError(
      `Source text exceeds the ${MAX_CHARS.toLocaleString()}-character limit. Trim it and try again.`,
      413
    );
  }

  const paragraphs = paragraphsOf(normalized);
  const title = (input.title ?? paragraphs[0]?.text ?? "Untitled snippet")
    .split("\n")[0]!
    .slice(0, 120)
    .trim();

  return {
    title,
    language: "en",
    paragraphs,
    charCount: normalized.length,
    fetchedAt: new Date().toISOString(),
    fingerprint: createHash("sha256").update(normalized).digest("hex"),
  };
}
