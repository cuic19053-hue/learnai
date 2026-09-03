import type { Metadata } from "next";
import LearnerHomeShell from "@/components/learn/shared/LearnerHomeShell";
import WikiUrlInput from "@/components/wiki/WikiUrlInput";
import { buildLearnerNav, WORLDS } from "@/lib/learn/worlds";

export const metadata: Metadata = {
  title: "WikiTest — Paste a Wikipedia URL, get a graded test",
  description:
    "Turn any Wikipedia article into a CEFR-style study session: cited explanations, mixed question types, and a readiness report. Train first, then prove it.",
};

const STEPS: Array<{ n: string; title: string; body: string; tone: string }> = [
  {
    n: "01",
    tone: "var(--l-explain)",
    title: "Read with a tutor",
    body: "We pull the article straight from Wikipedia, strip noise, and walk you through it section by section. Definitions, examples, and one-question check-ins along the way.",
  },
  {
    n: "02",
    tone: "var(--l-practice)",
    title: "Practice as you go",
    body: "Every concept gets a low-stakes drill. Wrong answers reveal the exact paragraph the answer came from — so you learn from the source, not from a hallucination.",
  },
  {
    n: "03",
    tone: "var(--l-feedback)",
    title: "Prove it with the test",
    body: "Take the timed version when you're ready. You get a readiness scorecard with per-section breakdown and a one-tap link back to re-train the weakest part.",
  },
];

const TRUST: Array<{ title: string; body: string }> = [
  {
    title: "Cited from the article",
    body: "Every question lists the exact heading it came from. We drop anything the model can't anchor to real text.",
  },
  {
    title: "Same link → same test",
    body: "Identical URL + settings always return the same test id. Share the link, paste it later — no surprises.",
  },
  {
    title: "Polite to Wikipedia",
    body: "We respect the public REST API: identified User-Agent, 24h cache, and one fetch per article per day.",
  },
];

export default function WikiTestHub() {
  const world = WORLDS.GRADE_9;
  return (
    <LearnerHomeShell
      journey={world.journey}
      learnerInitial={world.learnerInitial}
      worldSlug={world.slug}
      teacherName={world.teacherName}
      teacherEmoji={world.teacherEmoji}
      navItems={buildLearnerNav({ world, active: "wikitest" })}
      pageContext={{ kind: "wiki-hub", worldLabel: world.journey.name }}
    >
      {/* Hero */}
      <section className="la-card relative overflow-hidden p-7 md:p-9" style={{ borderRadius: 28 }}>
        <div className="wt-dots absolute inset-0 opacity-60" aria-hidden />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="la-pill"
              style={{ background: "var(--brand-grad-soft)", color: "var(--brand-2)" }}
            >
              ✨ WikiTest
            </span>
            <span className="la-pill">📚 Any topic on Wikipedia</span>
            <span className="la-pill">🎓 Train · Test · Report</span>
          </div>

          <h1 className="mt-4 max-w-[760px] text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] text-ink md:text-[44px]">
            Paste a Wikipedia link.{" "}
            <span className="bg-gradient-to-br from-[#2e5bff] to-[#7c3aed] bg-clip-text text-transparent">
              Get a graded test.
            </span>
          </h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-ink-soft">
            Any article becomes a study session. We do the reading, the question writing, and the
            grading — every question cited back to a real heading in the source. You bring the
            curiosity.
          </p>

          <div className="mt-6">
            <WikiUrlInput />
          </div>
        </div>
      </section>

      {/* How it works */}
      <h2 className="mt-10 text-lg font-extrabold tracking-tight text-ink">How a session runs</h2>
      <p className="mt-1 text-[13px] text-ink-mute">
        Three steps. Each one earns you XP toward your{" "}
        <span className="font-bold text-ink">{world.journey.name}</span> track.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="la-card p-5" style={{ borderRadius: 20 }}>
            <div className="flex items-center gap-3">
              <span
                className="la-loop-ring"
                style={{ color: step.tone, width: 44, height: 44, fontSize: 16 }}
              >
                {step.n}
              </span>
              <h3 className="text-[16px] font-extrabold tracking-tight text-ink">{step.title}</h3>
            </div>
            <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">{step.body}</p>
          </div>
        ))}
      </div>

      {/* Why it's trustworthy */}
      <h2 className="mt-10 text-lg font-extrabold tracking-tight text-ink">
        Why you can trust the test
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {TRUST.map((card) => (
          <div key={card.title} className="la-card p-5" style={{ borderRadius: 18 }}>
            <h3 className="text-[14px] font-extrabold tracking-tight text-ink">{card.title}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{card.body}</p>
          </div>
        ))}
      </div>

      {/* Attribution */}
      <p className="mt-10 max-w-[760px] text-[12px] leading-relaxed text-ink-mute">
        Article text is sourced live from Wikipedia and reused under the{" "}
        <a
          className="font-bold text-ink-soft underline decoration-line"
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer noopener"
        >
          CC BY-SA 4.0
        </a>{" "}
        license. WikiTest generates new questions and explanations from that text — those are
        licensed back to you under the same terms.
      </p>
    </LearnerHomeShell>
  );
}
