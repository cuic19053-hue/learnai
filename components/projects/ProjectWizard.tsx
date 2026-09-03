"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import WizardShell from "./WizardShell";
import { FORMAT_PREFS, type WizardConfig } from "@/lib/projects/wizard-config";
import type { Journey } from "@/lib/learn/journeys";

export type WizardPrefill = {
  topic?: string;
  outcome?: string;
  sources?: string[];
  daysPerWeek?: number;
  minutesPerDay?: number;
  prefs?: string[];
};

type Props = {
  config: WizardConfig;
  journey: Journey;
  /** Where the close button + cancel goes. */
  closeHref: string;
  /** Learner-friendly first name for the headline (optional). */
  learnerName?: string;
  /** Pre-fill the wizard from a ready-to-use demo project. */
  prefill?: WizardPrefill;
};

const STEP_LABELS_STANDARD = ["TOPIC", "SOURCES", "PACE", "PLAN"];
const STEP_LABELS_CALM = ["TOPIC", "PACE"];

export default function ProjectWizard({ config, journey, closeHref, learnerName, prefill }: Props) {
  // Variant-specific dispatch keeps each shape simple to read.
  if (config.variant === "parent") {
    return (
      <ParentWizard
        config={config}
        journey={journey}
        closeHref={closeHref}
        learnerName={learnerName}
        prefill={prefill}
      />
    );
  }
  if (config.variant === "calm") {
    return <CalmWizard config={config} journey={journey} closeHref={closeHref} prefill={prefill} />;
  }
  return (
    <StandardWizard
      config={config}
      journey={journey}
      closeHref={closeHref}
      learnerName={learnerName}
      prefill={prefill}
    />
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Standard 4-step wizard — GRADE_7 / GRADE_8 / GRADE_9 / Adult
   ────────────────────────────────────────────────────────────────────── */
function StandardWizard({ config, journey, closeHref, learnerName, prefill }: Props) {
  const router = useRouter();
  const accent = useAccent(journey);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(prefill?.topic ?? config.starters[0] ?? "");
  const [outcome, setOutcome] = useState(prefill?.outcome ?? config.outcomeOptions[0] ?? "");
  const [sources, setSources] = useState<string[]>(prefill?.sources ?? []);
  const [sourceDraft, setSourceDraft] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState(prefill?.daysPerWeek ?? config.defaultDaysPerWeek);
  const [minutesPerDay, setMinutesPerDay] = useState(
    prefill?.minutesPerDay ?? config.defaultMinutesPerDay
  );
  const [prefs, setPrefs] = useState<string[]>(prefill?.prefs ?? config.defaultPrefs);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const headline = learnerName
    ? config.question.replace(/, ?$/, "") + ", " + learnerName + "?"
    : config.question;
  const kicker = `NEW PROJECT · ${config.slug.toUpperCase()} WORLD`;

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            worldSlug: config.slug,
            topic,
            outcome,
            sources,
            daysPerWeek,
            minutesPerDay,
            prefs,
          }),
        });
        const payload = (await res.json().catch(() => null)) as
          | { ok: true; project: { id: string } }
          | { ok: false; error: string }
          | null;
        if (!res.ok || !payload || payload.ok === false) {
          setError(payload?.ok === false ? payload.error : "Couldn't save your project.");
          return;
        }
        router.push(`/learn/projects/${payload.project.id}`);
      } catch {
        setError("Network hiccup — please try again.");
      }
    });
  }

  const footer: ReactNode = (
    <>
      {step > 1 ? (
        <button type="button" className="la-btn ghost" onClick={() => setStep((s) => s - 1)}>
          ← Back
        </button>
      ) : null}
      {step < 4 ? (
        <button
          type="button"
          className="la-btn"
          onClick={() => setStep((s) => s + 1)}
          style={{ background: accent.gradient }}
          disabled={step === 1 && !topic.trim()}
        >
          Continue →
        </button>
      ) : (
        <>
          <button
            type="button"
            className="la-btn ghost"
            onClick={() => setStep(1)}
            disabled={pending}
          >
            ✨ Re-roll
          </button>
          <button
            type="button"
            className="la-btn"
            onClick={submit}
            disabled={pending}
            style={{ background: accent.gradient }}
          >
            {pending ? "Creating…" : "Start project →"}
          </button>
        </>
      )}
    </>
  );

  return (
    <WizardShell
      step={step}
      total={4}
      stepLabels={STEP_LABELS_STANDARD}
      accentGradient={accent.gradient}
      accentColor={accent.color}
      accentSoft={accent.soft}
      accentBg={accent.bg}
      kicker={kicker}
      title={
        step === 1
          ? headline
          : step === 2
            ? "Got a textbook or syllabus? Drop it in."
            : step === 3
              ? "How fast can we go?"
              : "Here's the plan. Looks right?"
      }
      subhead={
        step === 1
          ? config.subhead
          : step === 2
            ? "Optional — generating from scratch works, but anchoring to real sources makes the test feel like your class."
            : step === 3
              ? "Honest input → realistic plan. We'll flag you if the deadline doesn't fit the minutes."
              : "Drafted from your topic, sources, deadline, and the methods that fit this audience."
      }
      closeHref={closeHref}
      icon={journey.emoji}
      footer={footer}
      footerNote={
        error
          ? error
          : step === 1
            ? "Nothing is locked in — every step is editable later."
            : step === 2
              ? "All uploads stay private — never used to train any model."
              : step === 3
                ? "You can shift the plan later, even mid-week."
                : "Editing on launch · drag to re-order · double-click to rename"
      }
    >
      {step === 1 ? (
        <Step1Topic
          config={config}
          topic={topic}
          setTopic={setTopic}
          outcome={outcome}
          setOutcome={setOutcome}
          accent={accent}
        />
      ) : null}
      {step === 2 ? (
        <Step2Sources
          sources={sources}
          setSources={setSources}
          draft={sourceDraft}
          setDraft={setSourceDraft}
          accent={accent}
        />
      ) : null}
      {step === 3 ? (
        <Step3Pace
          daysPerWeek={daysPerWeek}
          setDaysPerWeek={setDaysPerWeek}
          minutesPerDay={minutesPerDay}
          setMinutesPerDay={setMinutesPerDay}
          prefs={prefs}
          setPrefs={setPrefs}
          paceCopy={config.defaultPaceCopy}
          accent={accent}
        />
      ) : null}
      {step === 4 ? <Step4Plan config={config} accent={accent} /> : null}
    </WizardShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Calm 2-step wizard — Senior
   ────────────────────────────────────────────────────────────────────── */
function CalmWizard({ config, journey, closeHref, prefill }: Omit<Props, "learnerName">) {
  const router = useRouter();
  const accent = useAccent(journey);
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState(prefill?.topic ?? config.starters[0] ?? "");
  const [outcome, setOutcome] = useState(prefill?.outcome ?? config.outcomeOptions[0] ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [accessibility, setAccessibility] = useState<string[]>(["bigger", "readaloud", "slower"]);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            worldSlug: config.slug,
            topic,
            outcome,
            sources: [],
            daysPerWeek: config.defaultDaysPerWeek,
            minutesPerDay: config.defaultMinutesPerDay,
            prefs: accessibility,
          }),
        });
        const payload = (await res.json().catch(() => null)) as
          | { ok: true; project: { id: string } }
          | { ok: false; error: string }
          | null;
        if (!res.ok || !payload || payload.ok === false) {
          setError(payload?.ok === false ? payload.error : "Couldn't save your project.");
          return;
        }
        router.push(`/learn/projects/${payload.project.id}`);
      } catch {
        setError("Please try again.");
      }
    });
  }

  return (
    <WizardShell
      step={step}
      total={2}
      stepLabels={STEP_LABELS_CALM}
      accentGradient={accent.gradient}
      accentColor={accent.color}
      accentSoft={accent.soft}
      accentBg={accent.bg}
      kicker={`STEP ${step} OF 2 · WITH ${journey.name.toUpperCase()}`}
      title={step === 1 ? config.question : "How would you like to learn?"}
      subhead={
        step === 1 ? config.subhead : "Pick what's comfortable. You can change anything later."
      }
      closeHref={closeHref}
      icon={journey.emoji}
      footer={
        <>
          {step > 1 ? (
            <button
              type="button"
              className="la-btn ghost"
              onClick={() => setStep((s) => s - 1)}
              style={{ padding: "12px 18px", fontSize: 15 }}
            >
              ← Back
            </button>
          ) : (
            <button
              type="button"
              className="la-btn ghost"
              style={{ padding: "12px 18px", fontSize: 15 }}
              onClick={() => router.push(closeHref)}
            >
              Talk to {journey.name === "Senior" ? "Aiya" : "your tutor"}
            </button>
          )}
          {step < 2 ? (
            <button
              type="button"
              className="la-btn"
              onClick={() => setStep((s) => s + 1)}
              style={{ background: accent.gradient, padding: "12px 22px", fontSize: 15 }}
              disabled={!topic.trim()}
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              className="la-btn"
              onClick={submit}
              style={{ background: accent.gradient, padding: "12px 22px", fontSize: 15 }}
              disabled={pending}
            >
              {pending ? "Setting up…" : "Begin"}
            </button>
          )}
        </>
      }
      footerNote={error ?? "Take your time. There's no rush."}
    >
      {step === 1 ? (
        <CalmStep1 config={config} topic={topic} setTopic={setTopic} accent={accent} />
      ) : (
        <CalmStep2
          config={config}
          outcome={outcome}
          setOutcome={setOutcome}
          accessibility={accessibility}
          setAccessibility={setAccessibility}
          accent={accent}
        />
      )}
    </WizardShell>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Parent single-page wizard — Little Learner
   ────────────────────────────────────────────────────────────────────── */
function ParentWizard({ config, journey, closeHref, learnerName, prefill }: Props) {
  const router = useRouter();
  const accent = useAccent(journey);
  const [topic, setTopic] = useState(prefill?.topic ?? config.starters[0] ?? "");
  const [length, setLength] = useState(prefill?.outcome ?? config.outcomeOptions[0] ?? "10 min");
  const [voice, setVoice] = useState(true);
  const [tap, setTap] = useState(true);
  const [readAloud, setReadAloud] = useState(true);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const childName = learnerName ?? "your little one";

  function submit() {
    setError(null);
    startTransition(async () => {
      const prefs = [
        voice ? "voice" : null,
        tap ? "tap" : null,
        readAloud ? "readaloud" : null,
      ].filter(Boolean) as string[];
      try {
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            worldSlug: config.slug,
            topic,
            outcome: length,
            sources: [],
            daysPerWeek: config.defaultDaysPerWeek,
            minutesPerDay: parseLength(length, config.defaultMinutesPerDay),
            prefs,
          }),
        });
        const payload = (await res.json().catch(() => null)) as
          | { ok: true; project: { id: string } }
          | { ok: false; error: string }
          | null;
        if (!res.ok || !payload || payload.ok === false) {
          setError(payload?.ok === false ? payload.error : "Couldn't save.");
          return;
        }
        router.push(`/learn/projects/${payload.project.id}`);
      } catch {
        setError("Please try again.");
      }
    });
  }

  return (
    <WizardShell
      step={1}
      total={1}
      stepLabels={[]}
      accentGradient={accent.gradient}
      accentColor={accent.color}
      accentSoft={accent.soft}
      accentBg={accent.bg}
      kicker={`PARENT MODE · MAKING A PROJECT FOR ${childName.toUpperCase()}`}
      title={`Set up ${childName}'s next adventure`}
      subhead="Pick the theme. The AI tutor turns it into a story-shaped lesson. You stay in control of time and content."
      closeHref={closeHref}
      icon="👪"
      footer={
        <>
          <button type="button" className="la-btn ghost" onClick={() => router.push(closeHref)}>
            Save for later
          </button>
          <button
            type="button"
            className="la-btn"
            onClick={submit}
            disabled={pending}
            style={{ background: accent.gradient, padding: "12px 20px" }}
          >
            {pending ? "Generating…" : "✨ Generate the project"}
          </button>
        </>
      }
      footerNote={
        error ?? `🔒 ${childName} never sees ads, links, or content outside the allowed subjects.`
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <SectionLabel n={1}>WHAT THEME?</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {config.starters.map((s) => {
              const on = s === topic;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  className="rounded-2xl p-3 text-left transition"
                  style={{
                    background: on ? accent.bg : "#fff",
                    border: on ? `2px solid ${accent.color}` : "1.5px solid var(--line)",
                  }}
                  aria-pressed={on}
                >
                  <div className="text-[22px]" aria-hidden>
                    {s.split(" ")[0]}
                  </div>
                  <div className="mt-1 text-[13px] font-extrabold text-ink">{s}</div>
                </button>
              );
            })}
          </div>

          <SectionLabel n={2} className="mt-5">
            SESSION LENGTH
          </SectionLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {config.outcomeOptions.map((o) => {
              const on = o === length;
              return (
                <button
                  key={o}
                  type="button"
                  onClick={() => setLength(o)}
                  className="min-w-[80px] flex-1 rounded-xl py-2.5 text-[13px] font-extrabold transition"
                  style={{
                    background: on ? accent.color : "#fff",
                    color: on ? "#fff" : "var(--ink)",
                    border: on ? "none" : "1px solid var(--line)",
                  }}
                  aria-pressed={on}
                >
                  {o}
                </button>
              );
            })}
          </div>

          <SectionLabel n={3} className="mt-5">
            HOW THEY INTERACT
          </SectionLabel>
          <div className="mt-2 space-y-1.5">
            <ToggleRow label="🎤 Voice answers" on={voice} setOn={setVoice} />
            <ToggleRow label="✏️ Tap & drag" on={tap} setOn={setTap} />
            <ToggleRow label="📖 Read aloud" on={readAloud} setOn={setReadAloud} />
          </div>

          <SectionLabel n={4} className="mt-5">
            SAFETY & SCHEDULE
          </SectionLabel>
          <div
            className="mt-2 rounded-xl border border-line-soft p-3.5 text-[12px]"
            style={{ background: "var(--surface-soft)" }}
          >
            <SafetyRow label="Content safety" value="Strict · ages 3–6" />
            <SafetyRow
              label="Allowed subjects"
              value="Numbers · Letters · Animals · Feelings · Colors"
            />
            <SafetyRow label="Language" value="English (US)" />
            <SafetyRow label="Voice" value="Friendly · slow" />
          </div>
        </div>

        {/* Preview */}
        <div>
          <SectionLabel>PREVIEW · WHAT {childName.toUpperCase()} WILL SEE</SectionLabel>
          <div
            className="mt-2 rounded-2xl p-5 text-white shadow-md"
            style={{ background: accent.gradient }}
          >
            <div className="la-mono text-[11px]" style={{ opacity: 0.85 }}>
              TUTOR SAYS
            </div>
            <div className="mt-1.5 text-[19px] font-extrabold leading-snug">
              &ldquo;Look, three lions are sleeping. Can you count them?&rdquo;
            </div>
            <div className="mt-3 flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <div
                  key={n}
                  className="grid place-items-center rounded-lg text-[15px] font-extrabold"
                  style={{
                    width: 32,
                    height: 32,
                    background: "rgba(255,255,255,0.2)",
                    fontFamily: "var(--font-serif), Georgia, serif",
                  }}
                >
                  {n}
                </div>
              ))}
            </div>
            <div
              className="mt-3 flex items-center gap-2 rounded-lg px-3 py-2 text-[12px]"
              style={{ background: "rgba(255,255,255,0.18)" }}
            >
              🎤 Tap to answer — or just say the number
            </div>
          </div>

          <div
            className="mt-3 rounded-xl p-3.5"
            style={{ background: accent.soft, border: `1px solid ${accent.color}33` }}
          >
            <div className="text-[12px] font-extrabold text-ink">
              For parents — pedagogical context
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">
              {config.tutorWhisper}
            </p>
            <div className="mt-2.5 rounded-md bg-white p-2.5">
              <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                Method
              </div>
              <div className="text-[12px] font-extrabold text-ink">
                Active recall + Kumon ladder
              </div>
              <div className="text-[11px] text-ink-soft">
                Repeats numbers until owned — no new number until the prior is solid.
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-dashed border-line p-3 text-[11px] leading-relaxed text-ink-soft">
            <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
              You'll receive
            </div>
            <ul className="mt-1 list-disc pl-5">
              <li>End-of-session summary in your phone</li>
              <li>What was right · where they paused</li>
              <li>1-tap chance to extend or stop</li>
            </ul>
          </div>
        </div>
      </div>
    </WizardShell>
  );
}

