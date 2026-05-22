"use client";

import type { InterviewGoal } from "@/lib/interview/types";

const OPTIONS: Array<{ id: InterviewGoal; emoji: string; title: string; desc: string }> = [
  {
    id: "specific_job",
    emoji: "🎯",
    title: "I have a specific job",
    desc: "Paste the job description and your CV. We tailor everything to that role.",
  },
  {
    id: "general_practice",
    emoji: "🛠️",
    title: "General interview practice",
    desc: "Open drills, common questions, no JD required.",
  },
  {
    id: "role_type",
    emoji: "🧭",
    title: "Prepare for a role type",
    desc: "Pick a generic role (e.g. Senior Backend) and we'll generate a training plan.",
  },
];

export default function GoalStep({
  value,
  onChange,
}: {
  value: InterviewGoal | null;
  onChange: (v: InterviewGoal) => void;
}) {
  return (
    <div>
      <p className="mt-2 max-w-[640px] text-[15px] text-ink-soft">
        What are you preparing for? You can change this later.
      </p>

      <div className="mt-7 grid max-w-[880px] grid-cols-1 gap-3 sm:grid-cols-3">
        {OPTIONS.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              className="la-card flex flex-col p-4 text-left"
              style={{
                border: `1.5px solid ${active ? "var(--brand-1)" : "var(--line-soft)"}`,
                boxShadow: active ? "0 0 0 4px rgba(46,91,255,.08)" : "var(--shadow-1)",
              }}
            >
              <div className="text-3xl" aria-hidden>
                {o.emoji}
              </div>
              <div className="mt-2 text-base font-bold text-ink">{o.title}</div>
              <div className="mt-1 text-[13px] text-ink-soft">{o.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
