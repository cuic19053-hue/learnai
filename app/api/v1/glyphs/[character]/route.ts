/**
 * GET /api/v1/glyphs/:character?lang=en&world=little_learner
 *
 * Public child-facing endpoint that returns the glyph (with guide
 * paths) for one letter in one language. Mobile/tablet clients call
 * this once per lesson; the response carries everything needed to
 * render the tracing canvas (guide_path, start_marker, audio_url,
 * reward image).
 */

import { fail, handler, ok } from "@/lib/api";
import { getGlyphByCharacter } from "@/lib/letterforge/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(
  async (req: Request, ctx: { params: Promise<{ character: string }> }) => {
    const { character } = await ctx.params;
    const url = new URL(req.url);
    const language = url.searchParams.get("lang") ?? "en";
    const world = url.searchParams.get("world") ?? "little_learner";
    const decoded = decodeURIComponent(character);
    if (!decoded || decoded.length > 12) {
      return fail(400, "Invalid character.");
    }
    const glyph = await getGlyphByCharacter({ character: decoded, language, world });
    if (!glyph) return fail(404, `No glyph for "${decoded}" in language="${language}".`);
    return ok({ glyph });
  }
);
