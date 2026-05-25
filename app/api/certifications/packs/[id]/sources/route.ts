/**
 * POST /api/certifications/packs/:id/sources
 *
 * User-facing source uploader. Same source-policy gate as the admin
 * route (vendor allowlist only — no random PDFs, brain dumps, or
 * third-party blogs). Idempotent on (certificationId, url).
 */

import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireSignedIn } from "@/lib/certifications/user-guard";
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
});

export const POST = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireSignedIn();
  if (!guard.ok) return fail(guard.status, guard.message);
  const limit = rateLimit(`cert:packs:src:${guard.userId}`, { limit: 40, windowMs: 60 * 60_000 });
  if (!limit.allowed) return fail(429, "Too many source uploads this hour.");

  const { id: certificationId } = await ctx.params;
  const body = BodySchema.parse(await req.json());

  if (!isAllowedOfficialSource(body.url)) {
    return fail(
      400,
      "URL host is not on the vendor allowlist. Only official vendor docs are accepted as sources."
    );
  }
  const domain = safeHostname(body.url);
  if (!domain) return fail(400, "Invalid URL.");

  const cert = await prisma.certification.findUnique({
    where: { id: certificationId },
    select: { id: true, isPublished: true },
  });
  if (!cert) return fail(404, "Pack not found.");
  if (cert.isPublished && guard.role !== "ADMIN") {
    return fail(403, "Pack is published — only admins can add sources after publish.");
  }
  // Mark client IP for downstream rate-limit telemetry; not stored.
  void clientIp(req);

  const source = await prisma.certificationSource.upsert({
    where: { certificationId_url: { certificationId, url: body.url } },
    create: {
      certificationId,
      title: body.title,
      url: body.url,
      domain,
      sourceType: body.sourceType,
      isPrimary: body.isPrimary,
      vendorOwned: true,
    },
    update: {
      title: body.title,
      domain,
      sourceType: body.sourceType,
      isPrimary: body.isPrimary,
      vendorOwned: true,
    },
  });
  return ok({ source });
});
