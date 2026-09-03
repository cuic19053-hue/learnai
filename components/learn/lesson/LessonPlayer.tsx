"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import ImgSlot from "@/components/design/ImgSlot";
import { Arrow } from "@/components/design/icons";
import { LOOP } from "@/lib/learn/loop";
import type { Journey } from "@/lib/learn/journeys";
import { stageToPath } from "@/lib/learn/stages";
import LoopProgressStrip from "./LoopProgressStrip";
import type { MissionPracticePayload } from "@/lib/learn/missions";

type Token = { id: string; label: string; emoji: string };

/** 默认七年级数学 - 相交线与平行线性质练习数据 */
const DEFAULT_MATH_PRACTICE: MissionPracticePayload = {
  prompt: "拖拽角的位置名称标签到几何图形对应的正确位置",
  subject: "数学",
  teacherName: "诺瓦导师",
  teacherEmoji: "📐",
  diagramLabel: "📐 沪教版七年级数学 - 两直线被第三条直线所截角的关系图",
  diagramGradient: "linear-gradient(180deg, #f0fdf4 0%, #e0f2fe 60%, #bae6fd 100%)",
  targets: [
    { id: "corresponding", label: "同位角 (∠1与∠5)", x: "50%", y: "25%" },
    { id: "alternate", label: "内错角 (∠3与∠5)", x: "50%", y: "50%" },
    { id: "consecutive", label: "同旁内角 (∠4与∠5)", x: "50%", y: "75%" },
  ],
  tokens: [
    { id: "corresponding", emoji: "📐", label: "同位角" },
    { id: "alternate", emoji: "🔀", label: "内错角" },
    { id: "consecutive", emoji: "↔️", label: "同旁内角" },
    { id: "opposite", emoji: "✖️", label: "对顶角" },
  ],
  initialPlaced: { corresponding: "corresponding", alternate: null, consecutive: null },
  initialFeedback:
    "太棒了！同位角位置正确。两条直线被第三条直线所截，在截线的同旁且在被截两直线的同一侧的角叫同位角。下一步：试着找出内错角的位置吧！",
  hintLadder: [
    { emoji: "💡", text: "在截线同侧且在两条被截直线同一位置的角是同位角。" },
    { emoji: "🔀", text: "在截线两侧且在两条被截直线之间的角是内错角 (呈现 Z 字形)。" },
    { emoji: "↔️", text: "在截线同侧且在两条被截直线之间的角是同旁内角 (呈现 U 字形)。" },
  ],
};

type LessonPlayerProps = {
  journey: Journey;
  teacherName?: string;
  teacherEmoji?: string;
  /** Optional override for the displayed lesson title. */
  title?: string;
  subject?: string;
  /** Mission-specific practice content. When omitted, falls back to
   *  the original GRADE_7 volcano practice so older entry points
   *  keep working. */
  practice?: MissionPracticePayload;
};

