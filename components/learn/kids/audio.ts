"use client";

/**
 * Kids audio toolkit.
 *
 * Two sound sources, both zero-asset:
 *   1. Web Audio API for tiny celebratory chimes (correct ping, star
 *      pop, completion fanfare). Generated on the fly so we don't
 *      ship sound files.
 *   2. SpeechSynthesis for spoken prompts, item names, and praise.
 *      Falls back silently when unsupported.
 *
 * Why audio matters for 3-year-olds:
 *   - They can't read; voice is the primary input channel
 *   - Positive sound on every successful tap = dopamine = engagement
 *   - Different pitch for ascending counts builds number-sense
 *
 * All public APIs are best-effort and tolerant — never throw on a
 * locked AudioContext or a missing voice. The UI just stays quieter.
 */

import { useCallback, useEffect, useRef } from "react";

let SHARED_CTX: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const W = window as unknown as {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  const Ctor = W.AudioContext ?? W.webkitAudioContext;
  if (!Ctor) return null;
  if (!SHARED_CTX) SHARED_CTX = new Ctor();
  // Browsers suspend the context until a user gesture; resume best-effort.
  if (SHARED_CTX.state === "suspended") {
    void SHARED_CTX.resume().catch(() => {});
  }
  return SHARED_CTX;
}

/** Short tone — one note with a quick attack/decay envelope. */
function tone(freq: number, durationMs = 180, type: OscillatorType = "sine", gain = 0.22) {
  const ctx = getCtx();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  // Quick fade-in (avoid click), held briefly, then fade out.
  env.gain.setValueAtTime(0.0001, t0);
  env.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  env.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
  osc.connect(env).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationMs / 1000 + 0.02);
}

/** Chord — three notes layered for a fuller "tada" feel. */
function chord(freqs: number[], durationMs = 260) {
  freqs.forEach((f) => tone(f, durationMs, "triangle", 0.16));
}

// ── Public chimes ────────────────────────────────────────────────

/** Positive ping for a successful tap. C major triad ascending. */
export function chimeCorrect() {
  chord([523.25, 659.25, 783.99], 260); // C5, E5, G5
}

/** Soft tick for each item counted (pitch rises with `step`). */
export function chimeCount(step: number) {
  const base = 392; // G4
  const f = base * Math.pow(2, (step % 8) / 12); // step ≈ 1 semitone up
  tone(f, 140, "sine", 0.18);
}

/** Star-pop for the reward screen. Bell-like high triangle. */
export function chimeStarPop(starIdx: 1 | 2 | 3) {
  const map = { 1: 988, 2: 1175, 3: 1397 }; // B5 · D6 · F6
  tone(map[starIdx], 220, "triangle", 0.2);
}

/** Mini fanfare when the whole lesson is complete. */
export function chimeComplete() {
  // C — E — G — C: a tiny rising arpeggio.
  const ctx = getCtx();
  if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
    setTimeout(() => tone(f, 220, "triangle", 0.18), i * 110)
  );
}

/** Gentle "try again" tone — neutral, never punishing. */
export function chimeTry() {
  tone(330, 120, "sine", 0.16); // E4
}

// ── Speech ───────────────────────────────────────────────────────

/** Speak `text` in `langCode` if the platform supports it. Returns
 *  a Promise that resolves when speech ends (or immediately if no
 *  speech engine). Safe to await but you don't have to. */
export function speak(text: string, langCode = "en"): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode === "en" ? "en-US" : langCode;
      utter.rate = 0.85; // slow for ages 3-6
      utter.pitch = 1.1;
      utter.onend = () => resolve();
      utter.onerror = () => resolve();
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {
      resolve();
    }
  });
}

/** Cancel anything Milo is saying right now. */
export function shutUp() {
  if (typeof window === "undefined") return;
  try {
    window.speechSynthesis.cancel();
  } catch {
    /* silent */
  }
}

// ── Convenience hook ─────────────────────────────────────────────

/** Speak something once when the component mounts. Useful for the
 *  initial game prompt: "How many apples?" said as the stage opens. */
export function useSpeakOnce(text: string, langCode: string, deps: unknown[] = []) {
  const sawRef = useRef(false);
  useEffect(() => {
    if (sawRef.current) return;
    sawRef.current = true;
    // Tiny delay so the page paints first.
    const t = setTimeout(() => {
      void speak(text, langCode);
    }, 250);
    return () => {
      clearTimeout(t);
      shutUp();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** Hook that returns a stable `play` function. The hook also unlocks
 *  the AudioContext on the first call (some browsers require a user
 *  gesture before audio works). */
export function useKidsAudio() {
  return useCallback(
    (
      kind: "correct" | "count" | "star1" | "star2" | "star3" | "complete" | "try",
      step?: number
    ) => {
      switch (kind) {
        case "correct":
          chimeCorrect();
          break;
        case "count":
          chimeCount(step ?? 0);
          break;
        case "star1":
          chimeStarPop(1);
          break;
        case "star2":
          chimeStarPop(2);
          break;
        case "star3":
          chimeStarPop(3);
          break;
        case "complete":
          chimeComplete();
          break;
        case "try":
          chimeTry();
          break;
      }
    },
    []
  );
}
