"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
import { useProgress } from "@/components/progress/ProgressProvider";
import type { Journey } from "@/lib/learn/journeys";
import {
  greetingFor,
  memoryForWorld,
  METHOD_META,
  promptsForContext,
  type PageContext,
  type SuggestedPrompt,
  type TutorMemory,
} from "@/lib/learn/tutor";

/* ── Message shape ──────────────────────────────────────────────────── */
type Bubble = {
  side: "in" | "out";
  /** Renderable text. For pending bubbles this is empty until the
   *  network call resolves; the UI shows animated dots in place. */
  text: string;
  /** Where the reply came from (only set on assistant bubbles). */
  source?: "ai" | "fallback" | "system";
  /** Round-trip latency in ms (only set on assistant bubbles). */
  latencyMs?: number;
  /** ISO timestamp the bubble was created. */
  ts: string;
  /** Stable id so React + the regenerate flow can find it. */
  id: string;
};

type TeacherChatPanelProps = {
  journey: Journey;
  teacherName?: string;
  teacherEmoji?: string;
  /** Optional override of the opening line — falls back to greetingFor(ctx). */
  greeting?: string;
  /**
   * What the learner is doing right now. Drives suggested prompts +
   * greeting + the memory ribbon. If not provided the rail still works
   * but won't be context-aware.
   */
  pageContext?: PageContext;
  /** World slug — used to read tutor memory. */
  worldSlug?: string;
};

const nextId = (() => {
  let n = 0;
  return () => `b${++n}-${Date.now().toString(36)}`;
})();

/**
 * Persistent AI tutor rail — real chatbot, not a mock.
 *
 * Every message the user sends goes through POST /api/tutor/chat which
 * walks the configured AI provider chain (OllaBridge by default; admin
 * can layer OpenAI/Anthropic/xAI/Ollama). Failures fall back to a
 * sensible per-page-kind static reply so the rail is never silent.
 *
 * UX guarantees:
 *   - Auto-scrolls to the latest message on every turn
 *   - Cancel mid-request (Esc or click the spinner)
 *   - Regenerate the last assistant reply with one click
 *   - Source + latency badge under every AI reply for transparency
 *   - Memory ribbon shows real per-world XP/streak when available,
 *     falls back to the demo memory shape for guest mode
 *   - Clear-conversation link resets the thread without leaving the page
 */
