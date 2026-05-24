/**
 * Types for the certifications subsystem.
 *
 * Two coordinate systems live here:
 *
 *   1. Legacy file-pack shape (`RawQuestion`, `CertificationVendor` /
 *      `CertificationLevel` as literal unions). This is what
 *      `certifications/questions/*.json` files use and what the
 *      legacy loader returns. Still authoritative for guest-mode
 *      operation when DB is unavailable.
 *
 *   2. DB shape (`QuestionOption`, `OfficialRef`, etc.). Used by every
 *      new DB-backed route and helper. Prisma generates the actual
 *      row types; this file holds the JSON column shapes plus shared
 *      helpers like the legacy-to-Prisma vendor map.
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

// ─── DB shape (mirrors the Prisma JSON column contents) ─────────────

/** One option presented to the learner. Stored in the JSON `options` column. */
export type QuestionOption = {
  key: string; // "A" | "B" | "C" | "D" | ...
  text: string;
};

/**
 * Vendor-owned reference attached to a generated question.
 * Stored as an entry in the JSON `officialRefs` column.
 */
export type OfficialRef = {
  title: string;
  url: string;
  sourceId?: string;
};

/** Per-domain accuracy summary stored in CertificationProgress JSON columns. */
export type DomainAccuracy = {
  domainId: string;
  name: string;
  accuracy: number; // 0-100
};

/**
 * Map the legacy literal-union vendor to the Prisma enum string. Used by
 * the JSON-pack ingester and by the read-path adapter that surfaces DB
 * rows back into the legacy-shaped CertificationMeta.
 */
export const LEGACY_TO_PRISMA_VENDOR: Record<
  CertificationVendor,
  "AWS" | "AZURE" | "GCP" | "IBM" | "OTHER"
> = {
  AWS: "AWS",
  Azure: "AZURE",
  GCP: "GCP",
  IBM: "IBM",
  Other: "OTHER",
};

export const PRISMA_TO_LEGACY_VENDOR: Record<
  "AWS" | "AZURE" | "GCP" | "IBM" | "OTHER",
  CertificationVendor
> = {
  AWS: "AWS",
  AZURE: "Azure",
  GCP: "GCP",
  IBM: "IBM",
  OTHER: "Other",
};

/** Map the legacy level union to the closest Prisma enum value. */
export const LEGACY_TO_PRISMA_LEVEL: Record<
  CertificationLevel,
  "FUNDAMENTALS" | "ASSOCIATE" | "PROFESSIONAL" | "SPECIALTY"
> = {
  Fundamentals: "FUNDAMENTALS",
  Associate: "ASSOCIATE",
  Professional: "PROFESSIONAL",
  Specialty: "SPECIALTY",
};

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
