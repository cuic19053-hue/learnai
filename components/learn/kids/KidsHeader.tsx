"use client";

/**
 * Shared header for the /learn/kids tree.
 *
 * Pattern from the design handoff: brand + parent-controlled language
 * pill + hold-to-open parent lock. Used identically on the Little
 * Learner home, every subject home, and every Play sequence.
 *
 * The lock button is wired with a `pointerdown → 800 ms` hold timer
 * so a child's tap doesn't open the parent menu — only an intentional
 * adult hold opens it.
 *
 * `dim` makes the header opaque-light against subject gradients;
 * `onlyBrand` is for play screens where the language picker would be
 * a distraction and only the brand + lock should be visible.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LANGUAGES, findLanguage, type Language } from "@/lib/letterforge/languages";
import XpBar from "./XpBar";

const HOLD_MS = 800;
const COOKIE_NAME = "miloLang";

export type KidsHeaderProps = {
  /** Current language code (server-resolved). */
  langCode: string;
  /** Title shown next to the brand mark, e.g. "Little Learner" or "Milo Letters". */
  title: string;
  /** Play screens hide the language picker so the child can focus. */
  onlyBrand?: boolean;
  /** Optional back link rendered as the first item. */
  backHref?: string;
  /** Optional progress indicator (e.g. "Game 1 of 3"). */
  progressLabel?: string;
};

export default function KidsHeader({
  langCode,
  title,
  onlyBrand,
  backHref,
  progressLabel,
}: KidsHeaderProps) {
  const router = useRouter();
  const search = useSearchParams();
  const [code, setCode] = useState(langCode);
  const lang = useMemo(() => findLanguage(code), [code]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [parentOpen, setParentOpen] = useState(false);

  // Persist the picked language for next visit.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.cookie = `${COOKIE_NAME}=${code}; Max-Age=${60 * 60 * 24 * 365}; Path=/; SameSite=Lax`;
  }, [code]);

  function applyLang(next: string) {
    setCode(next);
    setPickerOpen(false);
    const params = new URLSearchParams(search?.toString() ?? "");
    params.set("lang", next);
    // Replace in place so reloading keeps the picked language even if
    // the cookie hasn't been read yet by an upstream cache.
    router.replace(`?${params.toString()}`);
  }

  // Hold-to-open parent lock.
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function startHold() {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setParentOpen(true), HOLD_MS);
  }
  function cancelHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }
  useEffect(() => () => cancelHold(), []);

  return (
    <header
      style={{
        position: "relative",
        zIndex: 5,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Back"
            style={{
              padding: "6px 12px",
              borderRadius: 99,
              background: "#fff",
              border: "2px solid #fde68a",
              color: "#9a3412",
              fontWeight: 800,
              fontSize: 13,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            ←
          </Link>
        ) : (
          <Link
            href="/"
            aria-label="Back to LearnAI home"
            title="Back to home"
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#ec4899,#f59e0b)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontSize: 15,
              fontWeight: 800,
              boxShadow: "0 4px 10px rgba(236,72,153,.3)",
              textDecoration: "none",
            }}
          >
            L
          </Link>
        )}
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#9a3412",
            letterSpacing: "-0.01em",
          }}
        >
          {title}
        </span>
        {progressLabel ? (
          <span
            className="la-mono"
            style={{
              padding: "3px 8px",
              borderRadius: 99,
              background: "rgba(255,255,255,.7)",
              color: "#9a3412",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: ".06em",
            }}
          >
            {progressLabel}
          </span>
        ) : null}
      </div>

      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        <XpBar />
        {!onlyBrand ? (
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            aria-label={`Language: ${lang.name}. Tap to change.`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 14px 8px 10px",
              borderRadius: 99,
              background: "#fff",
              border: "2px solid #ec4899",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 800,
              color: "#9a3412",
              boxShadow: "0 4px 12px rgba(236,72,153,.15)",
            }}
          >
            <span style={{ fontSize: 22 }} aria-hidden>
              {lang.flag}
            </span>
            <span>{lang.name}</span>
            <span aria-hidden style={{ fontSize: 10, opacity: 0.6 }}>
              ▾
            </span>
          </button>
        ) : null}

        <button
          type="button"
          onPointerDown={startHold}
          onPointerUp={cancelHold}
          onPointerLeave={cancelHold}
          onPointerCancel={cancelHold}
          aria-label="Hold to open parent area"
          title="Hold for parent area"
          style={{
            width: 40,
            height: 40,
            borderRadius: 99,
            background: "rgba(255,255,255,.7)",
            border: "none",
            cursor: "pointer",
            fontSize: 18,
          }}
        >
          🔒
        </button>

        {pickerOpen ? (
          <LanguagePicker active={code} onPick={applyLang} onClose={() => setPickerOpen(false)} />
        ) : null}
        {parentOpen ? <ParentMenu onClose={() => setParentOpen(false)} /> : null}
      </div>
    </header>
  );
}

