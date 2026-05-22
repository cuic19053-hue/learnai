import type { Metadata } from "next";
import Link from "next/link";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import { Arrow } from "@/components/design/icons";
import { LANGUAGES, LEVELS } from "@/lib/languages/catalog";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "Languages",
  description:
    "Learn German, Russian, Japanese, Chinese, Arabic, Spanish, and English. CEFR-aligned A1 to B2.",
};

export default function LanguagesHub() {
  const world = WORLDS.adult;
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
        href={world.homePath}
        className="text-[13px] font-bold text-ink-soft hover:text-ink"
      >
        ← Back to {world.journey.name} home
      </Link>
      <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[34px]">
        Languages
      </h1>
      <p className="mt-1 max-w-[720px] text-[15px] text-ink-soft">
        Seven languages. Four CEFR levels — A1 to B2. We focus on the practical
        floor of fluency: from your first words to confident, independent use.
      </p>

      {/* Level legend */}
      <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {LEVELS.map((l) => (
          <div key={l.level} className="la-card p-3" style={{ borderRadius: 14 }}>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-extrabold text-brand-1">{l.level}</span>
              <span className="text-[10px] text-ink-mute">{l.hours}h</span>
            </div>
            <div className="mt-0.5 text-[13px] font-bold text-ink">{l.label}</div>
          </div>
        ))}
      </div>

      {/* Language grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LANGUAGES.map((lang) => (
          <Link
            key={lang.code}
            href={`/learn/languages/${lang.code}`}
            className="la-card group flex flex-col p-5 transition hover:-translate-y-0.5"
            style={{ borderRadius: 18 }}
          >
            <div className="flex items-baseline justify-between">
              <span className="text-4xl" aria-hidden>
                {lang.flag}
              </span>
              <span
                className="la-pill text-[11px]"
                style={{ background: `${lang.accent}1f`, color: lang.accent }}
              >
                A1 → B2
              </span>
            </div>
            <h3 className="mt-3 text-xl font-extrabold text-ink">{lang.name}</h3>
            <p
              className="mt-0.5 text-[14px] font-bold"
              dir={lang.dir}
              style={{ color: lang.accent }}
            >
              {lang.nativeName}
            </p>
            <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-soft">
              {lang.blurb}
            </p>
            <span
              className="mt-4 inline-flex items-center gap-1 self-start text-[13px] font-bold transition-transform group-hover:translate-x-0.5"
              style={{ color: lang.accent }}
            >
              Open <Arrow color={lang.accent} />
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-10 max-w-[760px] text-[12px] leading-relaxed text-ink-mute">
        Curriculum based on the public CEFR framework (Council of Europe). Mock
        tests are CEFR-aligned originals — they are not affiliated with, endorsed
        by, or compatible substitutes for TOEFL, IELTS, JLPT, HSK, DELE, TestDaF,
        TORFL, or any other proprietary language certification.
      </p>
    </LearnerHomeShell>
  );
}
