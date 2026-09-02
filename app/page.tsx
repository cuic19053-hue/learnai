import Link from "next/link";
import LearningStageCard from "@/components/learn/LearningStageCard";
import Mark from "@/components/design/Mark";
import Illustration from "@/components/design/Illustration";
import { Arrow } from "@/components/design/icons";
import StickyHeader from "@/components/home/StickyHeader";
import AnimatedHero from "@/components/home/AnimatedHero";
import AudienceCards from "@/components/home/AudienceCards";
import Comparison from "@/components/home/Comparison";
import HomeFaq from "@/components/home/HomeFaq";
import StickyMobileCta from "@/components/home/StickyMobileCta";
import { JOURNEYS } from "@/lib/learn/journeys";
import { LOOP } from "@/lib/learn/loop";

const HOW_IT_WORKS = [
  {
    n: 1,
    title: "设置学习者角色",
    desc: "只需 5 步即可匹配最适合的年龄段、学习目标与专属 AI 导师。",
  },
  {
    n: 2,
    title: "进入专属学习世界",
    desc: "针对不同年龄定制沉浸式界面 — 趣味探索、闯关任务、考证冲刺与沉浸关怀。",
  },
  {
    n: 3,
    title: "高效闭环练习与辅导",
    desc: "每个学习单元均融合科学闭环：兴趣引入、概念讲解、互动练习、即时反馈、反思总结与能力进阶。",
  },
];

const WORLDS: Array<{
  id: string;
  title: string;
  desc: string;
  best: string;
  /** Stage home this World card lands the learner in. */
  href: string;
  tint: string;
  recommended?: boolean;
}> = [
  {
    id: "playful",
    title: "趣味萌芽世界",
    desc: "生动的互动故事、趣味游戏与色彩丰富的启蒙课。",
    best: "幼龄启蒙 (3–6岁)",
    href: "/learn/kids",
    tint: "linear-gradient(135deg,#fce0ec,#fff1d6)",
  },
  {
    id: "mission",
    title: "探索任务世界",
    desc: "项目闯关、挑战任务与逻辑思维训练。",
    best: "少年创客 (12–15岁)",
    href: "/learn/builder",
    tint: "linear-gradient(135deg,#efe7ff,#e6ecff)",
    recommended: true,
  },
  {
    id: "career",
    title: "职场实践世界",
    desc: "真实项目案例、云计算认证与实操技能。",
    best: "职场进阶 (18岁+)",
    href: "/learn/adult",
    tint: "linear-gradient(135deg,#d6f1f0,#e6ecff)",
  },
  {
    id: "calm",
    title: "沉浸关怀世界",
    desc: "清晰步骤、舒缓节奏与大字号关怀模式。",
    best: "长者关怀",
    href: "/learn/senior",
    tint: "linear-gradient(135deg,#e7f8ee,#f3fbf5)",
  },
];

