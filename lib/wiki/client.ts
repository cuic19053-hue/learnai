/**
 * Server-only Wikipedia REST client.
 *
 * Etiquette:
 *   - Identifies itself via User-Agent (Wikimedia requires this for
 *     anonymous API traffic). Override via WIKI_USER_AGENT env var.
 *   - One soft retry on 5xx / network blips.
 *   - 24-hour in-memory cache per host+title to keep load light.
 *
 * Endpoints used:
 *   - /api/rest_v1/page/summary/{title}  — lead extract + dispatch type
 *   - /api/rest_v1/page/html/{title}     — full article HTML (pre-cleaned)
 */

import "server-only";

const DEFAULT_UA = "LearnAI-WikiTest/1.0 (https://github.com/ruslanmv/learnai; ai@learnai.example)";
const USER_AGENT = process.env.WIKI_USER_AGENT?.trim() || DEFAULT_UA;
const FETCH_TIMEOUT_MS = 12_000;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry<T> = { value: T; expiresAt: number };

const summaryCache = new Map<string, CacheEntry<WikiSummary>>();
const htmlCache = new Map<string, CacheEntry<string>>();

export type WikiSummary = {
  title: string;
  displayTitle: string;
  description?: string;
  extract: string; // plain-text lead
  type: "standard" | "disambiguation" | "no-extract" | string;
  lang: string;
  canonicalUrl: string;
};

export class WikiClientError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code:
      | "not_found"
      | "disambiguation"
      | "rate_limited"
      | "upstream_error"
      | "timeout"
      | "network"
  ) {
    super(message);
    this.name = "WikiClientError";
  }
}

function key(lang: string, title: string): string {
  return `${lang}:${title}`;
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "application/json, text/html;q=0.9, */*;q=0.5",
        "Accept-Language": "en",
      },
      signal: controller.signal,
      // Edge / Node fetch — no cache layer here; we cache in-memory ourselves.
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url: string): Promise<Response> {
  try {
    const res = await fetchWithTimeout(url);
    if (res.status >= 500) {
      // One quick retry on 5xx.
      await new Promise((r) => setTimeout(r, 250));
      return await fetchWithTimeout(url);
    }
    return res;
  } catch (err) {
    const isAbort = (err as Error)?.name === "AbortError";
    if (isAbort) {
      throw new WikiClientError("Wikipedia request timed out.", 504, "timeout");
    }
    // Retry once on transport failure.
    try {
      return await fetchWithTimeout(url);
    } catch (err2) {
      throw new WikiClientError(
        `Network error reaching Wikipedia: ${(err2 as Error).message}`,
        502,
        "network"
      );
    }
  }
}

/**
 * Fetch the article summary + dispatch type. Throws WikiClientError
 * with code "disambiguation" if the page is a disambiguation listing
 * (the user has to pick a more specific URL).
 */
export async function fetchSummary(lang: string, title: string): Promise<WikiSummary> {
  const k = key(lang, title);
  const cached = summaryCache.get(k);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
  const res = await fetchWithRetry(url);

  if (res.status === 404) {
    throw new WikiClientError(`Article not found: ${title.replace(/_/g, " ")}.`, 404, "not_found");
  }
  if (res.status === 429) {
    throw new WikiClientError(
      "Wikipedia rate-limited the request. Please retry shortly.",
      429,
      "rate_limited"
    );
  }
  if (!res.ok) {
    throw new WikiClientError(
      `Wikipedia returned ${res.status} for the summary.`,
      502,
      "upstream_error"
    );
  }

  const data = (await res.json()) as {
    title: string;
    displaytitle?: string;
    description?: string;
    extract?: string;
    type?: string;
    content_urls?: { desktop?: { page?: string }; mobile?: { page?: string } };
  };

  if (data.type === "disambiguation") {
    throw new WikiClientError(
      `This URL points to a disambiguation page. Open one of the listed articles and paste that URL instead.`,
      400,
      "disambiguation"
    );
  }

  const summary: WikiSummary = {
    title: data.title,
    displayTitle: stripBasicTags(data.displaytitle ?? data.title),
    description: data.description,
    extract: (data.extract ?? "").trim(),
    type: data.type ?? "standard",
    lang,
    canonicalUrl:
      data.content_urls?.desktop?.page ??
      `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(title)}`,
  };

  summaryCache.set(k, { value: summary, expiresAt: Date.now() + CACHE_TTL_MS });
  return summary;
}

/**
 * Fetch the full article HTML. Returns the raw HTML body — call
 * `extractSections` from ./extract.ts to turn this into clean sections.
 */
export async function fetchArticleHtml(lang: string, title: string): Promise<string> {
  const k = key(lang, title);
  const cached = htmlCache.get(k);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const url = `https://${lang}.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(title)}`;
  const res = await fetchWithRetry(url);

  if (res.status === 404) {
    throw new WikiClientError(`Article not found: ${title}`, 404, "not_found");
  }
  if (res.status === 429) {
    throw new WikiClientError("Wikipedia rate-limited the request.", 429, "rate_limited");
  }
  if (!res.ok) {
    throw new WikiClientError(
      `Wikipedia returned ${res.status} for the article body.`,
      502,
      "upstream_error"
    );
  }

  const html = await res.text();
  htmlCache.set(k, { value: html, expiresAt: Date.now() + CACHE_TTL_MS });
  return html;
}

/** Strip <i>/<b>/<sup> from a short string — used only for display titles. */
function stripBasicTags(s: string): string {
  return s.replace(/<[^>]+>/g, "");
}
