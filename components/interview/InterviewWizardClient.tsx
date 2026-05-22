"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Mark from "@/components/design/Mark";
import { Arrow } from "@/components/design/icons";
import WizardSidebar from "@/components/interview/WizardSidebar";
import GoalStep from "@/components/interview/steps/GoalStep";
import JobStep from "@/components/interview/steps/JobStep";
import ProfileStep from "@/components/interview/steps/ProfileStep";
import FitAnalysisStep from "@/components/interview/steps/FitAnalysisStep";
import TrainingStep, { type TrainingAttempt } from "@/components/interview/steps/TrainingStep";
import SelfPresentationTrainer from "@/components/interview/SelfPresentationTrainer";
import RecordedMockInterview from "@/components/interview/RecordedMockInterview";
import InterviewFinalReport from "@/components/interview/InterviewFinalReport";
import type {
  CandidateProfile,
  FitAnalysis,
  InterviewGoal,
  InterviewTurn,
  JobBrief,
  PresentationFeedback,
  ReadinessReport,
  TrainingBank,
  WizardStep,
} from "@/lib/interview/types";

type FocusItem = { area: string; label: string; score: number };

const ORDER: WizardStep[] = [
  "goal",
  "job",
  "profile",
  "analysis",
  "training",
  "presentation",
  "simulation",
  "report",
];

const STEP_TITLES: Record<WizardStep, string> = {
  goal: "Choose your goal",
  job: "Tell us about the job",
  profile: "Add your CV",
  analysis: "Fit analysis",
  training: "Train key questions",
  presentation: "5-minute self-presentation",
  simulation: "Recorded mock interview",
  report: "Readiness report",
};

const GOAL_LABEL: Record<InterviewGoal, string> = {
  specific_job: "Specific job",
  general_practice: "General practice",
  role_type: "Role type",
};

const STORAGE_KEY = "learnai_interview_wizard_v1";

type SavedState = {
  step: WizardStep;
  goal: InterviewGoal | null;
  job: Partial<JobBrief>;
  profile: Partial<CandidateProfile>;
  analysis: FitAnalysis | null;
  focusAreas: FocusItem[];
  trainingBanks: TrainingBank[];
  trainingAttempts: TrainingAttempt[];
  presentationFeedback: PresentationFeedback | null;
  simulationHistory: InterviewTurn[];
  finalReport: ReadinessReport | null;
};

const INITIAL: SavedState = {
  step: "goal",
  goal: null,
  job: {},
  profile: {},
  analysis: null,
  focusAreas: [],
  trainingBanks: [],
  trainingAttempts: [],
  presentationFeedback: null,
  simulationHistory: [],
  finalReport: null,
};

