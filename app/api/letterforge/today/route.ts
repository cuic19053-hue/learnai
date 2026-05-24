/**
 * GET /api/letterforge/today?language=en
 *
 * Returns the kids-home payload for the current day:
 *   - the language record (resolves unknown codes to English)
 *   - today's letter / sound / example word
 *   - the 3 default mini-games the kids hub shows
 *
 * Stateless (no learner ID required) so the public kids page can
 * render without auth. When we add per-child progress later, the
 * learner-scoped variant will live at
 * /api/letterforge/children/[childId]/today.
 */

import { handler, ok } from "@/lib/api";
import { findLanguage, KIDS_MINI_GAMES } from "@/lib/letterforge/languages";

export const GET = handler(async (req: Request) => {
  const url = new URL(req.url);
  const lang = findLanguage(url.searchParams.get("language"));
  return ok({
    language: {
      code: lang.code,
      name: lang.name,
      flag: lang.flag,
      direction: lang.direction,
      scriptLabel: lang.scriptLabel,
    },
    today: {
      letter: lang.todayLetter,
      sound: lang.todaySay,
      word: lang.todayWord,
      emoji: lang.todayEmoji,
      games: KIDS_MINI_GAMES.map((g) => ({
        id: g.id,
        title: g.title,
        emoji: g.emoji,
        accent: g.accent,
        accentBg: g.accentBg,
      })),
    },
  });
});
