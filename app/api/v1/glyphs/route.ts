/**
 * Admin glyph management.
 *
 *   GET  /api/v1/glyphs                       list (filters: ?lang ?world ?status ?search)
 *   POST /api/v1/glyphs                       create
 *
 * Both routes are admin-only. The child-facing fetch is
 * `/api/v1/glyphs/:character` and intentionally has no auth gate so
 * a tablet kiosk can render lessons without sign-in.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createGlyph, listGlyphs } from "@/lib/letterforge/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function requireAdmin() {
  const session = await getServerSession(authOptions).catch(() => null);
  const user = session?.user as { id?: string; role?: string } | undefined;
  if (!user?.id) return { ok: false as const, status: 401, message: "Sign in required." };
  if (user.role !== "ADMIN") return { ok: false as const, status: 403, message: "Admin only." };
  return { ok: true as const, userId: user.id };
}

const StrokeSchema = z.object({
  order: z.number().int().min(1).max(12),
  guide_path: z
    .array(z.object({ x: z.number(), y: z.number() }))
    .min(2)
    .max(64),
  start_marker: z.object({ x: z.number(), y: z.number() }).optional(),
  direction_arrow_points: z
    .object({
      from: z.object({ x: z.number(), y: z.number() }),
      to: z.object({ x: z.number(), y: z.number() }),
    })
    .optional(),
});

const CreateSchema = z.object({
  slug: z.string().min(2).max(120).optional(),
  character: z.string().min(1).max(8),
  language: z.string().min(2).max(8).default("en"),
  world: z.string().min(2).max(40).default("little_learner"),
  displayName: z.string().max(200).optional(),
  audioUrl: z.string().url().optional(),
  rewardImageUrl: z.string().url().optional(),
  rewardWord: z.string().max(80).optional(),
  rewardEmoji: z.string().max(8).optional(),
  strokes: z.array(StrokeSchema).min(1).max(8),
  toleranceRadius: z.number().int().min(10).max(120).default(40),
  difficulty: z.number().int().min(1).max(5).default(1),
  relatedWords: z.array(z.string().min(1).max(60)).max(10).optional(),
  status: z.enum(["DRAFT", "REVIEW", "LIVE", "RETIRED"]).default("LIVE"),
  tags: z.array(z.string().min(1).max(40)).max(10).optional(),
});

export const GET = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const url = new URL(req.url);
  const items = await listGlyphs({
    language: url.searchParams.get("lang") ?? undefined,
    world: url.searchParams.get("world") ?? undefined,
    status:
      (url.searchParams.get("status") as "DRAFT" | "REVIEW" | "LIVE" | "RETIRED" | null) ??
      undefined,
    search: url.searchParams.get("search") ?? undefined,
  });
  return ok({ items });
});

export const POST = handler(async (req: Request) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const body = CreateSchema.parse(await req.json());
  const glyph = await createGlyph({ ...body, createdBy: guard.userId });
  return ok({ glyph }, { status: 201 });
});
