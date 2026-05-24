/**
 * GET /api/wiki/search?q=<query>&lang=en&limit=8
 *
 * Wikipedia OpenSearch proxy used by the WikiTest landing page so
 * learners can type a topic and pick from a suggestion list rather
 * than pasting a URL.
 */

import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { searchWiki, WikiSearchError } from "@/lib/wiki/search";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const QuerySchema = z.object({
  q: z.string().min(2).max(120),
  lang: z.string().min(2).max(8).default("en"),
  limit: z.coerce.number().int().min(1).max(20).default(8),
});

export const GET = handler(async (req: Request) => {
  const limit = rateLimit(`wiki:search:${clientIp(req)}`, { limit: 30, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many search requests.");

  const url = new URL(req.url);
  const query = QuerySchema.parse({
    q: url.searchParams.get("q") ?? "",
    lang: url.searchParams.get("lang") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });

  try {
    const hits = await searchWiki(query.q, query.lang, query.limit);
    return ok({ hits });
  } catch (err) {
    if (err instanceof WikiSearchError) return fail(err.status, err.message);
    throw err;
  }
});
