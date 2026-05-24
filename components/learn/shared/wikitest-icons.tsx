/**
 * WikiTest icon set — the same 22 inline SVG icons the design handoff
 * declares as `I.*` in `wikitest-shared.jsx`. Each one accepts an
 * optional `color` and `size`. Kept in one file because the design
 * uses them everywhere and importing two dozen separate files would
 * pollute every screen.
 *
 * Mirror the design exactly: stroke widths, viewBox, path data.
 */

import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { color?: string; size?: number };

const base = (size = 16, color = "currentColor", strokeWidth = 2): SVGProps<SVGSVGElement> => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: color,
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

export const Icon = {
  arrow: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color, 2.4)} {...rest}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  ),
  back: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color, 2.4)} {...rest}>
      <path d="M19 12H5" />
      <path d="M11 18l-6-6 6-6" />
    </svg>
  ),
  link: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1" />
      <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1" />
    </svg>
  ),
  search: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  ),
  spark: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </svg>
  ),
  brain: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 18, color, 1.8)} {...rest}>
      <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-3 3 3 3 0 0 0 1.5 2.6A3 3 0 0 0 6 17a3 3 0 0 0 3 3h0V4z" />
      <path d="M15 4a3 3 0 0 1 3 3v0a3 3 0 0 1 3 3 3 3 0 0 1-1.5 2.6A3 3 0 0 1 18 17a3 3 0 0 1-3 3h0V4z" />
    </svg>
  ),
  book: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" />
      <path d="M8 7h8M8 11h8M8 15h5" />
    </svg>
  ),
  flag: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color)} {...rest}>
      <path d="M4 22V4h13l-2 5 2 5H4" />
    </svg>
  ),
  clock: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  check: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color, 3)} {...rest}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  ),
  x: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color, 2.6)} {...rest}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  ),
  bolt: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color)} {...rest}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </svg>
  ),
  bookmark: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color)} {...rest}>
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  ),
  layers: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <path d="M12 2L2 7l10 5 10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  ),
  home: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <path d="M3 12L12 4l9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  ),
  target: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.5" fill={color || "currentColor"} />
    </svg>
  ),
  hammer: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <path d="M14 3l7 7-3 3-7-7z" />
      <path d="M9 9L3 15l3 3 6-6" />
    </svg>
  ),
  globe: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  ),
  medal: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 16, color)} {...rest}>
      <circle cx="12" cy="15" r="6" />
      <path d="M8 9L6 3h12l-2 6" />
    </svg>
  ),
  flame: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color)} {...rest}>
      <path d="M12 22c4 0 7-3 7-7 0-2-1-4-3-5 0 2-1 3-2 3 1-3-1-6-4-8 0 4-5 5-5 10 0 4 3 7 7 7z" />
    </svg>
  ),
  zap: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color)} {...rest}>
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </svg>
  ),
  wand: ({ color, size, ...rest }: IconProps = {}) => (
    <svg {...base(size ?? 14, color)} {...rest}>
      <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8l1.4 1.4M17.8 6.2l1.4-1.4M3 21l9-9M12.2 6.2L10.8 4.8" />
    </svg>
  ),
};
