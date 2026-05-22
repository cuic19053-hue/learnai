import PersonaAvatar from "@/components/design/PersonaAvatar";
import { LOOP } from "@/lib/learn/loop";
import { JOURNEYS, type Journey } from "@/lib/learn/journeys";

export type Kpi = {
  label: string;
  value: string;
  /** Delta string e.g. "+18%" or "−42s". */
  delta: string;
  /** CSS variable or hex used to colour the delta. */
  deltaColor: string;
};

export function KpiCard({ kpi }: { kpi: Kpi }) {
  return (
    <div className="la-card p-4" style={{ borderRadius: 16 }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
        {kpi.label}
      </div>
      <div className="mt-1 text-[26px] font-extrabold tracking-[-0.02em] text-ink">{kpi.value}</div>
      <div className="mt-0.5 text-[11px] font-bold" style={{ color: kpi.deltaColor }}>
        {kpi.delta}
      </div>
    </div>
  );
}

/**
 * Six-bar Loop drop-off chart in the journey colors. Each bar is a vertical
 * fill bottom-up, with the percentage rendered on top. The numbers come in
 * pre-computed via props so the dashboard can swap data sources later.
 */
export function LoopDropoffChart({
  percents = [98, 94, 78, 72, 58, 51],
  caption = "where learners stop",
}: {
  percents?: number[];
  caption?: string;
}) {
  return (
    <div className="la-card p-[18px]" style={{ borderRadius: 18 }}>
      <div className="flex items-center justify-between">
        <div className="text-[13px] font-bold text-ink">Loop drop-off (last 7 days)</div>
        <div className="text-[11px] text-ink-mute">{caption}</div>
      </div>

      <div className="mt-3.5 grid grid-cols-6 gap-2">
        {LOOP.map((l, i) => {
          const pct = Math.max(0, Math.min(100, percents[i] ?? 0));
          return (
            <div key={l.n}>
              <div
                className="relative overflow-hidden"
                style={{ height: 100, borderRadius: 10, background: "var(--bg-2)" }}
                role="img"
                aria-label={`${l.label}: ${pct}%`}
              >
                <div
                  className="absolute bottom-0 left-0 right-0"
                  style={{
                    height: `${pct}%`,
                    background: l.color,
                    opacity: 0.85,
                  }}
                />
                <div
                  className="absolute left-0 right-0 text-center text-[11px] font-extrabold text-white"
                  style={{ top: 6, textShadow: "0 1px 2px rgba(0,0,0,.2)" }}
                >
                  {pct}%
                </div>
              </div>
              <div className="mt-1.5 text-center text-[11px] font-bold text-ink">
                {l.icon} {l.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type Learner = {
  name: string;
  age: number;
  /** Journey id (matches lib/learn/journeys.ts). */
  journeyId: string;
  /** Subtitle, e.g. "Python calculator · 4/6". */
  status: string;
};

export function RecentLearners({ learners }: { learners: Learner[] }) {
  return (
    <div className="la-card p-[18px]" style={{ borderRadius: 18 }}>
      <div className="mb-2.5 text-[13px] font-bold text-ink">Recent learners</div>
      {learners.map((l, idx) => {
        const journey: Journey = JOURNEYS.find((j) => j.id === l.journeyId) ?? JOURNEYS[0];
        return (
          <button
            type="button"
            key={`${l.name}-${idx}`}
            className="flex w-full items-center gap-2.5 border-t border-line-soft py-2.5 text-left"
          >
            <PersonaAvatar emoji={journey.emoji} color={journey.color} bg={journey.bg} size={32} />
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-bold text-ink">
                {l.name} · {l.age}
              </div>
              <div className="truncate text-[11px] text-ink-mute">{l.status}</div>
            </div>
            <span aria-hidden className="text-sm text-ink-mute">
              →
            </span>
          </button>
        );
      })}
    </div>
  );
}
