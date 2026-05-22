"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Difficulty = "undergrad" | "intermediate" | "advanced";
type Format = "mixed" | "multiple_choice" | "short_answer" | "true_false";

const SAMPLES: Array<{ label: string; url: string }> = [
  { label: "Calculus", url: "https://en.wikipedia.org/wiki/Calculus" },
  { label: "Differential equation", url: "https://en.wikipedia.org/wiki/Differential_equation" },
  { label: "World War II", url: "https://en.wikipedia.org/wiki/World_War_II" },
  { label: "Photosynthesis", url: "https://en.wikipedia.org/wiki/Photosynthesis" },
];

export default function WikiUrlInput() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("intermediate");
  const [format, setFormat] = useState<Format>("mixed");
  const [count, setCount] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function submit(targetUrl: string) {
    setError(null);
    const trimmed = targetUrl.trim();
    if (trimmed.length < 8) {
      setError("Paste a Wikipedia article URL to get started.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/wiki/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: trimmed, difficulty, format, count }),
        });
        const payload = (await res.json().catch(() => null)) as
          | { ok: true; test: { id: string } }
          | { ok: false; error: string }
          | null;

        if (!res.ok || !payload || payload.ok === false) {
          setError(
            (payload && payload.ok === false && payload.error) ||
              "Couldn't build a test from that article. Try a more substantial topic."
          );
          return;
        }

        router.push(`/learn/wiki/${payload.test.id}`);
      } catch {
        setError("Network hiccup — please try again in a moment.");
      }
    });
  }

  return (
    <div>
      <form
        className="wt-urlbar"
        onSubmit={(e) => {
          e.preventDefault();
          void submit(url);
        }}
        aria-label="Paste Wikipedia article URL"
      >
        <span aria-hidden className="text-xl" style={{ color: "var(--ink-mute)" }}>
          🔗
        </span>
        <input
          type="url"
          inputMode="url"
          placeholder="Paste a Wikipedia article URL — e.g. en.wikipedia.org/wiki/Calculus"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={pending}
          spellCheck={false}
          autoComplete="url"
        />
        <button type="submit" className="la-btn" disabled={pending}>
          {pending ? "Generating…" : "Generate test"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-mute">Try</span>
        {SAMPLES.map((s) => (
          <button
            key={s.url}
            type="button"
            className="wt-chip"
            onClick={() => {
              setUrl(s.url);
              void submit(s.url);
            }}
            disabled={pending}
          >
            {s.label}
            <span className="n">↗</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="la-card flex flex-col gap-1 p-3 text-[12px]">
          <span className="font-extrabold uppercase tracking-wider text-ink-mute">Difficulty</span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={pending}
            className="bg-transparent text-[14px] font-bold text-ink outline-none"
          >
            <option value="undergrad">Undergrad</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label className="la-card flex flex-col gap-1 p-3 text-[12px]">
          <span className="font-extrabold uppercase tracking-wider text-ink-mute">
            Question mix
          </span>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as Format)}
            disabled={pending}
            className="bg-transparent text-[14px] font-bold text-ink outline-none"
          >
            <option value="mixed">Mixed (recommended)</option>
            <option value="multiple_choice">Multiple choice only</option>
            <option value="short_answer">Short answer only</option>
            <option value="true_false">True / false only</option>
          </select>
        </label>
        <label className="la-card flex flex-col gap-1 p-3 text-[12px]">
          <span className="font-extrabold uppercase tracking-wider text-ink-mute">Questions</span>
          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            disabled={pending}
            className="bg-transparent text-[14px] font-bold text-ink outline-none"
          >
            {[5, 8, 10, 15, 20, 30].map((n) => (
              <option key={n} value={n}>
                {n} questions
              </option>
            ))}
          </select>
        </label>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-semibold text-rose-700"
        >
          {error}
        </div>
      ) : null}

      {pending ? (
        <p className="mt-4 text-[12px] text-ink-mute">
          Reading the article and writing your test — this takes 10–25 seconds. Repeat requests with
          the same settings are instant (deduplicated).
        </p>
      ) : null}
    </div>
  );
}
