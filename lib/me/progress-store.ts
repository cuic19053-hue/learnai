/**
 * Server-side store for per-user progress (XP, streak, world stats,
 * achievements).
 *
 * Mirrors the shape used by the client `ProgressProvider` so the two
 * speak the same language. The whole client `ProgressState` collapses
 * into a single row with three scalar columns + one JSON blob:
 *
 *   xp / streak / lastSeen  → cheap to read for header chrome
 *   worldStats              → JSON: { [slug]: WorldProgress, ... ,
 *                                     achievements: string[] }
 *
 * Achievements live inside worldStats rather than getting their own
 * column to keep the schema flat — the array is short enough that JSON
 * scan beats a separate junction table for this use case.
 */

import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_PROGRESS,
  PROGRESS_VERSION,
  type ProgressState,
  type WorldProgress,
} from "@/lib/progress/types";

type WorldStatsBlob = {
  worlds: Record<string, WorldProgress>;
  achievements: string[];
};

function safeWorldStats(raw: unknown): WorldStatsBlob {
  if (!raw || typeof raw !== "object") return { worlds: {}, achievements: [] };
  const obj = raw as Record<string, unknown>;
  const worlds =
    obj.worlds && typeof obj.worlds === "object"
      ? (obj.worlds as Record<string, WorldProgress>)
      : {};
  const achievements = Array.isArray(obj.achievements) ? (obj.achievements as string[]) : [];
  return { worlds, achievements };
}

export async function getUserProgress(userId: string): Promise<ProgressState | null> {
  const row = await prisma.userProgress.findUnique({ where: { userId } });
  if (!row) return null;
  const { worlds, achievements } = safeWorldStats(row.worldStats);
  return {
    v: PROGRESS_VERSION,
    xp: row.xp,
    streak: {
      current: row.streak,
      // Longest isn't stored separately yet — collapse to current as
      // a safe lower bound. Real "longest" tracking lands when we
      // start writing analytics events.
      longest: row.streak,
      lastActive: row.lastSeen ? toIsoDate(row.lastSeen) : null,
    },
    worlds,
    achievements,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function upsertUserProgress(
  userId: string,
  state: ProgressState
): Promise<ProgressState> {
  const blob: WorldStatsBlob = {
    worlds: state.worlds,
    achievements: state.achievements,
  };
  const lastSeen = state.streak.lastActive ? fromIsoDate(state.streak.lastActive) : null;

  const row = await prisma.userProgress.upsert({
    where: { userId },
    create: {
      userId,
      xp: state.xp,
      streak: state.streak.current,
      lastSeen,
      worldStats: blob as unknown as Prisma.InputJsonValue,
    },
    update: {
      xp: state.xp,
      streak: state.streak.current,
      lastSeen,
      worldStats: blob as unknown as Prisma.InputJsonValue,
    },
  });

  const merged = safeWorldStats(row.worldStats);
  return {
    v: PROGRESS_VERSION,
    xp: row.xp,
    streak: {
      current: row.streak,
      longest: Math.max(row.streak, state.streak.longest),
      lastActive: row.lastSeen ? toIsoDate(row.lastSeen) : null,
    },
    worlds: merged.worlds,
    achievements: merged.achievements,
    updatedAt: row.updatedAt.toISOString(),
  };
}

/**
 * Merge local-cookie progress with what's already in the DB, taking
 * the higher value per metric so a user signing in from a fresh
 * browser doesn't lose their existing XP.
 */
export function mergeProgress(server: ProgressState, local: ProgressState): ProgressState {
  const xp = Math.max(server.xp, local.xp);
  const streakCurrent = Math.max(server.streak.current, local.streak.current);
  const streakLongest = Math.max(server.streak.longest, local.streak.longest);
  const lastActive = laterDateString(server.streak.lastActive, local.streak.lastActive);

  const worlds: Record<string, WorldProgress> = {};
  const keys = new Set([...Object.keys(server.worlds), ...Object.keys(local.worlds)]);
  for (const k of keys) {
    const s = server.worlds[k];
    const l = local.worlds[k];
    if (!s) {
      worlds[k] = l!;
    } else if (!l) {
      worlds[k] = s;
    } else {
      worlds[k] = {
        xp: Math.max(s.xp, l.xp),
        lessonsCompleted: Math.max(s.lessonsCompleted, l.lessonsCompleted),
        lastSeen: laterDateString(s.lastSeen, l.lastSeen),
      };
    }
  }
  const achievements = Array.from(new Set([...server.achievements, ...local.achievements]));

  return {
    v: PROGRESS_VERSION,
    xp,
    streak: { current: streakCurrent, longest: streakLongest, lastActive },
    worlds,
    achievements,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Best-effort hydration helper used by login flows: pull whatever is
 * on the server for this user, or return defaults if nothing exists.
 * Never throws — a missing-table error returns DEFAULT_PROGRESS so the
 * caller can still render a sensible UI while the migration is pending.
 */
export async function safeLoadUserProgress(userId: string): Promise<ProgressState> {
  try {
    return (await getUserProgress(userId)) ?? DEFAULT_PROGRESS;
  } catch {
    return DEFAULT_PROGRESS;
  }
}

export function isMissingProgressTable(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fromIsoDate(d: string): Date {
  // Parse as UTC midnight so a yyyy-mm-dd round-trips without timezone drift.
  return new Date(`${d}T00:00:00.000Z`);
}

function laterDateString(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return a > b ? a : b;
}
