import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { parseWikipediaUrl } from "@/lib/wiki/url";
import { WikiClientError, fetchArticleHtml, fetchSummary } from "@/lib/wiki/client";
import { extractSections, totalChars } from "@/lib/wiki/extract";
import type { WikiArticle } from "@/lib/wiki/types";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  url: z.string().min(8).max(2_000),
});

/**
 * POST /api/wiki/parse
 *   { url: string }
 *
 * Resolves a Wikipedia article URL into a cleaned WikiArticle the
 * generator can hand straight to the LLM. Rate-limited per IP since
 * each call fans out to two Wikipedia REST requests.
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`wiki:parse:${clientIp(req)}`, {
    limit: 30,
    windowMs: 60_000,
  });
  if (!limit.allowed) return fail(429, "Too many article requests. Try again in a minute.");

  const body = BodySchema.parse(await req.json());

  const parsed = parseWikipediaUrl(body.url);
  if (!parsed.ok) {
    return fail(400, parsed.message);
  }

  try {
    // Run the two upstream calls in parallel — both share a 24h cache.
    const [summary, html] = await Promise.all([
      fetchSummary(parsed.lang, parsed.title),
      fetchArticleHtml(parsed.lang, parsed.title),
    ]);

    const sections = extractSections(html);
    if (sections.length === 0) {
      return fail(
        422,
        "Couldn't extract enough teaching content from this article. Try a more substantial topic.",
      );
    }

    const article: WikiArticle = {
      title: summary.displayTitle || parsed.displayTitle,
      lang: parsed.lang,
      canonicalUrl: summary.canonicalUrl,
      summary: summary.extract,
      sections,
      charCount: totalChars(sections),
      fetchedAt: new Date().toISOString(),
    };

    return ok({ article });
  } catch (err) {
    if (err instanceof WikiClientError) {
      const status =
        err.code === "rate_limited" ? 429 :
        err.code === "timeout" ? 504 :
        err.code === "disambiguation" ? 400 :
        err.code === "not_found" ? 404 :
        502;
      return fail(status, err.message);
    }
    throw err;
  }
});
