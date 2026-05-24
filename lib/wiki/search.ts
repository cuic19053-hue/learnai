/**
 * Wikipedia OpenSearch + summary fan-out — used by the WikiTest
 * landing page so learners can type a topic instead of pasting a URL.
 *
 * Uses the public `action=opensearch` endpoint which returns
 * [query, titles[], descriptions[], urls[]]. We then fetch the first
 * N summaries in parallel for richer suggestion cards.
 *
 * 5-minute in-memory cache keyed by language + query so the landing
 * page can debounce-then-fan-out without re-hitting Wikipedia for
 * every keystroke.
 */

import "server-only";

const SEARCH_TIMEOUT_MS = 6_000;
const CACHE_TTL_MS = 5 * 60_000;
const DEFAULT_UA = "LearnAI-WikiTest/1.0 (https://github.com/ruslanmv/learnai; ai@learnai.example)";
const USER_AGENT = process.env.WIKI_USER_AGENT?.trim() || DEFAULT_UA;

export type WikiSearchHit = {
  title: string;
  description: string;
  url: string;
};

type CacheEntry = { hits: WikiSearchHit[]; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function gc(): void {
  const now = Date.now();
  for (const [k, v] of cache) if (v.expiresAt <= now) cache.delete(k);
}

export class WikiSearchError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "WikiSearchError";
  }
}

/** Validate the language subdomain so we don't construct weird hosts. */
function safeLang(input: string | undefined): string {
  if (!input) return "en";
  return /^[a-z]{2,8}$/i.test(input) ? input.toLowerCase() : "en";
}

export async function searchWiki(query: string, lang = "en", limit = 8): Promise<WikiSearchHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];
  gc();
  const language = safeLang(lang);
  const key = `${language}|${trimmed.toLowerCase()}|${limit}`;
  const hit = cache.get(key);
  if (hit && hit.expiresAt > Date.now()) return hit.hits;

  const url = new URL(`https://${language}.wikipedia.org/w/api.php`);
  url.searchParams.set("action", "opensearch");
  url.searchParams.set("search", trimmed);
  url.searchParams.set("limit", String(Math.min(Math.max(1, limit), 20)));
  url.searchParams.set("namespace", "0");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT_MS);
  let resp: Response;
  try {
    resp = await fetch(url.toString(), {
      headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (err) {
    if ((err as { name?: string }).name === "AbortError") {
      throw new WikiSearchError("Wikipedia search timed out.", 504);
    }
    throw new WikiSearchError(`Wikipedia search failed: ${(err as Error).message}`, 502);
  } finally {
    clearTimeout(timer);
  }
  if (!resp.ok) {
    if (resp.status === 429) {
      throw new WikiSearchError("Wikipedia is rate limiting our search.", 429);
    }
    throw new WikiSearchError(`Wikipedia search returned ${resp.status}`, 502);
  }

  let payload: unknown;
  try {
    payload = await resp.json();
  } catch {
    throw new WikiSearchError("Wikipedia search returned malformed JSON.", 502);
  }
  if (!Array.isArray(payload) || payload.length < 4) {
    cache.set(key, { hits: [], expiresAt: Date.now() + CACHE_TTL_MS });
    return [];
  }
  const titles = payload[1] as string[];
  const descriptions = payload[2] as string[];
  const urls = payload[3] as string[];
  const hits: WikiSearchHit[] = titles.map((title, i) => ({
    title,
    description: descriptions[i] ?? "",
    url: urls[i] ?? "",
  }));

  cache.set(key, { hits, expiresAt: Date.now() + CACHE_TTL_MS });
  return hits;
}
