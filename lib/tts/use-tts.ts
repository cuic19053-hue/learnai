"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getEngine,
  getProvider,
  listEngines,
  setEngine as setEngineRegistry,
  speak as registrySpeak,
  stop as registryStop,
} from "./registry";
import type { TTSEngineId, TTSSpeakOptions, TTSVoice } from "./types";

export type UseTTS = {
  /** Active engine id, kept in sync with the registry. */
  engine: TTSEngineId;
  /** Switch engines. Resolves when the new engine has initialised
   *  (or fallen back to web-speech if init failed). */
  setEngine: (next: TTSEngineId) => Promise<boolean>;
  /** Engines available on this device with their display names. */
  engines: ReturnType<typeof listEngines>;
  /** Voices the active engine exposes. */
  voices: TTSVoice[];
  /** Currently selected voice id (per engine, persisted). */
  voiceId: string | null;
  /** Switch the active voice. */
  setVoice: (voiceId: string) => void;
  /** Speak using the active engine + voice. */
  speak: (text: string, opts?: TTSSpeakOptions) => Promise<void>;
  /** Stop any playback. */
  stop: () => void;
  /** True once the registry has finished its first hydration tick. */
  ready: boolean;
};

/**
 * React hook for the TTS layer. Keeps engine + voice state in sync
 * with localStorage so a learner's settings choice persists across
 * page loads without any database round-trip.
 */
export function useTTS(): UseTTS {
  const [engine, setEngineState] = useState<TTSEngineId>("web-speech");
  const [voices, setVoices] = useState<TTSVoice[]>([]);
  const [voiceId, setVoiceIdState] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate from registry / localStorage on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const current = getEngine();
      await setEngineRegistry(current);
      if (cancelled) return;
      setEngineState(getEngine());
      const prov = getProvider();
      setVoices(prov.getVoices());
      setVoiceIdState(prov.getVoice());
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setEngine = useCallback(async (next: TTSEngineId): Promise<boolean> => {
    const ok = await setEngineRegistry(next);
    setEngineState(getEngine());
    const prov = getProvider();
    setVoices(prov.getVoices());
    setVoiceIdState(prov.getVoice());
    return ok;
  }, []);

  const setVoice = useCallback((nextVoiceId: string) => {
    getProvider().setVoice(nextVoiceId);
    setVoiceIdState(nextVoiceId);
  }, []);

  const speak = useCallback(async (text: string, opts?: TTSSpeakOptions) => {
    await registrySpeak(text, opts);
  }, []);

  const stop = useCallback(() => {
    registryStop();
  }, []);

  return {
    engine,
    setEngine,
    engines: listEngines(),
    voices,
    voiceId,
    setVoice,
    speak,
    stop,
    ready,
  };
}
