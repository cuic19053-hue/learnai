/**
 * Pure reducer for learner progress. No browser APIs, no React — every
 * function returns a fresh ProgressState given an input state and an
 * action. Easy to unit-test and easy to mirror on the server.
 */

import {
  DEFAULT_PROGRESS,
  PROGRESS_VERSION,
  type ProgressAction,
  type ProgressState,
  type WorldProgress,
} from "./types";

/** "yyyy-mm-dd" in the runtime's local timezone. */
export function toIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dayDiff(aIso: string, bIso: string): number {
  const a = Date.parse(aIso + "T00:00:00Z");
  const b = Date.parse(bIso + "T00:00:00Z");
  return Math.round((b - a) / 86_400_000);
}

function withWorld(
  state: ProgressState,
  slug: string,
  mutator: (w: WorldProgress) => WorldProgress,
): ProgressState {
  const existing: WorldProgress = state.worlds[slug] ?? {
    xp: 0,
    lessonsCompleted: 0,
    lastSeen: null,
  };
  return {
    ...state,
    worlds: { ...state.worlds, [slug]: mutator(existing) },
  };
}

function withStreak(state: ProgressState, now: Date): ProgressState {
  const today = toIsoDay(now);
  const last = state.streak.lastActive;
  if (last === today) return state; // already counted today

  let current = 1;
  if (last) {
    const diff = dayDiff(last, today);
    if (diff === 1) current = state.streak.current + 1;
    else if (diff <= 0) current = state.streak.current; // clock skew — defensive
    else current = 1; // missed at least one day → reset to 1
  }
  return {
    ...state,
    streak: {
      current,
      longest: Math.max(state.streak.longest, current),
      lastActive: today,
    },
  };
}

function stamp(state: ProgressState): ProgressState {
  return { ...state, updatedAt: new Date().toISOString() };
}

/**
 * Validates and migrates an unknown blob into a ProgressState. Returns
 * DEFAULT_PROGRESS if the input is unusable.
 */
export function safeParseProgress(raw: unknown): ProgressState {
  if (!raw || typeof raw !== "object") return DEFAULT_PROGRESS;
  const r = raw as Partial<ProgressState>;
  if (r.v !== PROGRESS_VERSION) return DEFAULT_PROGRESS;
  return {
    v: PROGRESS_VERSION,
    xp: typeof r.xp === "number" ? r.xp : 0,
    streak: {
      current: r.streak?.current ?? 0,
      longest: r.streak?.longest ?? 0,
      lastActive: r.streak?.lastActive ?? null,
    },
    worlds: r.worlds && typeof r.worlds === "object" ? r.worlds : {},
    achievements: Array.isArray(r.achievements) ? r.achievements : [],
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : new Date(0).toISOString(),
  };
}

export function progressReducer(
  state: ProgressState,
  action: ProgressAction,
): ProgressState {
  switch (action.type) {
    case "hydrate":
      return action.state;

    case "ping": {
      const now = action.now ?? new Date();
      let next = withStreak(state, now);
      if (action.slug) {
        next = withWorld(next, action.slug, (w) => ({ ...w, lastSeen: toIsoDay(now) }));
      }
      return stamp(next);
    }

    case "addXp": {
      const amount = Math.max(0, Math.floor(action.amount));
      if (amount === 0) return state;
      let next = withStreak(state, new Date());
      next = { ...next, xp: next.xp + amount };
      if (action.slug) {
        next = withWorld(next, action.slug, (w) => ({
          ...w,
          xp: w.xp + amount,
          lastSeen: toIsoDay(new Date()),
        }));
      }
      return stamp(next);
    }

    case "lessonCompleted": {
      let next = withStreak(state, new Date());
      next = withWorld(next, action.slug, (w) => ({
        ...w,
        lessonsCompleted: w.lessonsCompleted + 1,
        lastSeen: toIsoDay(new Date()),
      }));
      return stamp(next);
    }

    case "achievement": {
      if (state.achievements.includes(action.id)) return state;
      return stamp({
        ...state,
        achievements: [...state.achievements, action.id],
      });
    }

    case "reset":
      return stamp(DEFAULT_PROGRESS);
  }
}

/**
 * Convenience selector — returns world progress with safe defaults when
 * the slug has never been touched.
 */
export function selectWorld(state: ProgressState, slug: string): WorldProgress {
  return (
    state.worlds[slug] ?? { xp: 0, lessonsCompleted: 0, lastSeen: null }
  );
}
