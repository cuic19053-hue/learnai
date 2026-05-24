/**
 * Read/update/delete one certification (any status, including DRAFT).
 *
 *   GET    /api/admin/certifications/:id
 *     Full admin view including DRAFT certs (unlike the public hub
 *     read which only shows isPublished=true rows).
 *
 *   PATCH  /api/admin/certifications/:id
 *     Update editable metadata. Useful for Step 1 edits after
 *     creation and for adding examGuideUrl / learningPathUrl later.
 *
 *   DELETE /api/admin/certifications/:id
 *     Hard-delete the certification (cascades to sources/domains/
 *     questions/sessions/answers/progress). Intended for DRAFTs that
 *     never got published.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";
import { isAllowedOfficialSource, safeHostname } from "@/lib/certifications/source-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const PatchSchema = z.object({
  code: z.string().min(1).max(64).optional(),
  title: z.string().min(2).max(200).optional(),
  shortDescription: z.string().min(2).max(400).nullable().optional(),
  fullDescription: z.string().max(4_000).nullable().optional(),
  officialUrl: z.string().url().optional(),
  examGuideUrl: z.string().url().nullable().optional(),
  learningPathUrl: z.string().url().nullable().optional(),
  level: z
    .enum([
      "FOUNDATIONAL",
      "FUNDAMENTALS",
      "ASSOCIATE",
      "PROFESSIONAL",
      "EXPERT",
      "SPECIALTY",
      "ADVANCED",
      "OTHER",
    ])
    .optional(),
  status: z.enum(["ACTIVE", "BETA", "RETIRING", "RETIRED", "DRAFT", "UNKNOWN"]).optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});

export const GET = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const cert = await prisma.certification.findUnique({
    where: { id },
    include: {
      sources: true,
      domains: true,
      _count: { select: { questions: true, sessions: true } },
    },
  });
  if (!cert) return fail(404, "Certification not found.");
  return ok({ certification: cert });
});

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const body = PatchSchema.parse(await req.json());

  if (body.officialUrl !== undefined && !isAllowedOfficialSource(body.officialUrl)) {
    return fail(400, "officialUrl host is not on the vendor allowlist.");
  }
  const officialDomain = body.officialUrl
    ? (safeHostname(body.officialUrl) ?? undefined)
    : undefined;

  const existing = await prisma.certification.findUnique({ where: { id } });
  if (!existing) return fail(404, "Certification not found.");

  const updated = await prisma.certification.update({
    where: { id },
    data: {
      code: body.code,
      title: body.title,
      shortDescription:
        body.shortDescription === null ? null : (body.shortDescription ?? undefined),
      fullDescription: body.fullDescription === null ? null : (body.fullDescription ?? undefined),
      officialUrl: body.officialUrl,
      officialDomain,
      examGuideUrl: body.examGuideUrl === null ? null : (body.examGuideUrl ?? undefined),
      learningPathUrl: body.learningPathUrl === null ? null : (body.learningPathUrl ?? undefined),
      level: body.level,
      status: body.status,
      sortOrder: body.sortOrder,
    },
  });
  return ok({ certification: updated });
});

export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const result = await prisma.certification.deleteMany({ where: { id } });
  if (result.count === 0) return fail(404, "Certification not found.");
  return ok({ deleted: true });
});
