/**
 * URL-slug-aware mapping from "world" query param → journey + canonical
 * home path. Used by the shared nav (Missions / Projects / Library /
 * Achievements / Switch) so every tab knows which stage it's scoped to.
 */

import type { Journey } from "./journeys";
import { JOURNEYS, journeyForStage } from "./journeys";
import type { LearnerStage } from "./stages";

export type WorldSlug =
  | "kids"
  | "explorer"
  | "builder"
  | "scholar"
  | "adult"
  | "senior";

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
    journey: journeyForStage("LITTLE_LEARNER"),
    homePath: "/learn/kids",
    teacherName: "Milo",
    teacherEmoji: "🦉",
    learnerInitial: "L",
    streakDays: 4,
    xp: 120,
  },
  explorer: {
    slug: "explorer",
    journey: journeyForStage("EXPLORER"),
    homePath: "/learn/explorer",
    teacherName: "Luna",
    teacherEmoji: "📚",
    learnerInitial: "A",
    streakDays: 5,
    xp: 620,
  },
  builder: {
    slug: "builder",
    journey: journeyForStage("BUILDER"),
    homePath: "/learn/builder",
    teacherName: "Nova",
    teacherEmoji: "🦉",
    learnerInitial: "S",
    streakDays: 12,
    xp: 1840,
  },
  scholar: {
    slug: "scholar",
    journey: journeyForStage("SCHOLAR"),
    homePath: "/learn/scholar",
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
  const candidate = (raw ?? "builder").toLowerCase();
  if (VALID_SLUGS.has(candidate as WorldSlug)) {
    return WORLDS[candidate as WorldSlug];
  }
  return WORLDS.builder;
}

export function worldSlugForStage(stage: LearnerStage): WorldSlug {
  switch (stage) {
    case "LITTLE_LEARNER":
      return "kids";
    case "EXPLORER":
      return "explorer";
    case "BUILDER":
      return "builder";
    case "SCHOLAR":
      return "scholar";
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
const WIKITEST_WORLDS: ReadonlySet<WorldSlug> = new Set(["scholar", "adult"]);

/** Build the standard left-rail nav for a world with one tab marked active. */
export function buildLearnerNav(opts: {
  world: World;
  active: NavTab;
}): NavItem[] {
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
  push({ id: "achievements", icon: "🏅", label: "Achievements", href: `/learn/achievements?world=${slug}` });

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
