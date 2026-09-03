/**
 * LetterForge persistence — glyph reads, attempt logging, progress.
 *
 * Two read paths exist:
 *   - Public child-facing: `getGlyph()`, `nextLesson()` — never expose
 *     the tolerance internals or evalDetail.
 *   - Admin: `listGlyphs()`, `createGlyph()`, `updateGlyph()`.
 *
 * Writes are all in one place so the schema stays consistent and the
 * Prisma JSON columns are validated against the same TypeScript types
 * the evaluator uses.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type { GlyphStatus, LetterforgeGlyph } from "@prisma/client";
import type { Glyph, GlyphStroke } from "./types";

function rowToPublic(row: LetterforgeGlyph): Glyph {
  return {
    glyph_id: row.id,
    slug: row.slug,
    character: row.character,
    language: row.language,
    world: row.world,
    display_name: row.displayName,
    audio_url: row.audioUrl,
    reward_image_url: row.rewardImageUrl,
    reward_word: row.rewardWord,
    reward_emoji: row.rewardEmoji,
    strokes: (row.strokes as unknown as GlyphStroke[]) ?? [],
    tolerance_radius: row.toleranceRadius,
    difficulty: row.difficulty,
    related_words: row.relatedWords,
  };
}

// ─── Reads ─────────────────────────────────────────────────────────

export async function getGlyphByCharacter(args: {
  character: string;
  language?: string;
  world?: string;
}): Promise<Glyph | null> {
  const row = await prisma.letterforgeGlyph.findFirst({
    where: {
      character: args.character,
      language: args.language ?? "en",
      world: args.world ?? "GRADE_6",
      status: "LIVE",
    },
  });
  return row ? rowToPublic(row) : null;
}

export async function getGlyphById(id: string): Promise<Glyph | null> {
  const row = await prisma.letterforgeGlyph.findUnique({ where: { id } });
  return row ? rowToPublic(row) : null;
}

export async function listGlyphs(filters?: {
  language?: string;
  world?: string;
  status?: GlyphStatus;
  search?: string;
}): Promise<
  Array<{
    id: string;
    slug: string;
    character: string;
    language: string;
    world: string;
    status: GlyphStatus;
    difficulty: number;
    updatedAt: string;
  }>
> {
  const rows = await prisma.letterforgeGlyph.findMany({
    where: {
      language: filters?.language,
      world: filters?.world,
      status: filters?.status,
      ...(filters?.search
        ? {
            OR: [
              { slug: { contains: filters.search, mode: "insensitive" } },
              { character: { contains: filters.search } },
              { displayName: { contains: filters.search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ language: "asc" }, { difficulty: "asc" }, { character: "asc" }],
    take: 500,
  });
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    character: r.character,
    language: r.language,
    world: r.world,
    status: r.status,
    difficulty: r.difficulty,
    updatedAt: r.updatedAt.toISOString(),
  }));
}

/**
 * The "next glyph due" picker. For Little Learner this is a simple
 * curated sequence: walk through the configured glyphs of the
 * learner's language in difficulty order, preferring glyphs the
 * learner hasn't earned a sticker on yet. No spaced repetition.
 */
export async function nextLesson(args: {
  learnerId: string;
  language?: string;
  world?: string;
}): Promise<{ glyph: Glyph; already_known: boolean } | null> {
  const language = args.language ?? "en";
  const world = args.world ?? "GRADE_6";

  // Already-mastered glyph ids for this learner.
  const mastered = await prisma.letterforgeProgress.findMany({
    where: { learnerId: args.learnerId, stickerEarned: true },
    select: { glyphId: true },
  });
  const masteredIds = new Set(mastered.map((m) => m.glyphId));

  const all = await prisma.letterforgeGlyph.findMany({
    where: { language, world, status: "LIVE" },
    orderBy: [{ difficulty: "asc" }, { character: "asc" }],
  });
  if (all.length === 0) return null;

  const next = all.find((g) => !masteredIds.has(g.id)) ?? all[0]!;
  return { glyph: rowToPublic(next), already_known: masteredIds.has(next.id) };
}

// ─── Writes ────────────────────────────────────────────────────────

export type UpsertGlyphInput = {
  slug?: string;
  character: string;
  language: string;
  world?: string;
  displayName?: string | null;
  audioUrl?: string | null;
  rewardImageUrl?: string | null;
  rewardWord?: string | null;
  rewardEmoji?: string | null;
  strokes: GlyphStroke[];
  toleranceRadius?: number;
  difficulty?: number;
  relatedWords?: string[];
  status?: GlyphStatus;
  tags?: string[];
  createdBy?: string;
};

function slugFor(input: { character: string; language: string; world: string }): string {
  // ASCII-friendly slug. For non-Latin characters (あ, أ) fall back to
  // a unicode hex; the slug is internal so readability is a bonus, not
  // a requirement.
  const asciiSafe = /^[A-Za-z0-9]+$/.test(input.character)
    ? input.character
    : Buffer.from(input.character, "utf8").toString("hex");
  return `${asciiSafe}-${input.language}-${input.world}`.toLowerCase();
}