/* ────────── Step components ───────── */
function Step1Topic({
  config,
  topic,
  setTopic,
  outcome,
  setOutcome,
  accent,
}: {
  config: WizardConfig;
  topic: string;
  setTopic: (v: string) => void;
  outcome: string;
  setOutcome: (v: string) => void;
  accent: Accent;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <FieldLabel>TOPIC</FieldLabel>
        <div
          className="mt-1.5 rounded-2xl border bg-white px-4 py-3.5"
          style={{ borderColor: accent.color, borderWidth: 1.5 }}
        >
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={config.placeholder}
            className="w-full border-none bg-transparent text-[17px] font-extrabold text-ink outline-none"
            aria-label="Project topic"
          />
          <div className="la-mono mt-1 text-[11px] text-ink-mute">
            We'll suggest subtopics in step 3 · {topic.length} chars
          </div>
        </div>

        <FieldLabel className="mt-4">OR PICK A STARTER</FieldLabel>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {config.starters.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-semibold text-ink-soft hover:border-ink-soft"
            >
              {s}
            </button>
          ))}
        </div>

        <FieldLabel className="mt-4">
          {config.outcomeLabel.toUpperCase()} · WHAT DOES "DONE" LOOK LIKE?
        </FieldLabel>
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          rows={2}
          className="mt-1.5 w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] leading-relaxed text-ink outline-none focus:border-brand-1"
        />
        <div className="mt-2 flex flex-wrap gap-1.5">
          {config.outcomeOptions.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:border-ink-soft"
            >
              {o}
            </button>
          ))}
        </div>
      </div>

      <TutorPanel
        accent={accent}
        kicker="HELPING YOU FRAME THIS"
        body={config.tutorWhisper}
        why={config.whyPrompt}
      />
    </div>
  );
}

