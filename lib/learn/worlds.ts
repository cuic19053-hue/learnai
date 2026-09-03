/**
 * URL-slug-aware mapping from "world" query param → journey + canonical
 * home path. Used by the shared nav (Missions / Projects / Library /
 * Achievements / Switch) so every tab knows which stage it's scoped to.
 */

import type { Journey } from "./journeys";
import { JOURNEYS, journeyForStage } from "./journeys";
import type { LearnerStage } from "./stages";

export type WorldSlug = "kids" | "GRADE_7" | "GRADE_8" | "GRADE_9" | "adult" | "senior";

export type World = {
  slug: WorldSlug;
  journey: Journey;
  /** Canonical stage home (Home tab target). */
  homePath: string;
  /** Default teacher + initial for this world's LearnerHomeShell chrome. */
  teacherName: string;
  teacherEmoji: string;
  learnerInitial: string;
  streakDays: number;
  xp: number;
};

export const WORLDS: Record<WorldSlug, World> = {
  kids: {
    slug: "kids",
    journey: journeyForStage("GRADE_6"),
    homePath: "/learn/kids",
    teacherName: "Milo",
    teacherEmoji: "🦉",
    learnerInitial: "L",
    streakDays: 4,
    xp: 120,
  },
  GRADE_7: {
    slug: "GRADE_7",
    journey: journeyForStage("GRADE_7"),
    homePath: "/learn/GRADE_7",
    teacherName: "Luna",
    teacherEmoji: "📚",
    learnerInitial: "A",
    streakDays: 5,
    xp: 620,
  },
  GRADE_8: {
    slug: "GRADE_8",
    journey: journeyForStage("GRADE_8"),
    homePath: "/learn/GRADE_8",
    teacherName: "Nova",
    teacherEmoji: "🦉",
    learnerInitial: "S",
    streakDays: 12,
    xp: 1840,
  },
  GRADE_9: {
    slug: "GRADE_9",
    journey: journeyForStage("GRADE_9"),
    homePath: "/learn/GRADE_9",
    teacherName: "Mentor Max",
    teacherEmoji: "🎓",
    learnerInitial: "J",
    streakDays: 9,
    xp: 2410,
  },
  adult: {
    slug: "adult",
    journey: journeyForStage("PROFESSIONAL"),
    homePath: "/learn/adult",
    teacherName: "Professor Turing",
    teacherEmoji: "💼",
    learnerInitial: "R",
    streakDays: 21,
    xp: 5230,
  },
  senior: {
    slug: "senior",
    journey: journeyForStage("SENIOR"),
    homePath: "/learn/senior",
    teacherName: "Sofia",
    teacherEmoji: "🌿",
    learnerInitial: "H",
    streakDays: 3,
    xp: 80,
  },
};

const VALID_SLUGS = new Set(Object.keys(WORLDS) as WorldSlug[]);

export function worldFromParam(raw: string | undefined): World {
  const candidate = (raw ?? "GRADE_8").toLowerCase();
  if (VALID_SLUGS.has(candidate as WorldSlug)) {
    return WORLDS[candidate as WorldSlug];
  }
  return WORLDS.GRADE_8;
}

export function worldSlugForStage(stage: LearnerStage): WorldSlug {
  switch (stage) {
    case "GRADE_6":
      return "kids";
    case "GRADE_7":
      return "GRADE_7";
    case "GRADE_8":
      return "GRADE_8";
    case "GRADE_9":
      return "GRADE_9";
    case "UNIVERSITY":
    case "PROFESSIONAL":
      return "adult";
    case "SENIOR":
      return "senior";
  }
}

export type NavTab =
  | "home"
  | "missions"
  | "projects"
  | "library"
  | "achievements"
  | "wikitest"
  | "switch";

export type NavItem = {
  icon: string;
  label: string;
  href: string;
  active?: boolean;
  /** Optional pill rendered to the right of the label — e.g. "NEW". */
  badge?: string;
  /** Visually distinct entry — used by WikiTest to stand out as a new section. */
  highlight?: boolean;
  /** Render a divider above this item. */
  divider?: boolean;
};

/** Worlds that have WikiTest enabled (academic/professional audiences). */
const WIKITEST_WORLDS: ReadonlySet<WorldSlug> = new Set(["GRADE_9", "adult"]);

/** Build the standard left-rail nav for a world with one tab marked active. */
export function buildLearnerNav(opts: { world: World; active: NavTab }): NavItem[] {
  const slug = opts.world.slug;
  const showWikiTest = WIKITEST_WORLDS.has(slug);

  const out: NavItem[] = [];
  const push = (it: NavItem & { id: NavTab }) => {
    const { id, ...rest } = it;
    out.push({ ...rest, active: id === opts.active });
  };

  push({ id: "home", icon: "🏠", label: "Home", href: opts.world.homePath });
  push({ id: "missions", icon: "🎯", label: "My missions", href: `/learn/missions?world=${slug}` });
  push({ id: "projects", icon: "🛠️", label: "Projects", href: `/learn/projects?world=${slug}` });
  push({ id: "library", icon: "📚", label: "Library", href: `/learn/library?world=${slug}` });
  push({
    id: "achievements",
    icon: "🏅",
    label: "Achievements",
    href: `/learn/achievements?world=${slug}`,
  });

  if (showWikiTest) {
    push({
      id: "wikitest",
      icon: "🧪",
      label: "WikiTest",
      href: "/learn/wiki",
      badge: "NEW",
      highlight: true,
    });
  }

  push({
    id: "switch",
    icon: "🌍",
    label: "Switch world",
    href: "/learn/switch",
    divider: true,
  });

  return out;
}

/** Convenience for picking 6 worlds in the Switch picker. */
export function allWorlds(): World[] {
  return Object.values(WORLDS);
}

export { JOURNEYS };
