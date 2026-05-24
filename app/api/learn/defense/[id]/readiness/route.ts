/**
 * POST /api/learn/defense/:id/readiness
 *   Compute (or recompute) the readiness report for a defense
 *   session, persist it as DefenseReadiness, and return the payload.
 *
 * GET /api/learn/defense/:id/readiness
 *   Return the most recently computed readiness report (404 if none
 *   yet). Idempotent — does not regenerate.
 */

import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { computeReadiness, DefenseReadinessError } from "@/lib/defense/readiness";
import { resolveDefenseOwner } from "@/lib/defense/owner";
import type { CommitteePersona, DefenseSource, RubricFeedback } from "@/lib/defense/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function loadOwnedSession(
  id: string,
  owner: { userId: string | null; guestId: string | null }
) {
  const session = await prisma.defenseSession.findUnique({
    where: { id },
    include: { rounds: { orderBy: { position: "asc" } } },
  });
  if (!session) return null;
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
  const session = await loadOwnedSession(id, owner);
  if (session === null) return fail(404, "Defense session not found.");
  if (session === "forbidden") return fail(403, "You don't have access to this session.");

  const readiness = await prisma.defenseReadiness.findUnique({ where: { sessionId: id } });
  if (!readiness) return fail(404, "No readiness report yet. POST to generate one.");
  return ok({ readiness });
});

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id } = await ctx.params;
  const owner = await resolveDefenseOwner(req);
  const session = await loadOwnedSession(id, owner);
  if (session === null) return fail(404, "Defense session not found.");
  if (session === "forbidden") return fail(403, "You don't have access to this session.");

  const sources = session.sources as unknown as DefenseSource[];
  const committee = session.committee as unknown as CommitteePersona[];
  const personaName = (id: string) => committee.find((p) => p.id === id)?.name ?? id;

  // Unpack feedback JSON columns.
  const rounds = session.rounds.map((r) => {
    const feedback = (r.feedback ?? null) as
      | (RubricFeedback & { citedSourceIds?: string[] })
      | null;
    return {
      personaName: personaName(r.personaId),
      question: r.question,
      answer: r.answer ?? null,
      feedback: feedback
        ? {
            score: feedback.score,
            strengths: feedback.strengths,
            gaps: feedback.gaps,
            followUp: feedback.followUp,
          }
        : null,
      citedSourceIds: feedback?.citedSourceIds ?? [],
    };
  });

  let result;
  try {
    result = await computeReadiness({
      thesisTitle: session.title,
      thesisAbstract: session.thesisAbstract ?? undefined,
      sources,
      rounds,
    });
  } catch (err) {
    if (err instanceof DefenseReadinessError) return fail(err.status, err.message);
    throw err;
  }

  const persisted = await prisma.defenseReadiness.upsert({
    where: { sessionId: id },
    create: {
      sessionId: id,
      scorePercent: result.scorePercent,
      sourceCoverage: result.sourceCoverage as unknown as object,
      weakAreas: result.weakAreas as unknown as object,
      narrative: result.narrative,
    },
    update: {
      scorePercent: result.scorePercent,
      sourceCoverage: result.sourceCoverage as unknown as object,
      weakAreas: result.weakAreas as unknown as object,
      narrative: result.narrative,
    },
  });

  // Mark the session COMPLETED on first successful report.
  if (session.status !== "COMPLETED") {
    await prisma.defenseSession.update({
      where: { id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  }

  return ok({ readiness: persisted });
});
