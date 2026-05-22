/**
 * Server-side store for per-user preferences.
 *
 * Mirrors the localStorage shape used by `lib/settings/prefs.ts` so
 * client code can read either source with the same interface. Three
 * fields get their own column (teacherId, ttsEngine, voiceLabel); the
 * rest land in the JSON `extra` blob so future preferences don't
 * require schema migrations.
 */

import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type StoredPreferences = {
  teacherId: string | null;
  ttsEngine: string | null;
  voiceLabel: string | null;
  extra: Record<string, unknown>;
  updatedAt: string;
};

const EMPTY: Omit<StoredPreferences, "updatedAt"> = {
  teacherId: null,
  ttsEngine: null,
  voiceLabel: null,
  extra: {},
};

export async function getUserPreferences(userId: string): Promise<StoredPreferences | null> {
  const row = await prisma.userPreferences.findUnique({ where: { userId } });
  if (!row) return null;
  return {
    teacherId: row.teacherId,
    ttsEngine: row.ttsEngine,
    voiceLabel: row.voiceLabel,
    extra: (row.extra as Record<string, unknown>) ?? {},
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function upsertUserPreferences(
  userId: string,
  patch: Partial<Omit<StoredPreferences, "updatedAt">>
): Promise<StoredPreferences> {
  // upsert + spread so a PATCH that only touches one field keeps the
  // rest intact. Prisma's update with `merge` semantics doesn't apply
  // to scalar columns, so we read first then write.
  const current = (await getUserPreferences(userId)) ?? { ...EMPTY };
  const merged = {
    teacherId: patch.teacherId ?? current.teacherId,
    ttsEngine: patch.ttsEngine ?? current.ttsEngine,
    voiceLabel: patch.voiceLabel ?? current.voiceLabel,
    extra: { ...current.extra, ...(patch.extra ?? {}) },
  };
  const row = await prisma.userPreferences.upsert({
    where: { userId },
    create: { userId, ...merged, extra: merged.extra as Prisma.InputJsonValue },
    update: { ...merged, extra: merged.extra as Prisma.InputJsonValue },
  });
  return {
    teacherId: row.teacherId,
    ttsEngine: row.ttsEngine,
    voiceLabel: row.voiceLabel,
    extra: (row.extra as Record<string, unknown>) ?? {},
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function isMissingPreferencesTable(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}
