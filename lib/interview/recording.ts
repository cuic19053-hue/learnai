/**
 * Browser MediaRecorder helpers for the simulation.
 *
 * MVP captures audio only and keeps blobs in-memory (object URLs). Audio
 * never leaves the device — there is no upload step in Batch 4. A future
 * batch can swap the in-memory cache for a signed-URL upload to private
 * object storage.
 */

export type RecorderState = "idle" | "recording" | "stopped" | "denied" | "unsupported";

const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg",
];

export function isRecordingSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    typeof window.MediaRecorder !== "undefined"
  );
}

function pickMime(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  for (const m of AUDIO_MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(m)) return m;
    } catch {
      /* ignore */
    }
  }
  return undefined;
}

export type TurnRecording = {
  /** Object URL (blob:) — playable in <audio src>. Revoke when done. */
  url: string;
  mimeType: string;
  durationSec: number;
  sizeBytes: number;
};

/**
 * Open a long-lived AudioRecorder bound to a single microphone stream.
 * Re-use across turns so we only request permission once.
 */
export class AudioRecorder {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: BlobPart[] = [];
  private startedAt = 0;
  private mime: string | undefined;

  state: RecorderState = "idle";

  async requestPermission(): Promise<void> {
    if (!isRecordingSupported()) {
      this.state = "unsupported";
      throw new Error("This browser does not support audio recording.");
    }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: false,
      });
      this.mime = pickMime();
      this.state = "idle";
    } catch (err) {
      this.state = "denied";
      throw new Error("Microphone permission was denied.");
    }
  }

  start(): void {
    if (!this.stream) throw new Error("Permission not yet granted.");
    this.chunks = [];
    this.recorder = new MediaRecorder(
      this.stream,
      this.mime ? { mimeType: this.mime } : undefined,
    );
    this.recorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.chunks.push(e.data);
    };
    this.recorder.start(250);
    this.startedAt = Date.now();
    this.state = "recording";
  }

  stop(): Promise<TurnRecording | null> {
    return new Promise((resolve) => {
      if (!this.recorder || this.recorder.state !== "recording") {
        resolve(null);
        return;
      }
      this.recorder.onstop = () => {
        const mime = this.recorder?.mimeType || this.mime || "audio/webm";
        const blob = new Blob(this.chunks, { type: mime });
        if (blob.size === 0) {
          resolve(null);
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({
          url,
          mimeType: mime,
          durationSec: Math.round((Date.now() - this.startedAt) / 1000),
          sizeBytes: blob.size,
        });
        this.chunks = [];
        this.state = "stopped";
      };
      this.recorder.stop();
    });
  }

  /** Tear down the mic stream. Call when leaving the simulation. */
  dispose(): void {
    if (this.recorder && this.recorder.state === "recording") {
      try {
        this.recorder.stop();
      } catch {
        /* ignore */
      }
    }
    if (this.stream) {
      for (const t of this.stream.getTracks()) t.stop();
    }
    this.recorder = null;
    this.stream = null;
    this.chunks = [];
    this.state = "idle";
  }
}

export function revokeRecording(rec: TurnRecording | null | undefined): void {
  if (rec?.url) {
    try {
      URL.revokeObjectURL(rec.url);
    } catch {
      /* ignore */
    }
  }
}
