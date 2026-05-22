"use client";

import type { FitAnalysis } from "@/lib/interview/types";

type FocusItem = { area: string; label: string; score: number };

export default function FitAnalysisStep({
  loading,
  analysis,
  focusAreas,
  degraded,
  error,
  onRetry,
}: {
  loading: boolean;
  analysis: FitAnalysis | null;
  focusAreas: FocusItem[];
  degraded?: boolean;
  error?: string | null;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className="mt-7 max-w-[820px]">
        <div className="la-card animate-pulse p-6" style={{ borderRadius: 18 }}>
          <div className="h-5 w-2/3 rounded bg-line-soft" />
          <div className="mt-3 h-4 w-full rounded bg-line-soft" />
          <div className="mt-2 h-4 w-3/4 rounded bg-line-soft" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-lg bg-line-soft" />
            ))}
          </div>
        </div>
        <p className="mt-4 text-sm text-ink-mute">
          Reading the job description and your profile…
        </p>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="mt-7 max-w-[640px]">
        <div className="la-card p-5" style={{ borderRadius: 16, borderColor: "#fca5a5" }}>
          <div className="font-bold text-red-700">Could not analyse fit</div>
          <p className="mt-1 text-sm text-ink-soft">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="la-btn mt-4"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="mt-7 max-w-[920px] space-y-4">
      {degraded ? (
        <div className="la-card p-3 text-xs" style={{ borderRadius: 12, background: "#fffbeb" }}>
          <strong>Heads-up:</strong> the AI provider was unreachable, so this is a
          quick deterministic skeleton. You can continue — or{" "}
          <button onClick={onRetry} className="text-brand-1 underline">
            re-run the analysis
          </button>{" "}
          for richer copy.
        </div>
      ) : null}

      <Block title="Job summary">
        <p className="leading-relaxed text-ink">{analysis.jobSummary || "—"}</p>
      </Block>

      <div className="grid gap-4 md:grid-cols-2">
        <ListBlock title="Key requirements" items={analysis.keyRequirements} />
        <ListBlock title="Likely interview topics" items={analysis.likelyTopics} />
        <ListBlock
          title="Your strengths"
          items={analysis.candidateStrengths}
          empty="Add your CV for stronger insights."
          accent="var(--j-little)"
        />
        <ListBlock
          title="Your gaps"
          items={analysis.candidateGaps}
          empty="Add your CV to surface gaps."
          accent="#dc2626"
        />
        <ListBlock title="Risk areas" items={analysis.riskAreas} accent="#b45309" />
        <ListBlock title="Recommended path" items={analysis.recommendedPath} accent="var(--brand-1)" />
      </div>

      {focusAreas.length ? (
        <Block title="Auto-detected focus areas">
          <div className="flex flex-wrap gap-1.5">
            {focusAreas.map((f) => (
              <span
                key={f.area}
                className="la-pill text-[11px]"
                style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
                title={`weight ${f.score}`}
              >
                {f.label}
              </span>
            ))}
          </div>
        </Block>
      ) : null}
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="la-card p-4" style={{ borderRadius: 16 }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
        {title}
      </div>
      <div className="mt-2 text-sm">{children}</div>
    </div>
  );
}

function ListBlock({
  title,
  items,
  empty = "—",
  accent = "var(--ink)",
}: {
  title: string;
  items: string[];
  empty?: string;
  accent?: string;
}) {
  return (
    <Block title={title}>
      {items.length === 0 ? (
        <p className="text-ink-mute">{empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((it, i) => (
            <li key={i} className="flex gap-2 leading-snug">
              <span style={{ color: accent }} aria-hidden>
                •
              </span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      )}
    </Block>
  );
}
