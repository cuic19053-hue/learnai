import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { parseWikipediaUrl } from "@/lib/wiki/url";
import { WikiClientError, fetchArticleHtml, fetchSummary } from "@/lib/wiki/client";
import { extractSections, totalChars } from "@/lib/wiki/extract";
import { generateTest, WikiGenerationError } from "@/lib/wiki/generate";
import type { WikiArticle } from "@/lib/wiki/types";

export const dynamic = "force-dynamic";

const BodySchema = z.object({
  url: z.string().min(8).max(2_000),
  difficulty: z.enum(["undergrad", "intermediate", "advanced"]).default("intermediate"),
  format: z.enum(["mixed", "multiple_choice", "short_answer", "true_false"]).default("mixed"),
  count: z.number().int().min(5).max(40).default(10),
  language: z.string().min(2).max(8).optional(),
});

/**
 * POST /api/wiki/generate
 *
 * Paste-URL-to-test pipeline. Reuses cached tests when the parameter
 * hash matches a prior generation — zero LLM spend on repeats.
 */
export const POST = handler(async (req: Request) => {
  const limit = rateLimit(`wiki:generate:${clientIp(req)}`, {
    limit: 10,
    windowMs: 60_000,
  });
  if (!limit.allowed) {
    return fail(429, "Too many test generations. Try again in a minute.");
  }

  const body = BodySchema.parse(await req.json());

  // ── Parse URL ────────────────────────────────────────────────────
  const parsed = parseWikipediaUrl(body.url);
  if (!parsed.ok) return fail(400, parsed.message);

  // ── Fetch + extract ──────────────────────────────────────────────
  let article: WikiArticle;
  try {
    const [summary, html] = await Promise.all([
      fetchSummary(parsed.lang, parsed.title),
      fetchArticleHtml(parsed.lang, parsed.title),
    ]);
    const sections = extractSections(html);
    if (sections.length === 0) {
      return fail(
        422,
        "Couldn't extract enough teaching content from this article. Try a more substantial topic."
      );
    }
    article = {
      title: summary.displayTitle || parsed.displayTitle,
      lang: parsed.lang,
      canonicalUrl: summary.canonicalUrl,
      summary: summary.extract,
      sections,
      charCount: totalChars(sections),
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
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
      return fail(status, err.message);
    }
    throw err;
  }

  // ── Generate ─────────────────────────────────────────────────────
  try {
    const test = await generateTest({
      article,
      url: parsed.canonicalUrl,
      difficulty: body.difficulty,
      format: body.format,
      count: body.count,
      language: body.language ?? parsed.lang,
    });
    return ok({ test });
  } catch (err) {
    if (err instanceof WikiGenerationError) {
      return fail(err.status, err.message);
    }
    throw err;
  }
});
