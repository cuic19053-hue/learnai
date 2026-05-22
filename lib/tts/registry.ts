/**
 * TTS registry — picks the active provider based on a localStorage key,
 * lazy-inits the engine, and proxies speak() / stop() / voice listing.
 *
 * The active engine persists across reloads under `tts_engine`. If a
 * persisted choice fails to init (Piper CDN unreachable, etc.) the
 * registry transparently falls back to web-speech and updates storage.
 */

import { piperProvider } from "./piper";
import { webSpeechProvider } from "./web-speech";
import type { TTSEngineId, TTSProvider, TTSSpeakOptions } from "./types";

const STORAGE_KEY_ENGINE = "tts_engine";

const PROVIDERS: Record<TTSEngineId, TTSProvider> = {
  "web-speech": webSpeechProvider,
  piper: piperProvider,
};

function readStoredEngine(): TTSEngineId {
  if (typeof window === "undefined") return "web-speech";
  const raw = window.localStorage.getItem(STORAGE_KEY_ENGINE);
  if (raw === "piper" || raw === "web-speech") return raw;
  return "web-speech";
}

let _active: TTSEngineId = readStoredEngine();
const _initialized: Partial<Record<TTSEngineId, boolean>> = {};

export function listEngines(): Array<{
  id: TTSEngineId;
  displayName: string;
  available: boolean;
}> {
  return Object.values(PROVIDERS).map((p) => ({
    id: p.id,
    displayName: p.displayName,
    available: p.isAvailable(),
  }));
}

export function getEngine(): TTSEngineId {
  return _active;
}

export function getProvider(): TTSProvider {
  return PROVIDERS[_active];
}

export async function setEngine(next: TTSEngineId): Promise<boolean> {
  if (next === _active && _initialized[next]) return true;
  // Stop anything currently playing on the previous engine.
  try {
    PROVIDERS[_active].stop();
  } catch {
    // ignore
  }
  _active = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY_ENGINE, next);
  }
  if (_initialized[next]) return true;
  try {
    await PROVIDERS[next].init();
    _initialized[next] = true;
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[tts] init failed for ${next}; falling back to web-speech:`, err);
    _active = "web-speech";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_ENGINE, "web-speech");
    }
    if (!_initialized["web-speech"]) {
      await PROVIDERS["web-speech"].init();
      _initialized["web-speech"] = true;
    }
    return false;
  }
}

/** Speak text using whichever engine is active. Resolves on start. */
export async function speak(text: string, opts?: TTSSpeakOptions): Promise<void> {
  // Lazy-init on first speak — covers SSR + cold first call.
  if (!_initialized[_active]) {
    await setEngine(_active);
  }
  await PROVIDERS[_active].speak(text, opts);
}

/** Stop any playback regardless of engine. */
export function stop(): void {
  try {
    PROVIDERS[_active].stop();
  } catch {
    // ignore
  }
}
