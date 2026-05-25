"use client";

/**
 * Client-side "Continue with Reflect" button for the Builder portal.
 *
 * Optimistically POSTs to /api/builder/steps/[id]/complete and reloads
 * the page on success so the server-rendered mission state refreshes.
 * Disabled for the seeded mission ids (which carry a "seed-" prefix)
 * because there's no row in the DB to mark complete.
 */

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  stepId: string | null;
  stepLabel: string;
  /** When true (anonymous or seed data), button is a Link to sign-in. */
  isSeed: boolean;
};

export function BuilderContinueButton({ stepId, stepLabel, isSeed }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const onClick = async () => {
    if (!stepId || isSeed) {
      // Seed mode has no DB row to mark complete — drop the learner
      // straight into the Python-calculator practice (matches the
      // mission shown on the portal). Without the ?mission= param the
      // lesson route falls back to the Explorer volcano demo.
      router.push("/learn/lesson/builder?mission=python-calculator");
      return;
    }
    setError(null);
    try {
      const res = await fetch(`/api/builder/steps/${encodeURIComponent(stepId)}/complete`, {
        method: "POST",
      });
      const body = (await res.json()) as { ok: boolean; error?: string };
      if (!body.ok) {
        setError(body.error ?? "Could not complete step");
        return;
      }
      startTransition(() => router.refresh());
    } catch {
      setError("Network error — try again.");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={isPending}
        style={{
          padding: "12px 22px",
          borderRadius: 14,
          border: "none",
          cursor: isPending ? "wait" : "pointer",
          fontFamily: "inherit",
          fontSize: 13.5,
          fontWeight: 800,
          background: "#020617",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(2,6,23,.25)",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Saving…" : `▶ Continue with ${stepLabel}`}
      </button>
      {error ? (
        <span style={{ fontSize: 11, color: "#dc2626", fontWeight: 700 }}>{error}</span>
      ) : null}
    </div>
  );
}
