"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** One-line reason — cite data when you have it. Keep under 200 chars. */
  reason: string;
  /** Optional bullet detail rendered under the reason. */
  details?: string[];
  /** Optional label for the trigger. Defaults to "Why this?". */
  label?: string;
  className?: string;
};

/**
 * Inline "Why this?" affordance for adaptive recommendations. Closes
 * gap G (transparency) — every adaptive choice the system makes should
 * be defensible in one sentence, citing data when possible.
 *
 * Best practice: keep the reason concrete ("You missed 3 of 5 on
 * quadratic roots last week") rather than vague ("based on your
 * activity"). Reversibility lives in /progress.
 */
export default function WhyThisButton({ reason, details, label = "推荐依据?", className }: Props) {
  const [open, setOpen] = useState(false);
  const popRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Click outside + Escape close — basic popover hygiene.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      const t = e.target as Node | null;
      if (popRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <span className={`relative inline-block ${className ?? ""}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="hover:bg-bg-2 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-ink-mute hover:text-ink"
      >
        <span aria-hidden>ⓘ</span>
        {label}
      </button>

      {open ? (
        <div
          ref={popRef}
          role="dialog"
          aria-label="推荐依据"
          className="absolute right-0 z-20 mt-1 w-[280px] rounded-xl border border-line bg-white p-3 text-left shadow-lg"
        >
          <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            算法推荐依据
          </div>
          <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{reason}</p>
          {details && details.length > 0 ? (
            <ul className="mt-2 space-y-1 text-[12px] text-ink-soft">
              {details.map((d, i) => (
                <li key={i} className="flex gap-1.5">
                  <span aria-hidden className="text-ink-mute">
                    •
                  </span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-2.5 border-t border-line-soft pt-2 text-[11px] text-ink-mute">
            可在“学情诊断与进度”中随时调整推荐策略。
          </div>
        </div>
      ) : null}
    </span>
  );
}
