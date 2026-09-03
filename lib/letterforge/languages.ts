/**
 * Supported Milo Letters languages.
 *
 * Each entry carries everything the child-facing /learn/kids page
 * needs to render a language pill, a "today's letter" hero, and a
 * sample word, without hitting the database.
 *
 * The full glyph data still comes from the LetterForgeGlyph table
 * (POST /api/v1/glyphs/[character]?lang=...). This file is the small
 * client-friendly catalog: "what languages can the parent pick, and
 * what's the first letter of each?"
 */

export type LangDirection = "ltr" | "rtl";

export type Language = {
  /** BCP-47-ish code. Matches the `language` column on glyphs. */
  code: string;
  /** Human-friendly name in the language's own script. */
  name: string;
  /** Flag emoji for the picker pill. */
  flag: string;
  direction: LangDirection;
  /** What we'd call the script set the child will learn.
   *  Chinese is "first characters", not an alphabet. */
  scriptLabel: "alphabet" | "first_characters";
  /** Today's letter (or first character). The DB has the glyph path. */
  todayLetter: string;
  /** Phonetic hint Milo says — "Ay" for English A, "Ah" for Spanish A. */
  todaySay: string;
  /** Example word starting with todayLetter. */
  todayWord: string;
  /** Emoji for the reward image. */
  todayEmoji: string;
};

export const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    flag: "🇬🇧",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "A",
    todaySay: "Ay",
    todayWord: "Apple",
    todayEmoji: "🍎",
  },
  {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "A",
    todaySay: "Ah",
    todayWord: "Árbol",
    todayEmoji: "🌳",
  },
  {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "A",
    todaySay: "Ah",
    todayWord: "Avion",
    todayEmoji: "✈️",
  },
  {
    code: "it",
    name: "Italiano",
    flag: "🇮🇹",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "A",
    todaySay: "Ah",
    todayWord: "Albero",
    todayEmoji: "🌳",
  },
  {
    code: "de",
    name: "Deutsch",
    flag: "🇩🇪",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "A",
    todaySay: "Ah",
    todayWord: "Apfel",
    todayEmoji: "🍎",
  },
  {
    code: "pt",
    name: "Português",
    flag: "🇵🇹",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "A",
    todaySay: "Ah",
    todayWord: "Avião",
    todayEmoji: "✈️",
  },
  {
    code: "ar",
    name: "العربية",
    flag: "🇸🇦",
    direction: "rtl",
    scriptLabel: "alphabet",
    todayLetter: "أ",
    todaySay: "Ah",
    todayWord: "أسد",
    todayEmoji: "🦁",
  },
  {
    code: "ru",
    name: "Русский",
    flag: "🇷🇺",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "А",
    todaySay: "Ah",
    todayWord: "Арбуз",
    todayEmoji: "🍉",
  },
  {
    code: "hi",
    name: "हिन्दी",
    flag: "🇮🇳",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "अ",
    todaySay: "Ah",
    todayWord: "अनार",
    todayEmoji: "🥭",
  },
  {
    code: "ja",
    name: "日本語",
    flag: "🇯🇵",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "あ",
    todaySay: "Ah",
    todayWord: "あめ",
    todayEmoji: "🍬",
  },
  {
    code: "ko",
    name: "한국어",
    flag: "🇰🇷",
    direction: "ltr",
    scriptLabel: "alphabet",
    todayLetter: "ㄱ",
    todaySay: "G",
    todayWord: "곰",
    todayEmoji: "🐻",
  },
  {
    code: "zh",
    name: "中文",
    flag: "🇨🇳",
    direction: "ltr",
    scriptLabel: "first_characters",
    todayLetter: "人",
    todaySay: "Rén",
    todayWord: "人 (person)",
    todayEmoji: "🧑",
  },
];

export function findLanguage(code: string | undefined | null): Language {
  if (!code) return LANGUAGES[0]!;
  const lower = code.toLowerCase();
  return LANGUAGES.find((l) => l.code === lower) ?? LANGUAGES[0]!;
}

/** The 3 mini-games we show by default on the kids home. Same set
 *  across languages; later the catalog can become language-aware. */
export const KIDS_MINI_GAMES = [
  {
    id: "car_letter_road",
    title: "Drive on the letter",
    emoji: "🚗",
    accent: "#ec4899",
    accentBg: "#fce0ec",
  },
  {
    id: "lego_letter_GRADE_8",
    title: "Build with blocks",
    emoji: "🧱",
    accent: "#f59e0b",
    accentBg: "#fef3c7",
  },
  {
    id: "garage_match",
    title: "Park in the garage",
    emoji: "🏠",
    accent: "#22c55e",
    accentBg: "#d1fae5",
  },
] as const;

export type KidsMiniGameId = (typeof KIDS_MINI_GAMES)[number]["id"];
