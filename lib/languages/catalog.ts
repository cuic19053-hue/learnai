/**
 * Catalog of the seven languages LearnAI currently offers and the CEFR
 * level descriptors. Native names, flag emojis, and reading direction
 * are factual; the level descriptors paraphrase the CEFR can-do
 * statements published by the Council of Europe.
 */

import type { CefrDescriptor, CefrLevel, Language, LanguageCode } from "./types";

export const LANGUAGES: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    dir: "ltr",
    blurb: "The lingua franca of the modern world. Practical, work-ready.",
    accent: "#2e5bff",
  },
  {
    code: "es",
    name: "Spanish",
    nativeName: "Español",
    flag: "🇪🇸",
    dir: "ltr",
    blurb: "Friendly and rhythmic. Spoken across two continents.",
    accent: "#f59e0b",
  },
  {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    dir: "ltr",
    blurb: "Precise and powerful. Strong for engineering and science.",
    accent: "#0ea5a4",
  },
  {
    code: "it",
    name: "Italian",
    nativeName: "Italiano",
    flag: "🇮🇹",
    dir: "ltr",
    blurb: "Warm, melodic, expressive. The language of art, food, and design.",
    accent: "#ea580c",
  },
  {
    code: "ru",
    name: "Russian",
    nativeName: "Русский",
    flag: "🇷🇺",
    dir: "ltr",
    blurb: "Cyrillic, rich literature, six cases, music in every sentence.",
    accent: "#7c3aed",
  },
  {
    code: "ja",
    name: "Japanese",
    nativeName: "日本語",
    flag: "🇯🇵",
    dir: "ltr",
    blurb: "Three scripts, beautifully patterned grammar.",
    accent: "#ec4899",
  },
  {
    code: "zh",
    name: "Chinese (Mandarin)",
    nativeName: "中文",
    flag: "🇨🇳",
    dir: "ltr",
    blurb: "Tonal, character-based, the most-spoken first language on Earth.",
    accent: "#dc2626",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    flag: "🇸🇦",
    dir: "rtl",
    blurb: "Right-to-left, root-based morphology, deep cultural reach.",
    accent: "#22c55e",
  },
];

export const LEVELS: CefrDescriptor[] = [
  {
    level: "A1",
    label: "Beginner",
    canDo:
      "Understand and use familiar everyday expressions. Introduce yourself, ask basic personal questions, interact when the other person speaks slowly.",
    hours: 80,
  },
  {
    level: "A2",
    label: "Elementary",
    canDo:
      "Communicate in simple routine tasks. Describe in basic terms your background, environment, and immediate needs.",
    hours: 180,
  },
  {
    level: "B1",
    label: "Intermediate",
    canDo:
      "Deal with most situations while travelling. Produce simple connected text on familiar topics. Describe experiences, opinions, plans.",
    hours: 350,
  },
  {
    level: "B2",
    label: "Upper-intermediate",
    canDo:
      "Interact fluently and spontaneously. Produce clear, detailed text on a wide range of subjects. Argue a viewpoint and weigh trade-offs.",
    hours: 600,
  },
];

const BY_CODE = new Map(LANGUAGES.map((l) => [l.code, l]));

export function findLanguage(code: string): Language | null {
  return BY_CODE.get(code as LanguageCode) ?? null;
}

export function findLevel(level: string): CefrDescriptor | null {
  return LEVELS.find((d) => d.level === (level as CefrLevel)) ?? null;
}

export const VALID_LEVELS: CefrLevel[] = LEVELS.map((d) => d.level);
