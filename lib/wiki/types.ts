/**
 * WikiTest core types — the shape of every WikiTest record, from raw
 * fetched article to graded question, plus the input pickers.
 */

export type WikiLang = string; // "en", "es", "de", … (subdomain prefix)

export type Difficulty = "undergrad" | "intermediate" | "advanced";
export type Format = "mixed" | "multiple_choice" | "short_answer" | "true_false";

/** Parsed + sanitised input picker bundle for /generate. */
export type GenerateParams = {
  url: string;
  difficulty: Difficulty;
  format: Format;
  count: number; // 5 | 10 | 20 | 40
  language?: WikiLang; // override; defaults to article's subdomain
};

/** A single Wikipedia article section after extraction. */
export type ArticleSection = {
  heading: string;
  text: string;
};

/** Result of /api/wiki/parse — the article cleaned for downstream use. */
export type WikiArticle = {
  title: string;
  lang: WikiLang;
  canonicalUrl: string;
  /** Wikipedia's lead extract, 1-3 sentences. */
  summary: string;
  sections: ArticleSection[];
  /** Rough char count of the cleaned text; used by the LLM prompt. */
  charCount: number;
  /** ISO timestamp the article was fetched. */
  fetchedAt: string;
};

/** One generated question. Citation back to a source section is required. */
export type WikiQuestion = {
  id: string;
  kind: Format extends "mixed" ? never : Format; // narrowed below
  prompt: string;
  /** Filled for MCQ / true_false. */
  choices?: string[];
  /** Index into `choices` (MCQ / true_false). */
  correctIndex?: number;
  /** Short canonical answer for short_answer. */
  expectedAnswer?: string;
  explanation: string;
  /** Heading of the article section the answer comes from — citation. */
  sourceSection: string;
};

/** Full generated test — what /api/wiki/generate returns. */
export type WikiTest = {
  id: string; // sha256 of url + lang + difficulty + format + count
  article: {
    title: string;
    lang: WikiLang;
    canonicalUrl: string;
    summary: string;
  };
  difficulty: Difficulty;
  format: Format;
  questions: WikiQuestion[];
  generatedAt: string;
  /** Rough wall-clock estimate, minutes. */
  estDurationMin: number;
};

/** Per-attempt user state. Held client-side; persisted in localStorage. */
export type WikiAttempt = {
  testId: string;
  startedAt: string;
  finishedAt?: string;
  answers: Array<{
    questionId: string;
    /** Letter for MCQ ("A"|"B"|…), free text otherwise. */
    response: string;
    correct: boolean | null;
    flaggedForReview?: boolean;
  }>;
};
