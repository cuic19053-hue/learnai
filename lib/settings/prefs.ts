/**
 * User settings — TTS engine, voice, and active AI tutor persona.
 *
 * Lives in localStorage. Per-learner customisation that doesn't need
 * a database: even a guest can pick a different teacher persona or
 * swap the voice and have it persist across reloads.
 *
 * The kids player + tutor rail read these on render. When the user
 * changes a value the relevant component re-reads on the next mount
 * (cheap; this isn't an app-wide reactive store).
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

const KEY = "learnai_user_settings_v1";

export function loadSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as UserSettings;
    if (parsed.v !== 1) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(patch: Partial<UserSettings>): UserSettings {
  const next: UserSettings = {
    ...loadSettings(),
    ...patch,
    v: 1,
    updatedAt: new Date().toISOString(),
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // localStorage quota — caller can ignore, in-memory copy still
      // returns the right shape.
    }
  }
  return next;
}
