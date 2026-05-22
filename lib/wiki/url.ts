/**
 * Wikipedia URL parser + allow-list.
 *
 * Enterprise rules baked in:
 *   - Host must match  ^[a-z]{2,3}(-[a-z]+)?\.wikipedia\.org$
 *   - Path must start with /wiki/ (no Special:, File:, Talk:, etc.)
 *   - Title is URL-decoded and trimmed; never includes a fragment
 *
 * Output: a normalised ParsedWikiUrl  OR  a typed reason for refusal.
 */

const HOST_RE = /^[a-z]{2,3}(?:-[a-z]+)?\.wikipedia\.org$/i;

/** Title prefixes we refuse — these aren't articles. */
const FORBIDDEN_PREFIXES = [
  "Special:",
  "File:",
  "Image:",
  "Talk:",
  "User:",
  "User_talk:",
  "Category:",
  "Template:",
  "Help:",
  "Wikipedia:",
  "Portal:",
  "Media:",
  "Draft:",
  "MediaWiki:",
];

export type ParsedWikiUrl = {
  /** Subdomain prefix — "en", "es", "de", … */
  lang: string;
  /** Decoded title, spaces normalised to underscores (Wikipedia REST canonical). */
  title: string;
  /** Title for display (underscores → spaces). */
  displayTitle: string;
  /** Canonical https URL we'll always show in citations. */
  canonicalUrl: string;
};

export type WikiUrlError =
  | { ok: false; code: "invalid_url"; message: string }
  | { ok: false; code: "wrong_host"; message: string }
  | { ok: false; code: "not_an_article"; message: string }
  | { ok: false; code: "empty_title"; message: string };

export type WikiUrlResult =
  | (ParsedWikiUrl & { ok: true })
  | WikiUrlError;

export function parseWikipediaUrl(input: string): WikiUrlResult {
  if (typeof input !== "string" || !input.trim()) {
    return {
      ok: false,
      code: "invalid_url",
      message: "Please paste a Wikipedia article URL.",
    };
  }

  let u: URL;
  try {
    u = new URL(input.trim());
  } catch {
    return {
      ok: false,
      code: "invalid_url",
      message: "That doesn't look like a URL.",
    };
  }

  if (u.protocol !== "https:" && u.protocol !== "http:") {
    return {
      ok: false,
      code: "invalid_url",
      message: "Use an https Wikipedia link.",
    };
  }

  if (!HOST_RE.test(u.hostname)) {
    return {
      ok: false,
      code: "wrong_host",
      message: `Only Wikipedia article URLs are accepted. Got "${u.hostname}".`,
    };
  }

  // Path must be /wiki/<title>.
  const match = u.pathname.match(/^\/wiki\/(.+)$/);
  if (!match) {
    return {
      ok: false,
      code: "not_an_article",
      message: "URL must point to /wiki/<title>.",
    };
  }

  // First segment after /wiki/ is the title; ignore any deeper segments.
  const rawTitle = match[1].split("/")[0];
  let decoded: string;
  try {
    decoded = decodeURIComponent(rawTitle);
  } catch {
    return {
      ok: false,
      code: "invalid_url",
      message: "Article title is not valid percent-encoding.",
    };
  }

  const title = decoded.replace(/\s+/g, "_").trim();
  if (!title) {
    return {
      ok: false,
      code: "empty_title",
      message: "Article title is empty.",
    };
  }

  if (FORBIDDEN_PREFIXES.some((p) => title.startsWith(p))) {
    return {
      ok: false,
      code: "not_an_article",
      message: `"${title.split(":")[0]}:" namespace pages aren't accepted — paste a regular article URL instead.`,
    };
  }

  const lang = u.hostname.split(".")[0].toLowerCase();
  const canonicalUrl = `https://${u.hostname}/wiki/${encodeURIComponent(title)}`;

  return {
    ok: true,
    lang,
    title,
    displayTitle: title.replace(/_/g, " "),
    canonicalUrl,
  };
}

/** Convenience predicate for the common case. */
export function isWikipediaUrl(input: string): boolean {
  const r = parseWikipediaUrl(input);
  return r.ok;
}