export default function TeacherChatPanel({
  journey,
  teacherName = "Nova",
  teacherEmoji = "🦉",
  greeting,
  pageContext = { kind: "world-home" },
  worldSlug,
}: TeacherChatPanelProps) {
  const opening = greeting ?? greetingFor(pageContext, teacherName);
  const prompts = useMemo(() => promptsForContext(pageContext), [pageContext]);
  const progress = useProgress();
  const memory = useMemo(
    () => buildMemory(progress, worldSlug, pageContext),
    [progress, worldSlug, pageContext]
  );

  const [thread, setThread] = useState<Bubble[]>(() => [
    { id: nextId(), side: "in", text: opening, source: "system", ts: new Date().toISOString() },
  ]);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset the thread when the page context changes — every screen
  // gets a fresh greeting so the tutor never feels stale.
  useEffect(() => {
    setThread([
      {
        id: nextId(),
        side: "in",
        text: opening,
        source: "system",
        ts: new Date().toISOString(),
      },
    ]);
  }, [opening]);

  // Auto-scroll to the bottom whenever the thread grows or pending flips.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Use rAF so the scroll happens after the new bubble is painted.
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [thread.length, pending]);

  // Cancel in-flight requests on unmount + on Escape.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && pending) {
        cancelInFlight();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pending]);

  const cancelInFlight = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setPending(false);
  }, []);

  const send = useCallback(
    async (history: Array<{ role: "user" | "assistant"; text: string }>) => {
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setPending(true);

      const started = Date.now();
      try {
        const res = await fetch("/api/tutor/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          signal: ctrl.signal,
          body: JSON.stringify({
            history,
            context: {
              kind: pageContext.kind,
              topic: pageContext.topic,
              worldLabel: pageContext.worldLabel,
              worldSlug,
              teacherName,
            },
          }),
        });
        const data = (await res.json().catch(() => null)) as
          | {
              ok: true;
              reply: string;
              source?: "ai" | "fallback";
              latencyMs?: number;
            }
          | { ok: false; error: string }
          | null;

        if (!res.ok || !data || data.ok === false) {
          const msg =
            (data && data.ok === false && data.error) ||
            `Couldn't reach the tutor (HTTP ${res.status}). Try again in a moment.`;
          setThread((t) => [
            ...t,
            {
              id: nextId(),
              side: "in",
              text: msg,
              source: "system",
              ts: new Date().toISOString(),
              latencyMs: Date.now() - started,
            },
          ]);
          return;
        }

        setThread((t) => [
          ...t,
          {
            id: nextId(),
            side: "in",
            text: data.reply,
            source: data.source ?? "ai",
            latencyMs: data.latencyMs ?? Date.now() - started,
            ts: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        // AbortError = user-cancelled — stay quiet.
        if ((err as Error).name === "AbortError") return;
        setThread((t) => [
          ...t,
          {
            id: nextId(),
            side: "in",
            text: "Network hiccup reaching the tutor. Try again — your message is still in the thread.",
            source: "system",
            ts: new Date().toISOString(),
            latencyMs: Date.now() - started,
          },
        ]);
      } finally {
        if (abortRef.current === ctrl) abortRef.current = null;
        setPending(false);
      }
    },
    [pageContext.kind, pageContext.topic, pageContext.worldLabel, teacherName, worldSlug]
  );

  const ask = useCallback(
    (promptText: string) => {
      if (!promptText.trim() || pending) return;
      const userText = promptText.trim();

      const history: Array<{ role: "user" | "assistant"; text: string }> = thread
        .filter((b) => b.source !== "system") // drop the opening greeting + system errors
        .map((b) => ({
          role: b.side === "out" ? ("user" as const) : ("assistant" as const),
          text: b.text,
        }));
      history.push({ role: "user", text: userText });

      setThread((t) => [
        ...t,
        { id: nextId(), side: "out", text: userText, ts: new Date().toISOString() },
      ]);
      setDraft("");
      // Focus stays on the input so the learner can keep typing.
      inputRef.current?.focus();

      void send(history);
    },
    [pending, thread, send]
  );

  const regenerateLast = useCallback(() => {
    if (pending) return;
    // Find the last user turn — regenerate from there forward.
    const lastUserIdx = [...thread].reverse().findIndex((b) => b.side === "out");
    if (lastUserIdx < 0) return;
    const cutoff = thread.length - 1 - lastUserIdx;
    const truncated = thread.slice(0, cutoff + 1);
    setThread(truncated);
    const history: Array<{ role: "user" | "assistant"; text: string }> = truncated
      .filter((b) => b.source !== "system")
      .map((b) => ({
        role: b.side === "out" ? ("user" as const) : ("assistant" as const),
        text: b.text,
      }));
    void send(history);
  }, [pending, thread, send]);

  const clearConversation = useCallback(() => {
    cancelInFlight();
    setThread([
      {
        id: nextId(),
        side: "in",
        text: opening,
        source: "system",
        ts: new Date().toISOString(),
      },
    ]);
  }, [opening, cancelInFlight]);

  const lastIsAssistant = thread.length > 1 && thread[thread.length - 1]!.side === "in" && !pending;

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PersonaAvatar emoji={teacherEmoji} color={journey.color} bg={journey.bg} size={36} />
          <div>
            <div className="text-sm font-bold text-ink">{teacherName}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-soft">
              <span
                aria-hidden
                className="inline-block"
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: pending ? "var(--brand-1)" : "#16a34a",
                }}
              />
              {pending ? "Thinking…" : "Your AI teacher"}
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Clear conversation"
          title="Clear conversation"
          onClick={clearConversation}
          className="hover:bg-bg-2 grid h-7 w-7 place-items-center rounded-md text-ink-mute hover:text-ink"
        >
          ↻
        </button>
      </div>

      {/* Memory ribbon — real progress when available */}
      <MemoryRibbon memory={memory} accent={journey.color} />

      {/* Thread */}
      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1"
        role="log"
        aria-live="polite"
      >
        {thread.map((b, i) => {
          const isLastAssistant = lastIsAssistant && i === thread.length - 1;
          return (
            <ChatBubble key={b.id} side={b.side} source={b.source} latencyMs={b.latencyMs}>
              {b.text}
              {isLastAssistant ? (
                <div className="mt-1.5 flex justify-end gap-2 text-[10px] text-ink-mute">
                  <button
                    type="button"
                    onClick={regenerateLast}
                    className="hover:bg-bg-2 rounded px-1.5 py-0.5 hover:text-ink-soft"
                    title="Regenerate this reply"
                  >
                    ↻ Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(b.text);
                    }}
                    className="hover:bg-bg-2 rounded px-1.5 py-0.5 hover:text-ink-soft"
                    title="Copy reply"
                  >
                    ⎘ Copy
                  </button>
                </div>
              ) : null}
            </ChatBubble>
          );
        })}
        {pending ? (
          <ChatBubble side="in" source="ai">
            <span className="inline-flex items-center gap-1.5 text-ink-mute">
              <Dot delay={0} /> <Dot delay={120} /> <Dot delay={240} />
              <button
                type="button"
                onClick={cancelInFlight}
                className="hover:bg-bg-2 ml-2 rounded px-1.5 py-0.5 text-[10px] font-bold text-ink-mute hover:text-ink"
                title="Stop generating (Esc)"
              >
                ✕ Stop
              </button>
            </span>
          </ChatBubble>
        ) : null}
      </div>

      {/* Suggested prompts — every one calls the real AI on click */}
      {!pending ? (
        <div>
          <div className="mb-1.5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            Try one
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {prompts.map((p) => (
              <li key={p.label}>
                <SuggestedChip prompt={p} onClick={() => ask(p.prompt)} disabled={pending} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {/* Input */}
      <form
        className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <input
          ref={inputRef}
          aria-label={`Ask ${teacherName} anything`}
          placeholder={pending ? "Tutor is thinking…" : `Ask ${teacherName}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={pending}
          className="flex-1 border-none bg-transparent text-[13px] outline-none disabled:opacity-50"
        />
        <button
          type="button"
          className="text-base text-ink-mute disabled:opacity-30"
          aria-label="Voice input (coming soon)"
          title="Voice input coming soon"
          disabled
        >
          🎤
        </button>
        <button
          type="submit"
          disabled={!draft.trim() || pending}
          className="grid h-7 w-7 place-items-center rounded-lg text-xs text-white disabled:opacity-40"
          style={{ background: "var(--brand-grad)" }}
          aria-label="Send message"
        >
          ↑
        </button>
      </form>

      {/* Transparency footer */}
      <Link href="/progress" className="text-center text-[10px] text-ink-mute hover:text-ink-soft">
        See or clear what I remember →
      </Link>
    </div>
  );
}

/* ── Build the memory ribbon from real progress data ────────────────── */
function buildMemory(
  progress: ReturnType<typeof useProgress>,
  worldSlug: string | undefined,
  ctx: PageContext
): TutorMemory {
  const demo = memoryForWorld(worldSlug);
  if (!worldSlug || !progress.hydrated) return demo;

  const world = progress.worldOf(worldSlug);
  const streak = progress.state.streak.current;

  // Compose real-data-first values, falling back to the demo shape so
  // the ribbon is never empty on a fresh visit.
  return {
    goal: demo.goal,
    weakArea:
      world.xp === 0 && streak === 0
        ? demo.weakArea
        : `${world.xp.toLocaleString()} XP · ${streak}-day streak`,
    lastTopic: ctx.topic ?? demo.lastTopic,
  };
}

/* ── Memory ribbon ──────────────────────────────────────────────────── */
function MemoryRibbon({ memory, accent }: { memory: TutorMemory; accent: string }) {
  const items: Array<{ label: string; value: string }> = [];
  if (memory.goal) items.push({ label: "Goal", value: memory.goal });
  if (memory.weakArea) items.push({ label: "Recent", value: memory.weakArea });
  if (memory.lastTopic) items.push({ label: "On", value: memory.lastTopic });
  if (items.length === 0) return null;

  return (
    <div
      className="rounded-xl border border-line-soft p-2.5"
      style={{ background: "var(--surface-soft)" }}
    >
      <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
        Mentor remembers
      </div>
      <ul className="mt-1.5 space-y-1">
        {items.map((it) => (
          <li
            key={it.label}
            className="flex items-baseline gap-2 text-[12px]"
            title={`${it.label}: ${it.value}`}
          >
            <span
              aria-hidden
              className="la-mono text-[9px] font-extrabold uppercase tracking-wider"
              style={{ color: accent }}
            >
              {it.label}
            </span>
            <span className="truncate text-ink-soft">{it.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ── Suggested prompt chip with technique label ─────────────────────── */
function SuggestedChip({
  prompt,
  onClick,
  disabled,
}: {
  prompt: SuggestedPrompt;
  onClick: () => void;
  disabled?: boolean;
}) {
  const meta = METHOD_META[prompt.method];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="la-pill cursor-pointer text-[11px] hover:-translate-y-px disabled:opacity-40"
      style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
      title={`${meta.name} · ${meta.hint}`}
    >
      <span aria-hidden>{meta.icon}</span>
      <span className="font-semibold text-ink-soft">{prompt.label}</span>
    </button>
  );
}

/* ── Bubble with optional source + latency badge ────────────────────── */
function ChatBubble({
  side,
  source,
  latencyMs,
  children,
}: {
  side: "in" | "out";
  source?: "ai" | "fallback" | "system";
  latencyMs?: number;
  children: ReactNode;
}) {
  if (side === "in") {
    return (
      <div
        className="self-start rounded-[14px_14px_14px_4px] border border-line-soft bg-white p-2.5 text-[13px] leading-snug"
        style={{ maxWidth: "92%" }}
      >
        <div>{children}</div>
        {source && source !== "system" ? (
          <div className="la-mono mt-1 flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-ink-mute">
            {source === "ai" ? "✨ AI" : "📘 offline reply"}
            {latencyMs ? <span>· {(latencyMs / 1000).toFixed(1)}s</span> : null}
          </div>
        ) : null}
      </div>
    );
  }
  return (
    <div
      className="self-end rounded-[14px_14px_4px_14px] p-2.5 text-[13px] leading-snug text-white"
      style={{ maxWidth: "92%", background: "var(--brand-grad)" }}
    >
      {children}
    </div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <span
      aria-hidden
      className="inline-block h-1.5 w-1.5 rounded-full bg-ink-mute"
      style={{ animation: `wt-dot 1.2s ${delay}ms infinite ease-in-out` }}
    />
  );
}
