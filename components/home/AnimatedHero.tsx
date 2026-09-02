"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Illustration from "@/components/design/Illustration";
import { Arrow, Spark } from "@/components/design/icons";

/**
 * Hero demo card cycles through 5 scenarios, one per representative
 * stage. Each scenario shares the same 10-step inner timeline:
 *
 *   0 enter         badge + card frame visible
 *   1 progress      progress dots fill
 *   2 title         lesson title + step caption fade in
 *   3 illustration  the lesson illustration fades in
 *   4 options       answer buttons appear (staggered)
 *   5 selected      the correct answer pulses + gets accent
 *   6 typing        teacher avatar + typing dots
 *   7 message       typing dots are replaced by the teacher's reply
 *   8 xp            the reward badge pops
 *   9 rest          short hold, then advance to next scenario @ step 1
 *
 * Reduced-motion users see the final state of the first scenario only.
 */

type Scenario = {
  id: string;
  badge: string; // "🚀 Explorer · Ages 7–11"
  badgeBg: string; // CSS var
  badgeColor: string; // CSS var
  bubbleBg: string; // CSS var — teacher message background
  title: string;
  stepLabel: string;
  illustrationId: string;
  illustrationLabel: string;
  questionLabel: string;
  options: string[];
  correctIndex: number;
  teacherEmoji: string;
  teacherName: string;
  teacherReply: string;
  xpLabel: string;
  /** Progress dots filled out of 6. */
  progressFilled: number;
};

const SCENARIOS: Scenario[] = [
  {
    id: "explorer-volcano",
    badge: "🚀 少儿探索 · 7–11 岁",
    badgeBg: "var(--j-explorer-bg)",
    badgeColor: "var(--j-explorer)",
    bubbleBg: "var(--j-explorer-soft)",
    title: "火山为什么会喷发？ 🌋",
    stepLabel: "第 3 步 (共 6 步) · 互动练习",
    illustrationId: "lessons/volcano-cross-section",
    illustrationLabel: "火山剖面图：显示岩浆房、喷发口和火山灰云",
    questionLabel: "拖拽标签匹配正确的图层",
    options: ["岩浆房", "喷发口", "火山灰云"],
    correctIndex: 1,
    teacherEmoji: "🦊",
    teacherName: "Nora",
    teacherReply: "岩浆房找得非常准！想看看当内部压力积聚时会发生什么吗？",
    xpLabel: "🏆 获得 +20 XP",
    progressFilled: 3,
  },
  {
    id: "little-apples",
    badge: "🦁 幼龄启蒙 · 3–6 岁",
    badgeBg: "var(--j-little-bg)",
    badgeColor: "var(--j-little)",
    bubbleBg: "var(--j-little-soft)",
    title: "数一数苹果 🍎",
    stepLabel: "第 2 步 (共 4 步) · 点击计数",
    illustrationId: "lessons/apples",
    illustrationLabel: "木桌上的三个红苹果",
    questionLabel: "你看到了几个苹果？",
    options: ["1 个", "2 个", "3 个", "4 个"],
    correctIndex: 2,
    teacherEmoji: "🦉",
    teacherName: "Milo",
    teacherReply: "真棒 — 是 3 个红彤彤的大苹果！接下来我们再数数别的吧。",
    xpLabel: "⭐ 获得勋章奖励",
    progressFilled: 2,
  },
  {
    id: "builder-python",
    badge: "🛠️ 少年创客 · 12–15 岁",
    badgeBg: "var(--j-builder-bg)",
    badgeColor: "var(--j-builder)",
    bubbleBg: "var(--j-builder-soft)",
    title: "处理除以零的异常 🐍",
    stepLabel: "第 4 步 (共 6 步) · 编程实践",
    illustrationId: "lessons/python-snippet",
    illustrationLabel: "Python 代码编辑器示例",
    questionLabel: "在 Python 中除以零会发生什么？",
    options: ["返回 0", "返回 None", "抛出 ZeroDivisionError"],
    correctIndex: 2,
    teacherEmoji: "🦉",
    teacherName: "Nova",
    teacherReply: "完全正确 — Python 会抛出 ZeroDivisionError。接下来尝试用 try/except 捕获它？",
    xpLabel: "🏆 获得 +60 XP",
    progressFilled: 4,
  },
  {
    id: "scholar-trig",
    badge: "🎓 高中学者 · 16–18 岁",
    badgeBg: "var(--j-scholar-bg)",
    badgeColor: "var(--j-scholar)",
    bubbleBg: "var(--j-scholar-soft)",
    title: "三角函数: sin(30°) 📐",
    stepLabel: "第 5 步 (共 6 步) · 快速测验",
    illustrationId: "lessons/trig-angle",
    illustrationLabel: "包含 30° 角的 30-60-90 直角三角形",
    questionLabel: "sin(30°) 的值是多少？",
    options: ["½", "√3⁄2", "1", "0"],
    correctIndex: 0,
    teacherEmoji: "🎓",
    teacherName: "Max 导师",
    teacherReply: "太棒了！sin(30°) = ½，30-60-90 三角形可是解题好帮手。",
    xpLabel: "🏆 获得 +90 XP",
    progressFilled: 5,
  },
  {
    id: "senior-scam",
    badge: "🌿 长者关怀 · 长者人群",
    badgeBg: "var(--j-senior-bg)",
    badgeColor: "var(--j-senior)",
    bubbleBg: "var(--j-senior-soft)",
    title: "这条信息是诈骗吗？ 🛡️",
    stepLabel: "第 3 步 (共 5 步) · 防诈辨析",
    illustrationId: "lessons/scam-email",
    illustrationLabel: "带紧急催促标识的可疑邮件示意图",
    questionLabel: "您的判断是？",
    options: ["🚩 诈骗信息", "✅ 正规通知"],
    correctIndex: 0,
    teacherEmoji: "🌿",
    teacherName: "Sage",
    teacherReply: "眼光真锐利！正规银行绝不会要求您在 24 小时内点击陌生链接进行验证。",
    xpLabel: "👏 答得太棒了",
    progressFilled: 3,
  },
];

