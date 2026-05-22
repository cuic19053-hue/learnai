"use client";

import type { JobBrief, Seniority } from "@/lib/interview/types";

const SENIORITIES: Seniority[] = [
  "intern",
  "junior",
  "mid",
  "senior",
  "staff",
  "lead",
  "manager",
  "director",
  "executive",
];

export default function JobStep({
  value,
  onChange,
}: {
  value: Partial<JobBrief>;
  onChange: (v: Partial<JobBrief>) => void;
}) {
  function update<K extends keyof JobBrief>(key: K, v: JobBrief[K]) {
    onChange({ ...value, [key]: v });
  }
  return (
    <div className="max-w-[760px]">
      <p className="mt-2 text-[15px] text-ink-soft">
        Paste the job posting. The more detail, the better the training plan.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <Field label="Company">
          <input
            type="text"
            maxLength={120}
            placeholder="e.g. Acme Cloud"
            value={value.companyName ?? ""}
            onChange={(e) => update("companyName", e.target.value)}
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
        </Field>
        <Field label="Role title">
          <input
            type="text"
            maxLength={140}
            placeholder="e.g. AI Engineering Team Lead"
            value={value.roleTitle ?? ""}
            onChange={(e) => update("roleTitle", e.target.value)}
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
        </Field>
        <Field label="Seniority">
          <select
            value={value.seniority ?? ""}
            onChange={(e) => update("seniority", (e.target.value || undefined) as Seniority)}
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          >
            <option value="">Unspecified</option>
            {SENIORITIES.map((s) => (
              <option key={s} value={s}>
                {cap(s)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Job link (optional)">
          <input
            type="url"
            maxLength={500}
            placeholder="https://…"
            value={value.jobUrl ?? ""}
            onChange={(e) => update("jobUrl", e.target.value)}
            className="w-full rounded-xl border border-line bg-white p-3 text-[15px] focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
          />
        </Field>
      </div>

      <Field label="Job description" className="mt-4">
        <textarea
          rows={10}
          maxLength={20_000}
          placeholder="Paste the full job description here…"
          value={value.jobDescription ?? ""}
          onChange={(e) => update("jobDescription", e.target.value)}
          className="w-full resize-y rounded-xl border border-line bg-white p-3 text-[14px] leading-relaxed focus:border-brand-1 focus:outline-none focus:ring-4 focus:ring-brand-1/10"
        />
        <div className="mt-1 text-xs text-ink-mute">
          {(value.jobDescription ?? "").length.toLocaleString()} characters
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

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
