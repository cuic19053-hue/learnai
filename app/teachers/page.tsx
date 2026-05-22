import type { Metadata } from "next";
import Link from "next/link";
import Mark from "@/components/design/Mark";
import { JOURNEYS } from "@/lib/learn/journeys";
import { TEACHERS } from "@/lib/learn/teachers";

export const metadata: Metadata = {
  title: "AI teachers",
  description: "Meet the AI teacher personas tuned for every learning stage.",
};

export default function TeachersPage() {
  return (
    <main id="main" className="min-h-screen bg-white">
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <Link
            href="/"
            className="text-[13px] font-bold text-ink-soft hover:text-ink"
          >
            ← Back home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10 md:px-10">
        <h1 className="text-3xl font-bold">AI Teacher Gallery</h1>
        <p className="mt-2 text-gray-600">
          Each teacher persona is tuned for one or more learning stages.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {TEACHERS.map((t) => (
            <div key={t.id} className="rounded-xl border p-5">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{t.emoji}</span>
                <h2 className="text-xl font-semibold">{t.name}</h2>
              </div>
              <p className="mt-2 text-gray-700">{t.focus}</p>
              <p className="mt-1 text-sm text-gray-600">{t.style}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.stages.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {s.replace("_", " ").toLowerCase()}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-xl bg-gray-50 p-5">
          <p className="font-semibold">Supported learning stages:</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {JOURNEYS.map((j) => (
              <span key={j.id} className="rounded-full border bg-white px-3 py-1 text-sm">
                {j.emoji} {j.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
