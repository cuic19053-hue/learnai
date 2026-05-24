/**
 * POST /api/certifications/:slug/sessions
 *
 * Start a new quiz session for a learner against a certification.
 * Signed-in learners get a DB-backed session; guests get one too if
 * the cert lives in the DB (CertificationSession allows null userId
 * with a `guestId`). When the cert is a legacy file pack, a
 * lightweight in-memory session is created instead — same response
 * shape, prefixed id (`leg_*`).
 */

import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { getCertificationIdBySlug, getPublicQuestions } from "@/lib/certifications/db";
import { createLegacySession, SessionError, type SessionMode } from "@/lib/certifications/sessions";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  mode: z.enum(["QUICK_DRILL", "REVIEW", "FULL_EXAM", "CUSTOM"]).default("QUICK_DRILL"),
  size: z.number().int().min(1).max(100).default(10),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional(),
  /** Caller-supplied guest id from the browser. Optional for the DB
   *  path; ignored for the legacy path (we mint one anyway). */
  guestId: z.string().min(8).max(64).optional(),
});

const SESSION_TTL_MS = 4 * 60 * 60_000;

export const POST = handler(async (req: Request, ctx: { params: Promise<{ slug: string }> }) => {
  const limit = rateLimit(`cert:sessions:${clientIp(req)}`, { limit: 20, windowMs: 60_000 });
  if (!limit.allowed) return fail(429, "Too many session-creation requests.");

  const { slug } = await ctx.params;
  const body = BodySchema.parse(await req.json().catch(() => ({})));
  const session = await getServerSession(authOptions).catch(() => null);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  // ── DB path ────────────────────────────────────────────────────
  try {
    const cert = await getCertificationIdBySlug(slug);
    if (cert && cert.isPublished) {
      const questions = await getPublicQuestions({
        certificationId: cert.id,
        mode: "sample",
        size: body.size,
        difficulty: body.difficulty,
      });
      if (questions.length === 0) {
        // No published questions in DB — fall through to legacy below.
      } else {
        const quizSession = await prisma.certificationSession.create({
          data: {
            userId: userId ?? null,
            guestId: userId ? null : (body.guestId ?? null),
            certificationId: cert.id,
            mode: body.mode as SessionMode,
            questionIds: questions.map((q) => q.id),
            totalQuestions: questions.length,
            expiresAt: new Date(Date.now() + SESSION_TTL_MS),
          },
        });
        return ok({
          source: "db",
          session: {
            id: quizSession.id,
            mode: quizSession.mode,
            status: quizSession.status,
            totalQuestions: quizSession.totalQuestions,
            currentIndex: quizSession.currentIndex,
            passingPercent: quizSession.passingPercent,
            certificationSlug: slug,
          },
          questions,
        });
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[certifications] DB session creation failed, trying legacy", err);
  }

  // ── Legacy file-pack path ──────────────────────────────────────
  try {
    const { envelope, questions } = await createLegacySession({
      slug,
      mode: body.mode as SessionMode,
      size: body.size,
      difficulty: body.difficulty,
    });
    return ok({ source: "legacy", session: envelope, questions });
  } catch (err) {
    if (err instanceof SessionError) return fail(err.status, err.message);
    throw err;
  }
});
