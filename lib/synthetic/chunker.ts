/**
 * Text chunker — slices an `ExtractedSource` into overlapping chunks
 * sized to the target LLM context budget.
 *
 * Design notes:
 *   - Token counts use a deliberately pessimistic char-based heuristic
 *     (~4 chars per token) so the runner stays well under any model's
 *     context window without dragging in a real BPE tokenizer. Swap to
 *     `gpt-tokenizer` later if accuracy matters; the only call site
 *     is `estimateTokens()`.
 *   - Splits never bisect a sentence — the chunker walks sentences
 *     (via `Intl.Segmenter` when available, falling back to a simple
 *     punctuation regex) and accumulates them up to the target.
 *   - Every chunk carries the nearest preceding paragraph `heading`,
 *     which becomes the citation anchor in the per-chunk prompt.
 *   - The hard `maxChunks` ceiling is the cost knob. When exceeded
 *     we drop later content silently and emit the prefix — the runner
 *     surfaces an explicit warning event so the UI can ask the
 *     learner to downsample.
 */

import "server-only";
import { createHash } from "node:crypto";
import { DEFAULT_CHUNKER } from "./types";
import type { Chunk, ChunkerConfig, ExtractedSource, Paragraph } from "./types";

/**
 * Conservative bytes-per-token estimate. English averages closer to 4
 * chars per token; non-Latin scripts can use more. Round up.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function segmentSentences(text: string): string[] {
  const Seg = (globalThis as { Intl?: { Segmenter?: typeof Intl.Segmenter } }).Intl?.Segmenter;
  if (Seg) {
    try {
      const segmenter = new Seg(undefined, { granularity: "sentence" });
      const out: string[] = [];
      for (const piece of segmenter.segment(text)) {
        const seg = piece.segment.trim();
        if (seg.length > 0) out.push(seg);
      }
      if (out.length > 0) return out;
    } catch {
      /* fall through to regex */
    }
  }
  return text
    .split(/(?<=[.!?。!？])\s+(?=[A-Z0-9“"'([])/u)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function chunkId(text: string, index: number): string {
  return createHash("sha256").update(`${index}:${text}`).digest("hex").slice(0, 16);
}

/**
 * Walk paragraphs, emit chunks sized close to `targetTokens` with
 * `overlapTokens` of trailing content carried into the next chunk.
 * Heading-only paragraphs are attached to the next chunk as
 * `anchorHeading` rather than emitted on their own.
 */
export function chunkSource(
  source: ExtractedSource,
  config: ChunkerConfig = DEFAULT_CHUNKER
): Chunk[] {
  const { targetTokens, overlapTokens, maxChunks } = config;
  const chunks: Chunk[] = [];

  let buffer: string[] = [];
  let bufferTokens = 0;
  let bufferStartOffset = 0;
  let anchorHeading: string | undefined;

  const flush = () => {
    if (buffer.length === 0) return;
    const text = buffer.join(" ").trim();
    if (text.length === 0) {
      buffer = [];
      bufferTokens = 0;
      return;
    }
    const idx = chunks.length;
    chunks.push({
      id: chunkId(text, idx),
      index: idx,
      text,
      charOffset: bufferStartOffset,
      anchorHeading,
    });
    // Slide the window: keep trailing sentences worth ~overlapTokens.
    if (overlapTokens > 0) {
      const overlap: string[] = [];
      let overlapBudget = overlapTokens;
      for (let i = buffer.length - 1; i >= 0 && overlapBudget > 0; i--) {
        const sentence = buffer[i]!;
        const cost = estimateTokens(sentence);
        overlap.unshift(sentence);
        overlapBudget -= cost;
      }
      buffer = overlap;
      bufferTokens = overlap.reduce((acc, s) => acc + estimateTokens(s), 0);
    } else {
      buffer = [];
      bufferTokens = 0;
    }
  };

  for (const paragraph of source.paragraphs) {
    if (chunks.length >= maxChunks) break;

    // Heading-only block? Capture and continue.
    if (isHeadingOnly(paragraph)) {
      anchorHeading = paragraph.heading;
      continue;
    }
    if (paragraph.heading) anchorHeading = paragraph.heading;
    if (buffer.length === 0) bufferStartOffset = paragraph.charOffset;

    for (const sentence of segmentSentences(paragraph.text)) {
      const cost = estimateTokens(sentence);
      // Single sentence longer than the target: emit alone (rare).
      if (cost > targetTokens) {
        flush();
        if (chunks.length >= maxChunks) break;
        chunks.push({
          id: chunkId(sentence, chunks.length),
          index: chunks.length,
          text: sentence,
          charOffset: paragraph.charOffset,
          anchorHeading,
        });
        bufferStartOffset = paragraph.charOffset + sentence.length;
        continue;
      }
      if (bufferTokens + cost > targetTokens) {
        flush();
        if (chunks.length >= maxChunks) break;
        if (buffer.length === 0) bufferStartOffset = paragraph.charOffset;
      }
      buffer.push(sentence);
      bufferTokens += cost;
    }
  }

  if (chunks.length < maxChunks) flush();
  return chunks;
}

function isHeadingOnly(p: Paragraph): boolean {
  if (!p.heading) return false;
  // Heading line markers ("# ...") get the heading captured by the
  // extractor; if there's no body content beyond the heading itself,
  // skip emission.
  const stripped = p.text.replace(/^#{1,6}\s+/, "").trim();
  return stripped === (p.heading ?? "");
}
