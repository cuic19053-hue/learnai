import type { Metadata } from "next";
import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import { journeyForStage } from "@/lib/learn/journeys";

export const metadata: Metadata = {
  title: "Little Learner",
  description: "One activity at a time, voice-first, parent-safe — for ages 3–6.",
};

const TILES: Array<{ icon: string; label: string; color: string; bg: string; href: string }> = [
  { icon: "🔢", label: "Numbers", color: "#2e5bff", bg: "#e6ecff", href: "/learn/lesson/kids" },
  { icon: "🅰️", label: "Letters", color: "#f59e0b", bg: "#fff1d6", href: "/learn/lesson/kids" },
  { icon: "🎨", label: "Colors", color: "#ec4899", bg: "#fce0ec", href: "/learn/lesson/kids" },
  { icon: "🐻", label: "Feelings", color: "#7c3aed", bg: "#efe7ff", href: "/learn/lesson/kids" },
];

const STORIES: Array<{ title: string; emoji: string; tint: string }> = [
  { title: "The Brave Bunny", emoji: "🐰", tint: "linear-gradient(135deg,#fce0ec,#fff1d6)" },
  { title: "Stars at Sea", emoji: "⭐", tint: "linear-gradient(135deg,#e6ecff,#efe7ff)" },
  { title: "Friend Tree", emoji: "🌳", tint: "linear-gradient(135deg,#e7f8ee,#fff1d6)" },
  { title: "Snowy Friends", emoji: "⛄", tint: "linear-gradient(135deg,#e6ecff,#fff)" },
];

export default function KidsPage() {
  const j = journeyForStage("LITTLE_LEARNER");

  return (
    <main
      id="main"
      className="relative mx-auto min-h-screen max-w-[480px]"
      style={{
        background: `linear-gradient(180deg, ${j.soft} 0%, #fff 50%)`,
      }}
    >
      {/* ───── Hello strip ───── */}
      <div className="flex items-center justify-between px-5 pb-1 pt-5">
        <div className="flex items-center gap-2.5">
          <PersonaAvatar emoji="🦁" color={j.color} bg={j.bg} size={44} />
          <div>
            <div className="text-[13px] text-ink-mute">Hello</div>
            <div className="text-[22px] font-extrabold tracking-[-0.01em] text-ink">
              Lina! ✨
            </div>
          </div>
        </div>
        {/* Parent exit — labelled pill, not a bare emoji. Big enough for
            an adult finger; small enough not to tempt a 3-year-old. */}
        <Link
          href="/parent"
          className="flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-2.5 text-[13px] font-extrabold text-ink-soft hover:text-ink"
          style={{ boxShadow: "var(--shadow-1)" }}
          aria-label="Parent area — leave the kids app"
        >
          <span aria-hidden className="text-[18px]">👨‍👩‍👧</span>
          <span>Parent</span>
        </Link>
      </div>

      {/* ───── Today's story hero card ───── */}
      <div className="px-4 pt-2">
        <div
          className="la-card overflow-hidden p-[18px] text-white"
          style={{
            borderRadius: 24,
            background: `linear-gradient(135deg, ${j.color}, #1f6c44)`,
            boxShadow: "var(--shadow-3)",
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-bold uppercase opacity-85">
                Today’s story
              </div>
              <div className="mt-1 text-[22px] font-extrabold leading-tight tracking-[-0.01em]">
                Count jungle animals
                <br />
                with Milo 🦁
              </div>
            </div>
            <div
              className="grid h-16 w-16 place-items-center text-4xl"
              style={{
                background: "rgba(255,255,255,.2)",
                borderRadius: "50% 40% 50% 50%",
              }}
              aria-hidden
            >
              🦒
            </div>
          </div>

          <Link
            href="/learn/lesson/kids"
            className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-white py-[18px] text-lg font-extrabold"
            style={{ color: j.color }}
          >
            ▶ Tap to begin
          </Link>
        </div>
      </div>

      {/* ───── Pick a world (4 big tiles) ───── */}
      <section className="px-4 pb-1 pt-3.5">
        <div className="mb-2.5 text-[13px] font-bold text-ink-mute">PICK A WORLD</div>
        <div className="grid grid-cols-2 gap-2.5">
          {TILES.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              className="flex flex-col justify-between p-4"
              style={{
                minHeight: 120,
                borderRadius: 22,
                background: t.bg,
                border: `1px solid ${t.color}22`,
                boxShadow: "var(--shadow-1)",
              }}
            >
              <div className="text-[40px]" aria-hidden>
                {t.icon}
              </div>
              <div
                className="text-lg font-extrabold tracking-[-0.01em]"
                style={{ color: t.color }}
              >
                {t.label}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───── Stories shelf ───── */}
      <section className="pb-24 pl-4 pt-5">
        <div className="mb-2.5 text-[13px] font-bold text-ink-mute">STORIES FOR YOU</div>
        <div className="flex gap-2.5 overflow-x-auto pb-1.5 pr-4">
          {STORIES.map((s) => (
            <button
              key={s.title}
              type="button"
              className="flex flex-col justify-between border border-line-soft p-3.5 text-left"
              style={{
                flex: "0 0 140px",
                minHeight: 160,
                borderRadius: 20,
                background: s.tint,
              }}
              aria-label={`Open story: ${s.title}`}
            >
              <div className="text-[44px]" aria-hidden>
                {s.emoji}
              </div>
              <div className="text-sm font-extrabold text-ink">{s.title}</div>
            </button>
          ))}
        </div>
      </section>

      {/* ───── Floating voice mic FAB ─────
            Respects iOS home-indicator via env(safe-area-inset-bottom) so
            it never sits under the system gesture bar on iPhone X+. */}
      <button
        type="button"
        className="fixed right-5 grid h-16 w-16 place-items-center rounded-full text-[28px] text-white sm:absolute"
        style={{
          bottom: "max(20px, env(safe-area-inset-bottom, 0px) + 12px)",
          background: "var(--brand-grad)",
          boxShadow: "0 16px 32px rgba(46,91,255,.35)",
        }}
        aria-label="Talk to your teacher"
      >
        🎤
      </button>
    </main>
  );
}
