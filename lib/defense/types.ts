/**
 * Shared types for the thesis-defense subsystem.
 *
 * The DB stores three JSON columns (`DefenseSession.sources`,
 * `DefenseSession.committee`, `DefenseRound.feedback`,
 * `DefenseRound.groundingCitations`, `DefenseReadiness.sourceCoverage`,
 * `DefenseReadiness.weakAreas`). These types are the canonical shapes
 * for those columns.
 */

export type DefenseSourceKind = "url" | "upload" | "note";

export type DefenseSource = {
  id: string;
  title: string;
  kind: DefenseSourceKind;
  /**
   * For url: the URL. For upload: an uploadId from the synthetic
   * upload store. For note: the note body (markdown).
   */
  ref: string;
  /** Optional MIME for upload kinds — informational. */
  mime?: string;
  addedAt: string;
};

export type CommitteeRole = "domain_expert" | "methods_chair" | "devils_advocate";

export type CommitteePersona = {
  id: string;
  role: CommitteeRole;
  name: string;
  /** Short focus statement that drives prompt shaping. */
  focus: string;
  /** TTS voice id (when audio output is enabled). */
  voice?: string;
};

export type RubricFeedback = {
  /** 0-5 holistic score for the answer. */
  score: number;
  strengths: string[];
  gaps: string[];
  /** Optional follow-up question the persona would ask next. */
  followUp?: string;
};

export type GroundingCitation = {
  sourceId: string;
  /** Free-form span — the title of the source plus a short snippet. */
  snippet: string;
};

export type SourceCoverage = {
  sourceId: string;
  name: string;
  /** 0..1 — proportion of rounds that cited this source. */
  coverage: number;
};

export type WeakArea = {
  topic: string;
  why: string;
  suggested: string;
};
