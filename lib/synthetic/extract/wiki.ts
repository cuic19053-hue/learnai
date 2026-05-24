/**
 * Wikipedia source extractor — a thin adapter over the existing
 * `lib/wiki/{client,extract,url}` pipeline that maps the wiki domain
 * types onto the synthetic-wizard `ExtractedSource` shape.
 *
 * Re-uses the same in-memory caching, retries, and citation-quality
 * decisions that the WikiTest feature relies on. No new HTTP calls
 * are added here — we strictly compose existing exports.
 */

import "server-only";
import { createHash } from "node:crypto";
import { fetchArticleHtml, fetchSummary, WikiClientError } from "@/lib/wiki/client";
import { extractSections, totalChars } from "@/lib/wiki/extract";
import { parseWikipediaUrl } from "@/lib/wiki/url";
import type { ExtractedSource, Paragraph, SourceInput } from "../types";

export class WikiSourceError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "WikiSourceError";
  }
}

/**
 * Fetch a Wikipedia article and return it in the canonical
 * `ExtractedSource` shape. Errors are re-thrown as `WikiSourceError`
 * with HTTP-friendly status codes so the API layer can pass them
 * straight to the client.
 */
export async function extractWiki(
  input: Extract<SourceInput, { kind: "wiki" }>
): Promise<ExtractedSource> {
  const parsed = parseWikipediaUrl(input.url);
  if (!parsed.ok) {
    throw new WikiSourceError(parsed.message, 400);
  }

  try {
    const [summary, html] = await Promise.all([
      fetchSummary(parsed.lang, parsed.title),
      fetchArticleHtml(parsed.lang, parsed.title),
    ]);

    const sections = extractSections(html);
    if (sections.length === 0) {
      throw new WikiSourceError(
        "Couldn't extract enough teaching content from this article. Try a more substantial topic.",
        422
      );
    }

    const paragraphs: Paragraph[] = [];
    let offset = 0;
    // Lead summary becomes the first paragraph with the article title as heading.
    if (summary.extract && summary.extract.length > 0) {
      paragraphs.push({ heading: parsed.displayTitle, text: summary.extract, charOffset: offset });
      offset += summary.extract.length + 2;
    }
    for (const section of sections) {
      paragraphs.push({ heading: section.heading, text: section.text, charOffset: offset });
      offset += section.text.length + 2;
    }

    const fingerprintBody = paragraphs.map((p) => `${p.heading ?? ""}\n${p.text}`).join("\n\n");

    return {
      title: summary.displayTitle || parsed.displayTitle,
      language: input.language ?? parsed.lang,
      canonicalUrl: summary.canonicalUrl,
      paragraphs,
      charCount: totalChars(sections) + summary.extract.length,
      fetchedAt: new Date().toISOString(),
      fingerprint: createHash("sha256").update(fingerprintBody).digest("hex"),
    };
  } catch (err) {
    if (err instanceof WikiSourceError) throw err;
    if (err instanceof WikiClientError) {
      const status =
        err.code === "rate_limited"
          ? 429
          : err.code === "timeout"
            ? 504
            : err.code === "disambiguation"
              ? 400
              : err.code === "not_found"
                ? 404
                : 502;
      throw new WikiSourceError(err.message, status);
    }
    throw err;
  }
}
