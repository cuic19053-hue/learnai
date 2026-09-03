import type { Metadata } from "next";
import { Crumbs, PageHeader } from "@/components/admin/shared";

export const metadata: Metadata = { title: "Admin · Worlds" };

const WORLDS = [
  {
    n: "Little Learner",
    ic: "🦁",
    ages: "3–6",
    c: "#ec4899",
    bg: "#fce0ec",
    active: true,
    count: 312,
    teacher: "Milo the Owl",
    voice: "on",
    avatar: "on",
    safety: "strict",
    samples: ["Counting 1–10", "Animals", "Colors"],
    loop: 74,
  },
  {
    n: "GRADE_7",
    ic: "🚀",
    ages: "7–11",
    c: "#4338ca",
    bg: "#e0e7ff",
    active: true,
    count: 488,
    teacher: "Luna",
    voice: "opt",
    avatar: "on",
    safety: "strict",
    samples: ["Volcanoes", "Sharks", "Slime science"],
    loop: 49,
  },
  {
    n: "GRADE_8",
    ic: "🛠️",
    ages: "12–15",
    c: "#7c3aed",
    bg: "#efe7ff",
    active: true,
    count: 402,
    teacher: "Ada Jr.",
    voice: "off",
    avatar: "opt",
    safety: "guided",
    samples: ["Python from scratch", "Discord bot", "Generative art"],
    loop: 42,
  },
  {
    n: "GRADE_9",
    ic: "🎓",
    ages: "16–18",
    c: "#c2410c",
    bg: "#fff1d6",
    active: true,
    count: 580,
    teacher: "Mentor Max",
    voice: "opt",
    avatar: "opt",
    safety: "standard",
    samples: ["Trig sprint", "AP Bio · cells", "APUSH"],
    loop: 64,
  },
  {
    n: "Professional",
    ic: "💼",
    ages: "18+",
    c: "#0f766e",
    bg: "#d6f1f0",
    active: true,
    count: 286,
    teacher: "Professor Turing",
    voice: "opt",
    avatar: "opt",
    safety: "standard",
    samples: ["AWS SAA", "CISSP", "System design L6"],
    loop: 58,
  },
  {
    n: "Senior Learner",
    ic: "🌿",
    ages: "65+",
    c: "#16a34a",
    bg: "#d1fae5",
    active: false,
    count: 80,
    teacher: "Sofia",
    voice: "on",
    avatar: "off",
    safety: "standard",
    samples: ["Scam messages", "Video calls", "Memory games"],
    loop: 81,
  },
];

const VOICE_LABEL: Record<string, string> = {
  on: "on by default",
  opt: "opt-in",
  off: "off",
};

export default function AdminWorlds() {
  return (
    <>
      <Crumbs trail={["Admin", "Worlds"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          title="Worlds"
          subtitle="Six audience-tuned surfaces. Each has its own teacher, voice setting, avatar policy, safety profile, and starter topics."
          right={
            <button
              type="button"
              className="la-btn ghost"
              style={{ padding: "9px 14px", fontSize: 13 }}
            >
              Translate worlds (i18n)
            </button>
          }
        />

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {WORLDS.map((w) => (
            <article
              key={w.n}
              className="la-card overflow-hidden p-0"
              style={{ borderRadius: 18, opacity: w.active ? 1 : 0.65 }}
            >
              <div style={{ height: 4, background: w.c }} />
              <div className="p-5">
                <div className="flex items-center gap-3">
                  <div
                    className="grid h-14 w-14 flex-none place-items-center rounded-2xl text-[28px]"
                    style={{ background: w.bg, color: w.c }}
                    aria-hidden
                  >
                    {w.ic}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[18px] font-extrabold tracking-tight text-ink">{w.n}</h3>
                      <span className="la-pill text-[10px]">Ages {w.ages}</span>
                      <span
                        className="la-pill text-[10px] font-extrabold"
                        style={{
                          background: w.active ? "#dcfce7" : "var(--bg-2)",
                          color: w.active ? "#16a34a" : "var(--ink-mute)",
                        }}
                      >
                        {w.active ? "ENABLED" : "DISABLED"}
                      </span>
                    </div>
                    <div className="la-mono mt-1 text-[11px] text-ink-mute">
                      {w.count.toLocaleString()} active learners · teacher: {w.teacher}
                    </div>
                  </div>
                  <ToggleSwitch on={w.active} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 border-t border-line-soft pt-3 sm:grid-cols-4">
                  <Stat label="Voice" v={VOICE_LABEL[w.voice]!} />
                  <Stat label="Avatar" v={VOICE_LABEL[w.avatar]!} />
                  <Stat label="Safety" v={w.safety} />
                  <Stat label="Loop completion" v={`${w.loop}%`} />
                </div>

                <div className="la-mono mt-3 text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                  STARTER TOPICS
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {w.samples.map((s) => (
                    <span
                      key={s}
                      className="la-pill text-[10px]"
                      style={{ background: w.bg, color: w.c }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="la-btn ghost flex-1"
                    style={{ padding: "8px 10px", fontSize: 12 }}
                  >
                    Edit copy & sample lessons
                  </button>
                  <button
                    type="button"
                    className="la-btn ghost"
                    style={{ padding: "8px 10px", fontSize: 12 }}
                  >
                    Preview ↗
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <span
      className="relative inline-block flex-none rounded-full"
      style={{
        width: 38,
        height: 22,
        background: on ? "#16a34a" : "var(--ink-faint)",
      }}
      aria-hidden
    >
      <span
        className="absolute top-[2px] grid h-[18px] w-[18px] place-items-center rounded-full bg-white transition-all"
        style={{ left: on ? 18 : 2 }}
      />
    </span>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div>
      <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
        {label}
      </div>
      <div className="mt-0.5 text-[12.5px] font-extrabold text-ink">{v}</div>
    </div>
  );
}
