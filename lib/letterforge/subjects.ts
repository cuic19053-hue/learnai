/**
 * Little Learner subject catalog.
 *
 * Seven subjects, each shaped the same way: today's item (a letter,
 * a number, a color, etc.), an example word + emoji, and a 3-game
 * play sequence. The /learn/kids tree reads this catalog to render
 * the home tile grid, each subject's home page, and the per-subject
 * Play sequence.
 *
 * Game types are deliberately small — the gameplay isn't "win/lose,"
 * it's "do one big tap and Milo praises you." See `play/PlaySequence.tsx`
 * for the renderers.
 */

export type GameType =
  /** Pick the matching tile out of 2–3 options. (Garage Match, Find Lion) */
  | "match"
  /** Items appear, learner taps each one, then picks the right number. (Count apples) */
  | "count"
  /** Trace the shape with a finger. We accept any taps inside the path. */
  | "trace"
  /** Build the shape from blocks — taps fill in cells one by one. */
  | "build"
  /** Tap to hear Milo say the item, then advance. */
  | "listen";

export type SubjectGame = {
  id: string;
  type: GameType;
  /** Tile label shown on the subject home page (with the day's item interpolated). */
  title: string;
  emoji: string;
  /** Prompt rendered inside the play stage. */
  prompt: string;
};

export type Subject = {
  slug: SubjectSlug;
  name: string;
  shortName: string;
  emoji: string;
  /** Pill color. */
  accent: string;
  accentBg: string;
  /** Background gradient for the subject home / play screens. */
  gradient: string;
  /** Today's daily item — letter / number / color name / shape / animal / feeling / story. */
  today: {
    /** Display value (e.g. "A", "2", "Red", "Circle", "Lion", "Happy", "Brave Bunny"). */
    item: string;
    /** Phonetic hint Milo says aloud. */
    say: string;
    /** Example word (already starts with / illustrates the item). */
    word: string;
    /** Emoji to render as the reward image. */
    wordEmoji: string;
    /** One-line description shown under the big item. */
    description: string;
  };
  /** Always three games per day. Sequence is play[0] → play[1] → play[2] → reward. */
  games: [SubjectGame, SubjectGame, SubjectGame];
};

export type SubjectSlug =
  | "letters"
  | "numbers"
  | "colors"
  | "shapes"
  | "animals"
  | "feelings"
  | "stories";

