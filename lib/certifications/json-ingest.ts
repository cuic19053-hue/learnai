/**
 * One-shot ingester: import the legacy `certifications/questions/*.json`
 * packs into the DB as CertificationQuestion rows.
 *
 * Why: those JSON packs hold the high-quality, originally-authored
 * questions for CLF-C02, SAA-C03, SAP-C02, DOP-C02, GCP-CA,
 * GCP-ML-vA/vB, and C1000-185. We don't want to throw them away
 * just because the storage moved to Postgres. The ingester maps
 * each legacy slug to its modern Certification row via
 * `buildLegacySlugMap()` from `official-seed.ts`, normalizes the
 * options into the new {key, text} shape, and persists everything
 * as `isAiGenerated=false, isReviewed=true, isPublished=true` so
 * the rows go live immediately.
 *
 * Idempotent: re-running won't create duplicates because each row's
 * `prompt + certificationId` combination is checked first.
 */

import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { buildLegacySlugMap } from "./official-seed";
import type { OfficialRef, QuestionOption, RawQuestion } from "./types";

const QUESTIONS_DIR = path.join(process.cwd(), "certifications", "questions");
const LETTER_RE = /^([A-E])[.)]?\s*/;

function letterFromCorrect(correct: string, options: string[]): string[] {
  if (!correct) return [];
  const trimmed = correct.trim();
  const m = trimmed.match(LETTER_RE);
  if (m) return [m[1]!.toUpperCase()];
  // Try exact match to one of the options.
  const idx = options.findIndex((o) => o.trim() === trimmed);
  if (idx >= 0) return [String.fromCharCode(65 + idx)];
  return [];
}

function toOption(opt: string, idx: number): QuestionOption {
  const m = opt.trim().match(LETTER_RE);
  return {
    key: m ? m[1]!.toUpperCase() : String.fromCharCode(65 + idx),
    text: opt.replace(LETTER_RE, "").trim(),
  };
}

export type IngestSummary = {
  pack: string;
  certificationSlug: string;
  total: number;
  inserted: number;
  skippedExisting: number;
  skippedInvalid: number;
};

export type IngestResult = {
  packs: IngestSummary[];
  notMapped: string[];
};

/**
 * Walk the certifications/questions directory and import each pack
 * that maps to a known certification via `buildLegacySlugMap()`.
 * Returns a per-pack summary plus a list of file slugs we couldn't
 * map (so the admin can extend `official-seed.ts:legacySlugs`).
 */
export async function ingestJsonPacks(): Promise<IngestResult> {
  let entries: string[];
  try {
    entries = await fs.readdir(QUESTIONS_DIR);
  } catch {
    return { packs: [], notMapped: [] };
  }
  const slugs = entries
    .filter((f) => f.endsWith(".json") && !f.endsWith(".meta.json"))
    .map((f) => f.replace(/\.json$/, ""))
    .filter((s) => /^[A-Za-z0-9._-]+$/.test(s));

  const legacyMap = buildLegacySlugMap();
  const summaries: IngestSummary[] = [];
  const notMapped: string[] = [];

  for (const fileSlug of slugs) {
    const entry = legacyMap.get(fileSlug);
    if (!entry) {
      notMapped.push(fileSlug);
      continue;
    }
    const certification = await prisma.certification.findUnique({
      where: { slug: entry.slug },
      select: { id: true, slug: true },
    });
    if (!certification) {
      // Seed hasn't been run yet — skip; the admin route returns a clear hint.
      notMapped.push(`${fileSlug} (target ${entry.slug} not in DB; run seed first)`);
      continue;
    }
    const summary = await ingestOnePack(fileSlug, certification.id, certification.slug);
    summaries.push(summary);
  }

  return { packs: summaries, notMapped };
}

async function ingestOnePack(
  fileSlug: string,
  certificationId: string,
  certificationSlug: string
): Promise<IngestSummary> {
  let raw: RawQuestion[] = [];
  try {
    const file = await fs.readFile(path.join(QUESTIONS_DIR, `${fileSlug}.json`), "utf8");
    const parsed = JSON.parse(file);
    if (Array.isArray(parsed)) raw = parsed as RawQuestion[];
  } catch {
    return {
      pack: fileSlug,
      certificationSlug,
      total: 0,
      inserted: 0,
      skippedExisting: 0,
      skippedInvalid: 0,
    };
  }

  let inserted = 0;
  let skippedExisting = 0;
  let skippedInvalid = 0;

  for (const q of raw) {
    if (!q || !q.question || !Array.isArray(q.options) || q.options.length < 2) {
      skippedInvalid += 1;
      continue;
    }
    const prompt = q.question.trim();
    const existing = await prisma.certificationQuestion.findFirst({
      where: { certificationId, prompt },
      select: { id: true },
    });
    if (existing) {
      skippedExisting += 1;
      continue;
    }
    const options: QuestionOption[] = q.options
      .map((o, i) => (o == null ? null : toOption(String(o), i)))
      .filter((o): o is QuestionOption => o !== null);
    const correctAnswers = letterFromCorrect(q.correct ?? "", q.options ?? []);
    const refs: OfficialRef[] = q.references
      ? [{ title: "Reference", url: q.references }].filter((r) => /^https?:\/\//.test(r.url))
      : [];
    const isMulti = correctAnswers.length === 0;
    await prisma.certificationQuestion.create({
      data: {
        certificationId,
        questionType: isMulti ? "MULTI_CHOICE" : "SINGLE_CHOICE",
        difficulty: "MEDIUM",
        prompt,
        options: options as unknown as object,
        // For multi-select packs (correct == "") the answer text lives
        // in the explanation by convention. We store empty correctAnswers
        // here; the session route handles MULTI_CHOICE comparison the
        // same way, and admins can curate correctAnswers later.
        correctAnswers,
        explanation: (q.explanation ?? "").trim(),
        officialRefs: refs as unknown as object,
        tags: [],
        isAiGenerated: false,
        isReviewed: true,
        isPublished: true,
      },
    });
    inserted += 1;
  }

  return {
    pack: fileSlug,
    certificationSlug,
    total: raw.length,
    inserted,
    skippedExisting,
    skippedInvalid,
  };
}
