"use client";

import { useEffect, useMemo, useState } from "react";
import QuestionTrainingCard from "@/components/interview/QuestionTrainingCard";
import type { AnswerScore, CandidateProfile, JobBrief, TrainingBank } from "@/lib/interview/types";

export type TrainingAttempt = {
  question: string;
  bankId: string;
  answer: string;
  score: AnswerScore;
  at: number;
};

const BANK_EMOJI: Record<string, string> = {
  recruiter: "🤝",
  ai_llm: "🧠",
  system_design: "🏗️",
  leadership: "👥",
  behavioural: "🎬",
  salary: "💰",
};

export default function TrainingStep({
  job,
  profile,
  banks,
  loading,
  error,
  attempts,
  onAttempt,
  onRetry,
}: {
  job: JobBrief;
  profile?: Partial<CandidateProfile>;
  banks: TrainingBank[];
  loading: boolean;
  error: string | null;
  attempts: TrainingAttempt[];
  onAttempt: (a: TrainingAttempt) => void;
  onRetry: () => void;
}) {
  const [activeBankId, setActiveBankId] = useState<string | null>(null);

  // When banks first arrive, don't auto-open one — let the user pick.
  useEffect(() => {
    if (!banks.length) setActiveBankId(null);
  }, [banks]);

  const activeBank = useMemo(
    () => banks.find((b) => b.id === activeBankId) ?? null,
    [banks, activeBankId]
  );

  // Mastery per bank — average score across attempts in that bank, /10.
  const bankScores = useMemo(() => {
    const out = new Map<string, { count: number; avg: number }>();
    for (const b of banks) {
      const local = attempts.filter((a) => a.bankId === b.id);
      if (!local.length) {
        out.set(b.id, { count: 0, avg: 0 });
      } else {
        const sum = local.reduce((acc, a) => acc + a.score.score0to10, 0);
        out.set(b.id, { count: local.length, avg: sum / local.length });
      }
    }
    return out;
  }, [attempts, banks]);

  if (loading) {
    return (
      <div className="mt-7 max-w-[820px] space-y-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="la-card animate-pulse p-5" style={{ borderRadius: 16 }}>
            <div className="h-4 w-1/3 rounded bg-line-soft" />
            <div className="mt-2 h-3 w-2/3 rounded bg-line-soft" />
          </div>
        ))}
      </div>
    );
  }

  if (error && !banks.length) {
    return (
      <div className="mt-7 max-w-[640px]">
        <div className="la-card p-5" style={{ borderRadius: 16, borderColor: "#fca5a5" }}>
          <div className="font-bold text-red-700">Could not load training plan</div>
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

  /* ─── Drill view ─── */
  if (activeBank) {
    const bankAttempts = attempts.filter((a) => a.bankId === activeBank.id);
    return (
      <div className="mt-7 max-w-[820px]">
        <button
          type="button"
          onClick={() => setActiveBankId(null)}
          className="text-[13px] font-bold text-ink-soft hover:text-ink"
        >
          ← Back to all banks
        </button>

        <div className="mt-3 flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold tracking-[-0.01em] text-ink">
              {BANK_EMOJI[activeBank.id] ?? "📚"} {activeBank.title}
            </h2>
            <p className="mt-1 text-[14px] text-ink-soft">{activeBank.description}</p>
          </div>
          <div className="text-[12px] text-ink-mute">
            {bankAttempts.length} / {activeBank.questions.length} attempted
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {activeBank.questions.map((q, i) => (
            <QuestionTrainingCard
              key={`${activeBank.id}-${i}`}
              bankId={activeBank.id}
              question={q}
              job={job}
              profile={profile}
              onAttempt={onAttempt}
            />
          ))}
        </div>
      </div>
    );
  }

  /* ─── Bank grid view ─── */
  return (
    <div className="mt-7 max-w-[1000px]">
      <p className="text-[15px] text-ink-soft">
        Train each bank before the simulation. Six banks, 3-8 questions each, scored individually
        with strengths, weaknesses and an improved model answer.
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {banks.map((b) => {
          const m = bankScores.get(b.id) ?? { count: 0, avg: 0 };
          const masteryColor =
            m.count === 0
              ? "var(--ink-mute)"
              : m.avg >= 8
                ? "var(--j-little)"
                : m.avg >= 5
                  ? "#b45309"
                  : "#dc2626";
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBankId(b.id)}
              className="la-card flex flex-col p-4 text-left transition hover:-translate-y-0.5"
              style={{ borderRadius: 16 }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-2xl" aria-hidden>
                  {BANK_EMOJI[b.id] ?? "📚"}
                </div>
                <span
                  className="la-pill text-[10px]"
                  style={{
                    background: "#fff",
                    color: masteryColor,
                    boxShadow: `0 0 0 1px ${masteryColor}40`,
                  }}
                >
                  {m.count === 0
                    ? "Not started"
                    : `${m.count} / ${b.questions.length} · avg ${m.avg.toFixed(1)}`}
                </span>
              </div>
              <h3 className="mt-2 text-[16px] font-bold text-ink">{b.title}</h3>
              <p className="mt-1 text-[13px] leading-snug text-ink-soft">{b.description}</p>
              <div className="mt-3 text-[11px] text-ink-mute">
                {b.questions.length} question{b.questions.length === 1 ? "" : "s"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
