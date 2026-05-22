import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { fail, handler, ok } from "@/lib/api";
import {
  getUserPreferences,
  isMissingPreferencesTable,
  upsertUserPreferences,
} from "@/lib/me/preferences-store";

export const dynamic = "force-dynamic";

/**
 * GET /api/me/preferences
 *
 * Returns the caller's stored tutor + voice + extra settings. Empty
 * object when none have been set yet — the client falls back to
 * localStorage in that case so existing guest sessions don't lose
 * their picks the first time they sign in.
 */
export const GET = handler(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to load your preferences.");

  try {
    const prefs = (await getUserPreferences(session.user.id)) ?? {
      teacherId: null,
      ttsEngine: null,
      voiceLabel: null,
      extra: {},
      updatedAt: new Date(0).toISOString(),
    };
    return ok({ preferences: prefs });
  } catch (err) {
    if (isMissingPreferencesTable(err)) {
      return fail(503, "Preference storage isn't ready — try again in a minute.");
    }
    throw err;
  }
});

const PutSchema = z.object({
  teacherId: z.string().max(40).nullable().optional(),
  ttsEngine: z.enum(["web-speech", "piper"]).nullable().optional(),
  voiceLabel: z.string().max(120).nullable().optional(),
  // `extra` is a free-form merge target — restrict keys to a sensible
  // length so a buggy client can't write a 100-key blob by accident.
  extra: z.record(z.string().max(40), z.unknown()).optional(),
});

/**
 * PUT /api/me/preferences
 *
 * Merge-update: only the fields you send are touched. The server
 * preserves everything else, including unknown keys inside `extra`,
 * so a client running an older schema doesn't accidentally wipe new
 * keys it doesn't know about yet.
 */
export const PUT = handler(async (req: Request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return fail(401, "Sign in to save your preferences.");

  const body = PutSchema.parse(await req.json());

  try {
    const prefs = await upsertUserPreferences(session.user.id, body);
    return ok({ preferences: prefs });
  } catch (err) {
    if (isMissingPreferencesTable(err)) {
      return fail(503, "Preference storage isn't ready — try again in a minute.");
    }
    throw err;
  }
});
