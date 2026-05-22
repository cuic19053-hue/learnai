/**
 * Web Speech API provider — the always-available default.
 *
 * No model download, no API key. Works in every modern browser; voice
 * quality varies by OS (macOS has Siri-grade voices, Linux is robotic).
 * The settings UI surfaces the system voices via the
 * `speechSynthesis.getVoices()` API and persists the chosen voice in
 * localStorage.
 */

import type { TTSProvider, TTSSpeakOptions, TTSVoice } from "./types";

const STORAGE_KEY_VOICE = "tts_web_speech_voice";

function browserSpeech(): SpeechSynthesis | null {
  if (typeof window === "undefined") return null;
  return window.speechSynthesis ?? null;
}

function snapshotVoices(): TTSVoice[] {
  const synth = browserSpeech();
  if (!synth) return [];
  return synth.getVoices().map((v) => ({
    id: v.voiceURI || `${v.name}|${v.lang}`,
    name: v.name,
    lang: v.lang,
    gender: undefined,
  }));
}

function findNativeVoice(voiceId: string | null): SpeechSynthesisVoice | null {
  if (!voiceId) return null;
  const synth = browserSpeech();
  if (!synth) return null;
  const voices = synth.getVoices();
  return voices.find((v) => (v.voiceURI || `${v.name}|${v.lang}`) === voiceId) ?? null;
}

export const webSpeechProvider: TTSProvider = {
  id: "web-speech",
  displayName: "Web Speech (built-in, no download)",

  isAvailable(): boolean {
    return !!browserSpeech();
  },

  async init(): Promise<void> {
    const synth = browserSpeech();
    if (!synth) return;
    // Some browsers populate the voice list lazily after the first
    // getVoices() call — kick it once on init so subsequent reads are
    // populated.
    synth.getVoices();
    if (synth.getVoices().length === 0 && synth.onvoiceschanged === null) {
      await new Promise<void>((resolve) => {
        synth.onvoiceschanged = () => resolve();
        // Don't block forever; some browsers never fire the event.
        setTimeout(resolve, 1500);
      });
    }
  },

  async speak(text: string, opts: TTSSpeakOptions = {}): Promise<void> {
    const synth = browserSpeech();
    if (!synth) {
      opts.onError?.(new Error("Web Speech API unavailable"));
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 1.0;
    u.pitch = opts.pitch ?? 1.0;
    const voice =
      findNativeVoice(opts.voiceId ?? null) ?? findNativeVoice(webSpeechProvider.getVoice());
    if (voice) u.voice = voice;
    if (opts.onEnd) u.onend = () => opts.onEnd?.();
    if (opts.onError) u.onerror = (e) => opts.onError?.(e);
    synth.speak(u);
  },

  stop(): void {
    browserSpeech()?.cancel();
  },

  getVoices(): TTSVoice[] {
    return snapshotVoices();
  },

  setVoice(voiceId: string): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY_VOICE, voiceId);
  },

  getVoice(): string | null {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(STORAGE_KEY_VOICE);
  },
};
