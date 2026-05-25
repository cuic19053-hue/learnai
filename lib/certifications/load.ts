/**
 * Server-only loader for the certifications question bank.
 *
 * Plug-and-play model:
 *   1. Drop `<slug>.json` into certifications/questions/ — it appears.
 *   2. Optionally drop `<slug>.meta.json` alongside it with display
 *      metadata (code, title, vendor, blurb, level). Anything missing
 *      is inferred from the filename.
 *   3. No TypeScript edits are needed to register a new exam pack.
 */

import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { inferCertificationMeta } from "./catalog";
import type {
  CertificationLevel,
  CertificationMeta,
  CertificationMetaSidecar,
  CertificationVendor,
  RawQuestion,
} from "./types";

const QUESTIONS_DIR = path.join(process.cwd(), "certifications", "questions");

export type LoadedQuestion = {
  id: string;
  question: string;
  options: string[];
  correctLetter: string; // "A" | "B" | "C" | "D" | "" (multi-select)
  correctRaw: string;
  explanation: string;
  references: string;
};

const questionCache = new Map<string, LoadedQuestion[]>();
let catalogCache: CertificationMeta[] | null = null;

function letterFromCorrect(correct: string, options: string[]): string {
  if (!correct) return "";
  const trimmed = correct.trim();
  const m = trimmed.match(/^([A-D])\b/i);
  if (m) return m[1].toUpperCase();
  const idx = options.findIndex((o) => o.trim() === trimmed);
  if (idx >= 0) return String.fromCharCode(65 + idx);
  return "";
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Catalog discovery                                                     */
/* ────────────────────────────────────────────────────────────────────── */

async function readSidecar(slug: string): Promise<CertificationMetaSidecar | null> {
  try {
    const raw = await fs.readFile(path.join(QUESTIONS_DIR, `${slug}.meta.json`), "utf8");
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as CertificationMetaSidecar) : null;
  } catch {
    return null;
  }
}

/**
 * Scan the questions folder and return one CertificationMeta per pack.
 *
 * Discovery rules:
 *   - Every file matching <slug>.json (excluding .meta.json) is a pack.
 *   - <slug>.meta.json is an optional metadata sidecar.
 *   - Anything missing is filled in by inferCertificationMeta(slug).
 */
export async function discoverCertifications(): Promise<CertificationMeta[]> {
  if (catalogCache) return catalogCache;

  let entries: string[] = [];
  try {
    entries = await fs.readdir(QUESTIONS_DIR);
  } catch {
    entries = [];
  }

  const slugs = entries
    .filter((f) => f.endsWith(".json") && !f.endsWith(".meta.json"))
    .map((f) => f.replace(/\.json$/, ""))
    // Defensive — only allow safe slug characters.
    .filter((s) => /^[A-Za-z0-9._-]+$/.test(s));

  const bySlug = new Map<string, CertificationMeta>();
  for (const slug of slugs) {
    const base = inferCertificationMeta(slug);
    const sidecar = await readSidecar(slug);
    bySlug.set(slug, {
      slug,
      code: sidecar?.code ?? base.code,
      title: sidecar?.title ?? base.title,
      vendor: sidecar?.vendor ?? base.vendor,
      blurb: sidecar?.blurb ?? base.blurb,
      level: sidecar?.level ?? base.level,
    });
  }

  // Merge in user-created packs that have been published to the DB.
  // DB rows win for slugs that exist in both places (file packs become
  // a starter / fallback once a published DB row exists for the slug).
  try {
    const dbRows = await prisma.certification.findMany({
      where: { isPublished: true },
      select: {
        slug: true,
        code: true,
        title: true,
        vendor: true,
        level: true,
        shortDescription: true,
      },
    });
    for (const row of dbRows) {
      bySlug.set(row.slug, {
        slug: row.slug,
        code: row.code,
        title: row.title,
        vendor: prismaVendorToDisplay(row.vendor),
        blurb: row.shortDescription ?? "Community-built · cited from official vendor docs.",
        level: prismaLevelToDisplay(row.level),
      });
    }
  } catch {
    // DB unreachable — file packs still render.
  }

  const metas = Array.from(bySlug.values());

  // Stable sort: vendor → level → code so the hub renders predictably.
  const VENDOR_ORDER = ["AWS", "Azure", "GCP", "IBM", "Other"];
  const LEVEL_ORDER = ["Fundamentals", "Associate", "Professional", "Specialty"];
  metas.sort((a, b) => {
    const v = VENDOR_ORDER.indexOf(a.vendor) - VENDOR_ORDER.indexOf(b.vendor);
    if (v !== 0) return v;
    const l = LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);
    if (l !== 0) return l;
    return a.code.localeCompare(b.code);
  });

  catalogCache = metas;
  return metas;
}

