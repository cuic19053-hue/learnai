/**
 * PiperWasmProvider — offline TTS via Piper running in WebAssembly.
 *
 * Ported from the 3D-Avatar-Chatbot project's PiperWasmTTSProvider.js.
 * Uses @mintplex-labs/piper-tts-web from a CDN, loaded dynamically so
 * the main bundle stays small. First voice download is ~20 MB, cached
 * by the browser's OPFS so subsequent calls are instant.
 *
 * No API key. No server roundtrip. Works fully offline after the
 * first model fetch.
 *
 * @see https://github.com/Mintplex-Labs/piper-tts-web
 * @see https://rhasspy.github.io/piper-samples/
 */

import type { TTSProvider, TTSSpeakOptions, TTSVoice } from "./types";
import { DEFAULT_PIPER_VOICE_ID, PIPER_VOICES } from "./voices";

const CDN_URL =
  "https://cdn.jsdelivr.net/npm/@mintplex-labs/piper-tts-web@1.0.4/dist/piper-tts-web.js";

const STORAGE_KEY_VOICE = "tts_piper_voice";

type PiperPredictFn = (args: { voiceId: string; text: string }) => Promise<Blob>;
type PiperModule = {
  predict: PiperPredictFn;
  flush?: () => Promise<void>;
  TtsSession?: { _instance: unknown };
};

let _module: PiperModule | null = null;
let _loading: Promise<PiperModule> | null = null;
let _audioCtx: AudioContext | null = null;
let _currentSource: AudioBufferSourceNode | null = null;
let _selectedVoiceId: string =
  (typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY_VOICE) : null) ??
  DEFAULT_PIPER_VOICE_ID;
let _lastSpokenVoiceId: string | null = null;

async function loadModule(): Promise<PiperModule> {
  if (_module) return _module;
  if (_loading) return _loading;
  _loading = (async () => {
    // The piper-tts-web module is published as an ESM bundle on jsdelivr.
    // We dynamic-import it so the main page bundle stays slim — the
    // module + its WASM payload is only fetched when the learner
    // explicitly switches to the Piper engine in settings.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore — dynamic CDN import not in TS module resolution
    const mod = (await import(/* @vite-ignore */ /* webpackIgnore: true */ CDN_URL)) as PiperModule;
    if (typeof mod.predict !== "function") {
      throw new Error("piper-tts-web is missing predict(). CDN module shape changed.");
    }
    _module = mod;
    return mod;
  })();
  try {
    return await _loading;
  } finally {
    _loading = null;
  }
}

function getAudioContext(): AudioContext {
  if (!_audioCtx || _audioCtx.state === "closed") {
    const Ctx = (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext) as
      | typeof AudioContext
      | undefined;
    if (!Ctx) throw new Error("AudioContext unavailable in this browser");
    _audioCtx = new Ctx();
  }
  if (_audioCtx.state === "suspended") {
    void _audioCtx.resume();
  }
  return _audioCtx;
}

function stopCurrent() {
  if (_currentSource) {
    try {
      _currentSource.onended = null;
      _currentSource.stop();
    } catch {
      // ignore — already stopped
    }
    _currentSource = null;
  }
}

export const piperProvider: TTSProvider = {
  id: "piper",
  displayName: "Piper (offline, no API key)",

  isAvailable(): boolean {
    if (typeof window === "undefined") return false;
    // Piper needs WebAssembly + AudioContext + dynamic import support.
    return typeof WebAssembly !== "undefined" && typeof window.AudioContext !== "undefined";
  },

  async init(): Promise<void> {
    if (typeof window === "undefined") return;
    // Pre-warm the module fetch so the first speak() call doesn't pay
    // the round-trip. The voice model itself downloads on first speak.
    await loadModule().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[piper] pre-load failed; will retry on first speak:", err);
    });
  },

  async speak(text: string, opts: TTSSpeakOptions = {}): Promise<void> {
    const { rate = 1.0, onEnd, onError } = opts;
    const voiceId = opts.voiceId ?? _selectedVoiceId;
    try {
      const mod = await loadModule();
      const ctx = getAudioContext();

      // piper-tts-web caches the first model on a singleton — when the
      // learner switches voices in settings we must null the singleton
      // so the new model loads on the next call.
      if (
        _lastSpokenVoiceId &&
        _lastSpokenVoiceId !== voiceId &&
        mod.TtsSession &&
        "_instance" in mod.TtsSession
      ) {
        mod.TtsSession._instance = null;
      }

      let audioBlob: Blob;
      try {
        audioBlob = await mod.predict({ voiceId, text });
      } catch (err) {
        const msg = String(err);
        const isQuota = msg.includes("QuotaExceeded") || msg.includes("NotReadable");
        if (isQuota && mod.flush) {
          // OPFS cache is full — flush and retry once with a fresh model.
          // eslint-disable-next-line no-console
          console.warn("[piper] OPFS quota hit, flushing cache and retrying");
          await mod.flush();
          if (mod.TtsSession) mod.TtsSession._instance = null;
          audioBlob = await mod.predict({ voiceId, text });
        } else {
          throw err;
        }
      }

      _lastSpokenVoiceId = voiceId;

      if (!audioBlob || audioBlob.size === 0) {
        throw new Error("Piper returned empty audio");
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      stopCurrent();

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = Math.max(0.25, Math.min(4.0, rate));
      source.connect(ctx.destination);
      source.onended = () => {
        if (_currentSource === source) _currentSource = null;
        onEnd?.();
      };
      _currentSource = source;
      source.start(0);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[piper] speak failed:", err);
      _currentSource = null;
      onError?.(err);
    }
  },

  stop(): void {
    stopCurrent();
  },

  getVoices(): TTSVoice[] {
    return PIPER_VOICES.slice();
  },

  setVoice(voiceId: string): void {
    _selectedVoiceId = voiceId;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_VOICE, voiceId);
    }
  },

  getVoice(): string | null {
    return _selectedVoiceId;
  },
};
