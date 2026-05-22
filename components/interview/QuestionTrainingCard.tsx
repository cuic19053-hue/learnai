"use client";

import { useState } from "react";
import type { AnswerScore, CandidateProfile, JobBrief } from "@/lib/interview/types";

type TrainingAttemptRecord = {
  question: string;
  bankId: string;
  answer: string;
  score: AnswerScore;
  at: number;
};

export default function QuestionTrainingCard({
  bankId,
  question,
  job,
  profile,
  onAttempt,
}: {
  bankId: string;
  question: string;
  job: JobBrief;
  profile?: Partial<CandidateProfile>;
  onAttempt: (record: TrainingAttemptRecord) => void;
}) {
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState<AnswerScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const [showModel, setShowModel] = useState(false);

  async function submit() {
    if (answer.trim().length < 3) return;
    setLoading(true);
    setError(null);
    setDegraded(false);
    try {
      const res = await fetch("/api/learn/interview/score-attempt", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          job: {
            companyName: job.companyName,
            roleTitle: job.roleTitle,
            seniority: job.seniority,
            jobDescription: job.jobDescription,
          },
          candidateProfile: profile,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error ?? "Scoring failed");
      const result = json.score as AnswerScore;
      setScore(result);
      if (json.degraded) setDegraded(true);
      onAttempt({ question, bankId, answer, score: result, at: Date.now() });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setAnswer("");
    setScore(null);
    setError(null);
    setShowModel(false);
  }

  const signalColor =
    score?.signal === "strong"
      ? "var(--j-little)"
      : score?.signal === "weak"
        ? "#dc2626"
        : "#b45309";

  return (
    <div className="la-card p-5" style={{ borderRadius: 16 }}>
      <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
        Question
      </div>
      <h3 className="mt-1 text-[17px] font-bold leading-snug text-ink">{question}</h3>

      <label className="mt-4 block">
        <div className="mb-1.5 text-[12px] font-bold text-ink-soft">Your answer</div>
        <textarea
          rows={6}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          maxLength={8000}
          placeholder="Speak it out, then type a short summary. Add at least one number or named project."
          className="w-full resize-y rounded-xl border border-line bg-white p-3 text-[14px] leading-relaxed focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
        />
        <div className="mt-1 text-xs text-ink-mute">
          {answer.length.toLocaleString()} characters
        </div>
      </label>

      {error ? (
        <div
          className="mt-3 rounded-lg p-2.5 text-xs"
          style={{ background: "#fef2f2", color: "#991b1b" }}
        >
          {error}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={submit}
          disabled={loading || answer.trim().length < 3}
          className="la-btn"
          style={{ padding: "10px 16px", fontSize: 13, opacity: loading ? 0.6 : 1 }}
        >
          {loading ? "Scoring…" : "Analyse answer"}
        </button>
        {score ? (
          <button
            type="button"
            onClick={reset}
            className="la-btn ghost"
            style={{ padding: "10px 16px", fontSize: 13 }}
          >
            Try again
          </button>
        ) : null}
      </div>

      {score ? (
        <div className="mt-4 rounded-xl border border-line-soft p-4" style={{ background: "var(--bg-2)" }}>
          {degraded ? (
            <div className="mb-2 text-[11px]" style={{ color: "#b45309" }}>
              AI provider degraded — feedback is generic.
            </div>
          ) : null}

          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-extrabold" style={{ color: signalColor }}>
              {score.score0to10}/10
            </div>
            <div
              className="la-pill text-[11px]"
              style={{ background: "#fff", color: signalColor, boxShadow: `0 0 0 1px ${signalColor}40` }}
            >
              {score.signal.toUpperCase()}
            </div>
          </div>

          {score.star ? (
            <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
              {(["situation", "task", "action", "result"] as const).map((k) => (
                <span
                  key={k}
                  className="la-pill"
                  style={{
                    background: score.star?.[k] ? "var(--j-little-bg)" : "#fff",
                    color: score.star?.[k] ? "var(--j-little)" : "var(--ink-mute)",
                    boxShadow: "0 0 0 1px var(--line)",
                  }}
                >
                  {score.star?.[k] ? "✓" : "·"} {k}
                </span>
              ))}
            </div>
          ) : null}

          {score.strengths.length ? (
            <Section title="Strengths">
              <List items={score.strengths} accent="var(--j-little)" />
            </Section>
          ) : null}

          {score.weaknesses.length ? (
            <Section title="Weaknesses">
              <List items={score.weaknesses} accent="#dc2626" />
            </Section>
          ) : null}

          {score.improvedAnswer ? (
            <Section title="">
              <button
                type="button"
                onClick={() => setShowModel((v) => !v)}
                className="text-[12px] font-bold text-brand-1 hover:underline"
              >
                {showModel ? "Hide model answer" : "Show improved model answer"}
              </button>
              {showModel ? (
                <p className="mt-2 whitespace-pre-wrap rounded-lg border border-line-soft bg-white p-3 text-[13px] leading-relaxed text-ink">
                  {score.improvedAnswer}
                </p>
              ) : null}
            </Section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      {title ? (
        <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
          {title}
        </div>
      ) : null}
      <div className={title ? "mt-1" : ""}>{children}</div>
    </div>
  );
}

function List({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="space-y-1 text-[13px]">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2 leading-snug">
          <span style={{ color: accent }} aria-hidden>
            •
          </span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}
