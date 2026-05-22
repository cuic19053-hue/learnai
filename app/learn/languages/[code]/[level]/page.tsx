import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { Arrow } from "@/components/design/icons";
import { findLanguage, findLevel } from "@/lib/languages/catalog";
import { curriculumFor } from "@/lib/languages/seed";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string; level: string }>;
}): Promise<Metadata> {
  const { code, level } = await params;
  const lang = findLanguage(code);
  const descriptor = findLevel(level);
  if (!lang || !descriptor) return { title: "Language level" };
  return {
    title: `${lang.name} · ${descriptor.level} ${descriptor.label}`,
    description: descriptor.canDo,
  };
}

export default async function LanguageLevelHome({
  params,
}: {
  params: Promise<{ code: string; level: string }>;
}) {
  const { code, level } = await params;
  const lang = findLanguage(code);
  const descriptor = findLevel(level);
  if (!lang || !descriptor) notFound();

  const world = WORLDS.adult;
  const curriculum = curriculumFor(lang.code).find((c) => c.level === descriptor.level);
  const modules = curriculum?.modules ?? [];
  const totalCards = modules.reduce((acc, m) => acc + m.cards.length, 0);
  const hasContent = modules.length > 0;

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <Link
        href={`/learn/languages/${lang.code}`}
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to {lang.name}
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <span className="text-3xl" aria-hidden>
          {lang.flag}
        </span>
        <span
          className="rounded-lg px-2.5 py-1 text-[16px] font-extrabold"
          style={{ background: `${lang.accent}1f`, color: lang.accent }}
        >
          {descriptor.level}
        </span>
        <h1 className="text-2xl font-extrabold tracking-[-0.02em] text-ink md:text-[28px]">
          {lang.name} · {descriptor.label}
        </h1>
      </div>
      <p className="mt-2 max-w-[720px] text-[14px] leading-relaxed text-ink-soft">
        {descriptor.canDo}
      </p>

      {/* Action row */}
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Link
          href={`/learn/languages/${lang.code}/${descriptor.level}/drill`}
          className="la-card group flex flex-col p-5 transition hover:-translate-y-0.5"
          style={{ borderRadius: 18 }}
        >
          <div className="text-3xl" aria-hidden>
            🃏
          </div>
          <h3 className="mt-2 text-lg font-bold text-ink">Flashcard drill</h3>
          <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-soft">
            {hasContent
              ? `${totalCards} card${totalCards === 1 ? "" : "s"} across ${modules.length} module${modules.length === 1 ? "" : "s"}. Reveal, self-rate, repeat.`
              : "Modules aren't seeded yet for this level."}
          </p>
          <span
            className="mt-4 inline-flex items-center gap-1 self-start rounded-xl px-4 py-2 text-[13px] font-bold text-white"
            style={{ background: hasContent ? lang.accent : "var(--ink-mute)" }}
          >
            {hasContent ? "Start drill" : "Empty — contribute"}
            <span className="transition-transform group-hover:translate-x-1">
              <Arrow color="#fff" />
            </span>
          </span>
        </Link>

        <div className="la-card flex flex-col p-5" style={{ borderRadius: 18 }}>
          <div className="text-3xl" aria-hidden>
            📝
          </div>
          <h3 className="mt-2 text-lg font-bold text-ink">CEFR-style mock test</h3>
          <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-soft">
            Author-original questions designed around the {descriptor.level} can-do statements.{" "}
            {curriculum?.mockCount ?? 0} items planned per attempt.
          </p>
          <span
            className="mt-4 inline-flex items-center gap-1 self-start rounded-xl px-4 py-2 text-[13px] font-bold text-ink-soft"
            style={{ background: "var(--bg-2)" }}
          >
            Coming soon
          </span>
        </div>
      </div>

      {/* Module list */}
      <h2 className="mt-10 text-lg font-extrabold tracking-tight text-ink">Modules</h2>
      {!hasContent ? (
        <div className="la-card mt-3 p-5 text-[14px] text-ink-soft" style={{ borderRadius: 16 }}>
          No modules yet at <strong>{descriptor.level}</strong> for {lang.name}. Contribute via PR
          in{" "}
          <code className="rounded bg-line-soft px-1 py-0.5 text-[12px]">
            lib/languages/seed.ts
          </code>
          .
        </div>
      ) : (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {modules.map((m) => (
            <article key={m.id} className="la-card p-4" style={{ borderRadius: 14 }}>
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-[15px] font-bold text-ink">{m.title}</h3>
                <span className="la-pill text-[10px]" style={{ background: "var(--bg-2)" }}>
                  {m.cards.length} cards
                </span>
              </div>
              <div className="mt-1 text-[12px] text-ink-mute">{m.topic}</div>
            </article>
          ))}
        </div>
      )}
    </LearnerHomeShell>
  );
}