export default function InterviewWizardClient() {
  const [state, setState] = useState<SavedState>(INITIAL);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [analysisDegraded, setAnalysisDegraded] = useState(false);
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingError, setTrainingError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Local persistence (cookie-free, per-device).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setState({ ...INITIAL, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      // Strip in-memory blob: URLs before serialising — they don't survive
      // a reload and would render dead audio controls otherwise.
      const safe = {
        ...state,
        simulationHistory: state.simulationHistory.map((t) =>
          t.recording ? { ...t, recording: undefined } : t
        ),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    } catch {
      /* quota — ignore */
    }
  }, [state, hydrated]);

  const currentIdx = useMemo(() => ORDER.indexOf(state.step), [state.step]);

  const canContinue = useMemo<boolean>(() => {
    switch (state.step) {
      case "goal":
        return state.goal !== null;
      case "job":
        return Boolean(
          state.job.companyName?.trim() &&
          state.job.roleTitle?.trim() &&
          (state.job.jobDescription ?? "").trim().length >= 50
        );
      case "profile":
        return true; // optional
      case "analysis":
        return state.analysis !== null;
      default:
        return true;
    }
  }, [state]);

  /* ─── API calls ─── */
  const runFitAnalysis = useCallback(async () => {
    if (!state.job.companyName || !state.job.roleTitle || !state.job.jobDescription) return;
    setAnalysisLoading(true);
    setAnalysisError(null);
    setAnalysisDegraded(false);
    try {
      const res = await fetch("/api/learn/interview/analyze-fit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: state.job.companyName,
          roleTitle: state.job.roleTitle,
          seniority: state.job.seniority,
          jobDescription: state.job.jobDescription,
          candidateProfile: emptyToUndefined(state.profile),
          language: "English",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error ?? "Analysis failed");
      }
      setState((s) => ({
        ...s,
        analysis: json.analysis as FitAnalysis,
        focusAreas: (json.focusAreas as FocusItem[]) ?? [],
      }));
      if (json.degraded) setAnalysisDegraded(true);
    } catch (err) {
      setAnalysisError((err as Error).message);
    } finally {
      setAnalysisLoading(false);
    }
  }, [state.job, state.profile]);

  const loadTrainingPlan = useCallback(async () => {
    if (!state.job.companyName || !state.job.roleTitle || !state.job.jobDescription) return;
    setTrainingLoading(true);
    setTrainingError(null);
    try {
      const res = await fetch("/api/learn/interview/training-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          companyName: state.job.companyName,
          roleTitle: state.job.roleTitle,
          seniority: state.job.seniority,
          jobDescription: state.job.jobDescription,
          candidateProfile: emptyToUndefined(state.profile),
          language: "English",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error ?? "Could not load training plan");
      setState((s) => ({ ...s, trainingBanks: json.banks as TrainingBank[] }));
    } catch (err) {
      setTrainingError((err as Error).message);
    } finally {
      setTrainingLoading(false);
    }
  }, [state.job, state.profile]);

  // Auto-load the training plan once when entering the training step.
  useEffect(() => {
    if (!hydrated) return;
    if (state.step !== "training") return;
    if (state.trainingBanks.length > 0) return;
    if (trainingLoading) return;
    loadTrainingPlan();
  }, [hydrated, state.step, state.trainingBanks.length, trainingLoading, loadTrainingPlan]);

  /* ─── Step navigation ─── */
  function go(delta: number) {
    setState((s) => {
      const i = ORDER.indexOf(s.step) + delta;
      const next = ORDER[Math.max(0, Math.min(ORDER.length - 1, i))];
      return { ...s, step: next };
    });
  }

  async function onContinue() {
    if (state.step === "profile" && !state.analysis) {
      setState((s) => ({ ...s, step: "analysis" }));
      await runFitAnalysis();
      return;
    }
    go(1);
  }

  function resetWizard() {
    setState(INITIAL);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  /* ─── Render ─── */
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div
        className="flex items-center justify-between border-b border-line-soft bg-white px-5 md:px-8"
        style={{ height: 64 }}
      >
        <div className="flex items-center gap-3">
          <Link href="/learn/adult" aria-label="Back to professional dashboard">
            <Mark size={28} fontSize={18} />
          </Link>
          <span className="la-pill" style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}>
            🎙️ AI Interview Trainer
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-ink-mute">
            Step {currentIdx + 1} / {ORDER.length}
          </span>
          <button
            type="button"
            onClick={resetWizard}
            className="text-[13px] text-ink-mute hover:text-ink"
            title="Start over"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1280px] grid-cols-1 lg:grid-cols-[300px_1fr]">
        <WizardSidebar
          step={state.step}
          goal={state.goal ? GOAL_LABEL[state.goal] : undefined}
          job={state.job}
          profile={state.profile}
        />

        <main id="main" className="px-5 py-8 md:px-10">
          <div className="la-mono text-xs font-bold tracking-[0.06em] text-brand-1">
            STEP {String(currentIdx + 1).padStart(2, "0")} / {String(ORDER.length).padStart(2, "0")}
          </div>
          <h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
            {STEP_TITLES[state.step]}
          </h1>

          {state.step === "goal" && (
            <GoalStep value={state.goal} onChange={(g) => setState((s) => ({ ...s, goal: g }))} />
          )}

          {state.step === "job" && (
            <JobStep value={state.job} onChange={(j) => setState((s) => ({ ...s, job: j }))} />
          )}

          {state.step === "profile" && (
            <ProfileStep
              value={state.profile}
              onChange={(p) => setState((s) => ({ ...s, profile: p }))}
            />
          )}

          {state.step === "analysis" && (
            <FitAnalysisStep
              loading={analysisLoading}
              analysis={state.analysis}
              focusAreas={state.focusAreas}
              degraded={analysisDegraded}
              error={analysisError}
              onRetry={runFitAnalysis}
            />
          )}

          {state.step === "training" && (
            <TrainingStep
              job={state.job as JobBrief}
              profile={state.profile}
              banks={state.trainingBanks}
              loading={trainingLoading}
              error={trainingError}
              attempts={state.trainingAttempts}
              onAttempt={(a) =>
                setState((s) => ({ ...s, trainingAttempts: [...s.trainingAttempts, a] }))
              }
              onRetry={loadTrainingPlan}
            />
          )}

          {state.step === "presentation" && (
            <SelfPresentationTrainer
              job={state.job as JobBrief}
              profile={state.profile}
              feedback={state.presentationFeedback}
              onFeedback={(f) => setState((s) => ({ ...s, presentationFeedback: f }))}
            />
          )}

          {state.step === "simulation" && (
            <RecordedMockInterview
              job={state.job as JobBrief}
              profile={state.profile}
              banks={state.trainingBanks}
              history={state.simulationHistory}
              onTurn={(t) =>
                setState((s) => ({ ...s, simulationHistory: [...s.simulationHistory, t] }))
              }
              onComplete={() => setState((s) => ({ ...s, step: "report" }))}
            />
          )}

          {state.step === "report" && (
            <InterviewFinalReport
              job={state.job as JobBrief}
              profile={state.profile}
              history={state.simulationHistory}
              trainingAttempts={state.trainingAttempts.map((a) => ({
                question: a.question,
                score: a.score.score0to10,
              }))}
              presentationFeedback={state.presentationFeedback}
              report={state.finalReport}
              onReport={(r) => setState((s) => ({ ...s, finalReport: r }))}
              onReset={resetWizard}
            />
          )}

          {/* Footer nav */}
          <div className="mt-10 flex max-w-[920px] items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => go(-1)}
              disabled={currentIdx === 0}
              className="la-btn ghost"
              style={{ padding: "12px 18px" }}
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={!canContinue || analysisLoading}
              className="la-btn"
              style={{ padding: "14px 22px", opacity: canContinue && !analysisLoading ? 1 : 0.5 }}
            >
              {state.step === "profile" && !state.analysis
                ? "Analyse fit"
                : state.step === "analysis"
                  ? "Continue to training"
                  : "Continue"}{" "}
              <Arrow />
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

function emptyToUndefined<T extends Record<string, unknown>>(obj: T): T | undefined {
  if (Object.values(obj).every((v) => v == null || v === "" || (Array.isArray(v) && !v.length))) {
    return undefined;
  }
  return obj;
}
