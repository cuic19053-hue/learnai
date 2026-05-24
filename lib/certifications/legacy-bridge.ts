/**
 * Bridge between the legacy file-pack loader and the new
 * DB-backed certifications API.
 *
 * Strategy: every public read endpoint tries the DB first. If the
 * DB returns no rows (or the database isn't configured at all), it
 * falls back to the on-disk JSON packs so guest-mode operation
 * keeps working without a Postgres connection or before the seed
 * has been run.
 *
 * The adapter shapes the legacy results into the same response
 * envelope the DB path produces, so the frontend sees one contract.
 */

import "server-only";
import {
  discoverCertifications,
  countCertification,
  findCertification,
  loadCertification,
  loadCertificationPage,
  sampleCertification,
  type LoadedQuestion,
} from "./load";
import { LEGACY_TO_PRISMA_LEVEL, LEGACY_TO_PRISMA_VENDOR } from "./types";
import type { CertificationListItem, PublicQuestion } from "./db";

const LETTER_RE = /^([A-E])[.)]?\s*/;

function letterFromCorrect(correct: string, options: string[]): string {
  if (!correct) return "";
  const m = correct.trim().match(LETTER_RE);
  if (m) return m[1]!.toUpperCase();
  const idx = options.findIndex((o) => o.trim() === correct.trim());
  if (idx >= 0) return String.fromCharCode(65 + idx);
  return "";
}

function letterFromOption(opt: string, idx: number): string {
  const m = opt.trim().match(LETTER_RE);
  return m ? m[1]!.toUpperCase() : String.fromCharCode(65 + idx);
}

function stripLetterPrefix(opt: string): string {
  return opt.replace(LETTER_RE, "").trim();
}

export async function legacyListCertifications(): Promise<CertificationListItem[]> {
  const catalog = await discoverCertifications();
  const items: CertificationListItem[] = [];
  for (const c of catalog) {
    const count = await countCertification(c.slug);
    items.push({
      id: c.slug, // file-pack has no UUID; route by slug.
      slug: c.slug,
      code: c.code,
      title: c.title,
      vendor: LEGACY_TO_PRISMA_VENDOR[c.vendor],
      level: LEGACY_TO_PRISMA_LEVEL[c.level],
      status: "ACTIVE",
      shortDescription: c.blurb,
      officialUrl: "",
      questionCount: count,
      sourceCount: 0,
      domainCount: 0,
    });
  }
  return items;
}

export type LegacyCertificationDetail = {
  certification: {
    id: string;
    slug: string;
    code: string;
    title: string;
    vendor: ReturnType<typeof LEGACY_TO_PRISMA_VENDOR.AWS extends infer T ? () => T : never>;
    level: ReturnType<typeof LEGACY_TO_PRISMA_LEVEL.Associate extends infer T ? () => T : never>;
    status: "ACTIVE";
    shortDescription: string;
    fullDescription: null;
    officialUrl: string;
    examGuideUrl: null;
    learningPathUrl: null;
    retiredAt: null;
    replacementSlug: null;
  };
  domains: never[];
  sources: never[];
  stats: { questionCount: number; sourceCount: 0; domainCount: 0 };
};

export async function legacyGetCertificationBySlug(slug: string) {
  const meta = await findCertification(slug);
  if (!meta) return null;
  const count = await countCertification(slug);
  return {
    certification: {
      id: slug,
      slug,
      code: meta.code,
      title: meta.title,
      vendor: LEGACY_TO_PRISMA_VENDOR[meta.vendor],
      level: LEGACY_TO_PRISMA_LEVEL[meta.level],
      status: "ACTIVE" as const,
      shortDescription: meta.blurb,
      fullDescription: null,
      officialUrl: "",
      examGuideUrl: null,
      learningPathUrl: null,
      retiredAt: null,
      replacementSlug: null,
    },
    domains: [] as Array<never>,
    sources: [] as Array<never>,
    stats: { questionCount: count, sourceCount: 0, domainCount: 0 },
  };
}

/**
 * Shape a legacy `LoadedQuestion` into the same `PublicQuestion`
 * envelope the DB path returns. Options carry letter prefixes when
 * the legacy text doesn't already include one.
 */
export function legacyToPublicQuestion(q: LoadedQuestion): PublicQuestion {
  const options = q.options.map((opt, idx) => ({
    key: letterFromOption(opt, idx),
    text: stripLetterPrefix(opt),
  }));
  return {
    id: q.id,
    prompt: q.question,
    options,
    questionType: q.correctLetter ? "SINGLE_CHOICE" : "MULTI_CHOICE",
    difficulty: "MEDIUM",
    domain: null,
    tags: [],
  };
}

/**
 * Same as `legacyToPublicQuestion` but also returns the data the
 * session-answer route needs to grade an attempt (`correctAnswers`,
 * `explanation`, `officialRefs`). Used when a legacy pack is being
 * served via the session API.
 */
export function legacyToAnswerableQuestion(q: LoadedQuestion) {
  const correctLetter = q.correctLetter || letterFromCorrect(q.correctRaw, q.options);
  return {
    public: legacyToPublicQuestion(q),
    correctAnswers: correctLetter ? [correctLetter] : [],
    explanation: q.explanation,
    officialRefs: q.references ? [{ title: q.references, url: q.references }] : [],
  };
}

export async function legacyPagedQuestions(slug: string, offset: number, limit: number) {
  const { items, total } = await loadCertificationPage(slug, offset, limit);
  return { total, items: items.map(legacyToPublicQuestion) };
}

export async function legacySampleQuestions(slug: string, size: number) {
  const items = await sampleCertification(slug, size);
  return items.map(legacyToPublicQuestion);
}

/**
 * Used by the session-creation route to build a frozen list of
 * questions for a legacy pack. Returns the publicly-safe shape plus
 * a parallel array keeping `correctAnswers` / `explanation` /
 * `officialRefs` for grading.
 */
export async function legacyBuildSessionQuestions(
  slug: string,
  size: number,
  _difficulty?: "EASY" | "MEDIUM" | "HARD"
) {
  const raw = await sampleCertification(slug, size);
  const enriched = raw.map(legacyToAnswerableQuestion);
  return enriched;
}

/**
 * Look up a single legacy question by `${slug}-${index}` id —
 * the format the loader returns. Used by the session-answer
 * route when grading a legacy session.
 */
export async function legacyFindQuestionById(slug: string, questionId: string) {
  const all = await loadCertification(slug);
  return all.find((q) => q.id === questionId) ?? null;
}
