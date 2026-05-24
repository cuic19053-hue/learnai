/**
 * Little Learner XP, levels, and achievements.
 *
 * Game-design choices borrowed from research on early-childhood
 * motivation (Deci & Ryan; B.F. Skinner variable reinforcement;
 * Dweck growth mindset):
 *
 *   - Every correct tap gives a small fixed reward (chime + 5 XP)
 *     so the loop is predictable.
 *   - Surprise bonuses (15 XP "bingo!" on every 7th correct) trigger
 *     a variable-reinforcement burst — the strongest motivator for
 *     continued play.
 *   - Levels are short (50 / 150 / 350 / 700 / 1200 XP cap) so the
 *     bar visibly moves after each session.
 *   - Achievements use named milestones, not raw scores. A child who
 *     learned 10 letters earns "Letter Friend", not "10/100". This
 *     keeps the framing growth-based.
 *
 * Persistence: localStorage. The state is per-device, not per-account
 * — the kids surface stays usable signed-out. A future learner-ID
 * version of the same shape can live alongside.
 */

export type LevelDef = {
  /** Display name spoken / shown when the child levels up. */
  name: string;
  /** Tiny tagline shown under the name on the reward screen. */
  tagline: string;
  /** Emoji shown on the bar. */
  emoji: string;
  /** Cumulative XP needed to enter this level. */
  xpFloor: number;
};

export const LEVELS: LevelDef[] = [
  { name: "New Cub", tagline: "Just getting started", emoji: "🐯", xpFloor: 0 },
  { name: "Curious Cub", tagline: "Already exploring", emoji: "🦊", xpFloor: 50 },
  { name: "Learning Hero", tagline: "Quick learner", emoji: "🦁", xpFloor: 150 },
  { name: "Star Player", tagline: "Shining bright", emoji: "⭐", xpFloor: 350 },
  { name: "Milo Champion", tagline: "The best of friends", emoji: "🏆", xpFloor: 700 },
  { name: "Legend", tagline: "Milo is so proud", emoji: "👑", xpFloor: 1200 },
];

/** Compute the current level + progress fraction (0..1) toward the next. */
export function levelFor(xp: number): {
  index: number;
  level: LevelDef;
  nextFloor: number | null;
  progress: number;
} {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i]!.xpFloor) idx = i;
    else break;
  }
  const current = LEVELS[idx]!;
  const next = LEVELS[idx + 1];
  if (!next) return { index: idx, level: current, nextFloor: null, progress: 1 };
  const span = next.xpFloor - current.xpFloor;
  const progress = Math.max(0, Math.min(1, (xp - current.xpFloor) / span));
  return { index: idx, level: current, nextFloor: next.xpFloor, progress };
}

// ── XP awards ────────────────────────────────────────────────────

/** XP for one correct exercise tap. Small + frequent. */
export const XP_PER_CORRECT = 5;
/** Surprise variable-reinforcement bonus every 7th correct (Skinner box). */
export const XP_BINGO = 15;
export const BINGO_EVERY = 7;
/** XP for finishing the whole 6-exercise session (the reward screen). */
export const XP_SESSION_COMPLETE = 25;

// ── Achievements ─────────────────────────────────────────────────

export type Achievement = {
  id: string;
  name: string;
  /** Short praise line spoken aloud when it unlocks. */
  blurb: string;
  emoji: string;
  /** Predicate over the running state. Returning true unlocks. */
  test: (state: XpState) => boolean;
};

