"use client";

import { useEffect, useRef, useState } from "react";
import type {
  CandidateProfile,
  JobBrief,
  PresentationFeedback,
} from "@/lib/interview/types";

type Milestone = { at: number; label: string };
const MILESTONES: Milestone[] = [
  { at: 30, label: "0:30 — Hook" },
  { at: 90, label: "1:30 — Background" },
  { at: 180, label: "3:00 — AI/LLM proof with numbers" },
  { at: 240, label: "4:00 — Leadership story" },
  { at: 270, label: "4:30 — Why this company" },
  { at: 300, label: "5:00 — Close" },
];

const TARGET_SEC = 300; // 5 minutes

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function SelfPresentationTrainer({
  job,
  profile,
  feedback,
  onFeedback,
}: {
  job: JobBrief;
  profile?: Partial<CandidateProfile>;
  feedback: PresentationFeedback | null;
  onFeedback: (f: PresentationFeedback) => void;
}) {
  const [text, setText] = useState("");
  const [elapsedSec, setElapsedSec] = useState(0);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [degraded, setDegraded] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number | null>(null);

  // Cleanup interval on unmount.
  useEffect(
    () => () => {
      if (tickRef.current) clearInterval(tickRef.current);
    },
    [],
  );

  function start() {
    setError(null);
    setRunning(true);
    startRef.current = Date.now() - elapsedSec * 1000;
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      if (startRef.current == null) return;
      setElapsedSec(Math.floor((Date.now() - startRef.current) / 1000));
    }, 250);
  }

  function pause() {
    setRunning(false);
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }

  function reset() {
    pause();
    setElapsedSec(0);
    setText("");
    startRef.current = null;
    setDegraded(false);
    setError(null);
  }

  async function submit() {
    if (text.trim().length < 10) {
      setError("Add at least a few sentences before submitting.");
      return;
    }
    pause();
    setSubmitting(true);
    setError(null);
    setDegraded(false);
    try {
      const res = await fetch("/api/learn/interview/presentation", {
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
          presentationText: text,
          durationSeconds: Math.max(1, elapsedSec || TARGET_SEC),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error ?? "Scoring failed");
      onFeedback(json.feedback as PresentationFeedback);
      if (json.degraded) setDegraded(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  // Live: word count + filler-word ratio (light heuristic).
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const fillerMatches = text.match(/\b(uh|um|like|you know|kind of|sort of|basically|literally|actually)\b/gi);
  const fillerRatio = wordCount ? (fillerMatches?.length ?? 0) / wordCount : 0;
  const overTime = elapsedSec > TARGET_SEC;
  const progressPct = Math.min(100, (elapsedSec / TARGET_SEC) * 100);

  return (
    <div className="mt-7 max-w-[920px]">
      <p className="text-[15px] text-ink-soft">
        Draft your 5-minute introduction. Speak it out loud while you write — the
        timer mirrors a real interviewer&apos;s pacing. Hit milestones, then have
        the AI score it.
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* Editor */}
        <div className="la-card p-5" style={{ borderRadius: 16 }}>
          <div className="flex items-baseline justify-between">
            <div className="la-mono text-[12px] font-bold tracking-wider text-ink-mute">
              YOUR DRAFT
            </div>
            <div className="text-[11px] text-ink-mute">
              {wordCount} words · target ≈ 650–750
            </div>
          </div>
          <textarea
            rows={16}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={10_000}
            placeholder={`Start with a one-sentence hook…\n\nWho I am.\nMy background and key technologies.\nAI/LLM proof with numbers.\nA leadership story with outcome.\nWhy ${job.companyName || "this company"}.`}
            className="mt-2 w-full resize-y rounded-xl border border-line bg-white p-3 text-[14px] leading-relaxed focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
          {error ? (
            <div
              className="mt-2 rounded-lg p-2.5 text-xs"
              style={{ background: "#fef2f2", color: "#991b1b" }}
            >
              {error}
            </div>
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px]">
            <Coach
              ok={wordCount >= 200 && wordCount <= 900}
              label={wordCount < 200 ? "Bulk it up" : wordCount > 900 ? "Trim it" : "Length on track"}
            />
            <Coach
              ok={fillerRatio < 0.04}
              label={fillerRatio < 0.04 ? "Low filler" : `Filler ratio ${(fillerRatio * 100).toFixed(1)}%`}
            />
            <Coach
              ok={/\d/.test(text)}
              label={/\d/.test(text) ? "Includes a number" : "Add a number"}
            />
            <Coach
              ok={!!job.companyName && text.toLowerCase().includes(job.companyName.toLowerCase())}
              label={
                job.companyName && text.toLowerCase().includes(job.companyName.toLowerCase())
                  ? `Mentions ${job.companyName}`
                  : `Mention ${job.companyName ?? "the company"}`
              }
            />
          </div>
        </div>

        {/* Timer + milestones */}
        <div className="la-card p-5" style={{ borderRadius: 16 }}>
          <div className="la-mono text-[12px] font-bold tracking-wider text-ink-mute">
            TIMER
          </div>
          <div
            className="mt-1 text-5xl font-extrabold tracking-tighter"
            style={{ color: overTime ? "#b45309" : "var(--ink)" }}
          >
            {fmt(elapsedSec)}
          </div>
          <div className="mt-2 h-2 rounded-full" style={{ background: "var(--line-soft)" }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: overTime ? "#f59e0b" : "var(--brand-grad)",
              }}
            />
          </div>
          <div className="mt-2 text-[11px] text-ink-mute">
            Target: {fmt(TARGET_SEC)}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!running ? (
              <button
                type="button"
                onClick={start}
                className="la-btn"
                style={{ padding: "8px 14px", fontSize: 12 }}
              >
                {elapsedSec === 0 ? "▶ Start" : "Resume"}
              </button>
            ) : (
              <button
                type="button"
                onClick={pause}
                className="la-btn ghost"
                style={{ padding: "8px 14px", fontSize: 12 }}
              >
                Pause
              </button>
            )}
            <button
              type="button"
              onClick={reset}
              className="la-btn ghost"
              style={{ padding: "8px 14px", fontSize: 12 }}
            >
              Reset
            </button>
          </div>

          <div className="mt-5 la-mono text-[11px] font-bold tracking-wider text-ink-mute">
            MILESTONES
          </div>
          <ul className="mt-2 space-y-1.5 text-[12px]">
            {MILESTONES.map((m) => {
              const hit = elapsedSec >= m.at;
              return (
                <li
                  key={m.at}
                  className="flex items-center gap-2"
                  style={{
                    color: hit ? "var(--ink)" : "var(--ink-mute)",
                    fontWeight: hit ? 700 : 500,
                  }}
                >
                  <span
                    className="grid h-4 w-4 place-items-center rounded-full text-[9px] font-extrabold"
                    style={{
                      background: hit ? "var(--brand-1)" : "#fff",
                      color: hit ? "#fff" : "var(--ink-mute)",
                      border: hit ? "none" : "1px solid var(--line)",
                    }}
                  >
                    {hit ? "✓" : ""}
                  </span>
                  {m.label}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={submit}
            disabled={submitting || text.trim().length < 10}
            className="la-btn mt-5 w-full"
            style={{ padding: "12px 16px", fontSize: 13, opacity: submitting ? 0.6 : 1 }}
          >
            {submitting ? "Scoring…" : "Analyse my pitch"}
          </button>
        </div>
      </div>

      {feedback ? (
        <FeedbackBlock feedback={feedback} degraded={degraded} />
      ) : null}
    </div>
  );
}

function Coach({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="la-pill text-[11px]"
      style={{
        background: ok ? "var(--j-little-bg)" : "#fff",
        color: ok ? "var(--j-little)" : "var(--ink-mute)",
        boxShadow: ok ? "none" : "0 0 0 1px var(--line)",
      }}
    >
      {ok ? "✓" : "·"} {label}
    </span>
  );
}

function FeedbackBlock({
  feedback,
  degraded,
}: {
  feedback: PresentationFeedback;
  degraded: boolean;
}) {
  return (
    <div className="mt-6 la-card p-5" style={{ borderRadius: 16 }}>
      {degraded ? (
        <div className="mb-2 text-[11px]" style={{ color: "#b45309" }}>
          AI provider degraded — feedback is generic.
        </div>
      ) : null}
      <div className="flex flex-wrap items-baseline gap-4">
        <div className="text-3xl font-extrabold text-ink">{feedback.score0to10}/10</div>
        <Score label="Clarity" v={feedback.clarity} />
        <Score label="Structure" v={feedback.structure} />
        <Score label="Role fit" v={feedback.roleRelevance} />
        <Score label="Confidence" v={feedback.confidence} />
      </div>
      <p className="mt-3 text-[13px] text-ink-soft">{feedback.timingFeedback}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {feedback.strengths.length ? (
          <Block title="Strengths">
            <List items={feedback.strengths} accent="var(--j-little)" />
          </Block>
        ) : null}
        {feedback.weaknesses.length ? (
          <Block title="Weaknesses">
            <List items={feedback.weaknesses} accent="#dc2626" />
          </Block>
        ) : null}
        {feedback.missingPoints.length ? (
          <Block title="Missing points">
            <List items={feedback.missingPoints} accent="#b45309" />
          </Block>
        ) : null}
      </div>

      {feedback.improvedScript ? (
        <details className="mt-4 rounded-xl border border-line-soft p-3">
          <summary className="cursor-pointer text-[12px] font-bold text-brand-1">
            Show improved script
          </summary>
          <p className="mt-2 whitespace-pre-wrap text-[13px] leading-relaxed text-ink">
            {feedback.improvedScript}
          </p>
        </details>
      ) : null}
    </div>
  );
}

function Score({ label, v }: { label: string; v: number }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="text-lg font-bold text-ink">{v}/10</div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-line-soft p-3">
      <div className="text-[10px] font-bold uppercase tracking-wider text-ink-mute">
        {title}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function List({ items, accent }: { items: string[]; accent: string }) {
  return (
    <ul className="space-y-1 text-[12px]">
      {items.map((s, i) => (
        <li key={i} className="flex gap-2 leading-snug">
          <span style={{ color: accent }} aria-hidden>•</span>
          <span>{s}</span>
        </li>
      ))}
    </ul>
  );
}
