/**
 * Language-learning core types. Modelled on the CEFR (Common European
 * Framework of Reference for Languages) — a public framework published
 * by the Council of Europe.
 */

export type LanguageCode = "en" | "es" | "de" | "it" | "ru" | "ja" | "zh" | "ar";

export type CefrLevel = "A1" | "A2" | "B1" | "B2";

export type Language = {
  code: LanguageCode;
  /** English name shown in the UI. */
  name: string;
  /** Native-script self-name. */
  nativeName: string;
  /** Flag emoji shown on cards. */
  flag: string;
  /** Reading direction; only Arabic needs rtl in v1. */
  dir: "ltr" | "rtl";
  /** Short marketing one-liner. */
  blurb: string;
  /** Brand accent applied to the language's cards. */
  accent: string;
};

export type CefrDescriptor = {
  level: CefrLevel;
  /** Short label, e.g. "Beginner" / "Elementary". */
  label: string;
  /** Paraphrased CEFR can-do statement, kept in plain English. */
  canDo: string;
  /** Estimated study hours to reach this level. */
  hours: number;
};

/**
 * A unit of teaching content. A LevelModule is a small lesson with a
 * vocab list and a couple of example phrases. The drill page rotates
 * through every module's cards.
 */
export type VocabCard = {
  /** Word or phrase in the target language. */
  term: string;
  /** English meaning. */
  meaning: string;
  /** Optional pronunciation hint (romanisation / IPA). */
  hint?: string;
  /** Optional example sentence — author-original. */
  example?: string;
};

export type LevelModule = {
  id: string;
  title: string;
  topic: string;
  cards: VocabCard[];
};

export type LanguageLevelCurriculum = {
  level: CefrLevel;
  /** Modules unlocked at this level. */
  modules: LevelModule[];
  /** Number of CEFR-style mock items available for this level. */
  mockCount: number;
};