/** A snapshot of XP + counters the achievements can read. */
export type XpState = {
  xp: number;
  correctTotal: number;
  sessionsCompleted: number;
  /** Per-subject correct counts. */
  bySubject: Record<string, number>;
  /** Daily streak (consecutive UTC days with at least 1 session). */
  streak: number;
  /** Already-unlocked badge ids. */
  unlocked: string[];
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_tap",
    name: "First Tap",
    blurb: "You started learning with Milo!",
    emoji: "🌱",
    test: (s) => s.correctTotal >= 1,
  },
  {
    id: "ten_taps",
    name: "Tap Tap Tap",
    blurb: "Ten things learned already!",
    emoji: "👏",
    test: (s) => s.correctTotal >= 10,
  },
  {
    id: "twenty_five",
    name: "Quarter Master",
    blurb: "Twenty-five right answers!",
    emoji: "🎯",
    test: (s) => s.correctTotal >= 25,
  },
  {
    id: "fifty",
    name: "Half-Century",
    blurb: "Fifty correct — wow!",
    emoji: "✨",
    test: (s) => s.correctTotal >= 50,
  },
  {
    id: "session_one",
    name: "First Lesson",
    blurb: "You finished a whole lesson!",
    emoji: "📚",
    test: (s) => s.sessionsCompleted >= 1,
  },
  {
    id: "session_five",
    name: "Lesson Lover",
    blurb: "Five whole lessons done!",
    emoji: "❤️",
    test: (s) => s.sessionsCompleted >= 5,
  },
  {
    id: "streak_3",
    name: "3-Day Streak",
    blurb: "Three days with Milo!",
    emoji: "🔥",
    test: (s) => s.streak >= 3,
  },
  {
    id: "streak_7",
    name: "Week with Milo",
    blurb: "A whole week of learning!",
    emoji: "🗓️",
    test: (s) => s.streak >= 7,
  },
  {
    id: "letter_friend",
    name: "Letter Friend",
    blurb: "Ten letters learned!",
    emoji: "🅰️",
    test: (s) => (s.bySubject.letters ?? 0) >= 10,
  },
  {
    id: "counting_hero",
    name: "Counting Hero",
    blurb: "Ten counting puzzles done!",
    emoji: "🔢",
    test: (s) => (s.bySubject.numbers ?? 0) >= 10,
  },
  {
    id: "all_worlds",
    name: "World Traveler",
    blurb: "You tried every world!",
    emoji: "🌍",
    test: (s) =>
      ["letters", "numbers", "colors", "shapes", "animals", "feelings"].every(
        (k) => (s.bySubject[k] ?? 0) >= 1
      ),
  },
  {
    id: "bingo_pro",
    name: "Bingo!",
    blurb: "Surprise bonus champion!",
    emoji: "🎉",
    test: (s) => s.correctTotal >= 7 && Math.floor(s.correctTotal / BINGO_EVERY) >= 5,
  },
];

/** Returns the newly unlocked achievements given a state, in catalog order. */
export function checkNewUnlocks(state: XpState): Achievement[] {
  return ACHIEVEMENTS.filter((a) => !state.unlocked.includes(a.id) && a.test(state));
}

// ── localStorage helpers ─────────────────────────────────────────

const STORAGE_KEY = "miloXp.v1";

export type PersistedState = XpState & {
  /** UTC YYYY-MM-DD of the most recent session. */
  lastSessionDay: string | null;
};

export function emptyState(): PersistedState {
  return {
    xp: 0,
    correctTotal: 0,
    sessionsCompleted: 0,
    bySubject: {},
    streak: 0,
    unlocked: [],
    lastSessionDay: null,
  };
}

export function loadState(): PersistedState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return { ...emptyState(), ...parsed };
  } catch {
    return emptyState();
  }
}

export function saveState(state: PersistedState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota / privacy mode — silent */
  }
}

/** Roll the streak forward when the child plays today. */
export function rollStreak(state: PersistedState, today = utcDayKey()): PersistedState {
  if (state.lastSessionDay === today) return state;
  if (!state.lastSessionDay) return { ...state, streak: 1, lastSessionDay: today };
  // Was yesterday? Increment. Else reset.
  const yesterday = utcDayKey(new Date(Date.now() - 86_400_000));
  const nextStreak = state.lastSessionDay === yesterday ? state.streak + 1 : 1;
  return { ...state, streak: nextStreak, lastSessionDay: today };
}

export function utcDayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}
