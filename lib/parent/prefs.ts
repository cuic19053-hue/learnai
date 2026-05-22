/**
 * Parent preferences store — localStorage-backed, multi-child aware.
 *
 * Mirrors the YouTube Kids parent surface: age band drives a default
 * safety level, a list of children stays under one account, and a
 * compact ParentPrefs object holds the per-child overrides plus the
 * global account-wide settings.
 */

export type AgeBand = "preschool" | "younger" | "older";

export const AGE_BAND_META: Record<
  AgeBand,
  { label: string; ages: string; default: true | undefined; blurb: string }
> = {
  preschool: {
    label: "Preschool",
    ages: "Ages 3–5",
    default: undefined,
    blurb: "Numbers, letters, colors. Big tappable cards, voice-first.",
  },
  younger: {
    label: "Younger",
    ages: "Ages 6–8",
    default: undefined,
    blurb: "Reading, math basics, simple science. More variety per session.",
  },
  older: {
    label: "Older",
    ages: "Ages 9–12",
    default: undefined,
    blurb: "Multi-step problems, longer stories, light projects.",
  },
};

export type SubjectId =
  | "numbers"
  | "letters"
  | "colors"
  | "feelings"
  | "animals"
  | "shapes"
  | "stories"
  | "music";

export const SUBJECTS: Array<{ id: SubjectId; label: string; icon: string }> = [
  { id: "numbers", label: "Numbers", icon: "🔢" },
  { id: "letters", label: "Letters", icon: "🅰️" },
  { id: "colors", label: "Colors", icon: "🎨" },
  { id: "feelings", label: "Feelings", icon: "🐻" },
  { id: "animals", label: "Animals", icon: "🦁" },
  { id: "shapes", label: "Shapes", icon: "🔷" },
  { id: "stories", label: "Stories", icon: "📖" },
  { id: "music", label: "Music & rhymes", icon: "🎵" },
];

export type ChildProfile = {
  id: string;
  /** First name only — keep PII minimal. */
  name: string;
  /** Avatar emoji. */
  avatar: string;
  ageBand: AgeBand;
  /** Per-child theme overrides (subset of SUBJECTS that are allowed). */
  allowedSubjects: SubjectId[];
  /** Per-session length cap, in minutes. */
  sessionMinutes: number;
  /** Daily total cap, in minutes. Soft limit — surfaces a "time's up" card. */
  dailyMinutes: number;
};

export type ParentPrefs = {
  v: 1;
  /** Currently selected child (drives the kids page). */
  activeChildId: string;
  children: ChildProfile[];
  /** YouTube-Kids-style "Approved content only" lockdown. */
  approvedOnly: boolean;
  /** Voice & accessibility defaults applied to all children. */
  voice: {
    readAloud: boolean;
    /** 0.7 → slow, 1 → normal, 1.3 → fast. */
    speed: 0.7 | 1 | 1.3;
    biggerText: boolean;
  };
  /** Quiet-hours window — sessions blocked during this range (24h). */
  quietHours: { from: string; to: string; enabled: boolean };
  /** End-of-session notifications. */
  notifications: { afterSession: boolean; weeklySummary: boolean };
  /** PIN gate for the settings tab. Stored hashed; null means no PIN. */
  pinHash: string | null;
  /** UTC ISO of the most recent save. */
  updatedAt: string;
};

export const DEFAULT_CHILD: ChildProfile = {
  id: "default",
  name: "Lina",
  avatar: "🦁",
  ageBand: "preschool",
  allowedSubjects: ["numbers", "letters", "colors", "animals", "stories"],
  sessionMinutes: 10,
  dailyMinutes: 30,
};

export const DEFAULT_PREFS: ParentPrefs = {
  v: 1,
  activeChildId: "default",
  children: [DEFAULT_CHILD],
  approvedOnly: true,
  voice: { readAloud: true, speed: 1, biggerText: false },
  quietHours: { from: "20:00", to: "07:00", enabled: true },
  notifications: { afterSession: true, weeklySummary: true },
  pinHash: null,
  updatedAt: new Date(0).toISOString(),
};

const KEY = "learnai_parent_prefs_v1";

export function loadPrefs(): ParentPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as ParentPrefs;
    if (parsed.v !== 1) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...parsed, voice: { ...DEFAULT_PREFS.voice, ...parsed.voice }, quietHours: { ...DEFAULT_PREFS.quietHours, ...parsed.quietHours }, notifications: { ...DEFAULT_PREFS.notifications, ...parsed.notifications } };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: ParentPrefs): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ ...prefs, updatedAt: new Date().toISOString() }),
    );
  } catch {
    // localStorage full / private mode — silently drop. The UI shows
    // an inline notice on the Settings panel when this happens.
  }
}

export function activeChild(prefs: ParentPrefs): ChildProfile {
  return (
    prefs.children.find((c) => c.id === prefs.activeChildId) ??
    prefs.children[0] ??
    DEFAULT_CHILD
  );
}

export function newChildId(): string {
  return `c_${Math.random().toString(36).slice(2, 10)}`;
}