export default function HomePage() {
  return (
    <main id="main">
      {/* ────────── Top nav ────────── */}
      <StickyHeader />

      {/* ────────── Hero (animated) ────────── */}
      <AnimatedHero />

      {/* ────────── Who it's for (4 audience cards) ────────── */}
      <AudienceCards />

      {/* ────────── Journey grid ────────── */}
      <section id="journeys" className="mx-auto max-w-[1200px] px-6 py-16 md:px-12">
        <div className="mb-8 max-w-[720px]">
          <span
            className="la-pill"
            style={{
              background: "#fff",
              boxShadow: "0 0 0 1px var(--line)",
              color: "var(--ink-soft)",
            }}
          >
            选择您的学习旅程
          </span>
          <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.025em] text-ink md:text-[44px]">
            选择最契合学习者的阶段
          </h2>
          <p className="mt-2 text-base text-ink-soft">
            我们将语言表达、课程时长与辅导语气精确匹配每位学员。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {JOURNEYS.map((j) => (
            <LearningStageCard key={j.id} {...j} />
          ))}
        </div>
      </section>

      {/* ────────── Learning Worlds ────────── */}
      <section className="mx-auto max-w-[1200px] px-6 pb-16 md:px-12">
        <div className="mb-7 max-w-[720px]">
          <span
            className="la-pill"
            style={{
              background: "#fff",
              boxShadow: "0 0 0 1px var(--line)",
              color: "var(--ink-soft)",
            }}
          >
            四大沉浸学习世界
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.025em] text-ink md:text-4xl">
            四大学习模式，总有一个适合您。
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORLDS.map((w) => (
            <Link
              key={w.id}
              href={w.href}
              className="la-jcard group block"
              style={{
                padding: 0,
                gap: 0,
                overflow: "hidden",
                border: w.recommended ? "1.5px solid var(--brand-1)" : "1px solid var(--line-soft)",
                boxShadow: w.recommended ? "0 0 0 4px rgba(46,91,255,.08)" : "var(--shadow-1)",
              }}
              aria-label={`${w.title}: ${w.desc}. 推荐对象: ${w.best}.`}
            >
              <div className="relative overflow-hidden" style={{ height: 140 }}>
                <Illustration
                  id={`worlds/${w.id}`}
                  label={`${w.title} — ${w.desc}`}
                  fallbackHeight={140}
                />
                {w.recommended ? (
                  <span
                    className="la-pill absolute left-3 top-3"
                    style={{
                      background: "var(--brand-grad)",
                      color: "#fff",
                      boxShadow: "var(--shadow-1)",
                    }}
                  >
                    ★ 热门推荐
                  </span>
                ) : null}
              </div>
              <div style={{ padding: 18 }}>
                <h3 className="m-0 text-lg font-bold tracking-[-0.01em] text-ink">{w.title}</h3>
                <p className="mt-1.5 text-sm text-ink-soft">{w.desc}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-mute">
                  <span>
                    推荐对象: <strong className="text-ink-soft">{w.best}</strong>
                  </span>
                  <span
                    className="inline-flex items-center gap-1 font-bold transition-transform group-hover:translate-x-0.5"
                    style={{ color: "var(--brand-1)" }}
                  >
                    前往体验 <Arrow color="var(--brand-1)" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ────────── How it works (Loop) ────────── */}
      <section
        id="how"
        className="border-y border-line-soft bg-white"
        style={{ padding: "64px 0" }}
      >
        <div className="mx-auto max-w-[1200px] px-6 md:px-12">
          <div className="mb-10 text-center">
            <span
              className="la-pill"
              style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}
            >
              运作机制
            </span>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.025em] text-ink md:text-[44px]">
              科学闭环，高效掌握无限知识
            </h2>
            <p className="mt-2 text-base text-ink-soft">
              每一个学习单元与练习均贯穿 6 步自适应闭环机制。
            </p>
          </div>

          <div className="mx-auto mb-12 grid max-w-[1100px] grid-cols-1 gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} style={{ padding: 22 }}>
                <div className="la-mono text-[13px] font-bold text-brand-1">
                  步骤 {String(s.n).padStart(2, "0")}
                </div>
                <h3 className="mt-2 text-[22px] font-bold tracking-[-0.01em] text-ink">
                  {s.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-soft">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* The Loop */}
          <div
            className="mx-auto max-w-[1100px] rounded-[28px] p-9"
            style={{
              background: "linear-gradient(135deg, var(--bg-2), #f7f4ff)",
              border: "1px solid var(--line-soft)",
            }}
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
              {LOOP.map((l, i) => (
                <div key={l.n} className="relative text-center">
                  <div className="la-mono mb-2 text-[11px] font-bold text-ink-mute">0{l.n}</div>
                  <div className="la-loop-ring mx-auto" style={{ color: l.color }}>
                    <span aria-hidden>{l.icon}</span>
                  </div>
                  <div className="mt-3 text-base font-bold text-ink">{l.label}</div>
                  <div className="mt-1 px-1.5 text-xs leading-snug text-ink-soft">{l.blurb}</div>
                  {i < LOOP.length - 1 ? (
                    <div
                      className="absolute hidden text-ink-faint md:block"
                      style={{ top: 36, right: -18 }}
                      aria-hidden
                    >
                      →
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ────────── Comparison strip ────────── */}
      <Comparison />

      {/* ────────── FAQ ────────── */}
      <HomeFaq />

      {/* ────────── Final CTA ────────── */}
      <section className="px-6 py-16 text-center md:px-12 md:py-20">
        <h2 className="m-0 text-4xl font-extrabold tracking-[-0.025em] text-ink md:text-[44px]">
          今天就开启适合您的智能学习之旅
        </h2>
        <p className="mt-3 text-base text-ink-soft">
          免费试用 · 无需信用卡 · 零广告 · 儿童安全保障
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/onboarding"
            className="la-btn inline-flex"
            style={{ padding: "16px 28px", fontSize: 16 }}
          >
            免费开始学习 <Arrow />
          </Link>
          <Link
            href="/organizations"
            className="la-btn ghost inline-flex"
            style={{ padding: "16px 22px", fontSize: 15 }}
          >
            学校与团队方案
          </Link>
        </div>
      </section>

      {/* ────────── Footer ────────── */}
      <footer className="border-t border-line-soft bg-surface-soft">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-ink-soft md:flex-row md:px-12">
          <div className="flex items-center gap-3">
            <Mark size={28} fontSize={16} />
            <span className="text-xs text-ink-mute">
              © LearnAI · 伴随人生的全阶段智能化教育平台
            </span>
          </div>
          <div className="flex flex-wrap gap-5">
            <Link href="/onboarding" className="hover:text-ink">
              立即体验
            </Link>
            <Link href="/organizations" className="hover:text-ink">
              合作与机构
            </Link>
            <Link href="/teachers" className="hover:text-ink">
              名师团队
            </Link>
            <Link href="/parent" className="hover:text-ink">
              家长控制
            </Link>
            <Link href="#faq" className="hover:text-ink">
              常见问题
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating mobile CTA (hidden on desktop and inside the hero
          viewport — only appears after the user scrolls past it). */}
      <StickyMobileCta />
    </main>
  );
}
