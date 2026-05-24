/**
 * LetterForge shared types.
 *
 * Coordinates are normalized to a 540 × 540 grid. The frontend scales
 * the canvas to fit the screen; the backend works on this fixed grid
 * so soft-scoring tolerances stay screen-independent.
 *
 * Philosophy: every type here supports the "every attempt is positive"
 * rule. There is no `failure` status in any output enum — the worst
 * the engine can return is `nice_start` with one star and a hint.
 */

/** Single point on a stroke path. */
export type Point = { x: number; y: number };

/**
 * One stroke of a glyph (e.g., the left diagonal of "A"). The
 * `guide_path` is a polyline; `start_marker` is what the green star
 * lives on; `direction_arrow_points` give the UI an arrow to draw.
 */
export type GlyphStroke = {
  order: number;
  guide_path: Point[];
  start_marker?: Point;
  direction_arrow_points?: { from: Point; to: Point };
};

/** Full glyph definition matching the DB JSON column. */
export type Glyph = {
  glyph_id: string;
  slug: string;
  character: string;
  language: string;
  world: string;
  display_name?: string | null;
  audio_url?: string | null;
  reward_image_url?: string | null;
  reward_word?: string | null;
  reward_emoji?: string | null;
  strokes: GlyphStroke[];
  tolerance_radius: number;
  difficulty: number;
  related_words: string[];
};

/** One captured point from the child's finger. */
export type AttemptPoint = Point & { timestamp: number };

export type AttemptStroke = {
  stroke_order: number;
  points: AttemptPoint[];
};

export type Attempt = {
  strokes: AttemptStroke[];
};

/** Engine output — strictly positive enum, never "failure". */
export type EvalResult = "great_tracing" | "nice_start" | "incomplete_tap";

export type Evaluation = {
  result: EvalResult;
  stars: 1 | 2 | 3;
  feedback_message: string;
  milo_animation: "happy_dance" | "gentle_clap" | "encouraging_smile";
  /** Optional per-check breakdown — never shown to the child. Parents/admins only. */
  detail?: {
    started_near_marker: boolean;
    moved_enough: boolean;
    direction_ok: boolean;
    tried_long_enough: boolean;
  };
};

/** What the child-facing /lesson/next endpoint returns. */
export type NextLessonResponse = {
  glyph: Glyph;
  /** True if the learner already earned the sticker for this glyph
   *  (so the UI can highlight it without exposing scores). */
  already_known: boolean;
};