const STEP_DURATIONS_MS = [600, 500, 500, 500, 800, 900, 1000, 1300, 1500, 1200];
const TOTAL_STEPS = STEP_DURATIONS_MS.length;

export default function AnimatedHero() {
  const reduce = useReducedMotion();

  // Page-load entrance: drives the left-column text + the card slide-in.
  const fadeUp = reduce
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

  // Inner timeline + outer scenario rotation.
  const [step, setStep] = useState(0);
  const [scenarioIdx, setScenarioIdx] = useState(0);

  useEffect(() => {
    if (reduce) {
      // Pin to the final state of the first scenario; never advance.
      setStep(TOTAL_STEPS - 2);
      return;
    }
    let timeoutId: ReturnType<typeof setTimeout>;
    const tick = (s: number, idx: number) => {
      setStep(s);
      setScenarioIdx(idx);
      timeoutId = setTimeout(() => {
        if (s >= TOTAL_STEPS - 1) {
          // Roll over: advance to next scenario, restart at step 1
          // (skipping the one-time entrance step).
          tick(1, (idx + 1) % SCENARIOS.length);
        } else {
          tick(s + 1, idx);
        }
      }, STEP_DURATIONS_MS[s] ?? 1000);
    };
    tick(0, 0);
    return () => clearTimeout(timeoutId);
  }, [reduce]);

  const visible = (n: number) => step >= n;
  const scenario = SCENARIOS[scenarioIdx];

  return (
    <section className="la-bg-dotted">
      <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-6 py-16 md:grid-cols-[1.1fr_1fr] md:px-12 md:py-20">
        {/* ───── Left: text reveal ───── */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
          }}
        >
          <motion.span
            className="la-pill"
            style={{
              background: "#fff",
              boxShadow: "0 0 0 1px var(--line)",
              color: "var(--brand-1)",
            }}
            variants={{
              hidden: reduce ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 },
              show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
            }}
          >
            <Spark color="var(--brand-1)" /> 全年龄段自适应 AI 学习
          </motion.span>

          <h1
            className="mt-5 font-extrabold tracking-[-0.035em] text-ink"
            style={{ fontSize: "clamp(40px, 7vw, 72px)", lineHeight: 1.04 }}
          >
            <motion.span
              className="block"
              variants={{
                hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
              }}
            >
              专属 AI 导师，
            </motion.span>
            <motion.span
              className="block"
              style={{
                background: "var(--brand-grad)",
                backgroundSize: "200% 100%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
              variants={{
                hidden: reduce
                  ? { opacity: 1, y: 0, backgroundPosition: "0% 50%" }
                  : { opacity: 0, y: 14, backgroundPosition: "100% 50%" },
                show: {
                  opacity: 1,
                  y: 0,
                  backgroundPosition: "0% 50%",
                  transition: { duration: 0.9, ease: "easeOut" },
                },
              }}
            >
              因材施教成就每位学习者。
            </motion.span>
          </h1>

          <motion.p
            className="mt-5 max-w-[560px] text-lg leading-relaxed text-ink-soft"
            variants={{
              hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 },
              show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
            }}
          >
            LearnAI 是您的个人 AI
            智能导师，根据每位学习者的年龄、学习节奏与目标，动态适配课程、练习与实时反馈。
          </motion.p>

          <motion.div
            className="mt-7 flex flex-wrap items-center gap-3"
            variants={{
              hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
              show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
            }}
          >
            <Link
              href="/onboarding"
              className="la-btn group transition-transform hover:-translate-y-0.5"
              style={{ padding: "14px 22px", fontSize: 15 }}
            >
              免费开始学习
              <span className="inline-flex transition-transform group-hover:translate-x-1">
                <Arrow />
              </span>
            </Link>
            <Link
              href="/organizations"
              className="la-btn ghost group transition-colors hover:border-brand-1 hover:text-ink"
              style={{ padding: "14px 22px", fontSize: 15 }}
            >
              学校与机构方案 →
            </Link>
          </motion.div>

          {/* Trust microcopy — directly under the CTA. Repeats what the
              footer says but at the highest-conversion spot. */}
          <motion.p
            className="mt-3 text-[13px] text-ink-mute"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.4, delay: 0.1 } },
            }}
          >
            免费试用 · 无需信用卡 · 零广告 · 儿童安全保障
          </motion.p>

          {/* Scenario dots — show which of 5 mini-lessons is on screen */}
          <motion.div
            className="mt-6 flex items-center gap-2"
            aria-label={`Showing scenario ${scenarioIdx + 1} of ${SCENARIOS.length}`}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { duration: 0.4, ease: "easeOut", delay: 0.6 } },
            }}
          >
            {SCENARIOS.map((s, i) => (
              <span
                key={s.id}
                aria-hidden
                style={{
                  width: i === scenarioIdx ? 24 : 8,
                  height: 4,
                  borderRadius: 2,
                  background: i === scenarioIdx ? "var(--brand-grad)" : "var(--line)",
                  transition: "width 0.3s, background 0.3s",
                }}
              />
            ))}
            <span className="ml-2 text-[11px] text-ink-mute">
              {scenarioIdx + 1} / {SCENARIOS.length}
            </span>
          </motion.div>
        </motion.div>

        {/* ───── Right: looping demo card ───── */}
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.35 }}
          className="relative hidden md:block"
          style={{ height: 460 }}
        >
          <div
            className="la-card absolute"
            style={{
              inset: 20,
              borderRadius: 28,
              padding: 22,
              boxShadow: "var(--shadow-3)",
              background: "linear-gradient(180deg, #fff 0%, #f8f9ff 100%)",
            }}
          >
            <div className="flex items-center justify-between">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={scenario.id + "-badge"}
                  className="la-pill"
                  style={{
                    background: scenario.badgeBg,
                    color: scenario.badgeColor,
                  }}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  {scenario.badge}
                </motion.span>
              </AnimatePresence>
              <div
                className="flex gap-1"
                aria-label={`Lesson progress: ${scenario.progressFilled} of 6`}
              >
                {[0, 1, 2, 3, 4, 5].map((i) => {
                  const active = visible(1) && i < scenario.progressFilled;
                  return (
                    <motion.div
                      key={i}
                      initial={false}
                      animate={{
                        background: active ? "var(--brand-1)" : "var(--line)",
                      }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: 0.06 * i }}
                      style={{ width: 28, height: 4, borderRadius: 2 }}
                    />
                  );
                })}
              </div>
            </div>

            <motion.h3
              key={scenario.id + "-title"}
              className="mt-4 text-[22px] font-bold tracking-[-0.01em] text-ink"
              style={{ marginBottom: 4 }}
              initial={false}
              animate={{
                opacity: visible(2) ? 1 : 0,
                y: visible(2) ? 0 : 6,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {scenario.title}
            </motion.h3>

            <motion.p
              key={scenario.id + "-step"}
              className="text-xs text-ink-mute"
              initial={false}
              animate={{ opacity: visible(2) ? 1 : 0 }}
              transition={{ duration: 0.3, ease: "easeOut", delay: 0.05 }}
            >
              {scenario.stepLabel}
            </motion.p>

            <motion.div
              key={scenario.id + "-illu"}
              className="mt-4 overflow-hidden rounded-2xl border border-line-soft"
              style={{ height: 140 }}
              initial={false}
              animate={{ opacity: visible(3) ? 1 : 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Illustration
                id={scenario.illustrationId}
                label={scenario.illustrationLabel}
                fallbackHeight={140}
              />
            </motion.div>

            <div className="mt-4">
              <motion.div
                className="mb-2 text-xs font-bold text-ink"
                initial={false}
                animate={{ opacity: visible(4) ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {scenario.questionLabel}
              </motion.div>
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(scenario.options.length, 4)}, minmax(0, 1fr))`,
                }}
              >
                {scenario.options.map((t, i) => {
                  const isCorrect = i === scenario.correctIndex;
                  const selected = visible(5) && isCorrect;
                  return (
                    <motion.button
                      key={scenario.id + "-opt-" + i}
                      type="button"
                      tabIndex={-1}
                      aria-hidden
                      className="text-center text-xs font-semibold"
                      initial={false}
                      animate={{
                        opacity: visible(4) ? 1 : 0,
                        y: visible(4) ? 0 : 6,
                        scale: visible(5) && isCorrect ? [1, 1.04, 1] : 1,
                        background: selected ? scenario.badgeBg : "#fff",
                        borderColor: selected ? scenario.badgeColor : "var(--line)",
                        boxShadow: selected ? "0 0 0 4px rgba(46,91,255,0.12)" : "none",
                      }}
                      transition={{
                        opacity: { duration: 0.3, delay: i * 0.08 },
                        y: { duration: 0.3, delay: i * 0.08 },
                        scale: { duration: 0.5, ease: "easeOut" },
                        background: { duration: 0.3 },
                        borderColor: { duration: 0.3 },
                        boxShadow: { duration: 0.3 },
                      }}
                      style={{
                        padding: 10,
                        borderRadius: 12,
                        border: "1.5px solid var(--line)",
                      }}
                    >
                      {t}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Teacher feedback bubble — typing dots → message */}
            <div
              className="mt-4 flex items-start gap-2.5 rounded-2xl p-3"
              style={{ background: scenario.bubbleBg, minHeight: 64 }}
            >
              <motion.div
                key={scenario.id + "-teacher"}
                className="text-[22px]"
                aria-hidden
                initial={false}
                animate={{
                  opacity: visible(6) ? 1 : 0,
                  scale: visible(6) ? 1 : 0.6,
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {scenario.teacherEmoji}
              </motion.div>
              <div className="flex-1 text-[13px] leading-snug">
                <AnimatePresence mode="wait" initial={false}>
                  {step === 6 ? (
                    <motion.div
                      key={scenario.id + "-typing"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="flex items-center gap-1.5 pt-1.5"
                    >
                      <Dot delay={0} />
                      <Dot delay={0.15} />
                      <Dot delay={0.3} />
                    </motion.div>
                  ) : visible(7) ? (
                    <motion.div
                      key={scenario.id + "-reply"}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <strong>{scenario.teacherName}:</strong> {scenario.teacherReply}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* XP badge — pops in at step 8, swaps copy per scenario */}
          <motion.div
            key={scenario.id + "-xp"}
            className="absolute bottom-0 left-0 flex items-center gap-2 rounded-2xl bg-white px-3.5 py-2.5 text-xs font-bold"
            style={{ boxShadow: "var(--shadow-2)" }}
            aria-label="Reward earned"
            initial={false}
            animate={{
              opacity: visible(8) ? 1 : 0,
              scale: visible(8) ? [0.6, 1.08, 1] : 0.8,
            }}
            transition={{
              opacity: { duration: 0.25 },
              scale: { duration: 0.5, ease: "easeOut", times: [0, 0.6, 1] },
            }}
          >
            {scenario.xpLabel}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="inline-block h-1.5 w-1.5 rounded-full bg-ink-mute"
      animate={{ opacity: [0.2, 1, 0.2] }}
      transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}