export const SUBJECTS: Record<SubjectSlug, Subject> = {
  letters: {
    slug: "letters",
    name: "Milo Letters",
    shortName: "Letters",
    emoji: "🅰️",
    accent: "#ec4899",
    accentBg: "#fce0ec",
    gradient: "linear-gradient(180deg, #fce0ec 0%, #fff1d6 100%)",
    today: {
      item: "A",
      say: "Ay",
      word: "Apple",
      wordEmoji: "🍎",
      description: "A is for Apple",
    },
    games: [
      {
        id: "garage_match",
        type: "match",
        title: "Park A in the A garage",
        emoji: "🏠",
        prompt: "Where does A go?",
      },
      {
        id: "car_road",
        type: "trace",
        title: "Drive the car on the A road",
        emoji: "🚗",
        prompt: "Drive on the letter A",
      },
      {
        id: "lego_GRADE_8",
        type: "build",
        title: "Build A with blocks",
        emoji: "🧱",
        prompt: "Tap blocks to build the A",
      },
    ],
  },
  numbers: {
    slug: "numbers",
    name: "Milo Numbers",
    shortName: "Numbers",
    emoji: "🔢",
    accent: "#f59e0b",
    accentBg: "#fef3c7",
    gradient: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)",
    today: {
      item: "2",
      say: "Two",
      word: "2 apples",
      wordEmoji: "🍎",
      description: "Today we count to 2",
    },
    games: [
      {
        id: "park_cars",
        type: "match",
        title: "Park 2 cars",
        emoji: "🚗",
        prompt: "Tap the garage with 2 cars",
      },
      {
        id: "count_apples",
        type: "count",
        title: "Count 2 apples",
        emoji: "🍎",
        prompt: "How many apples?",
      },
      {
        id: "build_blocks",
        type: "build",
        title: "Build a tower with 2 blocks",
        emoji: "🧱",
        prompt: "Tap to add blocks until you have 2",
      },
    ],
  },
  colors: {
    slug: "colors",
    name: "Milo Colors",
    shortName: "Colors",
    emoji: "🎨",
    accent: "#dc2626",
    accentBg: "#fee2e2",
    gradient: "linear-gradient(180deg, #fee2e2 0%, #fff1d6 100%)",
    today: {
      item: "Red",
      say: "Red",
      word: "Red car",
      wordEmoji: "🚗",
      description: "Today's colour is Red",
    },
    games: [
      {
        id: "wash_red_car",
        type: "match",
        title: "Wash the red car",
        emoji: "🚗",
        prompt: "Which car is red?",
      },
      {
        id: "pick_red_blocks",
        type: "build",
        title: "Pick the red blocks",
        emoji: "🧱",
        prompt: "Tap the red blocks",
      },
      {
        id: "find_red_apple",
        type: "match",
        title: "Find the red apple",
        emoji: "🍎",
        prompt: "Tap the red apple",
      },
    ],
  },
  shapes: {
    slug: "shapes",
    name: "Milo Shapes",
    shortName: "Shapes",
    emoji: "🔷",
    accent: "#0ea5a4",
    accentBg: "#d6f1f0",
    gradient: "linear-gradient(180deg, #d6f1f0 0%, #fff1d6 100%)",
    today: {
      item: "Circle",
      say: "Circle",
      word: "Circle",
      wordEmoji: "⭕",
      description: "Today's shape is a Circle",
    },
    games: [
      {
        id: "drive_around_circle",
        type: "trace",
        title: "Drive around the circle",
        emoji: "🚗",
        prompt: "Trace the circle with your finger",
      },
      {
        id: "build_circle",
        type: "build",
        title: "Build a circle with blocks",
        emoji: "🧱",
        prompt: "Tap blocks to build a circle",
      },
      {
        id: "park_in_circle",
        type: "match",
        title: "Park in the circle garage",
        emoji: "🏠",
        prompt: "Which garage is a circle?",
      },
    ],
  },
  animals: {
    slug: "animals",
    name: "Milo Animals",
    shortName: "Animals",
    emoji: "🦁",
    accent: "#16a34a",
    accentBg: "#d1fae5",
    gradient: "linear-gradient(180deg, #d1fae5 0%, #fff1d6 100%)",
    today: {
      item: "Lion",
      say: "Lion",
      word: "Lion",
      wordEmoji: "🦁",
      description: "Today we meet the Lion",
    },
    games: [
      {
        id: "hear_lion",
        type: "listen",
        title: "Hear the lion",
        emoji: "🔊",
        prompt: "Tap to hear the lion roar",
      },
      {
        id: "find_lion",
        type: "match",
        title: "Find the lion",
        emoji: "🦁",
        prompt: "Where is the lion?",
      },
      {
        id: "drive_lion_home",
        type: "trace",
        title: "Drive the lion home",
        emoji: "🚗",
        prompt: "Trace the path to the den",
      },
    ],
  },
  feelings: {
    slug: "feelings",
    name: "Milo Feelings",
    shortName: "Feelings",
    emoji: "🐻",
    accent: "#be185d",
    accentBg: "#fdf2f8",
    gradient: "linear-gradient(180deg, #fdf2f8 0%, #fff1d6 100%)",
    today: {
      item: "Happy",
      say: "Happy",
      word: "Happy",
      wordEmoji: "😊",
      description: "Today's feeling is Happy",
    },
    games: [
      {
        id: "find_happy_face",
        type: "match",
        title: "Find the happy face",
        emoji: "😊",
        prompt: "Which face is happy?",
      },
      {
        id: "happy_sticker",
        type: "match",
        title: "Give teddy a happy sticker",
        emoji: "🧸",
        prompt: "Tap the happy sticker for Teddy",
      },
      {
        id: "happy_voice",
        type: "listen",
        title: "Hear a happy voice",
        emoji: "🎵",
        prompt: "Tap to hear a happy voice",
      },
    ],
  },
  stories: {
    slug: "stories",
    name: "Milo Stories",
    shortName: "Stories",
    emoji: "📚",
    accent: "#7c3aed",
    accentBg: "#efe7ff",
    gradient: "linear-gradient(180deg, #efe7ff 0%, #fff1d6 100%)",
    today: {
      item: "Brave Bunny",
      say: "Brave Bunny",
      word: "Brave Bunny",
      wordEmoji: "🐰",
      description: "Tonight's story: The Brave Bunny",
    },
    games: [
      {
        id: "story_start",
        type: "listen",
        title: "Start the story",
        emoji: "🎬",
        prompt: "Tap to start The Brave Bunny",
      },
      {
        id: "story_choice",
        type: "match",
        title: "Help bunny choose",
        emoji: "🐰",
        prompt: "What should the bunny do next?",
      },
      {
        id: "story_end",
        type: "listen",
        title: "Hear the ending",
        emoji: "✨",
        prompt: "Tap to hear how it ends",
      },
    ],
  },
};