function LanguagePicker({
  active,
  onPick,
  onClose,
}: {
  active: string;
  onPick: (code: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-label="Close language picker"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          border: "none",
          cursor: "default",
          zIndex: 5,
        }}
      />
      <div
        role="dialog"
        aria-label="Choose language"
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 50,
          width: 320,
          padding: 14,
          borderRadius: 22,
          background: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,.18)",
          border: "2px solid #ec4899",
          zIndex: 6,
        }}
      >
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.6,
            letterSpacing: ".08em",
            marginBottom: 8,
            padding: "0 6px",
          }}
        >
          PARENT · CHOOSE LANGUAGE
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
          {LANGUAGES.map((l) => (
            <LanguageOption key={l.code} l={l} active={l.code === active} onPick={onPick} />
          ))}
        </div>
        <div
          style={{
            marginTop: 10,
            padding: "8px 10px",
            borderRadius: 8,
            background: "#fef3c7",
            fontSize: 11,
            color: "#9a3412",
            lineHeight: 1.4,
          }}
        >
          🌍 The child hears letters and example words in this language.
        </div>
      </div>
    </>
  );
}

function LanguageOption({
  l,
  active,
  onPick,
}: {
  l: Language;
  active: boolean;
  onPick: (code: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(l.code)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        borderRadius: 12,
        background: active ? "#fce0ec" : "transparent",
        border: active ? "2px solid #ec4899" : "2px solid transparent",
        cursor: "pointer",
        fontFamily: "inherit",
        fontSize: 13,
        fontWeight: 700,
        color: "#9a3412",
        textAlign: "left",
      }}
    >
      <span style={{ fontSize: 20 }} aria-hidden>
        {l.flag}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {l.name}
        </div>
        <div className="la-mono" style={{ fontSize: 10, opacity: 0.6 }}>
          {l.todayLetter} · &ldquo;{l.todaySay}&rdquo;
        </div>
      </div>
      {active ? <span style={{ color: "#ec4899", fontSize: 14 }}>✓</span> : null}
    </button>
  );
}

function ParentMenu({ onClose }: { onClose: () => void }) {
  return (
    <>
      <button
        type="button"
        aria-label="Close parent menu"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15,20,48,.3)",
          border: "none",
          cursor: "default",
          zIndex: 7,
        }}
      />
      <div
        role="dialog"
        aria-label="Parent area"
        style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 260,
          padding: 12,
          borderRadius: 18,
          background: "#fff",
          boxShadow: "0 20px 50px rgba(0,0,0,.2)",
          zIndex: 8,
        }}
      >
        <div
          className="la-mono"
          style={{
            fontSize: 10,
            fontWeight: 800,
            color: "#9a3412",
            opacity: 0.7,
            letterSpacing: ".08em",
            padding: "6px 6px",
          }}
        >
          PARENT AREA
        </div>
        <ParentLink href="/learn/kids/parent">👨‍👩‍👧 Parent dashboard</ParentLink>
        <ParentLink href="/learn/kids/parent#settings">⚙️ Language, subjects, time</ParentLink>
        <ParentLink href="/learn/kids/parent#reports">📊 This week</ParentLink>
        <ParentLink href="/learn">← Leave Little Learner</ParentLink>
      </div>
    </>
  );
}

function ParentLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        padding: "10px 12px",
        borderRadius: 10,
        color: "#9a3412",
        fontWeight: 700,
        textDecoration: "none",
        fontSize: 13,
      }}
    >
      {children}
    </Link>
  );
}
