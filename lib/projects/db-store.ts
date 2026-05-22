/**
 * Per-user project store (DB-backed).
 *
 * Replaces the process-local in-memory Map in `./store.ts` for any user
 * who is signed in. Every read and write is scoped by the caller's
 * `userId` — we never look up a project without an owner check, so one
 * user can't see, edit, or delete another user's drafts.
 *
 * Guests (no session) keep using the legacy in-memory store; their
 * drafts live in the same lambda and disappear on cold start, which is
 * acceptable for an unsigned visitor and matches the rest of the guest
 * data story (localStorage-only).
 */

import "server-only";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ProjectDraft } from "./wizard-config";
import type { WorldSlug } from "@/lib/learn/worlds";

type CreateInput = Omit<ProjectDraft, "id" | "createdAt" | "status"> & {
  status?: ProjectDraft["status"];
};

/**
 * Map a Prisma row to the existing `ProjectDraft` shape so callers
 * upstream don't have to know whether the data came from Prisma or the
 * legacy Map.
 */
function rowToDraft(row: {
  id: string;
  worldSlug: string;
  topic: string;
  outcome: string;
  sources: string[];
  daysPerWeek: number;
  minutesPerDay: number;
  deadline: string | null;
  prefs: string[];
  status: string;
  createdAt: Date;
}): ProjectDraft {
  return {
    id: row.id,
    worldSlug: row.worldSlug as WorldSlug,
    topic: row.topic,
    outcome: row.outcome,
    sources: row.sources,
    daysPerWeek: row.daysPerWeek,
    minutesPerDay: row.minutesPerDay,
    deadline: row.deadline ?? undefined,
    prefs: row.prefs,
    status: (row.status as ProjectDraft["status"]) ?? "idea",
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createUserProject(userId: string, input: CreateInput): Promise<ProjectDraft> {
  const row = await prisma.project.create({
    data: {
      userId,
      worldSlug: input.worldSlug,
      topic: input.topic,
      outcome: input.outcome,
      sources: input.sources,
      daysPerWeek: input.daysPerWeek,
      minutesPerDay: input.minutesPerDay,
      deadline: input.deadline,
      prefs: input.prefs,
      status: input.status ?? "idea",
    },
  });
  return rowToDraft(row);
}

export async function listUserProjects(
  userId: string,
  worldSlug?: WorldSlug
): Promise<ProjectDraft[]> {
  const rows = await prisma.project.findMany({
    where: { userId, ...(worldSlug ? { worldSlug } : {}) },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(rowToDraft);
}

/**
 * Look up a project by id, but only if it belongs to the caller. Returns
 * null if the row doesn't exist OR exists for a different user — we
 * never disclose which case it was, to avoid leaking ownership.
 */
export async function getUserProject(userId: string, id: string): Promise<ProjectDraft | null> {
  const row = await prisma.project.findFirst({ where: { id, userId } });
  return row ? rowToDraft(row) : null;
}

export async function deleteUserProject(userId: string, id: string): Promise<boolean> {
  try {
    await prisma.project.delete({ where: { id, userId } });
    return true;
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      // Row not found — either never existed or belongs to a different user.
      return false;
    }
    throw err;
  }
}

/**
 * True when the Prisma error means "the Project table doesn't exist
 * yet" — i.e. production migrations weren't applied. The API layer
 * uses this to short-circuit to a clear 503 instead of bubbling the
 * raw Prisma error to the client.
 */
export function isMissingProjectTable(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}
