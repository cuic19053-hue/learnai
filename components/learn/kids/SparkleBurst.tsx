"use client";

/**
 * Tiny celebration burst — six emojis fly outward and fade.
 *
 * Built as a "key-bumped" component: bump the `trigger` prop and a
 * fresh burst plays. We use a CSS keyframe so it works even with
 * `prefers-reduced-motion`-aware overrides (the animation is short
 * and never auto-repeats).
 *
 * Renders nothing until `trigger > 0`, so it stays out of the layout
 * before the first correct tap.
 */

import { useEffect, useState } from "react";

const EMOJIS = ["⭐", "✨", "🌟", "🎉", "💫", "🌈"];

export default function SparkleBurst({
  trigger,
  size = 32,
}: {
  /** Bump this any non-zero value to play. */
  trigger: number;
  /** Base emoji size. Bigger reward screens use ~44. */
  size?: number;
}) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (trigger > 0) {
      setActive(trigger);
      const t = setTimeout(() => setActive(0), 1400);
      return () => clearTimeout(t);
    }
  }, [trigger]);

  if (!active) return null;
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 0,
          height: 0,
          pointerEvents: "none",
          zIndex: 4,
        }}
      >
        {EMOJIS.map((e, i) => {
          const angle = (i / EMOJIS.length) * Math.PI * 2;
          const dist = 110 + (i % 2) * 30;
          const tx = Math.cos(angle) * dist;
          const ty = Math.sin(angle) * dist * 0.7;
          return (
            <span
              key={`${active}-${i}`}
              style={
                {
                  position: "absolute",
                  left: 0,
                  top: 0,
                  fontSize: size,
                  animation: "kSparkle 1.4s ease-out forwards",
                  animationDelay: `${(i % 3) * 0.05}s`,
                  // CSS custom props for the destination offset.
                  ["--tx" as never]: `${tx}px`,
                  ["--ty" as never]: `${ty}px`,
                } as React.CSSProperties
              }
            >
              {e}
            </span>
          );
        })}
      </div>
      <style>{`
        @keyframes kSparkle {
          0%   { transform: translate(0, 0) scale(0.4) rotate(0deg); opacity: 0; }
          15%  { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(1.15) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </>
  );
}
