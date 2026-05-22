"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Mark from "@/components/design/Mark";
import { TEACHERS, type Teacher } from "@/lib/learn/teachers";
import { useTTS } from "@/lib/tts/use-tts";
import { PERSONA_VOICE_DEFAULTS } from "@/lib/tts/voices";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type UserSettings,
} from "@/lib/settings/prefs";

/**
 * User settings — pick your AI tutor, voice, and speech engine.
 *
 * Three sections in one page (no tabs — short enough to scroll on
 * mobile, three clearly-labelled cards on desktop):
 *
 *   1. AI tutor — which persona greets you / drives the chat rail
 *   2. Voice (TTS) — speech engine + per-engine voice picker
 *   3. Test it — sample button that speaks a short sentence so you
 *      can hear the new voice before you leave the page
 *
 * Everything saves to localStorage. No server round-trip. A guest can
 * change settings and have them survive reload, exactly the same as a
 * signed-in user — sync-to-server lands when DB persistence ships.
 */
export default function UserSettingsClient() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const [sample, setSample] = useState("Hi! Let's learn something new together today.");
  const [speaking, setSpeaking] = useState(false);
  const [engineNotice, setEngineNotice] = useState<string | null>(null);
  const tts = useTTS();

  useEffect(() => {
    setSettings(loadSettings());
    setHydrated(true);
  }, []);

  function update(patch: Partial<UserSettings>) {
    setSettings(saveSettings(patch));
  }

  async function changeEngine(engineId: "web-speech" | "piper") {
    setEngineNotice(null);
    if (engineId === "piper") {
      setEngineNotice(
        "Loading Piper — first use downloads a ~20 MB voice model and caches it. After that it runs fully offline."
      );
    }
    const ok = await tts.setEngine(engineId);
    update({ ttsEngine: tts.engine });
    if (!ok) {
      setEngineNotice("Couldn't load Piper. Falling back to the built-in Web Speech voice.");
    } else if (engineId === "piper") {
      setEngineNotice("Piper ready — voices below run fully offline.");
    } else {
      setEngineNotice(null);
    }
  }

  function changeVoice(voiceId: string) {
    tts.setVoice(voiceId);
    const voice = tts.voices.find((v) => v.id === voiceId);
    update({ voiceLabel: voice ? `${voice.name} · ${voice.lang}` : null });
  }

  function changeTeacher(t: Teacher) {
    update({ teacherId: t.id });
    // If the active engine is Piper, also nudge the voice to the
    // persona-recommended one so swapping teachers genuinely changes
    // the sound, not just the avatar.
    const recommended = PERSONA_VOICE_DEFAULTS[t.id];
    if (recommended && tts.engine === "piper") {
      tts.setVoice(recommended);
      const voice = tts.voices.find((v) => v.id === recommended);
      update({ voiceLabel: voice ? `${voice.name} · ${voice.lang}` : null });
    }
  }

  async function testVoice() {
    setSpeaking(true);
    await tts.speak(sample, {
      rate: 0.95,
      pitch: 1.05,
      onEnd: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
    // Some engines resolve before audio actually finishes — use a
    // generous fallback timer to clear the speaking pill.
    window.setTimeout(() => setSpeaking(false), 8_000);
  }

  const activeTeacher = useMemo(
    () => TEACHERS.find((t) => t.id === settings.teacherId) ?? TEACHERS[0]!,
    [settings.teacherId]
  );

  // Voices grouped by language for the dropdown.
  const voicesByLang = useMemo(() => {
    const grouped = new Map<string, typeof tts.voices>();
    for (const v of tts.voices) {
      const key = v.lang || "—";
      const list = grouped.get(key) ?? [];
      list.push(v);
      grouped.set(key, list);
    }
    return Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [tts.voices]);

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Top bar */}
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex max-w-[960px] items-center justify-between px-5 py-4">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <Link href="/" className="text-[13px] font-bold text-ink-soft hover:text-ink">
            ← Back to LearnAI
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[960px] px-5 pb-20 pt-10">
        <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-1">
          Your settings
        </div>
        <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.02em] text-ink md:text-[40px]">
          Make it yours
        </h1>
        <p className="mt-2 max-w-[640px] text-[14px] text-ink-soft">
          Pick the AI tutor, the voice, and the speech engine. Everything saves on your device — no
          account needed, no sync to anywhere.
        </p>

        {!hydrated ? (
          <div className="mt-8 h-48 animate-pulse rounded-2xl bg-line-soft" />
        ) : (
          <div className="mt-8 space-y-5">
            {/* ── AI tutor ── */}
            <section className="la-card p-6" style={{ borderRadius: 20 }}>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
                    🎭 Your AI tutor
                  </h2>
                  <p className="mt-1 text-[12.5px] text-ink-soft">
                    Each persona has its own style and pace. Switch any time — your progress stays.
                  </p>
                </div>
                <div
                  className="grid h-12 w-12 flex-none place-items-center rounded-2xl text-[24px]"
                  style={{ background: "var(--bg-2)" }}
                  aria-hidden
                >
                  {activeTeacher.emoji}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {TEACHERS.map((t) => {
                  const active = t.id === settings.teacherId;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => changeTeacher(t)}
                      aria-pressed={active}
                      className="flex items-center gap-3 rounded-2xl p-3.5 text-left transition"
                      style={{
                        background: active ? "var(--bg-2)" : "#fff",
                        border: active
                          ? "1.5px solid var(--brand-1)"
                          : "1px solid var(--line-soft)",
                        boxShadow: active ? "0 0 0 4px rgba(46,91,255,.08)" : "var(--shadow-1)",
                      }}
                    >
                      <span
                        className="grid h-11 w-11 flex-none place-items-center rounded-xl text-[22px]"
                        style={{ background: "var(--surface-soft)" }}
                        aria-hidden
                      >
                        {t.emoji}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[14px] font-extrabold text-ink">{t.name}</span>
                          {t.universal ? (
                            <span
                              className="la-pill text-[9px] font-extrabold"
                              style={{ background: "var(--bg-2)", color: "var(--ink-mute)" }}
                            >
                              Universal
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-0.5 text-[11.5px] text-ink-mute">
                          {t.tag} · {t.focus}
                        </div>
                      </div>
                      {active ? (
                        <span aria-hidden className="text-brand-1">
                          ✓
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ── TTS engine + voice ── */}
            <section className="la-card p-6" style={{ borderRadius: 20 }}>
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
                    🔊 Voice (text-to-speech)
                  </h2>
                  <p className="mt-1 text-[12.5px] text-ink-soft">
                    Pick how the tutor sounds. The built-in browser voices work instantly; Piper
                    voices are higher quality and run fully offline after the first download.
                  </p>
                </div>
              </div>

              <div className="la-mono mt-5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                TTS engine
              </div>
              <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {tts.engines.map((e) => {
                  const active = e.id === tts.engine;
                  return (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => void changeEngine(e.id)}
                      disabled={!e.available}
                      aria-pressed={active}
                      className="rounded-2xl p-4 text-left transition"
                      style={{
                        background: active ? "var(--bg-2)" : "#fff",
                        border: active
                          ? "1.5px solid var(--brand-1)"
                          : "1px solid var(--line-soft)",
                        boxShadow: active ? "0 0 0 4px rgba(46,91,255,.08)" : "var(--shadow-1)",
                        opacity: e.available ? 1 : 0.6,
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span aria-hidden className="text-[18px]">
                          {e.id === "piper" ? "🧠" : "🌐"}
                        </span>
                        <span className="text-[14px] font-extrabold text-ink">{e.displayName}</span>
                        {active ? (
                          <span
                            className="la-pill text-[9px] font-extrabold"
                            style={{ background: "var(--brand-grad)", color: "#fff" }}
                          >
                            ACTIVE
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-1.5 text-[11.5px] leading-relaxed text-ink-soft">
                        {e.id === "piper"
                          ? "Runs fully in-browser via WebAssembly. First use downloads a ~20 MB voice model (cached)."
                          : "Built into your browser. Quality depends on the operating system."}
                      </div>
                    </button>
                  );
                })}
              </div>

              {engineNotice ? (
                <div
                  role="status"
                  className="mt-3 rounded-xl border border-line-soft px-4 py-2.5 text-[12.5px] leading-relaxed text-ink-soft"
                  style={{ background: "var(--bg-2)" }}
                >
                  {engineNotice}
                </div>
              ) : null}

              <div className="la-mono mt-5 text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                Voice ({tts.voices.length} available)
              </div>
              <div className="mt-2">
                {tts.voices.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-line bg-surface-soft px-3 py-3 text-[12.5px] text-ink-mute">
                    No voices available for this engine on your device.
                  </div>
                ) : (
                  <select
                    value={tts.voiceId ?? ""}
                    onChange={(e) => changeVoice(e.target.value)}
                    className="w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] outline-none focus:border-brand-1"
                  >
                    {voicesByLang.map(([lang, list]) => (
                      <optgroup key={lang} label={lang}>
                        {list.map((v) => (
                          <option key={v.id} value={v.id}>
                            {v.name}
                            {v.gender ? ` · ${v.gender}` : ""}
                            {v.quality ? ` · ${v.quality}` : ""}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}
              </div>
            </section>

            {/* ── Test it ── */}
            <section className="la-card p-6" style={{ borderRadius: 20 }}>
              <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
                ▶ Test the voice
              </h2>
              <p className="mt-1 text-[12.5px] text-ink-soft">
                Hear the current engine + voice combo with a sample sentence.
              </p>
              <textarea
                value={sample}
                onChange={(e) => setSample(e.target.value.slice(0, 280))}
                rows={2}
                className="mt-3 w-full resize-none rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] text-ink outline-none focus:border-brand-1"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void testVoice()}
                  disabled={speaking || !sample.trim()}
                  className="la-btn"
                  style={{ padding: "11px 18px", fontSize: 14 }}
                >
                  {speaking ? "Speaking…" : "▶ Hear it"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    tts.stop();
                    setSpeaking(false);
                  }}
                  className="la-btn ghost"
                  style={{ padding: "11px 14px", fontSize: 13 }}
                >
                  Stop
                </button>
              </div>

              <div
                className="la-mono mt-4 rounded-xl border border-dashed border-line px-3 py-2.5 text-[10px] uppercase tracking-[0.08em] text-ink-mute"
                style={{ background: "var(--surface-soft)" }}
              >
                Now using: <b>{activeTeacher.name}</b> ·{" "}
                {tts.engines.find((e) => e.id === tts.engine)?.displayName} ·{" "}
                {settings.voiceLabel ?? tts.voiceId ?? "default voice"}
              </div>
            </section>

            {/* ── Reset ── */}
            <section className="text-center">
              <button
                type="button"
                className="text-[12px] text-ink-mute hover:text-ink-soft"
                onClick={() => {
                  if (
                    !confirm(
                      "Reset your settings to the defaults? Your progress and XP stay; only the tutor + voice picks go back to Nova + Web Speech."
                    )
                  ) {
                    return;
                  }
                  saveSettings(DEFAULT_SETTINGS);
                  setSettings(DEFAULT_SETTINGS);
                  void tts.setEngine("web-speech");
                  setEngineNotice(null);
                }}
              >
                Reset settings to defaults
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