export async function createGlyph(input: UpsertGlyphInput): Promise<Glyph> {
  const world = input.world ?? "GRADE_6";
  const slug =
    input.slug ?? slugFor({ character: input.character, language: input.language, world });
  const row = await prisma.letterforgeGlyph.create({
    data: {
      slug,
      character: input.character,
      language: input.language,
      world,
      displayName: input.displayName,
      audioUrl: input.audioUrl,
      rewardImageUrl: input.rewardImageUrl,
      rewardWord: input.rewardWord,
      rewardEmoji: input.rewardEmoji,
      strokes: input.strokes as unknown as object,
      toleranceRadius: input.toleranceRadius ?? 40,
      difficulty: input.difficulty ?? 1,
      relatedWords: input.relatedWords ?? [],
      status: input.status ?? "LIVE",
      tags: input.tags ?? [],
      createdBy: input.createdBy,
    },
  });
  return rowToPublic(row);
}

export async function updateGlyph(
  id: string,
  patch: Partial<UpsertGlyphInput>
): Promise<Glyph | null> {
  const row = await prisma.letterforgeGlyph.update({
    where: { id },
    data: {
      slug: patch.slug ?? undefined,
      character: patch.character ?? undefined,
      language: patch.language ?? undefined,
      world: patch.world ?? undefined,
      displayName: patch.displayName ?? undefined,
      audioUrl: patch.audioUrl ?? undefined,
      rewardImageUrl: patch.rewardImageUrl ?? undefined,
      rewardWord: patch.rewardWord ?? undefined,
      rewardEmoji: patch.rewardEmoji ?? undefined,
      strokes: patch.strokes ? (patch.strokes as unknown as object) : undefined,
      toleranceRadius: patch.toleranceRadius ?? undefined,
      difficulty: patch.difficulty ?? undefined,
      relatedWords: patch.relatedWords ?? undefined,
      status: patch.status ?? undefined,
      tags: patch.tags ?? undefined,
    },
  });
  return rowToPublic(row);
}

export async function deleteGlyph(id: string): Promise<boolean> {
  const r = await prisma.letterforgeGlyph.deleteMany({ where: { id } });
  return r.count > 0;
}

// ─── Attempt logging + progress upsert ────────────────────────────

export async function recordAttempt(args: {
  glyphId: string;
  learnerId: string;
  userId?: string | null;
  guestId?: string | null;
  payload: object;
  result: string;
  stars: number;
  evalDetail?: object;
}): Promise<void> {
  await prisma.$transaction([
    prisma.letterforgeAttempt.create({
      data: {
        glyphId: args.glyphId,
        learnerId: args.learnerId,
        userId: args.userId ?? null,
        guestId: args.guestId ?? null,
        payload: args.payload as unknown as object,
        result: args.result,
        stars: args.stars,
        evalDetail: (args.evalDetail ?? null) as unknown as object,
      },
    }),
    prisma.letterforgeProgress.upsert({
      where: { learnerId_glyphId: { learnerId: args.learnerId, glyphId: args.glyphId } },
      create: {
        learnerId: args.learnerId,
        glyphId: args.glyphId,
        userId: args.userId ?? null,
        guestId: args.guestId ?? null,
        timesAttempted: 1,
        bestStars: args.stars,
        stickerEarned: args.stars >= 3,
        lastAttemptAt: new Date(),
      },
      update: {
        timesAttempted: { increment: 1 },
        bestStars: Math.max(0, args.stars),
        stickerEarned: args.stars >= 3 ? true : undefined,
        lastAttemptAt: new Date(),
        // Keep userId/guestId in sync for guests that later sign in.
        userId: args.userId ?? undefined,
        guestId: args.guestId ?? undefined,
      },
    }),
  ]);
}

// ─── Parent dashboard reads ───────────────────────────────────────

export async function learnerProgress(learnerId: string): Promise<{
  glyphsTried: number;
  glyphsMastered: number;
  totalAttempts: number;
  lastSeen: string | null;
  byGlyph: Array<{
    character: string;
    language: string;
    timesAttempted: number;
    bestStars: number;
    stickerEarned: boolean;
    lastAttemptAt: string | null;
  }>;
}> {
  const rows = await prisma.letterforgeProgress.findMany({
    where: { learnerId },
    include: { glyph: { select: { character: true, language: true } } },
    orderBy: { lastAttemptAt: "desc" },
  });
  const totalAttempts = rows.reduce((acc, r) => acc + r.timesAttempted, 0);
  const glyphsMastered = rows.filter((r) => r.stickerEarned).length;
  const lastSeen = rows[0]?.lastAttemptAt?.toISOString() ?? null;
  return {
    glyphsTried: rows.length,
    glyphsMastered,
    totalAttempts,
    lastSeen,
    byGlyph: rows.map((r) => ({
      character: r.glyph.character,
      language: r.glyph.language,
      timesAttempted: r.timesAttempted,
      bestStars: r.bestStars,
      stickerEarned: r.stickerEarned,
      lastAttemptAt: r.lastAttemptAt?.toISOString() ?? null,
    })),
  };
}
