"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CandidateProfile,
  InterviewTurn,
  JobBrief,
  TrainingBank,
} from "@/lib/interview/types";
import {
  AudioRecorder,
  isRecordingSupported,
  type TurnRecording,
} from "@/lib/interview/recording";

type Round = 1 | 2 | 3;

const ROUND_META: Record<Round, { name: string; topic: string; targetTurns: number }> = {
  1: { name: "Recruiter screen", topic: "Self-pitch · motivation · fit · salary", targetTurns: 3 },
  2: { name: "Technical deep-dive", topic: "AI/LLM · system design · SQL", targetTurns: 4 },
  3: { name: "Leadership · system", topic: "People · scale · trade-offs", targetTurns: 3 },
};

const TOTAL_TURNS = ROUND_META[1].targetTurns + ROUND_META[2].targetTurns + ROUND_META[3].targetTurns;

const FALLBACK_OPENERS: Record<Round, string> = {
  1: "Tell me about yourself and why you're interested in this role.",
  2: "Walk me through an AI / LLM feature you shipped in production — what model, what evals, what cost?",
  3: "Tell me about a time you led a team through a hard technical decision. What was the outcome?",
};

function pickOpener(banks: TrainingBank[], round: Round, fallback: string): string {
  const preferredBankIds: Record<Round, string[]> = {
    1: ["recruiter"],
    2: ["ai_llm", "system_design"],
    3: ["leadership", "behavioural"],
  };
  for (const bankId of preferredBankIds[round]) {
    const bank = banks.find((b) => b.id === bankId);
    if (bank?.questions?.length) return bank.questions[0];
  }
  return fallback;
}

