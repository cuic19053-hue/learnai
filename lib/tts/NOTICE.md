# `lib/tts/` — attribution

The TTS engine abstraction (`types.ts`, `registry.ts`, `web-speech.ts`,
`piper.ts`) and the curated Piper voice catalogue (`voices.ts`) are
ported from the **3D-Avatar-Chatbot** project by the same author:

> https://github.com/ruslanmv/3D-Avatar-Chatbot

The original implementation lives in `src/TTSProvider.js` and
`src/tts/PiperWasmTTSProvider.js` of that repo. The LearnAI port:

- Converts the IIFE-on-`window` pattern to typed ES modules.
- Adds a React hook (`use-tts.ts`) for component-level state sync.
- Drives the engine choice from the LearnAI user-settings page at
  `/settings`.
- Otherwise keeps the same wire-level behaviour: pluggable provider
  registry, localStorage-persisted active engine, lazy module-load
  for Piper via the official `@mintplex-labs/piper-tts-web` ESM bundle
  on jsdelivr, OPFS-cached ONNX models.

Both projects are under the Apache 2.0 license. See `LICENSE` in the
upstream repository for the source license text.

## Runtime dependencies

- `@mintplex-labs/piper-tts-web@1.0.4` — loaded from
  `https://cdn.jsdelivr.net/npm/...` at runtime, no npm install needed
- Piper voice ONNX models — fetched from Hugging Face the first time
  a voice is selected (~20 MB each), cached by the browser's OPFS
