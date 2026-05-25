"use client";

/**
 * Four-step "create or update" wizard for community certification packs.
 *
 *   1. Start — choose Scratch or New version of existing pack
 *   2. Sources — paste official vendor URLs (allowlist-enforced server-side)
 *   3. Generate — kick off AI generation in batches; show counts as they arrive
 *   4. Publish — confirm, flip live, link to the pack
 *
 * The wizard is intentionally a thin client over the existing user-facing
 * API routes — all validation, citation enforcement, and rate limiting
 * happens on the server. The client just orchestrates the flow.
 */

import { useState } from "react";
import Link from "next/link";

export type ExistingPack = {
  slug: string;
  code: string;
  title: string;
  vendor: string;
};

type Vendor = "AWS" | "AZURE" | "GCP" | "IBM" | "OTHER";
type Level =
  | "FOUNDATIONAL"
  | "FUNDAMENTALS"
  | "ASSOCIATE"
  | "PROFESSIONAL"
  | "EXPERT"
  | "SPECIALTY"
  | "ADVANCED"
  | "OTHER";
type SourceType =
  | "official_certification_page"
  | "official_exam_guide"
  | "official_learning_path"
  | "official_docs_index";

type StepKey = "start" | "sources" | "generate" | "publish";

const STEPS: { key: StepKey; label: string; sub: string }[] = [
  { key: "start", label: "1 · Start", sub: "Scratch or new version" },
  { key: "sources", label: "2 · Sources", sub: "Official vendor URLs" },
  { key: "generate", label: "3 · Generate", sub: "AI · cited · reviewed" },
  { key: "publish", label: "4 · Publish", sub: "Make it live" },
];

type PackState = {
  id: string;
  slug: string;
  title: string;
};

type SourceRow = { id: string; title: string; url: string; sourceType: SourceType };