export const SUBJECT_LIST: Subject[] = [
  SUBJECTS.letters,
  SUBJECTS.numbers,
  SUBJECTS.colors,
  SUBJECTS.shapes,
  SUBJECTS.animals,
  SUBJECTS.feelings,
  SUBJECTS.stories,
];

export function findSubject(slug: string | undefined | null): Subject | null {
  if (!slug) return null;
  return SUBJECTS[slug as SubjectSlug] ?? null;
}

/**
 * Progression sequences — what comes after the current day's item.
 * Used by the reward screen to suggest the next topic ("Continue:
 * Learn Blue", "Continue: Learn B", "Continue: Learn 3").
 *
 * Item keys here match the catalog's English form. Localized labels
 * are resolved via `subjectLabels` + a small translation step inside
 * `nextTopicLabel`. Returning null means the world is "complete" —
 * the reward screen shows a different copy in that case.
 */
const PROGRESSION: Record<SubjectSlug, string[]> = {
  letters: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M"],
  numbers: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
  colors: ["Red", "Blue", "Yellow", "Green", "Orange", "Purple", "Pink"],
  shapes: ["Circle", "Square", "Triangle", "Star", "Heart"],
  animals: ["Lion", "Elephant", "Cat", "Dog", "Bird", "Bear"],
  feelings: ["Happy", "Sad", "Angry", "Surprised", "Calm", "Excited"],
  stories: ["Brave Bunny", "Curious Fox", "Sleepy Bear"],
};

/** Return the next topic in the sequence after `current`, or null if
 *  there isn't one. Comparison is case-sensitive on the English key. */
export function nextTopicEnglish(slug: SubjectSlug, current: string): string | null {
  const seq = PROGRESSION[slug];
  const i = seq.indexOf(current);
  if (i < 0 || i + 1 >= seq.length) return null;
  return seq[i + 1] ?? null;
}

/** Read-only view of one world's progression: which items the child
 *  has finished, which is up next, which are still locked. Used by
 *  the My Learning Path page. */
export function progressionFor(
  slug: SubjectSlug,
  correctTapsForSubject: number,
  tapsPerTopic = 3
): {
  sequence: string[];
  doneCount: number;
  completed: string[];
  next: string | null;
  locked: string[];
} {
  const sequence = PROGRESSION[slug];
  const doneCount = Math.min(Math.floor(correctTapsForSubject / tapsPerTopic), sequence.length);
  return {
    sequence,
    doneCount,
    completed: sequence.slice(0, doneCount),
    next: sequence[doneCount] ?? null,
    locked: sequence.slice(doneCount + 1),
  };
}

/** Read the full progression catalog (used by the Progress page). */
export function getProgressionCatalog(): Record<SubjectSlug, string[]> {
  return PROGRESSION;
}

/** Today's recommended path — what the Little Learner home suggests as
 *  the "Start today" lesson. Currently fixed; later this can rotate
 *  per-child based on usage. */
export const TODAYS_PATH: SubjectSlug = "letters";
