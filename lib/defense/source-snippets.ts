/**
 * Resolve defense sources into a concise context snippet that
 * the persona prompt can ground questions on.
 *
 * Today's behavior:
 *   - url    : reuse `lib/synthetic/extract/wiki.ts` for Wikipedia
 *              URLs; for other URLs, return the URL + an empty body
 *              (Phase 2 will add a generic URL fetcher with the same
 *              source-policy gate as certifications).
 *   - upload : reuse the synthetic upload store + extract pipeline
 *              (PDF/DOCX/text) to pull body text.
 *   - note   : the body is already on the source record.
 *
 * Returns a flat text block of "Title — body excerpt" per source,
 * capped per-source so the LLM context budget stays sane.
 */

import "server-only";
import { extractSource } from "@/lib/synthetic/extract";
import type { DefenseSource } from "./types";

const PER_SOURCE_CHARS = 1_400;

export type SourceSnippet = {
  source: DefenseSource;
  title: string;
  body: string; // capped excerpt
};

export async function buildSourceSnippets(sources: DefenseSource[]): Promise<SourceSnippet[]> {
  const out: SourceSnippet[] = [];
  for (const source of sources) {
    try {
      if (source.kind === "note") {
        out.push({
          source,
          title: source.title,
          body: source.ref.slice(0, PER_SOURCE_CHARS),
        });
        continue;
      }
      if (source.kind === "url") {
        // Try the wiki extractor first; it accepts en/es/de wiki URLs.
        try {
          const extracted = await extractSource({
            kind: "wiki",
            url: source.ref,
          });
          const body = extracted.paragraphs
            .map((p) => p.text)
            .join(" ")
            .slice(0, PER_SOURCE_CHARS);
          out.push({ source, title: extracted.title || source.title, body });
        } catch {
          // Non-wiki URL — record without body for now. Phase 2 will
          // add a generic allowlisted fetcher.
          out.push({ source, title: source.title, body: `(URL: ${source.ref})` });
        }
        continue;
      }
      if (source.kind === "upload") {
        // The upload bytes live in the synthetic upload store keyed
        // by uploadId. Extract once — this drains the entry, so
        // re-resolving the same defense session requires re-upload.
        // (Mirrors the synthetic wizard's one-shot upload model.)
        const extracted = await extractSource({
          kind: "upload",
          uploadId: source.ref,
          mime: source.mime || "application/pdf",
          filename: source.title,
        });
        const body = extracted.paragraphs
          .map((p) => p.text)
          .join(" ")
          .slice(0, PER_SOURCE_CHARS);
        out.push({ source, title: extracted.title || source.title, body });
        continue;
      }
    } catch (err) {
      // A single bad source shouldn't kill the round. Fall back to a
      // placeholder so the LLM still sees the title.
      out.push({
        source,
        title: source.title,
        body: `(could not extract source: ${(err as Error).message.slice(0, 120)})`,
      });
    }
  }
  return out;
}

/** Render snippets into a single text block for prompt injection. */
export function renderSnippetsForPrompt(snippets: SourceSnippet[]): string {
  if (snippets.length === 0) return "(no sources supplied)";
  return snippets.map((s, i) => `[Source ${i + 1}: ${s.title}]\n${s.body}`).join("\n\n");
}
