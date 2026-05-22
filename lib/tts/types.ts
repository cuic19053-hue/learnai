/**
 * TTS engine + voice abstraction.
 *
 * Ported from the 3D-Avatar-Chatbot project's TTSProvider.js into
 * typed React-friendly modules. The learner picks an engine in the
 * settings UI; engines are responsible for their own initialisation
 * (Piper downloads a ~20 MB ONNX model on first use; Web Speech needs
 * nothing). Voice + speed live in localStorage so settings survive
 * a reload without a database.
 */

export type TTSEngineId = "web-speech" | "piper";

export type TTSVoice = {
  /** Stable id used to request this voice from its engine. */
  id: string;
  /** Human-readable label shown in the settings dropdown. */
  name: string;
  /** BCP-47 locale tag, e.g. en-US, es-ES. */
  lang: string;
  /** Optional gender hint for the UI. */
  gender?: "female" | "male" | "neutral";
  /** Quality bucket (Piper offers low / medium / high — bigger = slower). */
  quality?: "low" | "medium" | "high";
};

export type TTSSpeakOptions = {
  /** 0.25–4.0. 1.0 = normal, 0.7 = slow, 1.3 = fast. */
  rate?: number;
  /** 0.0–2.0. Only honoured by Web Speech; Piper ignores. */
  pitch?: number;
  /** When set, overrides the engine's currently-selected voice. */
  voiceId?: string;
  /** Fires when playback completes naturally. */
  onEnd?: () => void;
  /** Fires when playback fails. */
  onError?: (err: unknown) => void;
};

export interface TTSProvider {
  /** ID matching TTSEngineId. */
  readonly id: TTSEngineId;
  /** Human-readable label shown in the settings dropdown. */
  readonly displayName: string;
  /** True when this provider can run on the current device/browser. */
  isAvailable(): boolean;
  /** Initialise once; safe to call multiple times. */
  init(): Promise<void>;
  /** Speak the text. Resolves when audio actually starts. */
  speak(text: string, opts?: TTSSpeakOptions): Promise<void>;
  /** Stop any current playback. */
  stop(): void;
  /** Available voices for this engine. */
  getVoices(): TTSVoice[];
  /** Set the active voice id. */
  setVoice(voiceId: string): void;
  /** Get the active voice id. */
  getVoice(): string | null;
}
