"use client";

import { useEffect, useState } from "react";
import type {
  CandidateProfile,
  InterviewTurn,
  JobBrief,
  PresentationFeedback,
  ReadinessReport,
} from "@/lib/interview/types";

type TrainingScore = { question: string; score: number };

export default function InterviewFinalReport({
  job,
  profile,
  history,
  trainingAttempts,
  presentationFeedback,
  report,
  onReport,
  onReset,
}: {
  job: JobBrief;
  profile?: Partial<CandidateProfile>;
  history: InterviewTurn[];
  trainingAttempts: TrainingScore[];
  presentationFeedback: PresentationFeedback | null;
  report: ReadinessReport | null;
  onReport: (r: ReadinessReport) => void;
  onReset: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);

  // Auto-run the report once when this step is entered and we don't have one.
  useEffect(() => {
    if (report || loading) return;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generate() {
    setLoading(true);
    setError(null);
    setDegraded(false);
    try {
      const res = await fetch("/api/learn/interview/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          job: {
            companyName: job.companyName,
            roleTitle: job.roleTitle,
            seniority: job.seniority,
            jobDescription: job.jobDescription,
          },
          candidateProfile: profile,
          trainingAttempts,
          presentationScore: presentationFeedback?.score0to10,
          history,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error ?? "Could not synthesise report");
      onReport(json.report as ReadinessReport);
      if (json.degraded) setDegraded(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (loading && !report) {
    return (
      <div className="mt-7 max-w-[820px]">
        <div className="la-card animate-pulse p-6" style={{ borderRadius: 18 }}>
          <div className="h-6 w-1/2 rounded bg-line-soft" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-lg bg-line-soft" />
            ))}
          </div>
          <div className="mt-4 h-32 rounded bg-line-soft" />
        </div>
        <p className="mt-3 text-sm text-ink-mute">
          Synthesising your readiness report…
        </p>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="mt-7 max-w-[640px]">
        <div className="la-card p-5" style={{ borderRadius: 16, borderColor: "#fca5a5" }}>
          <div className="font-bold text-red-700">Could not generate report</div>
          <p className="mt-1 text-sm text-ink-soft">{error}</p>
          <button
            type="button"
            onClick={generate}
            className="la-btn mt-4"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const overall = report.overallReadiness;
  const verdict =
    overall >= 8 ? "Ready" : overall >= 6 ? "Almost ready" : "Keep training";
  const verdictColor =
    overall >= 8 ? "var(--j-little)" : overall >= 6 ? "#b45309" : "#dc2626";

  return (
    <div className="mt-7 max-w-[960px] space-y-4">
      {degraded ? (
        <div className="la-card p-3 text-xs" style={{ borderRadius: 12, background: "#fffbeb" }}>
          <strong>Heads-up:</strong> AI provider was unreachable. This report
          uses deterministic averages — re-run for the full synthesis.
        </div>
      ) : null}

      {/* Overall scorecard */}
      <div className="la-card p-6" style={{ borderRadius: 18 }}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              Readiness for {job.roleTitle} at {job.companyName}
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <div
                className="text-5xl font-extrabold tracking-tighter"
                style={{ color: verdictColor }}
              >
                {overall}/10
              </div>
              <div
                className="la-pill"
                style={{
                  background: "#fff",
                  color: verdictColor,
                  boxShadow: `0 0 0 1px ${verdictColor}40`,
                }}
              >
                {verdict.toUpperCase()}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Sub label="Technical" v={report.technicalReadiness} />
            <Sub label="Leadership" v={report.leadershipReadiness} />
            <Sub label="Communication" v={report.communicationReadiness} />
          </div>
        </div>
        <p className="mt-4 max-w-[640px] text-[14px] leading-relaxed text-ink">
          {report.finalAdvice}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {report.strongAreas.length ? (
          <Block title="Strong areas">
            <List items={report.strongAreas} accent="var(--j-little)" />
          </Block>
        ) : null}
        {report.weakAreas.length ? (
          <Block title="Weak areas">
            <List items={report.weakAreas} accent="#dc2626" />
          </Block>
        ) : null}
        {report.topRisks.length ? (
          <Block title="Top risks">
            <List items={report.topRisks} accent="#b45309" />
          </Block>
        ) : null}
        {report.nextTrainingRecommendations.length ? (
          <Block title="Next training recommendations">
            <List items={report.nextTrainingRecommendations} accent="var(--brand-1)" />
          </Block>
        ) : null}
      </div>

      {report.bestAnswers.length ? (
        <Block title="Best moments from your simulation">
          <ol className="space-y-3">
            {report.bestAnswers.map((b, i) => {
              // Match the best-answer quote back to a turn by question text.
              const matched = history.find(
                (t) => t.question.trim() === b.question.trim(),
              );
              return (
                <li key={i} className="rounded-xl border border-line-soft p-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                    {b.question}
                  </div>
                  <blockquote className="mt-1 border-l-2 border-brand-1 pl-3 text-[14px] italic leading-relaxed text-ink">
                    “{b.quote}”
                  </blockquote>
                  <p className="mt-2 text-[12px] text-ink-soft">{b.reason}</p>
                  {matched?.recording ? (
                    <audio
                      controls
                      preload="none"
                      src={matched.recording.url}
                      className="mt-2 w-full"
                      aria-label="Recording of this answer"
                    />
                  ) : null}
                </li>
              );
            })}
          </ol>
        </Block>
      ) : null}

      {/* All recordings list — only shown when any exist. */}
      {history.some((t) => t.recording) ? (
        <Block title="All your recordings">
          <ol className="space-y-2">
            {history
              .filter((t) => t.recording)
              .map((t) => (
                <li key={t.index} className="rounded-lg border border-line-soft p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-[11px] font-bold text-ink-mute">
                      R{t.round} · Q{t.index + 1} · {t.score0to10}/10
                    </div>
                    <div className="text-[10px] text-ink-mute">
                      {t.recording!.durationSec}s ·{" "}
                      {(t.recording!.sizeBytes / 1024).toFixed(0)} KB
                    </div>
                  </div>
                  <div className="mt-1 line-clamp-1 text-[12px] font-bold text-ink">
                    {t.question}
                  </div>
                  <audio
                    controls
                    preload="none"
                    src={t.recording!.url}
                    className="mt-1.5 w-full"
                  />
                </li>
              ))}
          </ol>
        </Block>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={generate}
          className="la-btn ghost"
          style={{ padding: "10px 16px", fontSize: 13 }}
        >
          Re-generate report
        </button>
        <button
          type="button"
          onClick={onReset}
          className="la-btn ghost"
          style={{ padding: "10px 16px", fontSize: 13 }}
        >
          Start a new preparation
        </button>
      </div>
    </div>
  );
}

function Sub({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
        {label}
      </div>
      <div className="text-xl font-bold text-ink">{v}/10</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="la-card p-4" style={{ borderRadius: 16 }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
        {title}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function List({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="space-y-1.5 text-[13px]">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2 leading-snug">
          <span style={{ color: accent }} aria-hidden>•</span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}
