"use client";

/**
 * Milo mascot renderer.
 *
 * Resolves the right artwork from /images/kids with a polite fallback
 * chain so the console stays quiet while individual variant files are
 * still missing:
 *
 *   1. Try the requested variant (e.g. /images/kids/milo-cheer.png).
 *   2. On load error, fall back to /images/kids/milo.png.
 *   3. On a second load error, fall back to the 🐯 emoji at the same
 *      box size so layout never shifts.
 *
 * A module-level miss-cache remembers which paths 404'd this session,
 * so re-renders skip straight past them — no repeat network noise.
 *
 * Variants currently expected (see public/images/kids/README.md):
 *   - "default" → /images/kids/milo.png
 *   - "cheer"   → /images/kids/milo-cheer.png  (reward screen)
 *   - "wave"    → /images/kids/milo-wave.png   (onboarding)
 */

import { useEffect, useMemo, useState } from "react";

export type MiloVariant = "default" | "cheer" | "wave";

function srcFor(v: MiloVariant): string {
  switch (v) {
    case "cheer":
      return "/images/kids/milo-cheer.png";
    case "wave":
      return "/images/kids/milo-wave.png";
    default:
      return "/images/kids/milo.png";
  }
}

/** Remembers paths that 404'd so we skip re-fetching them. Scope is
 *  the browser tab — refreshes do retry, in case the asset landed. */
const MISSING = new Set<string>();

export default function Milo({
  size = 96,
  variant = "default",
  className,
  style,
}: {
  size?: number;
  variant?: MiloVariant;
  className?: string;
  style?: React.CSSProperties;
}) {
  // Resolve to the first non-missing path in the chain
  //   variant → default → null (emoji)
  const initial = useMemo<string | null>(() => {
    const want = srcFor(variant);
    if (!MISSING.has(want)) return want;
    const def = srcFor("default");
    if (!MISSING.has(def)) return def;
    return null;
  }, [variant]);

  const [src, setSrc] = useState<string | null>(initial);

  // If the variant prop changes, retry the chain.
  useEffect(() => {
    setSrc(initial);
  }, [initial]);

  if (!src) {
    return (
      <span
        aria-hidden
        className={className}
        style={{
          display: "inline-grid",
          placeItems: "center",
          width: size,
          height: size,
          fontSize: Math.round(size * 0.85),
          lineHeight: 1,
          ...style,
        }}
      >
        🐯
      </span>
    );
  }

  return (
    <img
      src={src}
      alt="Milo"
      width={size}
      height={size}
      onError={() => {
        MISSING.add(src);
        const def = srcFor("default");
        // If the failed src wasn't already the default, try it next;
        // otherwise drop to the emoji.
        if (src !== def && !MISSING.has(def)) setSrc(def);
        else setSrc(null);
      }}
      draggable={false}
      className={className}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        userSelect: "none",
        ...style,
      }}
    />
  );
}
