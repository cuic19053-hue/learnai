import type { WizardStep, JobBrief, CandidateProfile } from "@/lib/interview/types";

const STEP_LABELS: Record<WizardStep, string> = {
  goal: "Goal",
  job: "Job",
  profile: "Profile",
  analysis: "Fit analysis",
  training: "Training",
  presentation: "5-min pitch",
  simulation: "Simulation",
  report: "Report",
};

export default function WizardSidebar({
  step,
  job,
  profile,
  goal,
}: {
  step: WizardStep;
  job: Partial<JobBrief>;
  profile?: Partial<CandidateProfile>;
  goal?: string;
}) {
  const steps: WizardStep[] = [
    "goal",
    "job",
    "profile",
    "analysis",
    "training",
    "presentation",
    "simulation",
    "report",
  ];
  const currentIdx = steps.indexOf(step);

  return (
    <aside
      className="border-b border-line-soft p-6 lg:border-b-0 lg:border-r"
      style={{ background: "linear-gradient(180deg, var(--bg-2), #fff 60%)" }}
    >
      <div className="la-mono text-[11px] font-bold tracking-[0.08em] text-ink-mute">
        YOUR PREPARATION
      </div>

      {/* Stepper rail */}
      <ol className="mt-3 space-y-1.5">
        {steps.map((s, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          return (
            <li
              key={s}
              className="flex items-center gap-2.5 text-[13px]"
              style={{
                color: active ? "var(--ink)" : done ? "var(--ink-soft)" : "var(--ink-mute)",
                fontWeight: active ? 700 : done ? 600 : 500,
              }}
            >
              <div
                className="grid h-5 w-5 place-items-center rounded-full text-[10px] font-extrabold"
                style={{
                  background: done ? "var(--brand-1)" : active ? "var(--brand-grad)" : "#fff",
                  color: done || active ? "#fff" : "var(--ink-mute)",
                  border: `1.5px solid ${done || active ? "transparent" : "var(--line)"}`,
                }}
              >
                {done ? "✓" : i + 1}
              </div>
              {STEP_LABELS[s]}
            </li>
          );
        })}
      </ol>

      <div className="my-5 h-px bg-line-soft" />

      <Card label="GOAL">{goal ?? "—"}</Card>
      <Card label="JOB">
        {job.companyName || job.roleTitle ? (
          <>
            <strong>{job.roleTitle ?? "Role"}</strong>
            <br />
            <span className="text-ink-soft">@ {job.companyName ?? "Company"}</span>
            {job.seniority ? (
              <span className="block text-xs text-ink-mute">{job.seniority}</span>
            ) : null}
          </>
        ) : (
          <span className="text-ink-mute">Not set</span>
        )}
      </Card>
      <Card label="CANDIDATE">
        {profile?.fullName || profile?.cvText ? (
          <>
            <strong>{profile.fullName ?? "Anonymous"}</strong>
            {profile.yearsExperience != null ? (
              <span className="block text-xs text-ink-mute">{profile.yearsExperience}+ years</span>
            ) : null}
            {profile.mainTech?.length ? (
              <span className="block text-xs text-ink-mute">
                {profile.mainTech.slice(0, 4).join(" · ")}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-ink-mute">Optional</span>
        )}
      </Card>

      <div
        className="mt-5 rounded-xl p-3 text-xs leading-relaxed text-ink-soft"
        style={{ background: "var(--bg-2)" }}
      >
        <strong className="text-ink">Privacy:</strong> your CV and answers stay on your device
        unless you sign in to save progress. We never train models on your data.
      </div>
    </aside>
  );
}

function Card({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="la-card mt-2.5" style={{ padding: 12, borderRadius: 12 }}>
      <div className="text-[10px] font-bold text-ink-mute">{label}</div>
      <div className="mt-1 text-[13px] text-ink">{children}</div>
    </div>
  );
}