function Step2Sources({
  sources,
  setSources,
  draft,
  setDraft,
  accent,
}: {
  sources: string[];
  setSources: (s: string[]) => void;
  draft: string;
  setDraft: (s: string) => void;
  accent: Accent;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div
          className="rounded-2xl border border-dashed p-5 text-center"
          style={{ borderColor: accent.color, background: accent.soft }}
        >
          <div className="text-[26px]" aria-hidden>
            📄
          </div>
          <div className="mt-1 text-[14px] font-extrabold text-ink">
            Drop a PDF, image, or paste a link
          </div>
          <div className="la-mono mt-1 text-[11px] text-ink-mute">
            up to 50 MB · PDF · DOCX · PPTX · JPG · YouTube · Wikipedia URL
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              className="la-btn ghost"
              disabled
              style={{ padding: "8px 12px", fontSize: 12 }}
            >
              📎 Browse files (soon)
            </button>
            <button
              type="button"
              className="la-btn ghost"
              disabled
              style={{ padding: "8px 12px", fontSize: 12 }}
            >
              📸 Snap a worksheet (soon)
            </button>
          </div>
        </div>

        <form
          className="mt-3 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const v = draft.trim();
            if (!v || sources.includes(v)) return;
            setSources([...sources, v]);
            setDraft("");
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Paste a URL (Wikipedia, YouTube, doc link)…"
            className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-[13px] outline-none focus:border-brand-1"
          />
          <button
            type="submit"
            className="la-btn"
            disabled={!draft.trim()}
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            Add link
          </button>
        </form>

        <FieldLabel className="mt-4">
          ADDED · {sources.length} SOURCE{sources.length === 1 ? "" : "S"}
        </FieldLabel>
        <div className="mt-2 space-y-1.5">
          {sources.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line bg-surface-soft px-3 py-2 text-[12px] text-ink-mute">
              No sources yet — that's fine. The tutor will generate from scratch.
            </div>
          ) : (
            sources.map((s) => (
              <div
                key={s}
                className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2.5"
              >
                <div
                  className="grid h-9 w-9 flex-none place-items-center rounded-md text-[15px]"
                  style={{ background: "var(--surface-soft)" }}
                >
                  🔗
                </div>
                <div className="min-w-0 flex-1 truncate text-[13px] font-bold text-ink">{s}</div>
                <button
                  type="button"
                  onClick={() => setSources(sources.filter((x) => x !== s))}
                  className="text-ink-mute hover:text-ink"
                  aria-label="Remove source"
                >
                  ✕
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <TutorPanel
        accent={accent}
        kicker="READING YOUR SOURCES"
        body="Anchoring to real materials means questions match your teacher's style and every citation links back to the source."
        why="Worked-example → twin-problem retention beats unsourced generation (Sweller, 1985)."
      />
    </div>
  );
}

function Step3Pace({
  daysPerWeek,
  setDaysPerWeek,
  minutesPerDay,
  setMinutesPerDay,
  prefs,
  setPrefs,
  paceCopy,
  accent,
}: {
  daysPerWeek: number;
  setDaysPerWeek: (n: number) => void;
  minutesPerDay: number;
  setMinutesPerDay: (n: number) => void;
  prefs: string[];
  setPrefs: (p: string[]) => void;
  paceCopy: string;
  accent: Accent;
}) {
  function togglePref(id: string) {
    setPrefs(prefs.includes(id) ? prefs.filter((p) => p !== id) : [...prefs, id]);
  }
  const weeklyMin = daysPerWeek * minutesPerDay;
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <PaceCounter
            label="Days per week"
            value={daysPerWeek}
            min={1}
            max={7}
            onChange={setDaysPerWeek}
            sub="weekends optional"
          />
          <PaceCounter
            label="Minutes per day"
            value={minutesPerDay}
            min={5}
            max={120}
            step={5}
            onChange={setMinutesPerDay}
            sub="a class period or two"
          />
        </div>

        <div
          className="mt-4 rounded-2xl p-4"
          style={{ background: accent.soft, border: `1px solid ${accent.color}33` }}
        >
          <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            WEEKLY BUDGET
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[28px] font-extrabold" style={{ color: accent.color }}>
              {weeklyMin}
            </span>
            <span className="la-mono text-[12px] text-ink-mute">minutes / week</span>
          </div>
          <div className="mt-1 text-[12px] text-ink-soft">{paceCopy}</div>
        </div>

        <FieldLabel className="mt-5">HOW YOU LEARN BEST · PICK 2–3</FieldLabel>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {FORMAT_PREFS.map((p) => {
            const on = prefs.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => togglePref(p.id)}
                className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-extrabold transition"
                style={{
                  background: on ? "var(--brand-grad)" : "#fff",
                  color: on ? "#fff" : "var(--ink)",
                  border: on ? "none" : "1px solid var(--line)",
                }}
                aria-pressed={on}
              >
                <span className="text-[16px]" aria-hidden>
                  {p.icon}
                </span>
                <span className="flex-1 text-left">{p.label}</span>
                {on ? <span aria-hidden>✓</span> : null}
              </button>
            );
          })}
        </div>
      </div>

      <TutorPanel
        accent={accent}
        kicker="BUDGET CHECK"
        body={
          weeklyMin < 60
            ? "Tight. We'll trim to the highest-leverage 2 sub-topics — better to master 2 than skim 6."
            : weeklyMin < 150
              ? "That's a workable cadence. We can hit mastery on 3 sub-topics in the timeline."
              : "Generous budget — we'll add interleaving + spaced reviews for the long tail."
        }
        why="Time-on-task is the single best predictor of mastery. Honest input here makes the plan realistic."
      />
    </div>
  );
}

