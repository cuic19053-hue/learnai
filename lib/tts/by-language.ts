/**
 * Speak text in a specific target language.
 *
 * Used by the language-learning flashcards so the audio always matches
 * the card's language, regardless of which engine the learner has
 * picked as their default in `/settings`. The strategy:
 *
 *   1. If Piper is the active engine AND a Piper voice exists for the
 *      requested language → speak via Piper, transparently overriding
 *      the active voice for this one call.
 *   2. Otherwise → speak via the Web Speech API, picking a system voice
 *      whose BCP-47 locale matches the target language. Web Speech is
 *      always available and ships with locale-tagged system voices on
 *      every modern OS (Safari/macOS, Edge/Windows, Chrome/Android).
 *
 * We call `webSpeechProvider` directly in the fallback so the registry's
 * active engine (which the learner chose in settings) isn't mutated.
 */

import type { LanguageCode } from "@/lib/languages/types";
import { piperProvider } from "./piper";
import { getEngine, speak as registrySpeak } from "./registry";
import type { TTSSpeakOptions } from "./types";
import { webSpeechProvider } from "./web-speech";

/**
 * Piper voice id by LearnAI language code. `null` means Piper doesn't
 * ship a model for this language yet — we'll route through Web Speech
 * instead. The chosen voices favour clarity over personality so they
 * pronounce isolated vocabulary cleanly. Medium-quality female voices
 * picked where available; native locale where one exists in Piper's
 * catalogue.
 */
const PIPER_VOICE_BY_LANG: Record<LanguageCode, string | null> = {
  en: "en_US-hfc_female-medium",
  es: "es_ES-davefx-medium",
  de: "de_DE-thorsten-medium",
  it: "it_IT-paola-medium",
  ru: "ru_RU-irina-medium",
  // Piper doesn't ship Japanese / Chinese / Arabic models in the
  // @mintplex-labs/piper-tts-web@1.0.4 release. Fall back to Web Speech.
  ja: null,
  zh: null,
  ar: null,
};

/**
 * BCP-47 locale tag by LearnAI language code, used to find the right
 * Web Speech system voice. The Speech API exposes voices tagged with
 * locales like `ja-JP`, `zh-CN`, `ar-SA`; we match on the full tag
 * first, then on the base language as a fallback.
 */
const BCP47_BY_LANG: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-ES",
  de: "de-DE",
  it: "it-IT",
  ru: "ru-RU",
  ja: "ja-JP",
  zh: "zh-CN",
  ar: "ar-SA",
};

let _webSpeechInitDone = false;

async function ensureWebSpeechReady(): Promise<void> {
  if (_webSpeechInitDone) return;
  try {
    await webSpeechProvider.init();
  } catch {
    // Web Speech init is best-effort — voices may populate later on
    // some browsers. Speaking will still work; the system voice list
    // just won't be honoured until the browser fires onvoiceschanged.
  }
  _webSpeechInitDone = true;
}

function findWebSpeechVoiceId(locale: string): string | undefined {
  const voices = webSpeechProvider.getVoices();
  if (voices.length === 0) return undefined;
  const wanted = locale.toLowerCase();
  const baseLang = wanted.split("-")[0];
  const exact = voices.find((v) => v.lang.toLowerCase() === wanted);
  if (exact) return exact.id;
  const partial = voices.find((v) => v.lang.toLowerCase().startsWith(baseLang));
  return partial?.id;
}

/**
 * Speak `text` in the given target language. The promise resolves once
 * playback has started (or failed silently). Pass `onEnd` / `onError`
 * in opts to react to playback completion or failure.
 */
export async function speakInLanguage(
  text: string,
  lang: LanguageCode,
  opts: TTSSpeakOptions = {}
): Promise<void> {
  const piperVoiceId = PIPER_VOICE_BY_LANG[lang];
  const locale = BCP47_BY_LANG[lang];

  // Route 1 — Piper (only when the learner has it selected as default
  // AND we have a model for this language). Otherwise we'd force a
  // 20 MB download on someone who didn't opt in, which is rude.
  if (getEngine() === "piper" && piperVoiceId) {
    await registrySpeak(text, { ...opts, voiceId: piperVoiceId });
    return;
  }

  // Route 2 — Web Speech with a locale-matching system voice.
  await ensureWebSpeechReady();
  const voiceId = findWebSpeechVoiceId(locale);
  // Stop anything Piper may have left playing so we don't overlap audio.
  try {
    piperProvider.stop();
  } catch {
    // ignore — Piper may not be initialised
  }
  await webSpeechProvider.speak(text, { ...opts, voiceId });
}

/** Stop any language-card audio regardless of which engine started it. */
export function stopLanguageSpeech(): void {
  try {
    piperProvider.stop();
  } catch {
    // ignore
  }
  try {
    webSpeechProvider.stop();
  } catch {
    // ignore
  }
}
