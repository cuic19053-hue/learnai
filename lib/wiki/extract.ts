/**
 * Wikipedia article HTML → clean structured sections.
 *
 * Wikipedia REST returns Parsoid HTML — verbose but consistent. We
 * strip the wrappers that don't carry teaching value (infoboxes,
 * references, navigation, edit links) and segment by <h2> heading.
 *
 * Implementation is regex-based on purpose: cheap, no dependency, and
 * the structure is stable enough that a full DOM parser is overkill.
 */

import type { ArticleSection } from "./types";

/** Hard upper bound on total cleaned text we hand to the LLM. */
export const MAX_TOTAL_CHARS = 10_000;
/** Per-section soft cap so no single section dominates. */
export const MAX_SECTION_CHARS = 2_400;

/** Section headings that almost never carry teaching content. */
const SKIP_HEADINGS = new Set([
  "references",
  "notes",
  "footnotes",
  "citations",
  "external links",
  "further reading",
  "bibliography",
  "see also",
  "sources",
  "works cited",
  "gallery",
]);

/**
 * Strip the noise wrappers from a chunk of Wikipedia HTML before we
 * split it into sections.
 */
function stripWrappers(html: string): string {
  return (
    html
      // Discard whole <head> (Parsoid often includes one)
      .replace(/<head\b[\s\S]*?<\/head>/gi, "")
      // Discard scripts + styles + link tags
      .replace(/<script\b[\s\S]*?<\/script>/gi, "")
      .replace(/<style\b[\s\S]*?<\/style>/gi, "")
      .replace(/<link\b[^>]*\/?>/gi, "")
      // Infoboxes and navboxes (always tables with a known class)
      .replace(/<table\b[^>]*class="[^"]*\b(infobox|navbox|sidebar|metadata|ambox|vertical-navbox|wikitable|hatnote)\b[^"]*"[\s\S]*?<\/table>/gi, "")
      // Reference markers in superscript and the reference list block
      .replace(/<sup\b[^>]*class="[^"]*\breference\b[^"]*"[\s\S]*?<\/sup>/gi, "")
      .replace(/<ol\b[^>]*class="[^"]*\breferences\b[^"]*"[\s\S]*?<\/ol>/gi, "")
      .replace(/<div\b[^>]*class="[^"]*\breflist\b[^"]*"[\s\S]*?<\/div>/gi, "")
      .replace(/<div\b[^>]*class="[^"]*\bhatnote\b[^"]*"[\s\S]*?<\/div>/gi, "")
      // Audio / video / images (text-only output)
      .replace(/<figure\b[\s\S]*?<\/figure>/gi, "")
      .replace(/<picture\b[\s\S]*?<\/picture>/gi, "")
      .replace(/<img\b[^>]*\/?>/gi, "")
      .replace(/<audio\b[\s\S]*?<\/audio>/gi, "")
      .replace(/<video\b[\s\S]*?<\/video>/gi, "")
      // Math (MathML / LaTeX renders) — keep the alt text only when present
      .replace(
        /<math\b[^>]*\balttext="([^"]+)"[^>]*>[\s\S]*?<\/math>/gi,
        (_, alt: string) => ` ${alt} `,
      )
      .replace(/<math\b[\s\S]*?<\/math>/gi, "")
      // Coordinates blocks
      .replace(/<span\b[^>]*\bid="coordinates"[\s\S]*?<\/span>/gi, "")
      // Edit links
      .replace(/<span\b[^>]*class="[^"]*\bmw-editsection\b[^"]*"[\s\S]*?<\/span>/gi, "")
  );
}

/** Remove every remaining HTML tag and collapse whitespace. */
function toPlainText(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<li\b[^>]*>/gi, "\n• ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Walk an article HTML body and return one ArticleSection per <h2>.
 * Anything before the first <h2> becomes a synthetic "Introduction"
 * section, which is usually the most teachable chunk.
 */
export function extractSections(rawHtml: string): ArticleSection[] {
  const stripped = stripWrappers(rawHtml);

  // Split on <h2> — capture the heading text and the body that follows.
  // (Parsoid emits ids; we don't need them.)
  const parts = stripped.split(/<h2\b[^>]*>([\s\S]*?)<\/h2>/i);
  // After split, parts looks like: [before-first-h2, h2-1-text, body-1, h2-2-text, body-2, ...]
  const out: ArticleSection[] = [];

  // Anything before the first h2 is the intro.
  if (parts[0] && parts[0].trim()) {
    const intro = toPlainText(parts[0]);
    if (intro) out.push({ heading: "Introduction", text: intro });
  }

  for (let i = 1; i < parts.length; i += 2) {
    const heading = toPlainText(parts[i] ?? "").trim();
    const bodyHtml = parts[i + 1] ?? "";
    if (!heading) continue;
    if (SKIP_HEADINGS.has(heading.toLowerCase())) continue;

    const text = toPlainText(bodyHtml).trim();
    if (text.length < 80) continue; // too short to teach from

    out.push({
      heading,
      text:
        text.length > MAX_SECTION_CHARS
          ? text.slice(0, MAX_SECTION_CHARS).trimEnd() + "…"
          : text,
    });
  }

  return clampTotal(out);
}

/** Clamp the combined section text to MAX_TOTAL_CHARS, preserving order. */
function clampTotal(sections: ArticleSection[]): ArticleSection[] {
  let budget = MAX_TOTAL_CHARS;
  const kept: ArticleSection[] = [];
  for (const s of sections) {
    if (budget <= 0) break;
    if (s.text.length <= budget) {
      kept.push(s);
      budget -= s.text.length;
    } else {
      kept.push({
        heading: s.heading,
        text: s.text.slice(0, Math.max(0, budget - 1)).trimEnd() + "…",
      });
      budget = 0;
    }
  }
  return kept;
}

/** Convenience: total cleaned char count across all sections. */
export function totalChars(sections: ArticleSection[]): number {
  return sections.reduce((acc, s) => acc + s.text.length, 0);
}
