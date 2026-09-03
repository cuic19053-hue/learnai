/**
 * Single source of truth for learner progress (XP, streak, per-world
 * stats, unlocked achievements).
 *
 * Lifecycle:
 *   - SSR renders with DEFAULT_STATE (zeros).
 *   - On client mount, ProgressProvider hydrates from a cookie.
 *   - Every state change writes back to the cookie and broadcasts to
 *     other open tabs via BroadcastChannel.
 *   - When the user signs in (future), the same shape syncs to the DB.
 */

export const PROGRESS_VERSION = 1;
export const PROGRESS_COOKIE = "learnai_progress_v1";

/** Per-world counters. Keyed by world slug (kids|GRADE_7|...). */
export type WorldProgress = {
  xp: number;
  lessonsCompleted: number;
  /** ISO yyyy-mm-dd of the last time the learner opened this world. */
  lastSeen: string | null;
};

export type ProgressState = {
  v: typeof PROGRESS_VERSION;
  /** Total XP across every world. */
  xp: number;
  streak: {
    /** Consecutive days with at least one activity, including today. */
    current: number;
    /** Highest streak ever reached. */
    longest: number;
    /** ISO yyyy-mm-dd of the most recent active day. */
    lastActive: string | null;
  };
  /** Per-world breakdown. Worlds appear only after the learner visits them. */
  worlds: Record<string, WorldProgress>;
  /** Ids of unlocked achievements. */
  achievements: string[];
  /** ISO timestamp of the last meaningful write — used by sync logic. */
  updatedAt: string;
};

export const DEFAULT_PROGRESS: ProgressState = {
  v: PROGRESS_VERSION,
  xp: 0,
  streak: { current: 0, longest: 0, lastActive: null },
  worlds: {},
  achievements: [],
  updatedAt: new Date(0).toISOString(),
};

/** Tag union of all action types — used by the reducer / Provider. */
export type ProgressAction =
  | { type: "hydrate"; state: ProgressState }
  | { type: "ping"; slug?: string; now?: Date }
  | { type: "addXp"; amount: number; slug?: string }
  | { type: "lessonCompleted"; slug: string }
  | { type: "achievement"; id: string }
  | { type: "reset" };
