/**
 * One adapter, three rules:
 *
 *   1. Known asset id → render the matching SVG component (instant, vector,
 *      zero network).
 *   2. Unknown asset id → fall back to the existing striped ImgSlot placeholder
 *      so pages never break visually.
 *   3. Manifest is the single source of truth — to add a new illustration
 *      register it in lib/img/manifest.ts AND add a renderer case here.
 *
 * No external CDN. No <img>. No raster fallbacks unless a real raster is
 * added to the manifest later.
 */

import type { ComponentType } from "react";
import ImgSlot from "@/components/design/ImgSlot";
import {
  CalmWorld,
  CareerWorld,
  MissionWorld,
  PlayfulWorld,
} from "@/components/illustrations/Worlds";
import {
  Apples,
  EmptyState,
  PythonSnippet,
  ScamEmail,
  TrigAngle,
  VolcanoCrossSection,
} from "@/components/illustrations/Lessons";

type IllustrationProps = {
  id: string;
  className?: string;
  /** Visible label used for the ImgSlot fallback and as the SVG title. */
  label?: string;
  /** Height for the fallback only — SVGs scale to the parent. */
  fallbackHeight?: number;
};

const RENDERERS: Record<string, ComponentType<{ className?: string; title?: string }>> = {
  "worlds/playful": PlayfulWorld,
  "worlds/mission": MissionWorld,
  "worlds/career": CareerWorld,
  "worlds/calm": CalmWorld,
  "lessons/volcano-cross-section": VolcanoCrossSection,
  "lessons/apples": Apples,
  "lessons/python-snippet": PythonSnippet,
  "lessons/trig-angle": TrigAngle,
  "lessons/scam-email": ScamEmail,
  empty: EmptyState,
};

export default function Illustration({
  id,
  className = "",
  label,
  fallbackHeight = 140,
}: IllustrationProps) {
  const Renderer = RENDERERS[id];
  if (Renderer) {
    return <Renderer className={className} title={label} />;
  }
  return <ImgSlot label={label ?? id} height={fallbackHeight} />;
}
