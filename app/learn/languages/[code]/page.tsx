import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { Arrow } from "@/components/design/icons";
import { findLanguage, LEVELS } from "@/lib/languages/catalog";
import { curriculumFor } from "@/lib/languages/seed";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const lang = findLanguage(code);
  return lang
    ? { title: `${lang.name} (${lang.nativeName})`, description: lang.blurb }
    : { title: "Language" };
}

export default async function LanguageOverview({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const lang = findLanguage(code);
  if (!lang) notFound();

  const world = WORLDS.adult;
  const curriculum = curriculumFor(lang.code);

  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "library" })}
    >
      <Link href="/learn/languages" className="text-[13px] font-bold text-ink-soft hover:text-ink">
        ← Back to all languages
      </Link>

      <div className="mt-3 flex flex-wrap items-baseline gap-3">
        <span className="text-5xl" aria-hidden>
          {lang.flag}
        </span>
        <div>
          <h1 className="text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
            {lang.name}
          </h1>
          <p className="mt-0.5 text-lg font-bold" dir={lang.dir} style={{ color: lang.accent }}>
            {lang.nativeName}
          </p>
        </div>
      </div>
      <p className="mt-2 max-w-[720px] text-[15px] leading-relaxed text-ink-soft">{lang.blurb}</p>

      <h2 className="mt-8 text-lg font-extrabold tracking-tight text-ink">CEFR levels</h2>
      <p className="mt-1 text-[13px] text-ink-mute">
        Each level lists what you can do once you reach it. Tap a card to open the level home with
        modules, drills, and a mock test.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {LEVELS.map((descriptor) => {
          const level = curriculum.find((c) => c.level === descriptor.level);
          const modules = level?.modules.length ?? 0;
          const hasContent = modules > 0;
          return (
            <Link
              key={descriptor.level}
              href={`/learn/languages/${lang.code}/${descriptor.level}`}
              className="la-card group flex flex-col p-5 transition hover:-translate-y-0.5"
              style={{ borderRadius: 18 }}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="rounded-lg px-2 py-1 text-[16px] font-extrabold"
                  style={{ background: `${lang.accent}1f`, color: lang.accent }}
                >
                  {descriptor.level}
                </span>
                <span className="text-[11px] text-ink-mute">≈ {descriptor.hours}h study</span>
              </div>
              <h3 className="mt-2 text-lg font-bold text-ink">{descriptor.label}</h3>
              <p className="mt-1 flex-1 text-[13px] leading-relaxed text-ink-soft">
                {descriptor.canDo}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="la-pill text-[11px]" style={{ background: "var(--bg-2)" }}>
                  {hasContent ? `${modules} modules` : "Coming soon"}
                </span>
                <span
                  className="inline-flex items-center gap-1 text-[13px] font-bold transition-transform group-hover:translate-x-0.5"
                  style={{ color: lang.accent }}
                >
                  Open <Arrow color={lang.accent} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <p className="mt-10 text-[12px] text-ink-mute">
        Curriculum scaffold — A1 ships with seed modules; higher levels are ready for contributors
        to add via PR in{" "}
        <code className="rounded bg-line-soft px-1 py-0.5 text-[11px]">lib/languages/seed.ts</code>.
      </p>
    </LearnerHomeShell>
  );
}