function Step4Plan({ config, accent }: { config: WizardConfig; accent: Accent }) {
  const plan = config.samplePlan;
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <div
          className="rounded-2xl border p-4"
          style={{ background: accent.soft, borderColor: accent.color, borderWidth: 1.5 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="la-pill text-[11px]"
              style={{ background: accent.color, color: "#fff" }}
            >
              {config.slug.toUpperCase()} PROJECT
            </span>
            <span
              className="la-pill text-[11px]"
              style={{
                background: "#fff",
                boxShadow: `0 0 0 1px ${accent.color}55`,
                color: accent.color,
              }}
            >
              Idea → ready
            </span>
          </div>
          <h3 className="mt-1.5 text-[20px] font-extrabold tracking-[-0.01em] text-ink">
            {plan.title}
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{plan.summary}</p>
          <div className="mt-2.5 flex flex-wrap gap-3 text-[12px] text-ink-soft">
            {plan.metaChips.map((m) => (
              <span key={m}>· {m}</span>
            ))}
          </div>
        </div>

        {plan.weeks.length > 0 ? (
          <>
            <FieldLabel className="mt-5">WEEK-BY-WEEK</FieldLabel>
            <div className="mt-2 space-y-1.5">
              {plan.weeks.map((w) => (
                <WeekRow key={w.label} week={w} accent={accent} />
              ))}
            </div>
          </>
        ) : null}
      </div>

      <div>
        <div className="rounded-2xl border border-line bg-white p-4">
          <FieldLabel>METHODS · TUNED FOR YOU</FieldLabel>
          <div className="mt-2 space-y-1.5">
            {plan.methods.map((m, i) => (
              <div key={m.title} className="flex items-center gap-2.5 text-[12.5px]">
                <span className="la-mono w-4 text-[10px] text-ink-mute">{i + 1}</span>
                <span className="text-[15px]" aria-hidden>
                  {m.icon}
                </span>
                <span className="flex-1 font-extrabold text-ink">{m.title}</span>
                <span className="la-mono text-[10px] text-ink-mute">{m.reason}</span>
              </div>
            ))}
          </div>
        </div>

        {plan.projection ? (
          <div
            className="mt-3 rounded-2xl p-4"
            style={{ background: accent.soft, border: `1px solid ${accent.color}33` }}
          >
            <FieldLabel>PROJECTED · ON-PLAN</FieldLabel>
            <div className="mt-1 flex items-baseline gap-2">
              <span
                className="text-[34px] font-extrabold"
                style={{ color: accent.color, fontFamily: "var(--font-serif), Georgia, serif" }}
              >
                {plan.projection.value}
              </span>
              <span className="la-mono text-[12px] text-ink-mute">{plan.projection.unit}</span>
            </div>
            <div className="mt-1 text-[12px] leading-relaxed text-ink-soft">
              {plan.projection.note}
            </div>
          </div>
        ) : null}

        <div className="mt-3 rounded-xl border border-dashed border-line bg-white p-3.5">
          <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            Sharing (soon)
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            <button
              type="button"
              className="la-btn ghost"
              disabled
              style={{ padding: "6px 10px", fontSize: 11 }}
            >
              👨‍🏫 Share with teacher
            </button>
            <button
              type="button"
              className="la-btn ghost"
              disabled
              style={{ padding: "6px 10px", fontSize: 11 }}
            >
              👪 Notify a parent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────── Calm variant steps ───────── */
function CalmStep1({
  config,
  topic,
  setTopic,
  accent,
}: {
  config: WizardConfig;
  topic: string;
  setTopic: (v: string) => void;
  accent: Accent;
}) {
  return (
    <div>
      <div className="la-mono text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
        Popular topics
      </div>
      <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {config.starters.map((s) => {
          const on = s === topic;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setTopic(s)}
              className="flex items-center gap-3 rounded-2xl p-4 text-left transition"
              style={{
                background: on ? accent.soft : "#fff",
                border: on ? `2px solid ${accent.color}` : "1.5px solid var(--line)",
              }}
              aria-pressed={on}
            >
              <span className="text-[28px]" aria-hidden>
                {s.split(" ")[0]}
              </span>
              <div className="flex-1">
                <div className="text-[17px] font-extrabold text-ink">{s}</div>
              </div>
              {on ? (
                <span style={{ color: accent.color, fontSize: 22 }} aria-hidden>
                  ✓
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="la-mono mt-5 text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
        Or tell us
      </div>
      <input
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder={config.placeholder}
        className="mt-2 w-full rounded-xl border border-line bg-surface-soft px-4 py-3.5 text-[17px] outline-none focus:border-brand-1"
      />
    </div>
  );
}

function CalmStep2({
  config,
  outcome,
  setOutcome,
  accessibility,
  setAccessibility,
  accent,
}: {
  config: WizardConfig;
  outcome: string;
  setOutcome: (v: string) => void;
  accessibility: string[];
  setAccessibility: (s: string[]) => void;
  accent: Accent;
}) {
  function toggle(id: string) {
    setAccessibility(
      accessibility.includes(id) ? accessibility.filter((x) => x !== id) : [...accessibility, id]
    );
  }
  const options = [
    { id: "bigger", label: "Bigger text" },
    { id: "contrast", label: "High contrast" },
    { id: "readaloud", label: "Read aloud" },
    { id: "slower", label: "Slower pace" },
  ];
  return (
    <div>
      <div className="la-mono text-[12px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
        How much each day
      </div>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {config.outcomeOptions.map((o) => {
          const on = o === outcome;
          return (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className="rounded-xl px-3 py-3 text-[15px] font-extrabold transition"
              style={{
                background: on ? accent.color : "#fff",
                color: on ? "#fff" : "var(--ink)",
                border: on ? "none" : "1.5px solid var(--line)",
              }}
              aria-pressed={on}
            >
              {o}
            </button>
          );
        })}
      </div>

      <div
        className="mt-5 rounded-2xl p-4"
        style={{ background: accent.soft, border: `1px solid ${accent.color}33` }}
      >
        <div className="text-[14px] font-extrabold text-ink">Make it comfortable for you</div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {options.map((o) => {
            const on = accessibility.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                className="rounded-full px-3.5 py-2 text-[13px] font-extrabold transition"
                style={{
                  background: on ? accent.color : "#fff",
                  color: on ? "#fff" : "var(--ink)",
                  border: on ? "none" : "1px solid var(--line)",
                }}
                aria-pressed={on}
              >
                {on ? "✓ " : ""}
                {o.label}
              </button>
            );
          })}
        </div>
        <div className="mt-2.5 text-[12px] leading-relaxed text-ink-soft">
          You can change these any time from the teacher's tray.
        </div>
      </div>
    </div>
  );
}

/* ────────── Helpers ───────── */
type Accent = { color: string; soft: string; bg: string; gradient: string };
function useAccent(journey: Journey): Accent {
  return useMemo(
    () => ({
      color: journey.color,
      soft: journey.soft,
      bg: journey.bg,
      gradient: `linear-gradient(135deg, ${journey.color}, var(--brand-2))`,
    }),
    [journey]
  );
}

function PaceCounter({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  sub,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5" style={{ borderWidth: 1.5 }}>
      <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="hover:bg-bg-2 grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-lg"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          −
        </button>
        <span
          className="min-w-[60px] text-center text-[28px] font-extrabold tabular-nums"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="hover:bg-bg-2 grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-lg"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          +
        </button>
      </div>
      <div className="la-mono mt-1 text-[11px] text-ink-mute">{sub}</div>
    </div>
  );
}

function TutorPanel({
  accent,
  kicker,
  body,
  why,
}: {
  accent: Accent;
  kicker: string;
  body: string;
  why: string;
}) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: accent.soft, border: `1px solid ${accent.color}33` }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="grid h-9 w-9 place-items-center rounded-full text-[16px]"
          style={{ background: accent.bg }}
        >
          ✨
        </div>
        <div>
          <div className="text-[13px] font-extrabold text-ink">Your tutor</div>
          <div className="la-mono text-[10px] uppercase tracking-[0.08em] text-ink-mute">
            {kicker}
          </div>
        </div>
      </div>
      <p className="mt-2.5 text-[13px] leading-relaxed text-ink">{body}</p>
      <div className="mt-3 rounded-md border border-line bg-white p-2.5">
        <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
          Why you're seeing this prompt
        </div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">{why}</p>
      </div>
    </div>
  );
}

function WeekRow({
  week,
  accent,
}: {
  week: {
    label: string;
    date: string;
    title: string;
    methods: string;
    highlight?: boolean;
    dim?: boolean;
  };
  accent: Accent;
}) {
  return (
    <div
      className="grid items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13px]"
      style={{
        gridTemplateColumns: "minmax(48px,auto) minmax(76px,auto) minmax(0,1fr) auto",
        background: week.highlight ? "#fff" : "var(--surface-soft)",
        border: week.highlight ? `1.5px solid ${accent.color}` : "1px solid var(--line-soft)",
        opacity: week.dim ? 0.75 : 1,
      }}
    >
      <span className="la-mono text-[11px] font-extrabold uppercase tracking-[0.04em] text-ink-mute">
        {week.label}
      </span>
      <span className="la-mono text-[11px] text-ink-mute">{week.date}</span>
      <span className="font-extrabold text-ink">
        {week.title}
        {week.highlight ? (
          <span
            className="la-pill ml-1.5 text-[9px]"
            style={{ background: "#fee2e2", color: "#991b1b", padding: "2px 6px" }}
          >
            WEAK SPOT
          </span>
        ) : null}
      </span>
      <span
        className="la-mono text-right text-[10px] font-extrabold"
        style={{ color: accent.color }}
      >
        {week.methods}
      </span>
    </div>
  );
}

function ToggleRow({
  label,
  on,
  setOn,
}: {
  label: string;
  on: boolean;
  setOn: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => setOn(!on)}
      className="flex w-full items-center justify-between rounded-md border border-line bg-white px-3 py-2 text-[13px] font-semibold"
      aria-pressed={on}
    >
      <span>{label}</span>
      <span
        className="relative inline-block h-[18px] w-8 rounded-full"
        style={{ background: on ? "var(--ok, #16a34a)" : "var(--ink-faint)" }}
      >
        <span
          className="absolute top-[2px] grid h-[14px] w-[14px] place-items-center rounded-full bg-white transition-all"
          style={{ left: on ? 16 : 2 }}
        />
      </span>
    </button>
  );
}

function SafetyRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-t border-line-soft py-1.5 first:border-t-0 first:pt-0">
      <span className="text-[12px] text-ink-mute">{label}</span>
      <span className="la-mono text-right text-[11px] font-extrabold text-ink">{value}</span>
    </div>
  );
}

function FieldLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute ${className ?? ""}`}
    >
      {children}
    </div>
  );
}

function SectionLabel({
  n,
  children,
  className,
}: {
  n?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute ${className ?? ""}`}
    >
      {n != null ? `${n} · ` : ""}
      {children}
    </div>
  );
}

function parseLength(value: string, fallback: number): number {
  const m = /([0-9]+)\s*min/i.exec(value);
  return m ? Number(m[1]) : fallback;
}
