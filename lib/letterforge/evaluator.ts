/**
 * The Gentle Judge — soft scoring for finger tracing.
 *
 * Four checks, never returning below `nice_start`:
 *
 *   1. Did they start near the green star?       (40-px tolerance)
 *   2. Did they move meaningfully?                 (just a tap is `incomplete_tap`)
 *   3. Did they roughly follow the direction?      (dot product on main vectors)
 *   4. Did they try long enough?                   (any interaction > 1 s)
 *
 * The output enum is intentionally limited to three positive values.
 * No `failure`, no `wrong`. This is a backend-level guarantee that
 * client developers and any future ML model must respect.
 *
 * Pure function, no I/O, no Prisma calls — safe to run on edge runtimes
 * and to unit-test without a database. Target: < 1 ms for an average
 * attempt on the normalized grid.
 */

import type { Attempt, AttemptStroke, Evaluation, Glyph, GlyphStroke, Point } from "./types";

const START_RADIUS_DEFAULT = 40;
const MIN_MOVE_PX = 20;
const MIN_INTERACTION_MS = 1_000;

function distance(a: Point, b: Point): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function totalLength(points: Point[]): number {
  let len = 0;
  for (let i = 1; i < points.length; i++) {
    len += distance(points[i - 1]!, points[i]!);
  }
  return len;
}

function mainVector(points: Point[]): Point {
  if (points.length < 2) return { x: 0, y: 0 };
  const first = points[0]!;
  const last = points[points.length - 1]!;
  return { x: last.x - first.x, y: last.y - first.y };
}

function dot(a: Point, b: Point): number {
  return a.x * b.x + a.y * b.y;
}

function startMarker(stroke: GlyphStroke): Point {
  return stroke.start_marker ?? stroke.guide_path[0] ?? { x: 0, y: 0 };
}

function durationMs(strokes: AttemptStroke[]): number {
  let min = Number.POSITIVE_INFINITY;
  let max = 0;
  for (const s of strokes) {
    for (const p of s.points) {
      if (p.timestamp < min) min = p.timestamp;
      if (p.timestamp > max) max = p.timestamp;
    }
  }
  if (!Number.isFinite(min)) return 0;
  return Math.max(0, max - min);
}

/**
 * Evaluate one attempt against the glyph it was tracing.
 *
 * The 4 checks aggregate into an output by this rule:
 *   - All 4 pass   → `great_tracing` · 3 stars
 *   - 2-3 pass + at least started → `nice_start` · 2 stars
 *   - Movement under threshold     → `incomplete_tap` · 1 star + hint
 *
 * Even `incomplete_tap` still hands out one star, because the child
 * tried. The frontend shows a gentle "Start on the star!" hint.
 */
export function evaluateAttempt(glyph: Glyph, attempt: Attempt): Evaluation {
  const radius = glyph.tolerance_radius ?? START_RADIUS_DEFAULT;
  const totalDuration = durationMs(attempt.strokes);
  const triedLongEnough = totalDuration >= MIN_INTERACTION_MS;

  // Aggregate per-stroke checks. Missing strokes don't break things —
  // we evaluate whatever the child actually touched.
  let startedCount = 0;
  let movedCount = 0;
  let directionOkCount = 0;
  const strokeCount = Math.min(attempt.strokes.length, glyph.strokes.length);

  for (let i = 0; i < strokeCount; i++) {
    const userStroke = attempt.strokes[i]!;
    const guide = glyph.strokes[i]!;

    // 1. Started near the marker?
    const first = userStroke.points[0];
    const marker = startMarker(guide);
    if (first && distance(first, marker) <= radius) {
      startedCount += 1;
    }

    // 2. Moved meaningfully?
    const len = totalLength(userStroke.points);
    if (len >= MIN_MOVE_PX) {
      movedCount += 1;
    }

    // 3. Direction ok? (dot product on main vectors).
    if (guide.guide_path.length >= 2 && userStroke.points.length >= 2) {
      const guideStart = guide.guide_path[0]!;
      const guideEnd = guide.guide_path[guide.guide_path.length - 1]!;
      const ideal = { x: guideEnd.x - guideStart.x, y: guideEnd.y - guideStart.y };
      const actual = mainVector(userStroke.points);
      if (dot(ideal, actual) > 0) {
        directionOkCount += 1;
      }
    }
  }

  const startedNearMarker = startedCount >= Math.max(1, Math.ceil(strokeCount / 2));
  const movedEnough = movedCount >= 1;
  const directionOk = directionOkCount >= 1;

  let result: Evaluation["result"];
  let stars: 1 | 2 | 3;
  let feedback: string;
  let animation: Evaluation["milo_animation"];

  if (!movedEnough) {
    result = "incomplete_tap";
    stars = 1;
    feedback = "Almost! Start on the star and slide your finger along the line.";
    animation = "encouraging_smile";
  } else if (startedNearMarker && directionOk && triedLongEnough) {
    result = "great_tracing";
    stars = 3;
    feedback = "Great tracing!";
    animation = "happy_dance";
  } else {
    result = "nice_start";
    stars = 2;
    feedback = startedNearMarker
      ? "Nice try! Try following the line all the way."
      : "Almost! Start on the green star.";
    animation = "gentle_clap";
  }

  return {
    result,
    stars,
    feedback_message: feedback,
    milo_animation: animation,
    detail: {
      started_near_marker: startedNearMarker,
      moved_enough: movedEnough,
      direction_ok: directionOk,
      tried_long_enough: triedLongEnough,
    },
  };
}

/** Hard caps used by the API layer to bound payload size. */
export const ATTEMPT_LIMITS = {
  maxStrokes: 8,
  maxPointsPerStroke: 600,
  maxTotalPoints: 2_500,
};

/** Defensive trim — keeps the attempt payload bounded before evaluation. */
export function trimAttempt(attempt: Attempt): Attempt {
  const strokes: AttemptStroke[] = [];
  let pointBudget = ATTEMPT_LIMITS.maxTotalPoints;
  for (const stroke of attempt.strokes.slice(0, ATTEMPT_LIMITS.maxStrokes)) {
    const take = Math.min(stroke.points.length, ATTEMPT_LIMITS.maxPointsPerStroke, pointBudget);
    if (take <= 0) break;
    strokes.push({
      stroke_order: stroke.stroke_order,
      points: stroke.points.slice(0, take),
    });
    pointBudget -= take;
  }
  return { strokes };
}
