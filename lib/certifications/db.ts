/**
 * Database read surface for the certifications hub.
 *
 * The API routes (`app/api/certifications/...`) call into this module
 * rather than touching `prisma` directly. That gives us one place to
 * shape rows, hide internal columns (correctAnswers), and add caching
 * later without changing the route handlers.
 *
 * Read paths never expose `correctAnswers` on questions — those flow
 * only through the session-answer endpoint where the learner submits
 * an attempt and gets feedback.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import type {
  CertificationLevel,
  CertificationStatus,
  CertificationVendor,
  QuestionDifficulty,
  QuestionType,
} from "@prisma/client";
import type { OfficialRef, QuestionOption } from "./types";

// ─── Listings ───────────────────────────────────────────────────────

export type CertificationListItem = {
  id: string;
  slug: string;
  code: string;
  title: string;
  vendor: CertificationVendor;
  level: CertificationLevel;
  status: CertificationStatus;
  shortDescription: string | null;
  officialUrl: string;
  questionCount: number;
  sourceCount: number;
  domainCount: number;
};

export async function listCertifications(filters?: {
  vendor?: CertificationVendor;
  level?: CertificationLevel;
  status?: CertificationStatus;
}): Promise<CertificationListItem[]> {
  const items = await prisma.certification.findMany({
    where: {
      isPublished: true,
      vendor: filters?.vendor,
      level: filters?.level,
      status: filters?.status,
    },
    include: {
      _count: {
        select: {
          questions: { where: { isPublished: true } },
          sources: true,
          domains: true,
        },
      },
    },
    orderBy: [{ vendor: "asc" }, { sortOrder: "asc" }, { title: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    slug: item.slug,
    code: item.code,
    title: item.title,
    vendor: item.vendor,
    level: item.level,
    status: item.status,
    shortDescription: item.shortDescription,
    officialUrl: item.officialUrl,
    questionCount: item._count.questions,
    sourceCount: item._count.sources,
    domainCount: item._count.domains,
  }));
}

// ─── Detail ────────────────────────────────────────────────────────

export async function getCertificationBySlug(slug: string) {
  return prisma.certification.findUnique({
    where: { slug },
    include: {
      sources: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] },
      domains: { orderBy: { sortOrder: "asc" } },
      _count: {
        select: {
          questions: { where: { isPublished: true } },
          sources: true,
          domains: true,
        },
      },
    },
  });
}

/** Convenience: just the id + publish flag, for lightweight existence checks. */
export async function getCertificationIdBySlug(
  slug: string
): Promise<{ id: string; isPublished: boolean } | null> {
  return prisma.certification.findUnique({
    where: { slug },
    select: { id: true, isPublished: true },
  });
}

// ─── Question reads (public — answers stripped) ─────────────────────

export type PublicQuestion = {
  id: string;
  prompt: string;
  options: QuestionOption[];
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  domain: { id: string; name: string } | null;
  tags: string[];
};

type GetPublicQuestionsArgs = {
  certificationId: string;
  mode: "sample" | "page";
  size?: number;
  offset?: number;
  limit?: number;
  difficulty?: QuestionDifficulty;
};

export async function getPublicQuestions(
  params: GetPublicQuestionsArgs
): Promise<PublicQuestion[]> {
  const where = {
    certificationId: params.certificationId,
    isPublished: true,
    ...(params.difficulty ? { difficulty: params.difficulty } : {}),
  };

  if (params.mode === "sample") {
    // Postgres random ordering via raw — keeps the sample varied per request.
    // The take cap is small (max 50) so the random scan is cheap.
    const size = Math.min(params.size ?? 10, 50);
    const ids = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM "CertificationQuestion"
      WHERE "certificationId" = ${params.certificationId}
        AND "isPublished" = true
        ${params.difficulty ? prismaDifficultyFilter(params.difficulty) : prismaNoOp()}
      ORDER BY random()
      LIMIT ${size}
    `.catch(() => [] as Array<{ id: string }>);
    if (ids.length > 0) {
      const rows = await prisma.certificationQuestion.findMany({
        where: { id: { in: ids.map((r) => r.id) } },
        include: { domain: true },
      });
      return rows.map(stripAnswerFields);
    }
    // Fallback (e.g. SQLite in tests): deterministic order.
    const rows = await prisma.certificationQuestion.findMany({
      where,
      take: size,
      orderBy: { createdAt: "desc" },
      include: { domain: true },
    });
    return rows.map(stripAnswerFields);
  }

  const offset = Math.max(0, params.offset ?? 0);
  const limit = Math.min(Math.max(1, params.limit ?? 20), 100);
  const rows = await prisma.certificationQuestion.findMany({
    where,
    skip: offset,
    take: limit,
    orderBy: { createdAt: "asc" },
    include: { domain: true },
  });
  return rows.map(stripAnswerFields);
}

// `prisma.$queryRaw` doesn't compose conditional fragments cleanly, so
// we wrap helpers to keep the SQL above readable.
function prismaDifficultyFilter(difficulty: QuestionDifficulty) {
  // Casting through Prisma.sql to keep parameter binding safe.
  // Imported lazily to avoid pulling the entire client into the type
  // graph for callers that don't need the raw query.
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { Prisma } = require("@prisma/client");
  return Prisma.sql`AND "difficulty" = ${difficulty}::"QuestionDifficulty"`;
}
function prismaNoOp() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/consistent-type-imports
  const { Prisma } = require("@prisma/client");
  return Prisma.sql``;
}

function stripAnswerFields(q: {
  id: string;
  prompt: string;
  options: unknown;
  questionType: QuestionType;
  difficulty: QuestionDifficulty;
  tags: string[];
  domain: { id: string; name: string } | null;
}): PublicQuestion {
  return {
    id: q.id,
    prompt: q.prompt,
    options: (q.options as QuestionOption[]) ?? [],
    questionType: q.questionType,
    difficulty: q.difficulty,
    domain: q.domain ? { id: q.domain.id, name: q.domain.name } : null,
    tags: q.tags,
  };
}

// ─── Internal: question with answer (for the session answer route) ─

export async function getQuestionWithAnswer(questionId: string) {
  return prisma.certificationQuestion.findUnique({
    where: { id: questionId },
    select: {
      id: true,
      prompt: true,
      questionType: true,
      correctAnswers: true,
      explanation: true,
      officialRefs: true,
    },
  });
}

export type QuestionAnswerView = {
  correctAnswers: string[];
  explanation: string;
  officialRefs: OfficialRef[];
};
