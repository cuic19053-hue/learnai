/**
 * LetterForge seed — A-Z English + a handful of multi-language samples
 * so the gallery and demo flows work end-to-end immediately after
 * `prisma migrate dev` finishes.
 *
 * Coordinates are on the 540 × 540 grid the evaluator + frontend share.
 * Each capital letter is modelled as 1-3 polyline strokes that an adult
 * reading the JSON can recognise. The numbers don't have to be exact —
 * the soft-scoring engine has a 40-px tolerance.
 */

import type { GlyphStroke } from "./types";

export type GlyphSeed = {
  character: string;
  language: string;
  world?: string;
  display_name?: string;
  reward_word?: string;
  reward_emoji?: string;
  audio_url?: string;
  difficulty?: number;
  related_words?: string[];
  strokes: GlyphStroke[];
};

// English capitals A-Z. Coordinates are simplified polylines; the
// frontend renders them via SVG so anti-aliasing handles the polish.
export const SEED_EN_CAPS: GlyphSeed[] = [
  {
    character: "A",
    language: "en",
    reward_word: "Apple",
    reward_emoji: "🍎",
    related_words: ["apple", "ant", "arrow"],
    strokes: [
      {
        order: 1,
        guide_path: [
          { x: 130, y: 470 },
          { x: 270, y: 80 },
        ],
        start_marker: { x: 130, y: 470 },
      },
      {
        order: 2,
        guide_path: [
          { x: 270, y: 80 },
          { x: 410, y: 470 },
        ],
        start_marker: { x: 270, y: 80 },
      },
      {
        order: 3,
        guide_path: [
          { x: 180, y: 320 },
          { x: 360, y: 320 },
        ],
        start_marker: { x: 180, y: 320 },
      },
    ],
  },
  {
    character: "B",
    language: "en",
    reward_word: "Bee",
    reward_emoji: "🐝",
    related_words: ["bee", "ball", "boat"],
    strokes: [
      {
        order: 1,
        guide_path: [
          { x: 160, y: 80 },
          { x: 160, y: 470 },
        ],
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 2,
        guide_path: [
          { x: 160, y: 80 },
          { x: 360, y: 80 },
          { x: 380, y: 200 },
          { x: 360, y: 270 },
          { x: 160, y: 270 },
        ],
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 3,
        guide_path: [
          { x: 160, y: 270 },
          { x: 380, y: 270 },
          { x: 400, y: 370 },
          { x: 380, y: 470 },
          { x: 160, y: 470 },
        ],
        start_marker: { x: 160, y: 270 },
      },
    ],
  },
  {
    character: "C",
    language: "en",
    reward_word: "Cat",
    reward_emoji: "🐱",
    strokes: stroke3([
      [420, 130],
      [240, 80],
      [120, 200],
      [120, 360],
      [240, 470],
      [420, 430],
    ]),
  },
  {
    character: "D",
    language: "en",
    reward_word: "Dog",
    reward_emoji: "🐶",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [160, 80],
          [160, 470],
        ]),
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [160, 80],
          [320, 80],
          [410, 180],
          [410, 370],
          [320, 470],
          [160, 470],
        ]),
        start_marker: { x: 160, y: 80 },
      },
    ],
  },
  {
    character: "E",
    language: "en",
    reward_word: "Egg",
    reward_emoji: "🥚",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [400, 80],
          [160, 80],
          [160, 470],
          [400, 470],
        ]),
        start_marker: { x: 400, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [160, 275],
          [340, 275],
        ]),
        start_marker: { x: 160, y: 275 },
      },
    ],
  },
  {
    character: "F",
    language: "en",
    reward_word: "Fish",
    reward_emoji: "🐟",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [400, 80],
          [160, 80],
          [160, 470],
        ]),
        start_marker: { x: 400, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [160, 275],
          [340, 275],
        ]),
        start_marker: { x: 160, y: 275 },
      },
    ],
  },
  {
    character: "G",
    language: "en",
    reward_word: "Goat",
    reward_emoji: "🐐",
    strokes: stroke3([
      [420, 130],
      [240, 80],
      [120, 200],
      [120, 360],
      [240, 470],
      [420, 430],
      [420, 280],
      [320, 280],
    ]),
  },
  {
    character: "H",
    language: "en",
    reward_word: "House",
    reward_emoji: "🏠",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [160, 80],
          [160, 470],
        ]),
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [400, 80],
          [400, 470],
        ]),
        start_marker: { x: 400, y: 80 },
      },
      {
        order: 3,
        guide_path: pts([
          [160, 275],
          [400, 275],
        ]),
        start_marker: { x: 160, y: 275 },
      },
    ],
  },
  {
    character: "I",
    language: "en",
    reward_word: "Ice",
    reward_emoji: "🧊",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [280, 80],
          [280, 470],
        ]),
        start_marker: { x: 280, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [180, 80],
          [380, 80],
        ]),
        start_marker: { x: 180, y: 80 },
      },
      {
        order: 3,
        guide_path: pts([
          [180, 470],
          [380, 470],
        ]),
        start_marker: { x: 180, y: 470 },
      },
    ],
  },
  {
    character: "J",
    language: "en",
    reward_word: "Jellyfish",
    reward_emoji: "🪼",
    strokes: stroke3([
      [380, 80],
      [380, 380],
      [320, 450],
      [220, 450],
      [160, 380],
    ]),
  },
  {
    character: "K",
    language: "en",
    reward_word: "Key",
    reward_emoji: "🔑",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [160, 80],
          [160, 470],
        ]),
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [400, 80],
          [160, 280],
        ]),
        start_marker: { x: 400, y: 80 },
      },
      {
        order: 3,
        guide_path: pts([
          [160, 280],
          [400, 470],
        ]),
        start_marker: { x: 160, y: 280 },
      },
    ],
  },
  {
    character: "L",
    language: "en",
    reward_word: "Lion",
    reward_emoji: "🦁",
    strokes: stroke3([
      [160, 80],
      [160, 470],
      [400, 470],
    ]),
  },
  {
    character: "M",
    language: "en",
    reward_word: "Moon",
    reward_emoji: "🌙",
    strokes: stroke3([
      [140, 470],
      [140, 80],
      [280, 320],
      [420, 80],
      [420, 470],
    ]),
  },
  {
    character: "N",
    language: "en",
    reward_word: "Nest",
    reward_emoji: "🪺",
    strokes: stroke3([
      [140, 470],
      [140, 80],
      [420, 470],
      [420, 80],
    ]),
  },
  {
    character: "O",
    language: "en",
    reward_word: "Octopus",
    reward_emoji: "🐙",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [280, 80],
          [120, 200],
          [120, 360],
          [280, 470],
          [440, 360],
          [440, 200],
          [280, 80],
        ]),
        start_marker: { x: 280, y: 80 },
      },
    ],
  },
  {
    character: "P",
    language: "en",
    reward_word: "Penguin",
    reward_emoji: "🐧",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [160, 80],
          [160, 470],
        ]),
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [160, 80],
          [340, 80],
          [400, 180],
          [340, 280],
          [160, 280],
        ]),
        start_marker: { x: 160, y: 80 },
      },
    ],
  },
  {
    character: "Q",
    language: "en",
    reward_word: "Queen",
    reward_emoji: "👑",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [280, 80],
          [120, 200],
          [120, 360],
          [280, 470],
          [440, 360],
          [440, 200],
          [280, 80],
        ]),
        start_marker: { x: 280, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [340, 380],
          [440, 500],
        ]),
        start_marker: { x: 340, y: 380 },
      },
    ],
  },
  {
    character: "R",
    language: "en",
    reward_word: "Rainbow",
    reward_emoji: "🌈",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [160, 80],
          [160, 470],
        ]),
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [160, 80],
          [340, 80],
          [400, 180],
          [340, 280],
          [160, 280],
        ]),
        start_marker: { x: 160, y: 80 },
      },
      {
        order: 3,
        guide_path: pts([
          [260, 280],
          [410, 470],
        ]),
        start_marker: { x: 260, y: 280 },
      },
    ],
  },
  {
    character: "S",
    language: "en",
    reward_word: "Sun",
    reward_emoji: "☀️",
    strokes: stroke3([
      [420, 130],
      [280, 80],
      [140, 160],
      [220, 250],
      [360, 300],
      [440, 380],
      [320, 470],
      [160, 430],
    ]),
  },
  {
    character: "T",
    language: "en",
    reward_word: "Tree",
    reward_emoji: "🌳",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [140, 80],
          [420, 80],
        ]),
        start_marker: { x: 140, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [280, 80],
          [280, 470],
        ]),
        start_marker: { x: 280, y: 80 },
      },
    ],
  },
  {
    character: "U",
    language: "en",
    reward_word: "Umbrella",
    reward_emoji: "☂️",
    strokes: stroke3([
      [140, 80],
      [140, 360],
      [280, 470],
      [420, 360],
      [420, 80],
    ]),
  },
  {
    character: "V",
    language: "en",
    reward_word: "Violin",
    reward_emoji: "🎻",
    strokes: stroke3([
      [120, 80],
      [280, 470],
      [440, 80],
    ]),
  },
  {
    character: "W",
    language: "en",
    reward_word: "Whale",
    reward_emoji: "🐳",
    strokes: stroke3([
      [100, 80],
      [200, 470],
      [280, 220],
      [360, 470],
      [460, 80],
    ]),
  },
  {
    character: "X",
    language: "en",
    reward_word: "X-ray",
    reward_emoji: "❎",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [140, 80],
          [420, 470],
        ]),
        start_marker: { x: 140, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [420, 80],
          [140, 470],
        ]),
        start_marker: { x: 420, y: 80 },
      },
    ],
  },
  {
    character: "Y",
    language: "en",
    reward_word: "Yarn",
    reward_emoji: "🧶",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [140, 80],
          [280, 280],
        ]),
        start_marker: { x: 140, y: 80 },
      },
      {
        order: 2,
        guide_path: pts([
          [420, 80],
          [280, 280],
        ]),
        start_marker: { x: 420, y: 80 },
      },
      {
        order: 3,
        guide_path: pts([
          [280, 280],
          [280, 470],
        ]),
        start_marker: { x: 280, y: 280 },
      },
    ],
  },
  {
    character: "Z",
    language: "en",
    reward_word: "Zebra",
    reward_emoji: "🦓",
    strokes: stroke3([
      [140, 80],
      [420, 80],
      [140, 470],
      [420, 470],
    ]),
  },
];

