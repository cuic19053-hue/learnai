/**
 * Drive one round of the defense:
 *
 *   POST /api/learn/defense/:id/round
 *     Generate the next question from a chosen persona. Returns the
 *     created DefenseRound row (answer empty, feedback null).
 *
 *     Body:
 *       {
 *         personaId: string,        // persona from session.committee[]
 *         kind: "SOCRATIC" | "MOCK_DEFENSE",
 *         followUpTopic?: string    // optional drill-down hint
 *       }
 *
 *   PATCH /api/learn/defense/:id/round
 *     Submit the candidate's answer for a round. Grades the answer
 *     against the persona + sources and persists the rubric feedback.
 *
 *     Body:
 *       {
 *         roundId: string,
 *         answer: string             // typed, or STT transcription
 *       }
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { askDefenseQuestion, DefenseAskError } from "@/lib/defense/ask";
import { gradeDefenseAnswer, DefenseGradeError } from "@/lib/defense/grade";
import { buildSourceSnippets } from "@/lib/defense/source-snippets";
import { resolveDefenseOwner } from "@/lib/defense/owner";
import type { CommitteePersona, DefenseSource, GroundingCitation } from "@/lib/defense/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PostSchema = z.object({
  personaId: z.string().min(1).max(40),
  kind: z.enum(["SOCRATIC", "MOCK_DEFENSE"]),
  followUpTopic: z.string().max(200).optional(),
});

const PatchSchema = z.object({
  roundId: z.string().cuid(),
  answer: z.string().min(1).max(4_000),
});

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

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id: sessionId } = await ctx.params;
  const body = PostSchema.parse(await req.json());
  const owner = await resolveDefenseOwner(req);

  const session = await loadOwnedSession(sessionId, owner);
  if (session === null) return fail(404, "Defense session not found.");
  if (session === "forbidden") return fail(403, "You don't have access to this session.");

  const committee = session.committee as unknown as CommitteePersona[];
  const persona = committee.find((p) => p.id === body.personaId);
  if (!persona) return fail(400, "Persona is not part of this session's committee.");

  const sources = session.sources as unknown as DefenseSource[];
  const snippets = await buildSourceSnippets(sources);

  const history = session.rounds.slice(-8).map((r) => {
    const personaName = committee.find((p) => p.id === r.personaId)?.name ?? r.personaId;
    return {
      personaName,
      question: r.question,
      answer: r.answer ?? undefined,
    };
  });

  let asked;
  try {
    asked = await askDefenseQuestion({
      persona,
      thesisTitle: session.title,
      thesisAbstract: session.thesisAbstract ?? undefined,
      snippets,
      history,
      followUpTopic: body.followUpTopic,
    });
  } catch (err) {
    if (err instanceof DefenseAskError) return fail(err.status, err.message);
    throw err;
  }

  const position = session.rounds.length;
  const round = await prisma.defenseRound.create({
    data: {
      sessionId,
      kind: body.kind,
      personaId: persona.id,
      question: asked.question,
      position,
      groundingCitations: asked.citations as unknown as object,
    },
  });

  // First round of a study/mock automatically moves the session into
  // the right state so the UI doesn't have to PATCH separately.
  if (session.status === "PLANNING") {
    await prisma.defenseSession.update({
      where: { id: sessionId },
      data: { status: body.kind === "SOCRATIC" ? "STUDY" : "MOCK" },
    });
  }

  return ok({
    round: {
      id: round.id,
      kind: round.kind,
      personaId: round.personaId,
      personaName: persona.name,
      question: round.question,
      groundingCitations: asked.citations as GroundingCitation[],
      position: round.position,
      createdAt: round.createdAt,
    },
  });
});

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const { id: sessionId } = await ctx.params;
  const body = PatchSchema.parse(await req.json());
  const owner = await resolveDefenseOwner(req);

  const session = await loadOwnedSession(sessionId, owner);
  if (session === null) return fail(404, "Defense session not found.");
  if (session === "forbidden") return fail(403, "You don't have access to this session.");

  const round = session.rounds.find((r) => r.id === body.roundId);
  if (!round) return fail(404, "Round not found in this session.");
  if (round.answer) {
    return fail(409, "This round has already been answered.");
  }

  const committee = session.committee as unknown as CommitteePersona[];
  const persona = committee.find((p) => p.id === round.personaId);
  if (!persona) return fail(500, "Round persona is missing from the committee.");

  const sources = session.sources as unknown as DefenseSource[];
  const snippets = await buildSourceSnippets(sources);

  let graded;
  try {
    graded = await gradeDefenseAnswer({
      persona,
      question: round.question,
      answer: body.answer,
      snippets,
    });
  } catch (err) {
    if (err instanceof DefenseGradeError) return fail(err.status, err.message);
    throw err;
  }

  // Persist the answer + feedback. We keep the existing
  // groundingCitations (from the ask call) and let the grader's
  // citedSourceIds drive readiness coverage downstream.
  const updated = await prisma.defenseRound.update({
    where: { id: round.id },
    data: {
      answer: body.answer,
      answeredAt: new Date(),
      feedback: {
        ...graded.feedback,
        citedSourceIds: graded.citedSourceIds,
      } as unknown as object,
    },
  });

  return ok({
    round: {
      id: updated.id,
      personaId: updated.personaId,
      question: updated.question,
      answer: updated.answer,
      feedback: graded.feedback,
      citedSourceIds: graded.citedSourceIds,
    },
  });
});
