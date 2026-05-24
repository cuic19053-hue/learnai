/**
 * Per-session defense endpoints.
 *
 *   GET    /api/learn/defense/:id
 *     Snapshot of the session including all rounds (with feedback)
 *     and any computed readiness report.
 *
 *   PATCH  /api/learn/defense/:id
 *     Update status (e.g. PLANNING -> STUDY -> MOCK -> COMPLETED) or
 *     replace sources/committee. Owner-gated.
 *
 *   DELETE /api/learn/defense/:id
 *     Permanently delete the session and all its rounds.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { resolveDefenseOwner } from "@/lib/defense/owner";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PatchSchema = z.object({
  status: z.enum(["PLANNING", "STUDY", "MOCK", "COMPLETED", "ARCHIVED"]).optional(),
  title: z.string().min(2).max(200).optional(),
  thesisAbstract: z.string().max(4_000).optional(),
  sources: z
    .array(
      z.object({
        id: z.string().min(1).max(60),
        title: z.string().min(1).max(200),
        kind: z.enum(["url", "upload", "note"]),
        ref: z.string().min(1).max(20_000),
        mime: z.string().max(100).optional(),
        addedAt: z.string().min(10).max(40),
      })
    )
    .max(20)
    .optional(),
});

async function loadOwned(id: string, owner: { userId: string | null; guestId: string | null }) {
  const session = await prisma.defenseSession.findUnique({
    where: { id },
    include: {
      rounds: { orderBy: { position: "asc" } },
      readiness: true,
    },
  });
  if (!session) return null;
  // Owner check: signed-in vs userId, guest vs guestId.
  if (owner.userId) {
    if (session.userId && session.userId !== owner.userId) return "forbidden" as const;
  } else if (session.guestId !== owner.guestId) {
    return "forbidden" as const;
  }
  return session;
}

export const GET = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const owner = await resolveDefenseOwner(req);
  const session = await loadOwned(id, owner);
  if (session === null) return fail(404, "Defense session not found.");
  if (session === "forbidden") return fail(403, "You don't have access to this session.");
  return ok({ session });
});

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const body = PatchSchema.parse(await req.json());
  const owner = await resolveDefenseOwner(req);
  const session = await loadOwned(id, owner);
  if (session === null) return fail(404, "Defense session not found.");
  if (session === "forbidden") return fail(403, "You don't have access to this session.");

  const updated = await prisma.defenseSession.update({
    where: { id },
    data: {
      status: body.status,
      title: body.title,
      thesisAbstract: body.thesisAbstract,
      sources: body.sources ? (body.sources as unknown as object) : undefined,
      completedAt: body.status === "COMPLETED" ? new Date() : undefined,
    },
  });
  return ok({ session: updated });
});

export const DELETE = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const owner = await resolveDefenseOwner(req);
  const session = await loadOwned(id, owner);
  if (session === null) return fail(404, "Defense session not found.");
  if (session === "forbidden") return fail(403, "You don't have access to this session.");
  await prisma.defenseSession.delete({ where: { id } });
  return ok({ deleted: true });
});
