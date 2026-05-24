/**
 * GET /api/v1/glyphs/ping
 *
 * LetterForge health probe. Tells the admin overview how many glyphs
 * are live in each language so the team can see coverage at a glance.
 */

import { handler, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = handler(async () => {
  try {
    const byLang = await prisma.letterforgeGlyph.groupBy({
      by: ["language"],
      where: { status: "LIVE" },
      _count: { _all: true },
      orderBy: { language: "asc" },
    });
    const total = byLang.reduce((acc, b) => acc + b._count._all, 0);
    return ok({
      reachable: true,
      totalLive: total,
      byLanguage: byLang.map((b) => ({ language: b.language, count: b._count._all })),
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("does not exist")) {
      return ok({
        reachable: false,
        totalLive: 0,
        byLanguage: [],
        warning: "letterforge_table_missing",
      });
    }
    throw err;
  }
});
