/**
 * Defense subsystem entry points.
 *
 *   POST /api/learn/defense
 *     Body: { title, thesisAbstract?, sources[], committee? }
 *     Creates a new DefenseSession in PLANNING status. Sources are
 *     validated structurally (kind/title/ref required); committee
 *     defaults to the 3-persona kit when omitted.
 *
 *   GET  /api/learn/defense
 *     Lists the caller's recent defense sessions (most recent first).
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { defaultCommittee } from "@/lib/defense/personas";
import { resolveDefenseOwner } from "@/lib/defense/owner";
import type { CommitteePersona, DefenseSource } from "@/lib/defense/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SourceSchema = z.object({
  id: z.string().min(1).max(60),
  title: z.string().min(1).max(200),
  kind: z.enum(["url", "upload", "note"]),
  ref: z.string().min(1).max(20_000),
  mime: z.string().max(100).optional(),
  addedAt: z.string().min(10).max(40),
});

const PersonaSchema = z.object({
  id: z.string().min(1).max(40),
  role: z.enum(["domain_expert", "methods_chair", "devils_advocate"]),
  name: z.string().min(1).max(80),
  focus: z.string().min(1).max(400),
  voice: z.string().max(80).optional(),
});

const BodySchema = z.object({
  title: z.string().min(2).max(200),
  thesisAbstract: z.string().max(4_000).optional(),
  sources: z.array(SourceSchema).max(20).default([]),
  committee: z.array(PersonaSchema).min(1).max(5).optional(),
});

export const POST = handler(async (req: Request) => {
  const body = BodySchema.parse(await req.json());
  const owner = await resolveDefenseOwner(req);

  const committee: CommitteePersona[] = body.committee ?? defaultCommittee();
  const sources: DefenseSource[] = body.sources;

  try {
    const session = await prisma.defenseSession.create({
      data: {
        userId: owner.userId,
        guestId: owner.guestId,
        title: body.title.trim(),
        thesisAbstract: body.thesisAbstract?.trim(),
        sources: sources as unknown as object,
        committee: committee as unknown as object,
        status: "PLANNING",
      },
    });
    return ok(
      {
        session: {
          id: session.id,
          title: session.title,
          status: session.status,
          startedAt: session.startedAt,
          sources,
          committee,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("does not exist")) {
      return fail(503, "Defense table missing. Run `prisma migrate dev --name defense_subsystem`.");
    }
    throw err;
  }
});

export const GET = handler(async (req: Request) => {
  const owner = await resolveDefenseOwner(req);
  const where = owner.userId ? { userId: owner.userId } : { guestId: owner.guestId };
  try {
    const rows = await prisma.defenseSession.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: 25,
      select: {
        id: true,
        title: true,
        status: true,
        startedAt: true,
        completedAt: true,
        sources: true,
        committee: true,
      },
    });
    return ok({ items: rows });
  } catch (err) {
    if (err instanceof Error && err.message.includes("does not exist")) {
      return ok({ items: [], warning: "defense_table_missing" });
    }
    throw err;
  }
});
