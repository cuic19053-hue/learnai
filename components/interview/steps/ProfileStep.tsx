"use client";

import type { CandidateProfile } from "@/lib/interview/types";

export default function ProfileStep({
  value,
  onChange,
}: {
  value: Partial<CandidateProfile>;
  onChange: (v: Partial<CandidateProfile>) => void;
}) {
  function update<K extends keyof CandidateProfile>(key: K, v: CandidateProfile[K]) {
    onChange({ ...value, [key]: v });
  }

  function onTechChange(raw: string) {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
    update("mainTech", parts);
  }

  return (
    <div className="max-w-[760px]">
      <p className="mt-2 text-[15px] text-ink-soft">
        Adding your CV is optional, but the fit analysis and training questions get sharper with it.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Field label="Full name (optional)">
          <input
            type="text"
            maxLength={120}
            value={value.fullName ?? ""}
            onChange={(e) => update("fullName", e.target.value)}
            placeholder="e.g. Sam Rivera"
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
        </Field>
        <Field label="Years of experience">
          <input
            type="number"
            min={0}
            max={80}
            value={value.yearsExperience ?? ""}
            onChange={(e) =>
              update("yearsExperience", e.target.value ? Number(e.target.value) : undefined)
            }
            placeholder="e.g. 8"
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
        </Field>
        <Field label="LinkedIn URL (optional)">
          <input
            type="url"
            maxLength={300}
            value={value.linkedinUrl ?? ""}
            onChange={(e) => update("linkedinUrl", e.target.value)}
            placeholder="https://linkedin.com/in/…"
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
        </Field>
        <Field label="Main technologies (comma-separated)">
          <input
            type="text"
            value={value.mainTech?.join(", ") ?? ""}
            onChange={(e) => onTechChange(e.target.value)}
            placeholder="Node.js, Python, React, PostgreSQL, LLM, RAG"
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
        </Field>
      </div>

      <Field label="Main leadership experience" className="mt-4">
        <input
          type="text"
          maxLength={2000}
          value={value.mainLeadership ?? ""}
          onChange={(e) => update("mainLeadership", e.target.value)}
          placeholder="e.g. Led a team of 5 engineers building an AI tutoring product"
          className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
        />
      </Field>

      <Field label="CV text (paste here — optional but recommended)" className="mt-4">
        <textarea
          rows={10}
          maxLength={20_000}
          value={value.cvText ?? ""}
          onChange={(e) => update("cvText", e.target.value)}
          placeholder="Paste your CV / resume text here…"
          className="w-full resize-y rounded-xl border border-line bg-white p-3 text-[14px] leading-relaxed focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
        />
        <div className="mt-1 text-xs text-ink-mute">
          {(value.cvText ?? "").length.toLocaleString()} characters · stored only on your device
        </div>
      </Field>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <div className="mb-1.5 text-[13px] font-bold text-ink">{label}</div>
      {children}
    </label>
  );
}