export default function CreatePackWizard({ existing }: { existing: ExistingPack[] }) {
  const [step, setStep] = useState<StepKey>("start");
  const [pack, setPack] = useState<PackState | null>(null);
  const [sources, setSources] = useState<SourceRow[]>([]);
  const [questionsCreated, setQuestionsCreated] = useState(0);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mt-6">
      <StepNav step={step} />

      <div
        className="mt-5 rounded-2xl border border-[var(--line)] bg-white p-6 shadow-sm"
        style={{ minHeight: 360 }}
      >
        {error ? (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[13px] font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        {step === "start" ? (
          <StartStep
            existing={existing}
            onPackCreated={(p) => {
              setPack(p);
              setError(null);
              setStep("sources");
            }}
            onError={setError}
          />
        ) : null}

        {step === "sources" && pack ? (
          <SourcesStep
            pack={pack}
            sources={sources}
            onAdd={(s) => setSources((prev) => [...prev, s])}
            onError={setError}
            onContinue={() => {
              if (sources.length === 0) {
                setError("Add at least one official source before generating.");
                return;
              }
              setError(null);
              setStep("generate");
            }}
            onBack={() => setStep("start")}
          />
        ) : null}

        {step === "generate" && pack ? (
          <GenerateStep
            pack={pack}
            questionsCreated={questionsCreated}
            onCreated={(n) => setQuestionsCreated((prev) => prev + n)}
            onError={setError}
            onContinue={() => {
              if (questionsCreated === 0) {
                setError("Generate at least one question before publishing.");
                return;
              }
              setError(null);
              setStep("publish");
            }}
            onBack={() => setStep("sources")}
          />
        ) : null}

        {step === "publish" && pack ? (
          <PublishStep
            pack={pack}
            sourceCount={sources.length}
            questionCount={questionsCreated}
            onError={setError}
          />
        ) : null}
      </div>

      <BestPracticesNote />
    </div>
  );
}

function StepNav({ step }: { step: StepKey }) {
  return (
    <ol className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {STEPS.map((s) => {
        const active = s.key === step;
        const done =
          STEPS.findIndex((x) => x.key === step) > STEPS.findIndex((x) => x.key === s.key);
        return (
          <li
            key={s.key}
            className="rounded-xl px-3 py-2"
            style={{
              background: active ? "var(--ink)" : done ? "#ecfdf5" : "var(--surface-soft)",
              color: active ? "#fff" : done ? "#047857" : "var(--ink-soft)",
              border: active ? "none" : "1px solid var(--line)",
            }}
          >
            <div className="text-[11px] font-bold tracking-[.08em]">{s.label}</div>
            <div className="text-[12px] opacity-90">{s.sub}</div>
          </li>
        );
      })}
    </ol>
  );
}

/* ─── Step 1 · Start ───────────────────────────────────────────────── */

function StartStep({
  existing,
  onPackCreated,
  onError,
}: {
  existing: ExistingPack[];
  onPackCreated: (p: PackState) => void;
  onError: (m: string | null) => void;
}) {
  const [mode, setMode] = useState<"scratch" | "version-of">("scratch");
  const [submitting, setSubmitting] = useState(false);

  // Scratch state
  const [vendor, setVendor] = useState<Vendor>("AWS");
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState<Level>("ASSOCIATE");
  const [officialUrl, setOfficialUrl] = useState("");
  const [shortDescription, setShortDescription] = useState("");

  // Version state
  const [baseSlug, setBaseSlug] = useState<string>("");
  const [versionTitle, setVersionTitle] = useState("");

  async function submit() {
    setSubmitting(true);
    onError(null);
    try {
      const body =
        mode === "scratch"
          ? {
              from: "scratch",
              vendor,
              code: code.trim(),
              title: title.trim(),
              level,
              officialUrl: officialUrl.trim(),
              shortDescription: shortDescription.trim() || undefined,
            }
          : {
              from: "version-of",
              baseSlug,
              title: versionTitle.trim() || undefined,
            };
      const res = await fetch("/api/certifications/packs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { certification: { id: string; slug: string; title: string } };
        certification?: { id: string; slug: string; title: string };
      };
      const cert = json.data?.certification ?? json.certification;
      if (!res.ok || !cert) {
        onError(json.error ?? "Could not create the pack.");
        return;
      }
      onPackCreated({ id: cert.id, slug: cert.slug, title: cert.title });
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="text-[12.5px] font-bold uppercase tracking-[.12em] text-ink-mute">
        What do you want to create?
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <ModeCard
          active={mode === "scratch"}
          onClick={() => setMode("scratch")}
          eyebrow="New certification"
          title="Create a completely new exam"
          body="Pick a vendor, paste the official exam page, and start a fresh question bank."
          icon="✨"
        />
        <ModeCard
          active={mode === "version-of"}
          onClick={() => setMode("version-of")}
          disabled={existing.length === 0}
          eyebrow="New version"
          title="Add a new version to an existing certification"
          body={
            existing.length === 0
              ? "No published packs yet — start with a new certification."
              : "Fork an existing pack as v2, v3… and regenerate questions against the latest vendor docs."
          }
          icon="🔁"
        />
      </div>

      {mode === "scratch" ? (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Vendor">
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value as Vendor)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <option value="AWS">AWS</option>
              <option value="AZURE">Azure</option>
              <option value="GCP">Google Cloud</option>
              <option value="IBM">IBM</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="Level">
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value as Level)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <option value="FUNDAMENTALS">Fundamentals</option>
              <option value="ASSOCIATE">Associate</option>
              <option value="PROFESSIONAL">Professional</option>
              <option value="SPECIALTY">Specialty</option>
              <option value="EXPERT">Expert</option>
              <option value="OTHER">Other</option>
            </select>
          </Field>
          <Field label="Exam code (e.g. SAA-C03)">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              placeholder="SAA-C03"
            />
          </Field>
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              placeholder="AWS Solutions Architect — Associate"
            />
          </Field>
          <Field label="Official exam page (URL, vendor domain)" wide>
            <input
              value={officialUrl}
              onChange={(e) => setOfficialUrl(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              placeholder="https://aws.amazon.com/certification/certified-solutions-architect-associate/"
            />
          </Field>
          <Field label="One-line summary (optional)" wide>
            <input
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              placeholder="Designing distributed systems on AWS"
            />
          </Field>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Base pack to clone" wide>
            <select
              value={baseSlug}
              onChange={(e) => setBaseSlug(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            >
              <option value="">— pick a pack —</option>
              {existing.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.vendor} · {p.code} — {p.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Override title (optional)" wide>
            <input
              value={versionTitle}
              onChange={(e) => setVersionTitle(e.target.value)}
              className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
              placeholder="Leave blank to keep the original title"
            />
          </Field>
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12.5px] text-amber-900 md:col-span-2">
            A new version inherits the official URLs of the base pack but starts with{" "}
            <b>no questions and no sources beyond the official URL</b> — you add fresh sources and
            re-generate against the latest vendor docs.
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={submit}
          disabled={submitting || (mode === "version-of" && !baseSlug)}
          className="rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create draft & continue →"}
        </button>
      </div>
    </div>
  );
}

/* ─── Step 2 · Sources ─────────────────────────────────────────────── */

function SourcesStep({
  pack,
  sources,
  onAdd,
  onError,
  onContinue,
  onBack,
}: {
  pack: PackState;
  sources: SourceRow[];
  onAdd: (s: SourceRow) => void;
  onError: (m: string | null) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [sourceType, setSourceType] = useState<SourceType>("official_certification_page");
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    setSubmitting(true);
    onError(null);
    try {
      const res = await fetch(`/api/certifications/packs/${encodeURIComponent(pack.id)}/sources`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: title.trim(), url: url.trim(), sourceType }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { source: { id: string; title: string; url: string; sourceType: SourceType } };
      };
      if (!res.ok || !json.data?.source) {
        onError(json.error ?? "Could not add this source.");
        return;
      }
      onAdd({
        id: json.data.source.id,
        title: json.data.source.title,
        url: json.data.source.url,
        sourceType: json.data.source.sourceType,
      });
      setTitle("");
      setUrl("");
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[.14em] text-ink-mute">
        {pack.title} · draft
      </div>
      <h2 className="mt-1 text-xl font-extrabold text-ink">Add official sources</h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        Paste links to vendor-owned pages (exam guides, learning paths, docs). Other domains are
        rejected at the server — only sources on the vendor allowlist are accepted.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[180px_1fr_auto] md:items-end">
        <Field label="Source type">
          <select
            value={sourceType}
            onChange={(e) => setSourceType(e.target.value as SourceType)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          >
            <option value="official_certification_page">Certification page</option>
            <option value="official_exam_guide">Exam guide</option>
            <option value="official_learning_path">Learning path</option>
            <option value="official_docs_index">Docs index</option>
          </select>
        </Field>
        <Field label="Title">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            placeholder="SAA-C03 exam guide (PDF)"
          />
        </Field>
        <button
          type="button"
          onClick={submit}
          disabled={submitting || !title.trim() || !url.trim()}
          className="rounded-lg bg-ink px-3 py-2 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Adding…" : "Add source"}
        </button>
        <Field label="URL (vendor domain only)" wide>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
            placeholder="https://d1.awsstatic.com/training-and-certification/.../AWS-SAA-C03-Exam-Guide.pdf"
          />
        </Field>
      </div>

      <div className="mt-5">
        <div className="text-[12px] font-bold uppercase tracking-[.1em] text-ink-mute">
          Added so far · {sources.length}
        </div>
        {sources.length === 0 ? (
          <div className="mt-2 rounded-lg border border-dashed border-[var(--line)] px-3 py-3 text-[12.5px] text-ink-mute">
            No sources yet. Add at least one to enable generation.
          </div>
        ) : (
          <ul className="mt-2 divide-y divide-[var(--line-soft)] rounded-lg border border-[var(--line)] bg-white">
            {sources.map((s) => (
              <li key={s.id} className="px-3 py-2 text-[13px]">
                <div className="font-bold text-ink">{s.title}</div>
                <div className="truncate text-[11.5px] text-ink-mute">{s.url}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-[13px] font-bold text-ink-soft"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white"
        >
          Continue to generate →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3 · Generate ────────────────────────────────────────────── */

function GenerateStep({
  pack,
  questionsCreated,
  onCreated,
  onError,
  onContinue,
  onBack,
}: {
  pack: PackState;
  questionsCreated: number;
  onCreated: (n: number) => void;
  onError: (m: string | null) => void;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("MEDIUM");
  const [submitting, setSubmitting] = useState(false);

  async function generate() {
    setSubmitting(true);
    onError(null);
    try {
      const res = await fetch(`/api/certifications/packs/${encodeURIComponent(pack.id)}/generate`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ count, difficulty }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { created: number };
      };
      if (!res.ok) {
        onError(json.error ?? "Generation failed.");
        return;
      }
      const created = json.data?.created ?? 0;
      if (created === 0) {
        onError(
          "AI returned no usable questions — try again, or check that your sources cover the topic."
        );
      }
      onCreated(created);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[.14em] text-ink-mute">
        {pack.title} · draft
      </div>
      <h2 className="mt-1 text-xl font-extrabold text-ink">Generate citation-grounded questions</h2>
      <p className="mt-1 text-[13px] text-ink-soft">
        Every question must cite one of the sources you added. Distractors are written in-style.
        Generate in small batches and re-roll until you&apos;re happy.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <Field label="Batch size">
          <input
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 5)))}
            className="w-24 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          />
        </Field>
        <Field label="Difficulty">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as "EASY" | "MEDIUM" | "HARD")}
            className="w-32 rounded-lg border border-[var(--line)] px-3 py-2 text-sm"
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </Field>
        <button
          type="button"
          onClick={generate}
          disabled={submitting}
          className="rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Generating…" : "Generate batch"}
        </button>
        <div className="ml-auto rounded-full bg-[#ecfdf5] px-3 py-1 text-[12px] font-bold text-emerald-700">
          ✓ {questionsCreated} questions ready
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-[13px] font-bold text-ink-soft"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={questionsCreated === 0}
          className="rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
        >
          Continue to publish →
        </button>
      </div>
    </div>
  );
}

/* ─── Step 4 · Publish ─────────────────────────────────────────────── */

function PublishStep({
  pack,
  sourceCount,
  questionCount,
  onError,
}: {
  pack: PackState;
  sourceCount: number;
  questionCount: number;
  onError: (m: string | null) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [published, setPublished] = useState(false);

  async function publish() {
    setSubmitting(true);
    onError(null);
    try {
      const res = await fetch(`/api/certifications/packs/${encodeURIComponent(pack.id)}/publish`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "ACTIVE" }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok) {
        onError(json.error ?? "Publish failed.");
        return;
      }
      setPublished(true);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  if (published) {
    return (
      <div className="text-center">
        <div className="text-4xl">✨</div>
        <h2 className="mt-3 text-2xl font-extrabold text-ink">Your pack is live</h2>
        <p className="mt-1 text-[13.5px] text-ink-soft">
          Tagged <span className="font-bold">{pack.slug}</span>. Anyone with the link can practice
          now.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href={`/learn/certifications/${pack.slug}`}
            className="rounded-lg bg-ink px-4 py-2 text-[13px] font-bold text-white"
          >
            Open the pack →
          </Link>
          <Link
            href="/learn/certifications"
            className="rounded-lg border border-[var(--line)] bg-white px-4 py-2 text-[13px] font-bold text-ink-soft"
          >
            Back to the hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-extrabold text-ink">Publish &quot;{pack.title}&quot;</h2>
      <ul className="mt-3 space-y-1.5 text-[13.5px] text-ink-soft">
        <li>
          <b>Slug:</b> <code>{pack.slug}</code>
        </li>
        <li>
          <b>Sources:</b> {sourceCount} · <b>Questions:</b> {questionCount}
        </li>
        <li>
          <b>Visibility:</b> public after publish — anyone with the link can practice.
        </li>
      </ul>
      <div className="mt-5 rounded-lg border border-[var(--line)] bg-[var(--surface-soft)] p-3 text-[12.5px] text-ink-soft">
        You can come back later to add more sources, generate more questions, or fork this pack as a
        new version.
      </div>
      <div className="mt-5 flex justify-end">
        <button
          type="button"
          onClick={publish}
          disabled={submitting}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white disabled:opacity-50"
        >
          {submitting ? "Publishing…" : "Publish pack"}
        </button>
      </div>
    </div>
  );
}

/* ─── Shared bits ──────────────────────────────────────────────────── */

function ModeCard({
  active,
  disabled,
  onClick,
  eyebrow,
  title,
  body,
  icon,
}: {
  active: boolean;
  disabled?: boolean;
  onClick: () => void;
  eyebrow: string;
  title: string;
  body: string;
  icon: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50"
      style={{
        background: active ? "var(--ink)" : "#fff",
        color: active ? "#fff" : "var(--ink)",
        border: active ? "none" : "1px solid var(--line)",
        boxShadow: active ? "0 6px 18px rgba(2,6,23,.18)" : "0 1px 2px rgba(0,0,0,.04)",
      }}
    >
      <div className="flex items-center gap-2 text-[18px]">{icon}</div>
      <div className="mt-1 text-[10.5px] font-bold uppercase tracking-[.14em] opacity-70">
        {eyebrow}
      </div>
      <div className="mt-1 text-[14px] font-extrabold leading-snug">{title}</div>
      <div className="mt-1 text-[12px] leading-relaxed opacity-80">{body}</div>
    </button>
  );
}

function Field({
  label,
  children,
  wide,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={`block ${wide ? "md:col-span-2" : ""}`}>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-[.1em] text-ink-mute">
        {label}
      </div>
      {children}
    </label>
  );
}

function BestPracticesNote() {
  return (
    <details
      className="mt-6 rounded-2xl"
      style={{ background: "var(--surface-soft)", border: "1px solid var(--line-soft)" }}
    >
      <summary className="cursor-pointer list-none p-4 text-[12.5px] font-bold text-ink-soft">
        Industry best practices baked into this wizard ▾
      </summary>
      <div className="px-4 pb-4 text-[12.5px] leading-relaxed text-ink-soft">
        <b>No copied questions.</b> The AI is instructed to write original prompts; copy/paste from
        third-party question banks is rejected by the citation gate. <b>Vendor allowlist.</b>{" "}
        Sources must live on the official vendor domain — random PDFs and brain dumps are blocked
        server-side. <b>Citations required.</b> Every generated question must cite at least one of
        your sources or it&apos;s discarded. <b>Draft before publish.</b> Packs stay invisible until
        you publish them. <b>Rate-limited.</b> Generation is capped per hour to keep costs bounded.
      </div>
    </details>
  );
}
