"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";

type Props = {
  /** 1-based step index. */
  step: number;
  /** Total step count (4 for standard, 2 for senior). */
  total: number;
  /** Comma-separated headline labels for the indicator bar (e.g. "TOPIC,SOURCES,PACE,PLAN"). */
  stepLabels: string[];
  /** Brand-grad slab applied to the top bar + active step pip. */
  accentGradient: string;
  /** Solid colour used for accent borders / fills. */
  accentColor: string;
  /** Soft fill used for tutor panels. */
  accentSoft: string;
  /** World pill background. */
  accentBg: string;
  /** Header kicker, e.g. "NEW PROJECT · SCHOLAR WORLD · WITH MENTOR MAX". */
  kicker: string;
  /** Big modal title. */
  title: string;
  /** Optional subhead under the title. */
  subhead?: string;
  /** Where to close back to. */
  closeHref: string;
  /** Header icon (emoji). */
  icon: string;
  /** Footer content — typically the back / continue actions. */
  footer: ReactNode;
  /** Optional small note in the footer's left side. */
  footerNote?: string;
  /** Step body. */
  children: ReactNode;
};

/**
 * Modal-style wizard shell. Same chrome across worlds — only the
 * accent gradient + step count change. ESC closes back to the
 * projects hub, mirroring the design's "nothing is locked in" promise.
 */
export default function WizardShell({
  step,
  total,
  stepLabels,
  accentGradient,
  accentColor,
  accentSoft,
  accentBg,
  kicker,
  title,
  subhead,
  closeHref,
  icon,
  footer,
  footerNote,
  children,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") router.push(closeHref);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [router, closeHref]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="wt-wiz-title"
      className="fixed inset-0 z-50 grid place-items-start overflow-y-auto bg-[rgba(15,20,48,0.45)] px-3 py-6 sm:py-10"
    >
      <div
        className="mx-auto w-full max-w-[960px] overflow-hidden rounded-3xl bg-white shadow-2xl"
      >
        <div style={{ height: 6, background: accentGradient }} aria-hidden />

        {/* Header */}
        <div className="flex items-center gap-4 border-b border-line-soft px-6 py-4 sm:px-7">
          <div
            className="grid h-11 w-11 flex-none place-items-center rounded-xl text-xl"
            style={{ background: accentBg, color: accentColor }}
            aria-hidden
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div
              className="la-mono text-[11px] font-bold uppercase tracking-[0.08em] text-ink-mute"
              style={{ letterSpacing: "0.08em" }}
            >
              {kicker}
            </div>
            <h2
              id="wt-wiz-title"
              className="mt-0.5 text-[20px] font-extrabold tracking-[-0.01em] text-ink sm:text-[22px]"
            >
              {title}
            </h2>
            {subhead ? (
              <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{subhead}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => router.push(closeHref)}
            className="grid h-9 w-9 flex-none place-items-center rounded-lg text-ink-mute hover:bg-bg-2"
            aria-label="Close wizard"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        {total > 1 ? (
          <>
            <div className="flex items-center gap-2 px-6 pt-3 sm:px-7">
              {Array.from({ length: total }, (_, i) => i + 1).map((s) => {
                const done = s < step;
                const current = s === step;
                return (
                  <span key={s} className="contents">
                    <span
                      className="grid place-items-center rounded-full text-[11px] font-extrabold la-mono"
                      style={{
                        width: 26,
                        height: 26,
                        background: done ? accentColor : current ? "#fff" : "var(--bg-2)",
                        border: current ? `2px solid ${accentColor}` : "none",
                        color: done ? "#fff" : current ? accentColor : "var(--ink-mute)",
                      }}
                      aria-current={current ? "step" : undefined}
                    >
                      {done ? "✓" : s}
                    </span>
                    {s < total ? (
                      <span
                        className="h-[2px] flex-1"
                        style={{ background: done ? accentColor : "var(--bg-2)" }}
                        aria-hidden
                      />
                    ) : null}
                  </span>
                );
              })}
            </div>
            <div className="flex justify-between px-6 pb-3 pt-1.5 sm:px-7">
              {stepLabels.map((l, i) => (
                <span
                  key={l}
                  className="la-mono text-[10px] sm:text-[11px]"
                  style={{
                    color: i + 1 <= step ? "var(--ink)" : "var(--ink-mute)",
                    fontWeight: i + 1 === step ? 800 : 600,
                  }}
                >
                  {i + 1} · {l}
                </span>
              ))}
            </div>
          </>
        ) : null}

        {/* Body */}
        <div className="px-6 pb-5 pt-1 sm:px-7" style={{ minHeight: 360 }}>
          {children}
        </div>

        {/* Footer */}
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-6 py-3.5 sm:px-7"
          style={{ background: "var(--surface-soft)" }}
        >
          <div className="text-[12px] text-ink-mute">{footerNote ?? ""}</div>
          <div className="flex gap-2">{footer}</div>
        </div>
      </div>

      {/* Sub-grid accent that subtly bleeds into the side — purely cosmetic */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${accentSoft}cc 0%, transparent 60%)`,
        }}
      />
    </div>
  );
}
