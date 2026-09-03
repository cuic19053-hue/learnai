/**
 * Curated Piper voice catalogue.
 *
 * Sourced from @mintplex-labs/piper-tts-web's PATH_MAP. Pruned to a
 * sensible default set per language — medium quality first, then low/
 * high, female before male. The settings UI surfaces all of them in
 * one searchable dropdown.
 *
 * @see https://rhasspy.github.io/piper-samples/
 */

import type { TTSVoice } from "./types";

export const PIPER_VOICES: TTSVoice[] = [
  // ── English (US) ──
  {
    id: "en_US-hfc_female-medium",
    name: "HFC Female",
    lang: "en-US",
    gender: "female",
    quality: "medium",
  },
  { id: "en_US-lessac-medium", name: "Lessac", lang: "en-US", gender: "female", quality: "medium" },
  {
    id: "en_US-kristin-medium",
    name: "Kristin",
    lang: "en-US",
    gender: "female",
    quality: "medium",
  },
  { id: "en_US-amy-medium", name: "Amy", lang: "en-US", gender: "female", quality: "medium" },
  { id: "en_US-amy-low", name: "Amy (fast)", lang: "en-US", gender: "female", quality: "low" },
  {
    id: "en_US-hfc_male-medium",
    name: "HFC Male",
    lang: "en-US",
    gender: "male",
    quality: "medium",
  },
  { id: "en_US-ryan-medium", name: "Ryan", lang: "en-US", gender: "male", quality: "medium" },
  { id: "en_US-joe-medium", name: "Joe", lang: "en-US", gender: "male", quality: "medium" },
  { id: "en_US-bryce-medium", name: "Bryce", lang: "en-US", gender: "male", quality: "medium" },
  { id: "en_US-norman-medium", name: "Norman", lang: "en-US", gender: "male", quality: "medium" },
  { id: "en_US-arctic-medium", name: "Arctic", lang: "en-US", gender: "male", quality: "medium" },
  { id: "en_US-ryan-low", name: "Ryan (fast)", lang: "en-US", gender: "male", quality: "low" },
  // ── English (UK) ──
  { id: "en_GB-alba-medium", name: "Alba", lang: "en-GB", gender: "female", quality: "medium" },
  { id: "en_GB-cori-medium", name: "Cori", lang: "en-GB", gender: "female", quality: "medium" },
  {
    id: "en_GB-jenny_dioco-medium",
    name: "Jenny Dioco",
    lang: "en-GB",
    gender: "female",
    quality: "medium",
  },
  {
    id: "en_GB-northern_english_male-medium",
    name: "Northern English Male",
    lang: "en-GB",
    gender: "male",
    quality: "medium",
  },
  // ── Spanish ──
  { id: "es_ES-davefx-medium", name: "Davefx", lang: "es-ES", gender: "male", quality: "medium" },
  { id: "es_ES-mls_9972-low", name: "MLS 9972", lang: "es-ES", gender: "female", quality: "low" },
  { id: "es_MX-claude-high", name: "Claude (MX)", lang: "es-MX", gender: "male", quality: "high" },
  // ── French ──
  { id: "fr_FR-siwis-medium", name: "Siwis", lang: "fr-FR", gender: "female", quality: "medium" },
  { id: "fr_FR-gilles-low", name: "Gilles (fast)", lang: "fr-FR", gender: "male", quality: "low" },
  { id: "fr_FR-upmc-medium", name: "UPMC", lang: "fr-FR", gender: "female", quality: "medium" },
  // ── German ──
  {
    id: "de_DE-thorsten-medium",
    name: "Thorsten",
    lang: "de-DE",
    gender: "male",
    quality: "medium",
  },
  {
    id: "de_DE-eva_k-x_low",
    name: "Eva K (fastest)",
    lang: "de-DE",
    gender: "female",
    quality: "low",
  },
  { id: "de_DE-kerstin-low", name: "Kerstin", lang: "de-DE", gender: "female", quality: "low" },
  // ── Italian ──
  { id: "it_IT-paola-medium", name: "Paola", lang: "it-IT", gender: "female", quality: "medium" },
  {
    id: "it_IT-riccardo-x_low",
    name: "Riccardo (fastest)",
    lang: "it-IT",
    gender: "male",
    quality: "low",
  },
  // ── Portuguese ──
  { id: "pt_BR-faber-medium", name: "Faber", lang: "pt-BR", gender: "male", quality: "medium" },
  {
    id: "pt_BR-edresson-low",
    name: "Edresson (fast)",
    lang: "pt-BR",
    gender: "male",
    quality: "low",
  },
  // ── Russian ──
  { id: "ru_RU-irina-medium", name: "Irina", lang: "ru-RU", gender: "female", quality: "medium" },
  { id: "ru_RU-denis-medium", name: "Denis", lang: "ru-RU", gender: "male", quality: "medium" },
  // ── Polish ──
  {
    id: "pl_PL-mc_speech-medium",
    name: "MC Speech",
    lang: "pl-PL",
    gender: "male",
    quality: "medium",
  },
  // ── Dutch ──
  { id: "nl_NL-mls_5809-low", name: "MLS 5809", lang: "nl-NL", gender: "female", quality: "low" },
  {
    id: "nl_BE-rdh-medium",
    name: "RDH (Flemish)",
    lang: "nl-BE",
    gender: "male",
    quality: "medium",
  },
];

export const DEFAULT_PIPER_VOICE_ID = "en_US-hfc_female-medium";

/** Per-persona default voice — matches the personality catalog. */
export const PERSONA_VOICE_DEFAULTS: Record<string, string> = {
  // Universal teachers
  nova: "en_US-hfc_female-medium",
  rex: "en_US-amy-low", // bright, punchy
  sage: "en_US-arctic-medium", // steady, measured
  pixel: "en_US-ryan-medium", // crisp
  // Specialists
  milo: "en_US-lessac-medium", // gentle, sing-song for Little Learner
  luna: "en_US-kristin-medium", // lively, GRADE_7
  "ada-jr": "en_US-joe-medium", // direct, GRADE_8
  "mentor-max": "en_US-arctic-medium", // patient, GRADE_9
  "professor-turing": "en_US-norman-medium", // authoritative, Professional
  sofia: "en_GB-cori-medium", // calm, Senior
  forge: "en_US-bryce-medium", // direct, GRADE_8
};