// A handful of seeds for non-Latin scripts to exercise the multi-lang
// data model. Glyph artists will replace these with real paths later;
// the schema accepts arbitrary unicode characters as-is.
export const SEED_MULTILANG: GlyphSeed[] = [
  {
    character: "Á",
    language: "es",
    reward_word: "Árbol",
    reward_emoji: "🌳",
    strokes: [
      {
        order: 1,
        guide_path: pts([
          [130, 470],
          [270, 80],
        ]),
        start_marker: { x: 130, y: 470 },
      },
      {
        order: 2,
        guide_path: pts([
          [270, 80],
          [410, 470],
        ]),
        start_marker: { x: 270, y: 80 },
      },
      {
        order: 3,
        guide_path: pts([
          [180, 320],
          [360, 320],
        ]),
        start_marker: { x: 180, y: 320 },
      },
      {
        order: 4,
        guide_path: pts([
          [290, 40],
          [250, 70],
        ]),
        start_marker: { x: 290, y: 40 },
      },
    ],
  },
  {
    character: "あ",
    language: "ja",
    reward_word: "あめ",
    reward_emoji: "🍬",
    strokes: stroke3([
      [180, 140],
      [400, 140],
      [280, 240],
      [380, 380],
      [180, 360],
      [120, 200],
    ]),
  },
  {
    character: "أ",
    language: "ar",
    reward_word: "أسد",
    reward_emoji: "🦁",
    strokes: stroke3([
      [260, 100],
      [260, 460],
      [200, 60],
      [260, 100],
    ]),
  },
];

function pts(xs: number[][]): { x: number; y: number }[] {
  return xs.map(([x, y]) => ({ x: x!, y: y! }));
}

function stroke3(xs: number[][]): GlyphStroke[] {
  return [{ order: 1, guide_path: pts(xs), start_marker: { x: xs[0]![0]!, y: xs[0]![1]! } }];
}

export function allSeeds(): GlyphSeed[] {
  return [...SEED_EN_CAPS, ...SEED_MULTILANG];
}