export default function RecordedMockInterview({
  job,
  profile,
  banks,
  history,
  onTurn,
  onComplete,
}: {
  job: JobBrief;
  profile?: Partial<CandidateProfile>;
  banks: TrainingBank[];
  history: InterviewTurn[];
  onTurn: (t: InterviewTurn) => void;
  onComplete: () => void;
}) {
  const [round, setRound] = useState<Round>(1);
  const [currentQuestion, setCurrentQuestion] = useState<string>("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consented, setConsented] = useState(false);
  const initialised = useRef(false);

  // ── Audio recording (optional, opt-in per simulation) ──
  const [recordingEnabled, setRecordingEnabled] = useState(false);
  const [micState, setMicState] = useState<"idle" | "armed" | "recording" | "denied">(
    "idle",
  );
  const [recElapsedSec, setRecElapsedSec] = useState(0);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const recTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const supportsAudio = isRecordingSupported();

  function ensureRecorder(): AudioRecorder {
    if (!recorderRef.current) recorderRef.current = new AudioRecorder();
    return recorderRef.current;
  }

  async function enableRecording() {
    if (!supportsAudio) return;
    try {
      const rec = ensureRecorder();
      await rec.requestPermission();
      setMicState("armed");
      setRecordingEnabled(true);
      setError(null);
    } catch (e) {
      setMicState("denied");
      setRecordingEnabled(false);
      setError((e as Error).message);
    }
  }

  function startTurnRecording() {
    if (!recordingEnabled) return;
    const rec = ensureRecorder();
    try {
      rec.start();
      setMicState("recording");
      setRecElapsedSec(0);
      if (recTickRef.current) clearInterval(recTickRef.current);
      recTickRef.current = setInterval(
        () => setRecElapsedSec((s) => s + 1),
        1000,
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function stopTurnRecording(): Promise<TurnRecording | null> {
    if (!recordingEnabled || !recorderRef.current) return null;
    if (recTickRef.current) {
      clearInterval(recTickRef.current);
      recTickRef.current = null;
    }
    const result = await recorderRef.current.stop().catch(() => null);
    setMicState("armed");
    setRecElapsedSec(0);
    return result;
  }

  // Auto-arm a new recording whenever a new question is shown.
  useEffect(() => {
    if (!recordingEnabled || !currentQuestion) return;
    // Slight delay so the question paints before the mic light goes on.
    const id = setTimeout(() => startTurnRecording(), 250);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion, recordingEnabled]);

  // Cleanup on unmount.
  useEffect(
    () => () => {
      if (recTickRef.current) clearInterval(recTickRef.current);
      recorderRef.current?.dispose();
      recorderRef.current = null;
    },
    [],
  );

  // First question for the active round (when entering a fresh round).
  useEffect(() => {
    if (!consented) return;
    if (!initialised.current) {
      // Resuming a session: derive round from history.
      if (history.length > 0) {
        const last = history[history.length - 1];
        const roundCounts = countByRound(history);
        const lastRound = last.round;
        const targetForLast = ROUND_META[lastRound].targetTurns;
        if (roundCounts[lastRound] >= targetForLast && lastRound < 3) {
          const next = (lastRound + 1) as Round;
          setRound(next);
          setCurrentQuestion(pickOpener(banks, next, FALLBACK_OPENERS[next]));
        } else {
          setRound(lastRound);
          // Use the AI's nextQuestion if available, otherwise a fresh opener.
          setCurrentQuestion(FALLBACK_OPENERS[lastRound]);
        }
      } else {
        setCurrentQuestion(pickOpener(banks, 1, FALLBACK_OPENERS[1]));
      }
      initialised.current = true;
    }
  }, [consented, banks, history]);

  const roundCounts = useMemo(() => countByRound(history), [history]);
  const totalAnswered = history.length;
  const allDone = totalAnswered >= TOTAL_TURNS;
  const meta = ROUND_META[round];

  async function submit() {
    if (answer.trim().length < 1) return;
    setLoading(true);
    setError(null);
    // Stop the recording for this turn (if any) BEFORE the network call, so the
    // mic light goes off immediately on submit.
    const turnRecording = await stopTurnRecording();
    try {
      const res = await fetch("/api/learn/interview/simulation-turn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          round,
          question: currentQuestion,
          userAnswer: answer,
          history,
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
      if (!res.ok || !json.ok) throw new Error(json?.error ?? "Could not score the turn");

      const turn = json.turn as InterviewTurn & { nextQuestion?: string };
      onTurn({
        index: turn.index,
        round: turn.round,
        question: turn.question,
        answer: turn.answer,
        score0to10: turn.score0to10,
        signal: turn.signal,
        feedbackBullets: turn.feedbackBullets,
        strengths: turn.strengths,
        weaknesses: turn.weaknesses,
        improvedAnswer: turn.improvedAnswer,
        communication: turn.communication,
        recording: turnRecording
          ? {
              url: turnRecording.url,
              mimeType: turnRecording.mimeType,
              durationSec: turnRecording.durationSec,
              sizeBytes: turnRecording.sizeBytes,
            }
          : undefined,
      });

      const nextInRoundCount = (roundCounts[round] ?? 0) + 1;
      const roundFull = nextInRoundCount >= ROUND_META[round].targetTurns;

      if (roundFull && round < 3) {
        const nextRound = (round + 1) as Round;
        setRound(nextRound);
        setCurrentQuestion(pickOpener(banks, nextRound, FALLBACK_OPENERS[nextRound]));
      } else if (roundFull && round === 3) {
        // Trainer is done.
        setCurrentQuestion("");
      } else {
        // Continue in the same round with the AI's follow-up.
        const nextQ = (turn as unknown as { nextQuestion?: string }).nextQuestion;
        setCurrentQuestion(
          nextQ && nextQ.trim() ? nextQ.trim() : pickOpener(banks, round, FALLBACK_OPENERS[round]),
        );
      }
      setAnswer("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  /* ─── Consent gate ─── */
  if (!consented) {
    return (
      <div className="mt-7 max-w-[760px]">
        <div className="la-card p-6" style={{ borderRadius: 18 }}>
          <div className="text-2xl" aria-hidden>
            🎙️
          </div>
          <h3 className="mt-3 text-xl font-bold text-ink">
            Before you start the recorded mock interview
          </h3>
          <ul className="mt-3 space-y-2 text-[14px] leading-relaxed text-ink-soft">
            <li>• Three rounds, ~10 questions total, no retakes.</li>
            <li>• Each answer is scored live. The AI calibrates the next question to your last one.</li>
            <li>• <strong>Audio recording is optional.</strong> Recordings stay on your device — they never leave the browser.</li>
            <li>• Your answers stay on your device until you sign in to save progress.</li>
            <li>• We <strong>never</strong> use your data to train models.</li>
          </ul>

          {supportsAudio ? (
            <div
              className="mt-4 rounded-xl border border-line-soft p-3.5"
              style={{ background: "var(--bg-2)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[13px] font-bold text-ink">
                    🔴 Enable audio recording (optional)
                  </div>
                  <p className="mt-1 text-[12px] text-ink-soft">
                    We&apos;ll capture audio of each answer so you can play it back
                    in the report. Mic permission is requested once.
                  </p>
                  {micState === "denied" ? (
                    <p className="mt-1 text-[11px] text-red-600">
                      Microphone permission denied — text-only continues to work.
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={enableRecording}
                  disabled={recordingEnabled}
                  className="la-btn ghost shrink-0"
                  style={{ padding: "8px 12px", fontSize: 12 }}
                >
                  {recordingEnabled ? "✓ Mic ready" : "Enable mic"}
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-3 text-[11px] text-ink-mute">
              Your browser does not support audio recording — text-only mode active.
            </div>
          )}

          <button
            type="button"
            onClick={() => setConsented(true)}
            className="la-btn mt-5"
            style={{ padding: "12px 18px" }}
          >
            I understand — start the simulation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-7 max-w-[960px]">
      {/* Round strip */}
      <div className="grid grid-cols-3 gap-2">
        {([1, 2, 3] as Round[]).map((r) => {
          const m = ROUND_META[r];
          const active = round === r && !allDone;
          const done = (roundCounts[r] ?? 0) >= m.targetTurns;
          return (
            <div
              key={r}
              className="flex items-center gap-2.5 rounded-xl border p-3"
              style={{
                borderColor: active ? "var(--brand-1)" : done ? "var(--j-little)" : "var(--line)",
                background: active ? "rgba(46,91,255,0.06)" : "#fff",
              }}
            >
              <div
                className="grid h-7 w-7 place-items-center rounded-full text-[11px] font-extrabold"
                style={{
                  background: done ? "var(--j-little)" : active ? "var(--brand-grad)" : "#fff",
                  color: done || active ? "#fff" : "var(--ink-mute)",
                  border: done || active ? "none" : "1.5px solid var(--line)",
                }}
              >
                {done ? "✓" : r}
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-bold text-ink">{m.name}</div>
                <div className="truncate text-[11px] text-ink-mute">
                  {roundCounts[r] ?? 0} / {m.targetTurns}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!allDone && currentQuestion ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          {/* Question + answer */}
          <div className="la-card p-5" style={{ borderRadius: 18 }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              {meta.name} · question {(roundCounts[round] ?? 0) + 1} of {meta.targetTurns}
            </div>
            <h3 className="mt-1 text-[19px] font-bold leading-snug text-ink">
              {currentQuestion}
            </h3>

            {recordingEnabled ? (
              <div
                aria-live="polite"
                className="mt-3 flex items-center gap-2 rounded-lg border border-line-soft px-3 py-1.5 text-[12px]"
                style={{
                  background:
                    micState === "recording" ? "rgba(220,38,38,0.06)" : "var(--bg-2)",
                }}
              >
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-full"
                  style={{
                    background: micState === "recording" ? "#dc2626" : "var(--ink-mute)",
                    animation: micState === "recording" ? "pulse 1.4s ease-in-out infinite" : "none",
                  }}
                />
                <span className="font-bold text-ink">
                  {micState === "recording" ? "Recording" : "Mic armed"}
                </span>
                <span className="la-mono text-ink-mute">
                  {micState === "recording" ? fmtSec(recElapsedSec) : "0:00"}
                </span>
                <style>{`@keyframes pulse {0%,100%{opacity:1}50%{opacity:.3}}`}</style>
              </div>
            ) : null}

            <textarea
              rows={7}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              maxLength={8000}
              placeholder="Type your answer as if you were speaking it. The AI will score and follow up."
              className="mt-4 w-full resize-y rounded-xl border border-line bg-white p-3 text-[14px] leading-relaxed focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
            />
            {error ? (
              <div
                className="mt-2 rounded-lg p-2.5 text-xs"
                style={{ background: "#fef2f2", color: "#991b1b" }}
              >
                {error}
              </div>
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[11px] text-ink-mute">
                {answer.length.toLocaleString()} characters
              </span>
              <button
                type="button"
                onClick={submit}
                disabled={loading || answer.trim().length < 1}
                className="la-btn"
                style={{ padding: "10px 16px", fontSize: 13, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Scoring…" : "Submit & continue →"}
              </button>
            </div>
          </div>

          {/* History sidebar */}
          <aside className="la-card p-4" style={{ borderRadius: 16 }}>
            <div className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              History · {totalAnswered} answer{totalAnswered === 1 ? "" : "s"}
            </div>
            {history.length === 0 ? (
              <p className="mt-2 text-[12px] text-ink-mute">
                Your answers will appear here as you go.
              </p>
            ) : (
              <ol className="mt-2 max-h-[420px] space-y-2.5 overflow-y-auto pr-1">
                {history.map((t) => (
                  <li key={t.index} className="rounded-lg border border-line-soft p-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[10px] font-bold text-ink-mute">
                        R{t.round} · Q{t.index + 1}
                      </span>
                      <span
                        className="text-[11px] font-bold"
                        style={{
                          color:
                            t.signal === "strong"
                              ? "var(--j-little)"
                              : t.signal === "weak"
                                ? "#dc2626"
                                : "#b45309",
                        }}
                      >
                        {t.score0to10}/10
                      </span>
                    </div>
                    <div className="mt-1 line-clamp-2 text-[12px] font-bold text-ink">
                      {t.question}
                    </div>
                    <div className="mt-1 line-clamp-2 text-[11px] text-ink-soft">
                      {t.answer}
                    </div>
                    {t.recording ? (
                      <audio
                        controls
                        preload="none"
                        src={t.recording.url}
                        className="mt-1.5 h-7 w-full"
                      />
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </aside>
        </div>
      ) : null}

      {allDone ? (
        <div
          className="mt-5 rounded-2xl border p-6 text-center"
          style={{
            borderColor: "var(--brand-1)",
            background: "rgba(46,91,255,0.04)",
          }}
        >
          <div className="text-3xl" aria-hidden>
            🎉
          </div>
          <h3 className="mt-2 text-xl font-bold text-ink">Simulation complete</h3>
          <p className="mt-1 text-[14px] text-ink-soft">
            {totalAnswered} answers across 3 rounds. Generate your readiness report next.
          </p>
          <button
            type="button"
            onClick={onComplete}
            className="la-btn mt-4"
            style={{ padding: "12px 18px" }}
          >
            Continue to report →
          </button>
        </div>
      ) : null}
    </div>
  );
}

function countByRound(history: InterviewTurn[]): Record<Round, number> {
  const out: Record<Round, number> = { 1: 0, 2: 0, 3: 0 };
  for (const t of history) {
    out[t.round]++;
  }
  return out;
}

function fmtSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
