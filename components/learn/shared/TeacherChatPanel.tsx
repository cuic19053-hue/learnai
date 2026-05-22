"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import PersonaAvatar from "@/components/design/PersonaAvatar";
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

type Bubble = { side: "in" | "out"; text: string };

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
  /** World slug — used to read demo tutor memory. */
  worldSlug?: string;
};

/**
 * Persistent AI tutor rail. Industry + study-guide best practices:
 *
 *   - Context-aware suggested prompts, each labelled with a named
 *     learning technique (Socratic, Feynman, active recall, spaced
 *     repetition, interleaving, worked example, metacognition).
 *   - Visible "Mentor remembers" ribbon — transparency about what the
 *     tutor knows. Every chip is reversible from a single footer link.
 *   - Honest AI-UX: thinking state, send affordance, voice placeholder,
 *     no fake intelligence claims.
 */
export default function TeacherChatPanel({
  journey,
  teacherName = "Nova",
  teacherEmoji = "🦉",
  greeting,
  pageContext = { kind: "world-home" },
  worldSlug,
}: TeacherChatPanelProps) {
  const memory = useMemo(() => memoryForWorld(worldSlug), [worldSlug]);
  const opening = greeting ?? greetingFor(pageContext, teacherName);
  const prompts = useMemo(() => promptsForContext(pageContext), [pageContext]);

  const [thread, setThread] = useState<Bubble[]>([{ side: "in", text: opening }]);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");

  // Reset the thread when the page context changes — every screen
  // gets a fresh greeting so the tutor never feels stale.
  useEffect(() => {
    setThread([{ side: "in", text: opening }]);
  }, [opening]);

  function ask(promptText: string) {
    if (!promptText.trim() || pending) return;
    const userText = promptText.trim();

    // Build the history payload from the current thread + this new turn.
    // The opening greeting is informational, not a real exchange — skip it
    // unless there's been at least one back-and-forth.
    const history: Array<{ role: "user" | "assistant"; text: string }> = thread
      .slice(1) // drop opening greeting
      .map((b) => ({
        role: b.side === "out" ? ("user" as const) : ("assistant" as const),
        text: b.text,
      }));
    history.push({ role: "user", text: userText });

    setThread((t) => [...t, { side: "out", text: userText }]);
    setDraft("");
    setPending(true);

    void (async () => {
      try {
        const res = await fetch("/api/tutor/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
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
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          // eslint-disable-next-line no-console
          console.error("[tutor-rail] backend error:", data);
          setThread((t) => [
            ...t,
            {
              side: "in",
              text:
                (data?.error as string | undefined) ??
                "I'm having trouble reaching the model right now. Try again in a moment.",
            },
          ]);
        } else {
          // eslint-disable-next-line no-console
          console.log(
            `[tutor-rail] reply source=${data.source} ms=${data.latencyMs ?? "-"}`,
          );
          setThread((t) => [...t, { side: "in", text: data.reply as string }]);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[tutor-rail] network error:", err);
        setThread((t) => [
          ...t,
          {
            side: "in",
            text: "Network hiccup reaching the tutor. Try again — your message is still in the thread.",
          },
        ]);
      } finally {
        setPending(false);
      }
    })();
  }

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <PersonaAvatar emoji={teacherEmoji} color={journey.color} bg={journey.bg} size={36} />
          <div>
            <div className="text-sm font-bold text-ink">{teacherName}</div>
            <div className="text-[11px] text-ink-soft flex items-center gap-1.5">
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 99,
                  background: "var(--ok)",
                  display: "inline-block",
                }}
              />
              Your AI teacher
            </div>
          </div>
        </div>
        <button
          type="button"
          aria-label="Tutor settings"
          className="grid h-7 w-7 place-items-center rounded-md text-ink-mute hover:bg-bg-2"
        >
          ⋯
        </button>
      </div>

      {/* Memory ribbon — gap F + G: transparency about what the tutor knows */}
      <MemoryRibbon memory={memory} accent={journey.color} />

      {/* Thread */}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1" role="log" aria-live="polite">
        {thread.map((b, i) => (
          <ChatBubble key={i} side={b.side}>
            {b.text}
          </ChatBubble>
        ))}
        {pending ? (
          <ChatBubble side="in">
            <span className="inline-flex items-center gap-1.5 text-ink-mute">
              <Dot delay={0} /> <Dot delay={120} /> <Dot delay={240} />
            </span>
          </ChatBubble>
        ) : null}
      </div>

      {/* Suggested prompts — every one is anchored to a named technique */}
      <div>
        <div className="text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute mb-1.5">
          Try one
        </div>
        <ul className="flex flex-wrap gap-1.5">
          {prompts.map((p) => (
            <li key={p.label}>
              <SuggestedChip prompt={p} onClick={() => ask(p.prompt)} />
            </li>
          ))}
        </ul>
      </div>

      {/* Input */}
      <form
        className="flex items-center gap-2 rounded-2xl border border-line bg-white p-2.5"
        onSubmit={(e) => {
          e.preventDefault();
          ask(draft);
        }}
      >
        <input
          aria-label={`Ask ${teacherName} anything`}
          placeholder={`Ask ${teacherName}…`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          disabled={pending}
          className="flex-1 border-none bg-transparent text-[13px] outline-none"
        />
        <button
          type="button"
          className="text-base text-ink-mute"
          aria-label="Voice input (coming soon)"
          title="Voice input coming soon"
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

      {/* Transparency footer — data control is a baseline expectation */}
      <Link
        href="/progress"
        className="text-center text-[10px] text-ink-mute hover:text-ink-soft"
      >
        See or clear what I remember →
      </Link>
    </div>
  );
}

/* ── Memory ribbon ──────────────────────────────────────────────────── */
function MemoryRibbon({ memory, accent }: { memory: TutorMemory; accent: string }) {
  const items: Array<{ label: string; value: string }> = [];
  if (memory.goal) items.push({ label: "Goal", value: memory.goal });
  if (memory.weakArea) items.push({ label: "Weak", value: memory.weakArea });
  if (memory.lastTopic) items.push({ label: "Last", value: memory.lastTopic });
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
}: {
  prompt: SuggestedPrompt;
  onClick: () => void;
}) {
  const meta = METHOD_META[prompt.method];
  return (
    <button
      type="button"
      onClick={onClick}
      className="la-pill cursor-pointer text-[11px] hover:-translate-y-px"
      style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
      title={`${meta.name} · ${meta.hint}`}
    >
      <span aria-hidden>{meta.icon}</span>
      <span className="font-semibold text-ink-soft">{prompt.label}</span>
    </button>
  );
}

/* ── Bubble + thinking dot ──────────────────────────────────────────── */
function ChatBubble({ side, children }: { side: "in" | "out"; children: ReactNode }) {
  if (side === "in") {
    return (
      <div
        className="self-start rounded-[14px_14px_14px_4px] border border-line-soft bg-white p-2.5 text-[13px] leading-snug"
        style={{ maxWidth: "92%" }}
      >
        {children}
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
