/**
 * POST /api/certifications/packs
 *
 * User-facing entry into the "Create your own pack" wizard. Any
 * signed-in learner can create a DRAFT pack; aggressive per-IP and
 * per-user rate limits bound abuse. The pack is invisible until the
 * creator (or an admin) publishes it via the publish route.
 *
 * Two modes:
 *   - `from: "scratch"` (default) — fresh slug derived from vendor+title.
 *   - `from: "version-of"` with `baseSlug` — clones metadata from an
 *     existing pack and assigns the next `-v<N>` suffix.
 */

import { z } from "zod";
import { clientIp, fail, handler, ok, rateLimit } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { requireSignedIn } from "@/lib/certifications/user-guard";
import { isAllowedOfficialSource, safeHostname } from "@/lib/certifications/source-policy";
import { nextVersionSlug } from "@/lib/certifications/versioning";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{1,118}[a-z0-9])?$/;

const ScratchSchema = z.object({
  from: z.literal("scratch").default("scratch"),
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
  officialUrl: z.string().url(),
  examGuideUrl: z.string().url().optional(),
});

const VersionSchema = z.object({
  from: z.literal("version-of"),
  baseSlug: z.string().regex(SLUG_RE),
  title: z.string().min(2).max(200).optional(),
  shortDescription: z.string().min(2).max(400).optional(),
});

const BodySchema = z.discriminatedUnion("from", [ScratchSchema, VersionSchema]);

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "pack"
  );
}

export const POST = handler(async (req: Request) => {
  const guard = await requireSignedIn();
  if (!guard.ok) return fail(guard.status, guard.message);

  const ipLimit = rateLimit(`cert:packs:create:ip:${clientIp(req)}`, {
    limit: 6,
    windowMs: 60 * 60_000,
  });
  if (!ipLimit.allowed) return fail(429, "Too many packs created from this network. Try later.");
  const userLimit = rateLimit(`cert:packs:create:user:${guard.userId}`, {
    limit: 8,
    windowMs: 24 * 60 * 60_000,
  });
  if (!userLimit.allowed) return fail(429, "Daily pack-creation limit reached.");

  const body = BodySchema.parse(await req.json());

  if (body.from === "version-of") {
    const base = await prisma.certification.findUnique({ where: { slug: body.baseSlug } });
    if (!base) return fail(404, `No pack found at slug "${body.baseSlug}".`);
    const slug = await nextVersionSlug(body.baseSlug);
    const cert = await prisma.certification.create({
      data: {
        slug,
        code: base.code,
        title: body.title ?? base.title,
        vendor: base.vendor,
        level: base.level,
        status: "DRAFT",
        shortDescription: body.shortDescription ?? base.shortDescription,
        fullDescription: base.fullDescription,
        officialUrl: base.officialUrl,
        officialDomain: base.officialDomain,
        examGuideUrl: base.examGuideUrl,
        learningPathUrl: base.learningPathUrl,
        isPublished: false,
      },
    });
    return ok({ certification: cert, version: cert.slug }, { status: 201 });
  }

  if (!isAllowedOfficialSource(body.officialUrl)) {
    return fail(400, "officialUrl host is not on the vendor allowlist.");
  }
  const officialDomain = safeHostname(body.officialUrl) ?? "";
  const slug = body.slug ?? slugify(`${body.vendor.toLowerCase()}-${body.code}`);
  const exists = await prisma.certification.findUnique({ where: { slug } });
  if (exists) {
    return fail(409, `A pack already exists at slug "${slug}". Try a new version instead.`);
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
      officialUrl: body.officialUrl,
      officialDomain,
      examGuideUrl: body.examGuideUrl,
      isPublished: false,
    },
  });
  return ok({ certification: cert, version: cert.slug }, { status: 201 });
});
