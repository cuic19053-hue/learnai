/**
 * POST /api/admin/certifications
 *
 * Step 1 of the "Add a certification" admin wizard. Creates a
 * Certification row in DRAFT status from the vendor + metadata
 * the admin entered on the first wizard step. The slug must be
 * unique and URL-safe; the admin can pick one or we generate from
 * the title.
 *
 * The created cert is intentionally `isPublished: false` and
 * `status: DRAFT` so it doesn't appear in the public catalog until
 * the admin walks through the rest of the wizard and hits
 * Step 4 publish.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/certifications/admin-guard";
import { isAllowedOfficialSource, safeHostname } from "@/lib/certifications/source-policy";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,118}[a-z0-9])?$/;

const BodySchema = z.object({
  slug: z.string().regex(SLUG_RE).optional(),
  code: z.string().min(1).max(64),
  title: z.string().min(2).max(200),
  vendor: z.enum(["AWS", "AZURE", "GCP", "IBM", "OTHER"]),
  level: z.enum([
    "FOUNDATIONAL",
    "FUNDAMENTALS",
    "ASSOCIATE",
    "PROFESSIONAL",
    "EXPERT",
    "SPECIALTY",
    "ADVANCED",
    "OTHER",
  ]),
  shortDescription: z.string().min(2).max(400).optional(),
  fullDescription: z.string().max(4_000).optional(),
  officialUrl: z.string().url(),
  examGuideUrl: z.string().url().optional(),
  learningPathUrl: z.string().url().optional(),
});

function slugify(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 120) || "cert"
  );
}

export const POST = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);

  const body = BodySchema.parse(await req.json());
  if (!isAllowedOfficialSource(body.officialUrl)) {
    return fail(400, "officialUrl host is not on the vendor allowlist.");
  }
  const officialDomain = safeHostname(body.officialUrl) ?? "";

  const slug = body.slug ?? slugify(`${body.vendor.toLowerCase()}-${body.title}`);
  const exists = await prisma.certification.findUnique({ where: { slug } });
  if (exists) {
    return fail(409, `A certification already exists with slug "${slug}".`);
  }

  const cert = await prisma.certification.create({
    data: {
      slug,
      code: body.code,
      title: body.title,
      vendor: body.vendor,
      level: body.level,
      status: "DRAFT",
      shortDescription: body.shortDescription,
      fullDescription: body.fullDescription,
      officialUrl: body.officialUrl,
      officialDomain,
      examGuideUrl: body.examGuideUrl,
      learningPathUrl: body.learningPathUrl,
      isPublished: false,
    },
  });

  return ok({ certification: cert }, { status: 201 });
});
