"use client";

/**
 * Compact XP + level bar for the kids header.
 *
 * Renders:
 *   - Level emoji (current rank avatar)
 *   - Mini progress bar with a smooth fill animation
 *   - Tiny "L# · ⭐ N" caption · streak flame if active
 *
 * Tapping the bar opens the My Learning Path page — the in-app
 * progression / "skills unlocked" surface. The bar is otherwise
 * passive: a continuous sense of "I'm building something" + a
 * deliberate doorway into the long-term arc.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useXp } from "./XpProvider";

export default function XpBar() {
  const { state, level } = useXp();
  const sp = useSearchParams();
  const langQuery = sp?.get("lang") ? `?lang=${sp.get("lang")}` : "";
  const pct = Math.round(level.progress * 100);
  return (
    <Link
      href={`/learn/kids/progress${langQuery}`}
      aria-label={`Open My Learning Path. Level ${level.index + 1}, ${state.xp} XP`}
      style={{
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px 4px 4px",
          borderRadius: 99,
          background: "#fff",
          boxShadow: "0 4px 12px rgba(0,0,0,.08)",
          fontFamily: "inherit",
        }}
        aria-label={`Level ${level.index + 1} ${level.level.name}, ${state.xp} XP`}
      >
        <span
          aria-hidden
          style={{
            width: 28,
            height: 28,
            borderRadius: 99,
            display: "grid",
            placeItems: "center",
            background: "linear-gradient(135deg,#fde68a,#f59e0b)",
            fontSize: 16,
          }}
        >
          {level.level.emoji}
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 80 }}>
          <div
            style={{
              width: 96,
              height: 6,
              borderRadius: 99,
              background: "#fce0ec",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: "100%",
                background: "linear-gradient(90deg,#ec4899,#f59e0b)",
                borderRadius: 99,
                transition: "width .5s cubic-bezier(.34,1.56,.64,1)",
              }}
            />
          </div>
          <div
            className="la-mono"
            style={{
              fontSize: 9,
              fontWeight: 800,
              letterSpacing: ".06em",
              color: "#9a3412",
              opacity: 0.75,
              display: "flex",
              gap: 5,
              alignItems: "center",
            }}
          >
            <span>L{level.index + 1}</span>
            <span>·</span>
            <span>⭐ {state.xp}</span>
            {state.streak > 0 ? (
              <span aria-label={`${state.streak} day streak`}>🔥{state.streak}</span>
            ) : null}
          </div>
        </div>
      </div>
    </Link>
  );
}
