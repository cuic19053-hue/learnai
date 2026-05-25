/**
 * Shared question resolver — DB-first (AI-generated, published)
 * with the on-disk JSON pack as fallback.
 *
 * Use this from any read site (public API route, server-rendered
 * quiz page, admin previews) so the live "which questions did the
 * learner see" answer is consistent everywhere. The JSON packs are
 * never the primary source when the database is reachable and the
 * cert has published rows; the live experience always prefers
 * fresh AI-generated questions.
 *
 * Source attribution lives on the return shape:
 *   - `source: "db"`     — AI-generated, persisted, admin-reviewed
 *   - `source: "legacy"` — file-pack fallback (database empty or unreachable)
 *
 * That lets the UI render an honest "✨ AI generated" badge when
 * the source is db, or a quieter "starter pack" note otherwise.
 */

import "server-only";
import { getCertificationIdBySlug, getPublicQuestions, type PublicQuestion } from "./db";
import { legacyPagedQuestions, legacySampleQuestions } from "./legacy-bridge";

export type QuestionSource = "db" | "legacy";

export type ResolveOptions =
  | { mode: "sample"; size: number; difficulty?: "EASY" | "MEDIUM" | "HARD" }
  | {
      mode: "page";
      offset: number;
      limit: number;
      difficulty?: "EASY" | "MEDIUM" | "HARD";
    };

export type ResolveResult = {
  source: QuestionSource;
  items: PublicQuestion[];
  /** Filled for paged reads; undefined for sample mode. */
  total?: number;
};

export async function resolveQuestions(slug: string, opts: ResolveOptions): Promise<ResolveResult> {
  // 1) DB path — preferred. AI-generated, admin-published questions.
  try {
    const cert = await getCertificationIdBySlug(slug);
    if (cert && cert.isPublished) {
      const items = await getPublicQuestions({
        certificationId: cert.id,
        mode: opts.mode,
        size: opts.mode === "sample" ? opts.size : undefined,
        offset: opts.mode === "page" ? opts.offset : undefined,
        limit: opts.mode === "page" ? opts.limit : undefined,
        difficulty: opts.difficulty,
      });
      if (items.length > 0) {
        return { source: "db", items, total: opts.mode === "page" ? items.length : undefined };
      }
    }
  } catch (err) {
    // Database not reachable or schema not migrated — fall through to
    // the file pack quietly. Logged for ops, not surfaced to the user.
    // eslint-disable-next-line no-console
    console.warn("[certifications.resolveQuestions] db read failed, falling back", err);
  }

  // 2) Legacy fallback — JSON file pack.
  if (opts.mode === "sample") {
    const items = await legacySampleQuestions(slug, opts.size);
    return { source: "legacy", items };
  }
  const { total, items } = await legacyPagedQuestions(slug, opts.offset, opts.limit);
  return { source: "legacy", items, total };
}