function prismaVendorToDisplay(v: string): CertificationVendor {
  const up = v.toUpperCase();
  if (up === "AWS") return "AWS";
  if (up === "AZURE") return "Azure";
  if (up === "GCP") return "GCP";
  if (up === "IBM") return "IBM";
  return "Other";
}

function prismaLevelToDisplay(l: string): CertificationLevel {
  const up = l.toUpperCase();
  if (up === "FUNDAMENTALS" || up === "FOUNDATIONAL") return "Fundamentals";
  if (up === "ASSOCIATE") return "Associate";
  if (up === "PROFESSIONAL" || up === "EXPERT" || up === "ADVANCED") return "Professional";
  if (up === "SPECIALTY") return "Specialty";
  return "Associate";
}

export async function findCertification(slug: string): Promise<CertificationMeta | null> {
  if (!/^[A-Za-z0-9._-]+$/.test(slug)) return null;
  const list = await discoverCertifications();
  return list.find((c) => c.slug === slug) ?? null;
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Question loading                                                       */
/* ────────────────────────────────────────────────────────────────────── */

export async function loadCertification(slug: string): Promise<LoadedQuestion[]> {
  if (!/^[A-Za-z0-9._-]+$/.test(slug)) return [];

  const cached = questionCache.get(slug);
  if (cached) return cached;

  const filePath = path.join(QUESTIONS_DIR, `${slug}.json`);
  try {
    const raw = await fs.readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as RawQuestion[];
    const normalised: LoadedQuestion[] = (Array.isArray(parsed) ? parsed : [])
      .filter((q) => q && q.question && Array.isArray(q.options))
      .map((q, i) => ({
        id: `${slug}-${i}`,
        question: (q.question ?? "").trim(),
        options: q.options.map((o) => (o ?? "").trim()).filter(Boolean),
        correctLetter: letterFromCorrect(q.correct ?? "", q.options ?? []),
        correctRaw: (q.correct ?? "").trim(),
        explanation: (q.explanation ?? "").trim(),
        references: (q.references ?? "").trim(),
      }));
    questionCache.set(slug, normalised);
    return normalised;
  } catch {
    return [];
  }
}

export async function countCertification(slug: string): Promise<number> {
  const fromFile = await loadCertification(slug);
  if (fromFile.length > 0) return fromFile.length;
  // DB-only packs (community-created) — fall back to a count from the
  // CertificationQuestion table so the hub card shows a real number.
  try {
    const cert = await prisma.certification.findUnique({
      where: { slug },
      select: { id: true, isPublished: true },
    });
    if (!cert || !cert.isPublished) return 0;
    return prisma.certificationQuestion.count({
      where: { certificationId: cert.id, isPublished: true },
    });
  } catch {
    return 0;
  }
}

export async function loadCertificationPage(
  slug: string,
  offset = 0,
  limit = 20
): Promise<{ total: number; items: LoadedQuestion[] }> {
  const all = await loadCertification(slug);
  const safeOffset = Math.max(0, Math.min(all.length, offset));
  const safeLimit = Math.max(1, Math.min(100, limit));
  return {
    total: all.length,
    items: all.slice(safeOffset, safeOffset + safeLimit),
  };
}

export async function sampleCertification(slug: string, size: number): Promise<LoadedQuestion[]> {
  const all = await loadCertification(slug);
  if (size >= all.length) return shuffle([...all]);
  return shuffle([...all]).slice(0, size);
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
