/**
 * GET /api/letterforge/languages
 *
 * Returns the list of languages the parent can pick on the kids
 * page. Each entry includes the language metadata + the day's seed
 * letter so the picker can render a tiny preview ("A · Ay").
 *
 * No auth — the language catalog is public so the picker can hydrate
 * without exposing learner data.
 */

import { handler, ok } from "@/lib/api";
import { LANGUAGES } from "@/lib/letterforge/languages";

export const GET = handler(async () => {
  return ok({
    languages: LANGUAGES.map((l) => ({
      code: l.code,
      name: l.name,
      flag: l.flag,
      direction: l.direction,
      scriptLabel: l.scriptLabel,
      todayLetter: l.todayLetter,
      todaySay: l.todaySay,
    })),
  });
});
