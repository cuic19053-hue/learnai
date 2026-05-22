import { LOOP } from "@/lib/learn/loop";
import { Check } from "@/components/design/icons";

type LoopProgressStripProps = {
  /** 0-indexed current step (0 = Hook, 5 = Evolve). */
  step: number;
};

/**
 * Top strip of the lesson player — six pills for the Loop steps with
 * three visual states: done (filled accent), active (outlined accent),
 * locked (line). Each pill carries a 2-character mono number.
 */
export default function LoopProgressStrip({ step }: LoopProgressStripProps) {
  return (
    <div
      className="grid grid-cols-2 gap-2 border-b border-line-soft px-4 py-3 sm:grid-cols-3 md:grid-cols-6 md:px-6"
      style={{ background: "linear-gradient(180deg, #fff, #fafbff)" }}
    >
      {LOOP.map((l, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div
            key={l.n}
            className="flex items-center gap-2 px-2.5 py-2"
            style={{
              borderRadius: 10,
              border: `1.5px solid ${
                active ? l.color : done ? `${l.color}55` : "var(--line)"
              }`,
              background: active ? `${l.color}12` : done ? "#fff" : "transparent",
            }}
          >
            <div
              className="grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold"
              style={{
                background: active || done ? l.color : "#fff",
                color: active || done ? "#fff" : "var(--ink-mute)",
                border: !(active || done) ? "1.5px solid var(--line)" : "none",
              }}
              aria-hidden
            >
              {done ? <Check size={11} color="#fff" /> : l.icon}
            </div>
            <div>
              <div className="la-mono text-[9px] font-bold text-ink-mute">
                0{l.n}
              </div>
              <div
                className="text-[12px] font-bold"
                style={{ color: active ? l.color : "var(--ink-soft)" }}
              >
                {l.label}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
