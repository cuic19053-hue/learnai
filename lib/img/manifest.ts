/**
 * Image asset manifest — a single source of truth for every visual the
 * product ships. Used by:
 *   • /licenses (auto-generated attribution page)
 *   • scripts/verify-licenses.mjs (pre-commit guard)
 *
 * Every shipped illustration / photo / icon-set MUST appear here. CC0
 * means we authored it ourselves. External assets must carry the exact
 * URL and license slug so attribution is verifiable.
 */

export type LicenseSlug =
  | "CC0"
  | "CC-BY-4.0"
  | "MIT"
  | "Apache-2.0"
  | "Unsplash"
  | "Pexels"
  | "Pixabay";

export type ImageAsset = {
  /** Stable id used by the Illustration adapter component. */
  id: string;
  /** Path under public/ when bundled, or external URL otherwise. */
  src?: string;
  /** Human description for the licenses page. */
  description: string;
  license: LicenseSlug;
  /** Original source URL (for external assets). */
  source?: string;
  /** Author name (or "LearnAI team" for in-house work). */
  author: string;
};

export const IMAGE_MANIFEST: ImageAsset[] = [
  {
    id: "worlds/playful",
    description: "Worlds card — Playful World, sun + stars + soft hill",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "worlds/mission",
    description: "Worlds card — Mission World, rocket arcing across geometric peaks",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "worlds/career",
    description: "Worlds card — Career World, rising chart over a city skyline",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "worlds/calm",
    description: "Worlds card — Calm World, gentle waves and a leaf at sunrise",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "lessons/volcano-cross-section",
    description: "Hero card preview — labelled volcano cross-section",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "lessons/apples",
    description: "Hero card preview — three apples on a wooden table",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "lessons/python-snippet",
    description: "Hero card preview — stylised Python code snippet",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "lessons/trig-angle",
    description: "Hero card preview — 30-60-90 right triangle",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "lessons/scam-email",
    description: "Hero card preview — suspicious email mock-up",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "empty",
    description: "Generic friendly placeholder (fallback for unknown asset ids)",
    license: "CC0",
    author: "LearnAI team",
  },
  {
    id: "logo",
    src: "/logo.svg",
    description: "LearnAI brand mark — gradient L with circuit nodes",
    license: "Apache-2.0",
    author: "LearnAI team",
  },
  {
    id: "fonts/plus-jakarta-sans",
    description: "Plus Jakarta Sans typeface — primary UI font",
    license: "MIT",
    source: "https://github.com/tokotype/PlusJakartaSans",
    author: "Tokotype",
  },
  {
    id: "fonts/geist-mono",
    description: "Geist Mono typeface — numerics and step labels",
    license: "MIT",
    source: "https://vercel.com/font",
    author: "Vercel",
  },
];

/** Look up a single asset by id. Returns null when unknown. */
export function findAsset(id: string): ImageAsset | null {
  return IMAGE_MANIFEST.find((a) => a.id === id) ?? null;
}

/** Group manifest entries by license slug for the /licenses page. */
export function groupByLicense(): Array<{ license: LicenseSlug; assets: ImageAsset[] }> {
  const map = new Map<LicenseSlug, ImageAsset[]>();
  for (const a of IMAGE_MANIFEST) {
    const arr = map.get(a.license) ?? [];
    arr.push(a);
    map.set(a.license, arr);
  }
  return Array.from(map.entries())
    .map(([license, assets]) => ({ license, assets }))
    .sort((a, b) => a.license.localeCompare(b.license));
}