export default function LessonPlayer({
  journey,
  teacherName,
  teacherEmoji,
  title,
  subject,
  practice,
}: LessonPlayerProps) {
  const payload = practice ?? DEFAULT_MATH_PRACTICE;
  const TARGETS = payload.targets;
  const TOKENS = payload.tokens;
  const HINT_LADDER = payload.hintLadder;

  // Practice step (3 of 6).
  const PRACTICE_STEP = 2;
  const initialPlaced = useMemo<Record<string, string | null>>(() => {
    if (payload.initialPlaced) return { ...payload.initialPlaced };
    return Object.fromEntries(TARGETS.map((t) => [t.id, null]));
  }, [payload, TARGETS]);
  const [placed, setPlaced] = useState<Record<string, string | null>>(initialPlaced);
  const [picked, setPicked] = useState<Token | null>(null);
  const [feedback, setFeedback] = useState<string | null>(
    payload.initialFeedback ?? "请选择下方一个标签，然后点击图表对应位置进行标记。"
  );
  // Reveal half the ladder up-front so the first hint is visible.
  const [hintsRevealed, setHintsRevealed] = useState(Math.min(2, HINT_LADDER.length));

  const remainingTokens = useMemo(
    () =>
      TOKENS.filter((t) => {
        return !Object.entries(placed).some(([targetId, val]) => val === t.id && targetId === t.id);
      }),
    [placed, TOKENS]
  );

  const placedCount = Object.values(placed).filter((v) => v !== null).length;
  const allCorrect = placedCount === TARGETS.length;
  const stagePill = LOOP[PRACTICE_STEP];

  // Resolved header bits. Mission-supplied subject/teacher wins; then
  // explicit prop; then the default.
  const headerSubject = subject ?? payload.subject;
  const headerTitle = title ?? payload.prompt;
  const tName = teacherName ?? payload.teacherName ?? "雷克斯导师";
  const tEmoji = teacherEmoji ?? payload.teacherEmoji ?? "🦊";

  function labelFor(id: string): string {
    return TOKENS.find((t) => t.id === id)?.label ?? id;
  }

  function tryPlace(targetId: string, tokenId: string) {
    if (targetId === tokenId) {
      setPlaced((p) => ({ ...p, [targetId]: tokenId }));
      setPicked(null);
      setFeedback(`太棒了！${labelFor(tokenId)} 的位置完全正确。`);
    } else {
      setFeedback(
        `位置不太对哦。再试着为“${labelFor(tokenId)}”找一个更合适的位置吧！`
      );
    }
  }

  function unlockNextHint() {
    setHintsRevealed((n) => Math.min(HINT_LADDER.length, n + 1));
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* ───── Header ───── */}
      <header
        className="flex items-center justify-between border-b border-line-soft bg-white px-4 md:px-6"
        style={{ height: 60 }}
      >
        <div className="flex items-center gap-4">
          <Link
            href={stageToPath(journey.stage)}
            aria-label="返回首页"
            className="text-lg text-ink-mute hover:text-ink"
          >
            ←
          </Link>
          <div>
            <div
              className="text-[11px] font-bold uppercase tracking-[0.06em]"
              style={{ color: journey.color }}
            >
              {journey.name} · {headerSubject}
            </div>
            <div className="text-sm font-bold text-ink">{headerTitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden text-[13px] text-ink-soft sm:inline">⏱ 已用时 4:21</span>
          <span className="la-pill" style={{ background: "#fff7e6", color: "#b15c00" }}>
            +30 XP
          </span>
        </div>
      </header>

      {/* ───── Loop progress strip ───── */}
      <LoopProgressStrip step={PRACTICE_STEP} />

      {/* ───── Main: practice stage + teacher panel ───── */}
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
        <main id="main" className="overflow-auto px-5 py-7 md:px-12">
          <span
            className="la-pill"
            style={{ background: `${stagePill.color}18`, color: stagePill.color }}
          >
            {stagePill.icon} 步骤 {PRACTICE_STEP + 1} · {stagePill.label}
          </span>
          <h1 className="mt-2.5 text-3xl font-extrabold tracking-[-0.02em] text-ink md:text-[30px]">
            {payload.prompt}
          </h1>
          <p className="mb-6 mt-1.5 text-sm text-ink-soft">
            每次放置放置标签后均可获得即时反馈。还剩 {TARGETS.length - placedCount} 个待标记。
          </p>

          {/* Diagram */}
          <div
            className="relative overflow-hidden rounded-[22px] border border-line-soft"
            style={{
              height: 300,
              background: payload.diagramGradient,
            }}
          >
            <ImgSlot
              label={payload.diagramLabel}
              height={300}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 0,
                border: "none",
                background: "transparent",
              }}
            />

            {TARGETS.map((t) => {
              const correctTokenId = placed[t.id];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    if (picked) tryPlace(t.id, picked.id);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const tokenId = e.dataTransfer.getData("text/plain");
                    if (tokenId) tryPlace(t.id, tokenId);
                  }}
                  aria-label={
                    correctTokenId ? `正确标记：${t.label}` : `放置目标：${t.label}`
                  }
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: t.x,
                    top: t.y,
                    padding: "6px 12px",
                    borderRadius: 999,
                    background: correctTokenId ? "#fff" : "rgba(255,255,255,.6)",
                    border: `2px ${correctTokenId ? `solid ${journey.color}` : "dashed rgba(15,20,48,.3)"}`,
                    color: correctTokenId ? journey.color : "var(--ink-soft)",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {correctTokenId ? `✓ ${t.label}` : "? 放置此处"}
                </button>
              );
            })}
          </div>

          {/* Drag tray */}
          <div className="mt-5">
            <div className="la-mono mb-2 text-[12px] font-bold tracking-[0.06em] text-ink-mute">
              拖拽或点击下方标签
            </div>
            <div className="flex flex-wrap gap-2.5">
              {remainingTokens.length === 0 ? (
                <p className="text-sm text-ink-soft">所有标签标记完成，太棒了！</p>
              ) : (
                remainingTokens.map((c) => {
                  const selected = picked?.id === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", c.id);
                      }}
                      onClick={() => setPicked(selected ? null : c)}
                      aria-pressed={selected}
                      className="flex cursor-grab items-center gap-2 rounded-xl border bg-white px-3.5 py-3 text-[13px] font-bold"
                      style={{
                        borderColor: selected ? journey.color : "var(--line)",
                        boxShadow: selected
                          ? `0 0 0 4px ${journey.color}1a, var(--shadow-1)`
                          : "var(--shadow-1)",
                      }}
                    >
                      <span aria-hidden>{c.emoji}</span> {c.label}
                    </button>
                  );
                })
              )}
            </div>
            {picked ? (
              <p className="mt-3 text-xs text-ink-soft">
                现在点击图表上的相应位置放置“{picked.label}”。
              </p>
            ) : null}
          </div>
        </main>

        {/* Teacher panel */}
        <aside
          className="flex flex-col gap-3 border-t border-line-soft p-5 lg:border-l lg:border-t-0"
          style={{ background: "#fbfbff" }}
        >
          <div className="flex items-center gap-2.5">
            <PersonaAvatar emoji={tEmoji} color={journey.color} bg={journey.bg} size={40} />
            <div>
              <div className="text-sm font-bold text-ink">{tName}</div>
              <div className="text-[11px] text-ink-soft">您的 AI 导师</div>
            </div>
            <button
              type="button"
              className="ml-auto text-base text-ink-mute hover:text-ink"
              aria-label="朗读"
            >
              🔊
            </button>
          </div>

          <div
            aria-live="polite"
            className="rounded-2xl p-3.5 text-[13px] leading-relaxed"
            style={{
              background: journey.soft,
              border: `1px solid ${journey.bg}`,
              color: "var(--ink)",
            }}
          >
            <strong style={{ color: journey.color }}>
              {allCorrect ? "全部标记正确 — 太棒了！" : "实时导师反馈"}
            </strong>
            <br />
            {feedback ?? "请选择下方一个标签，然后点击图表对应位置进行标记。"}
          </div>

          <div className="la-mono text-[11px] font-bold tracking-[0.06em] text-ink-mute">提示说明</div>
          <div className="flex flex-col gap-2">
            {HINT_LADDER.map((h, i) => {
              const unlocked = i < hintsRevealed;
              return (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-[13px]"
                  style={{
                    borderRadius: 10,
                    background: unlocked ? "#fff" : "transparent",
                    border: unlocked ? "1px solid var(--line-soft)" : "1px dashed var(--line)",
                    color: unlocked ? "var(--ink)" : "var(--ink-mute)",
                  }}
                >
                  <span aria-hidden>{h.emoji}</span>
                  {unlocked ? h.text : null}
                  {!unlocked && i === hintsRevealed ? (
                    <button
                      type="button"
                      onClick={unlockNextHint}
                      className="font-semibold text-ink"
                    >
                      🔓 解锁下一条提示 (-2 XP)
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>

          <AdaptiveTuning />
        </aside>
      </div>

      {/* ───── Footer controls ───── */}
      <footer
        className="flex items-center justify-between border-t border-line-soft bg-white px-4 md:px-6"
        style={{ height: 64 }}
      >
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="la-btn ghost"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            暂停
          </button>
          <button
            type="button"
            className="la-btn ghost hidden sm:inline-flex"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            跳过此步
          </button>
          <button
            type="button"
            className="la-btn ghost hidden md:inline-flex"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            降低难度
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-ink-mute sm:inline">
            已完成 {placedCount} / {TARGETS.length} 个标记
          </span>
          <button
            type="button"
            disabled={!allCorrect}
            className="la-btn"
            style={{ padding: "12px 18px", opacity: allCorrect ? 1 : 0.6 }}
          >
            继续查看反馈 <Arrow />
          </button>
        </div>
      </footer>
    </div>
  );
}

function AdaptiveTuning() {
  return (
    <div className="mt-auto">
      <div className="la-mono text-[10px] font-bold tracking-[0.06em] text-ink-mute">
        自适应学情调节
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {["📖 阅读难度：初一适中", "⏱ 讲课节奏：中等", "🎯 学习目标：学科探索"].map((p) => (
          <span
            key={p}
            className="la-pill text-[11px]"
            style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}
