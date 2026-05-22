/**
 * Types for the certifications quiz wizard. Mirrors the JSON shape of the
 * upstream question bank — `string` options matching the `correct` answer
 * verbatim. See certifications/NOTICE.md for the source and licence.
 */

export type RawQuestion = {
  question: string;
  options: string[];
  correct: string; // "" when multi-select (answer lives inside explanation)
  explanation: string;
  references?: string;
};

export type CertificationVendor = "AWS" | "Azure" | "GCP" | "IBM" | "Other";

export type CertificationLevel = "Fundamentals" | "Associate" | "Professional" | "Specialty";

/**
 * Shape of an optional `<slug>.meta.json` sidecar next to the question
 * JSON file. Every field is optional — anything missing is inferred
 * from the filename.
 */
export type CertificationMetaSidecar = {
  code?: string;
  title?: string;
  vendor?: CertificationVendor;
  blurb?: string;
  level?: CertificationLevel;
};

export type CertificationMeta = {
  /** Filename slug (no extension), used as the route param. */
  slug: string;
  /** Official certification code shown to learners. */
  code: string;
  /** Human-friendly cert title. */
  title: string;
  vendor: CertificationVendor;
  /** One-line description. */
  blurb: string;
  /** Difficulty tier shown on the hub. */
  level: CertificationLevel;
};

export type QuestionTurn = {
  index: number;
  /** "A" | "B" | "C" | "D" — letter the learner picked. Empty until answered. */
  picked: string;
  correctLetter: string;
  /** Whether the user marked it as known after seeing the answer. */
  selfRated?: "known" | "review";
};
