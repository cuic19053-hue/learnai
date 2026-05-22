import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";
import { getStoredTest } from "@/lib/wiki/cache";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ testId: string }>;
}): Promise<Metadata> {
  const { testId } = await params;
  const test = getStoredTest(testId);
  return test
    ? {
        title: `${test.article.title} — WikiTest`,
        description: `A ${test.difficulty} ${test.questions.length}-question test on ${test.article.title}, generated from Wikipedia with citations.`,
      }
    : { title: "WikiTest" };
}

const DIFFICULTY_LABEL: Record<string, string> = {
  undergrad: "Undergrad",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const KIND_LABEL: Record<string, string> = {
  multiple_choice: "Multiple choice",
  true_false: "True / false",
  short_answer: "Short answer",
};

export default async function WikiTestDetail({
  params,
}: {
  params: Promise<{ testId: string }>;
}) {
  const { testId } = await params;
  const test = getStoredTest(testId);
  if (!test) notFound();

  const world = WORLDS.scholar;

  // Per-section breakdown — which sections the questions cite.
  const bySection = new Map<string, number>();
  for (const q of test.questions) {
    bySection.set(q.sourceSection, (bySection.get(q.sourceSection) ?? 0) + 1);
  }
  const sectionRows = Array.from(bySection.entries()).sort((a, b) => b[1] - a[1]);

  // Per-kind counts.
  const byKind = new Map<string, number>();
  for (const q of test.questions) {
    byKind.set(q.kind, (byKind.get(q.kind) ?? 0) + 1);
  }

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "wikitest" })}
      pageContext={{ kind: "wiki-detail", topic: test.article.title, worldLabel: world.journey.name }}
    >
      <Link
        href="/learn/wiki"
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to WikiTest
      </Link>

      {/* Header */}
      <div className="mt-3 flex flex-wrap items-baseline justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
            {test.article.title}
          </h1>
          <p className="mt-1 max-w-[760px] text-[15px] leading-relaxed text-ink-soft">
            {test.article.summary}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="la-pill">{DIFFICULTY_LABEL[test.difficulty]}</span>
          <span className="la-pill">{test.questions.length} questions</span>
          <span className="la-pill">~{test.estDurationMin} min</span>
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Link
          href={`/learn/wiki/${testId}/train`}
          className="la-card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5"
          style={{ borderRadius: 20, background: "var(--brand-grad-soft)" }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>🎯</span>
            <h3 className="text-[18px] font-extrabold tracking-tight text-ink">
              Train first
            </h3>
            <span className="la-pill text-[11px]">Recommended</span>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Walk the article with your tutor. We pause at each section for a
            quick check-in — wrong answers reveal the exact paragraph the
            answer came from.
          </p>
          <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-bold text-brand-1">
            Start training →
          </span>
        </Link>
        <Link
          href={`/learn/wiki/${testId}/quiz`}
          className="la-card flex flex-col gap-3 p-5 transition hover:-translate-y-0.5"
          style={{ borderRadius: 20 }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden>📝</span>
            <h3 className="text-[18px] font-extrabold tracking-tight text-ink">
              Take the test
            </h3>
          </div>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Timed, graded, no peeking. You&apos;ll get a readiness scorecard
            with per-section breakdown when you finish.
          </p>
          <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-bold text-ink-soft">
            Begin exam →
          </span>
        </Link>
      </div>

      {/* Breakdown */}
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <section className="la-card p-5" style={{ borderRadius: 18 }}>
          <h2 className="text-[14px] font-extrabold tracking-tight text-ink">
            Section coverage
          </h2>
          <p className="mt-1 text-[12px] text-ink-mute">
            What the test draws from. Each question is cited back to one of
            these headings.
          </p>
          <ul className="mt-3 space-y-2">
            {sectionRows.map(([section, n]) => {
              const pct = Math.round((n / test.questions.length) * 100);
              return (
                <li key={section}>
                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                    <span className="truncate font-bold text-ink">{section}</span>
                    <span className="font-mono text-[11px] text-ink-mute">
                      {n} · {pct}%
                    </span>
                  </div>
                  <div className="wt-meter mt-1">
                    <div className="fill" style={{ width: `${pct}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="la-card p-5" style={{ borderRadius: 18 }}>
          <h2 className="text-[14px] font-extrabold tracking-tight text-ink">
            Question mix
          </h2>
          <p className="mt-1 text-[12px] text-ink-mute">
            Variety keeps it honest — recall, reasoning, and free recall.
          </p>
          <ul className="mt-3 space-y-2">
            {Array.from(byKind.entries()).map(([kind, n]) => (
              <li
                key={kind}
                className="flex items-center justify-between rounded-xl border border-line-soft bg-surface-soft px-3 py-2 text-[13px]"
              >
                <span className="font-bold text-ink">{KIND_LABEL[kind] ?? kind}</span>
                <span className="font-mono text-[12px] text-ink-mute">×{n}</span>
              </li>
            ))}
          </ul>

          <h3 className="mt-5 text-[12px] font-extrabold uppercase tracking-wider text-ink-mute">
            Source
          </h3>
          <a
            href={test.article.canonicalUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="mt-1 block truncate text-[13px] font-bold text-brand-1 hover:underline"
          >
            {test.article.canonicalUrl}
          </a>
          <p className="mt-2 text-[11px] leading-relaxed text-ink-mute">
            Article text © Wikipedia contributors, reused under{" "}
            <a
              className="underline"
              href="https://creativecommons.org/licenses/by-sa/4.0/"
              target="_blank"
              rel="noreferrer noopener"
            >
              CC BY-SA 4.0
            </a>
            .
          </p>
        </section>
      </div>
    </LearnerHomeShell>
  );
}
