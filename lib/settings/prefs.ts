/**
 * User settings — TTS engine, voice, and active AI tutor persona.
 *
 * Per-user scoping
 *   When a user id is supplied, settings are stored under a key
 *   suffix derived from that id (`...__user_<id>`). Two users on the
 *   same browser therefore don't inherit each other's settings.
 *   When no id is supplied the legacy global key is used, which keeps
 *   guest sessions working with the same data they had before.
 *
 *   For signed-in users we also mirror the settings to Neon via the
 *   /api/me/preferences endpoint so they survive across devices. The
 *   API write happens in the settings client — this module only
 *   handles the local cache.
 */

import type { TTSEngineId } from "@/lib/tts/types";

export type UserSettings = {
  v: 1;
  /** Active AI tutor persona id (matches a teacher in lib/learn/teachers). */
  teacherId: string;
  /** Active TTS engine — actual playback choice still lives in
   *  the TTS registry's own localStorage key. This duplicate keeps
   *  the settings page honest as the single source of truth. */
  ttsEngine: TTSEngineId;
  /** Friendly nickname for the voice — UI displays the voice's
   *  display name. The actual voiceId stays in the engine's own key. */
  voiceLabel: string | null;
  /** ISO timestamp of the last write. */
  updatedAt: string;
};

export const DEFAULT_SETTINGS: UserSettings = {
  v: 1,
  teacherId: "nova",
  ttsEngine: "web-speech",
  voiceLabel: null,
  updatedAt: new Date(0).toISOString(),
};

const BASE_KEY = "learnai_user_settings_v1";

function storageKey(userId?: string | null): string {
  // Sanitise the id to ASCII safe chars — Prisma cuids only contain
  // [a-z0-9] but we belt-and-braces this in case of future provider
  // ids that contain something exotic.
  if (!userId) return BASE_KEY;
  const safe = userId.replace(/[^a-z0-9_-]/gi, "_").slice(0, 64);
  return `${BASE_KEY}__user_${safe}`;
}

export function loadSettings(userId?: string | null): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as UserSettings;
    if (parsed.v !== 1) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(patch: Partial<UserSettings>, userId?: string | null): UserSettings {
  const next: UserSettings = {
    ...loadSettings(userId),
    ...patch,
    v: 1,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(next));
    } catch {
      // localStorage quota — caller can ignore, in-memory copy still
      // returns the right shape.
    }
  }
  return next;
}
