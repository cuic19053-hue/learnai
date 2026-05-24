/**
 * Step 2 of the add-cert admin wizard.
 *
 *   POST   /api/admin/certifications/:id/sources
 *     Append one vendor-owned official source to a cert (draft or
 *     published). The URL must pass `isAllowedOfficialSource`.
 *
 *   GET    /api/admin/certifications/:id/sources
 *     Admin-view list (includes rawText/contentHash/lastFetchedAt
 *     which the public route hides).
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";
import { isAllowedOfficialSource, safeHostname } from "@/lib/certifications/source-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BodySchema = z.object({
  title: z.string().min(2).max(400),
  url: z.string().url(),
  sourceType: z
    .enum([
      "official_exam_guide",
      "official_certification_page",
      "official_retirement_notice",
      "official_learning_path",
      "official_docs_index",
    ])
    .default("official_certification_page"),
  isPrimary: z.boolean().default(false),
  pageLastUpdated: z.string().max(40).optional(),
});

export const GET = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const cert = await prisma.certification.findUnique({
    where: { id },
    select: { id: true, sources: { orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }] } },
  });
  if (!cert) return fail(404, "Certification not found.");
  return ok({ items: cert.sources });
});

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id: certificationId } = await ctx.params;
  const body = BodySchema.parse(await req.json());

  if (!isAllowedOfficialSource(body.url)) {
    return fail(400, "URL host is not on the vendor allowlist.");
  }
  const domain = safeHostname(body.url);
  if (!domain) return fail(400, "Invalid URL.");

  const cert = await prisma.certification.findUnique({
    where: { id: certificationId },
    select: { id: true },
  });
  if (!cert) return fail(404, "Certification not found.");

  // Upsert by (certificationId, url) so re-submission is idempotent.
  const source = await prisma.certificationSource.upsert({
    where: { certificationId_url: { certificationId, url: body.url } },
    create: {
      certificationId,
      title: body.title,
      url: body.url,
      domain,
      sourceType: body.sourceType,
      isPrimary: body.isPrimary,
      pageLastUpdated: body.pageLastUpdated,
      vendorOwned: true,
    },
    update: {
      title: body.title,
      domain,
      sourceType: body.sourceType,
      isPrimary: body.isPrimary,
      pageLastUpdated: body.pageLastUpdated,
      vendorOwned: true,
    },
  });
  return ok({ source });
});
