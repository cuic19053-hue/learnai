/**
 * Admin glyph update / delete by id.
 *
 *   GET    /api/v1/glyphs/by-id/:id
 *   PATCH  /api/v1/glyphs/by-id/:id
 *   DELETE /api/v1/glyphs/by-id/:id
 *
 * Lives under `/by-id/` so the public `/api/v1/glyphs/:character`
 * route can keep ergonomic URLs like /A or /ñ without colliding.
 */

import { z } from "zod";
import { fail, handler, ok } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { deleteGlyph, getGlyphById, updateGlyph } from "@/lib/letterforge/store";

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

const PatchSchema = z.object({
  slug: z.string().min(2).max(120).optional(),
  character: z.string().min(1).max(8).optional(),
  language: z.string().min(2).max(8).optional(),
  world: z.string().min(2).max(40).optional(),
  displayName: z.string().max(200).nullable().optional(),
  audioUrl: z.string().url().nullable().optional(),
  rewardImageUrl: z.string().url().nullable().optional(),
  rewardWord: z.string().max(80).nullable().optional(),
  rewardEmoji: z.string().max(8).nullable().optional(),
  strokes: z.array(StrokeSchema).min(1).max(8).optional(),
  toleranceRadius: z.number().int().min(10).max(120).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  relatedWords: z.array(z.string().min(1).max(60)).max(10).optional(),
  status: z.enum(["DRAFT", "REVIEW", "LIVE", "RETIRED"]).optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).optional(),
});

export const GET = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const glyph = await getGlyphById(id);
  if (!glyph) return fail(404, "Glyph not found.");
  return ok({ glyph });
});

export const PATCH = handler(async (req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const body = PatchSchema.parse(await req.json());
  const glyph = await updateGlyph(id, body);
  if (!glyph) return fail(404, "Glyph not found.");
  return ok({ glyph });
});

export const DELETE = handler(async (_req: Request, ctx: { params: Promise<{ id: string }> }) => {
  const guard = await requireAdmin();
  if (!guard.ok) return fail(guard.status, guard.message);
  const { id } = await ctx.params;
  const removed = await deleteGlyph(id);
  if (!removed) return fail(404, "Glyph not found.");
  return ok({ deleted: true });
});
