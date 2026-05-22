/**
 * AI provider catalogue. Six providers across three classes:
 *
 *   1. OllaBridge — bundled default. Free, hosted on Hugging Face Spaces.
 *      OpenAI-Chat-Completions-shape API at `/v1/chat/completions`.
 *
 *   2. OpenAI-compatible — OpenAI, xAI Grok, Ollama-local, Custom.
 *      All speak the same wire format with a different baseUrl.
 *
 *   3. Anthropic — Claude family. Uses Anthropic's own `/v1/messages`
 *      endpoint with `x-api-key` + `anthropic-version` headers.
 *
 * The admin enables providers and sets the fallback chain. The chat()
 * function in @/lib/ai/provider walks the chain on transport errors —
 * OllaBridge first by default, then the admin's primary, then the
 * admin's secondary, etc. Free credits never turn into a surprise bill
 * because every provider declares a spend cap.
 */

export type ProviderId = "ollabridge" | "openai" | "anthropic" | "xai" | "ollama" | "custom";

export type ProviderProtocol = "openai-compat" | "anthropic";

export type ProviderTier = "bundled" | "local" | "paid" | "free-credits" | "byo";

export type ProviderCatalogueEntry = {
  id: ProviderId;
  name: string;
  /** Short marketing label rendered as a pill on the provider card. */
  tag: string;
  tier: ProviderTier;
  protocol: ProviderProtocol;
  /** Default base URL — admin can override per-instance. */
  defaultBaseUrl: string;
  /** Default model id when the admin doesn't set one. */
  defaultModel: string;
  /** One-line description for the catalogue card. */
  description: string;
  /** Bullet-list perks shown in compact form. */
  perks: string[];
  /** UI accent color. */
  color: string;
  /** Short logo glyph for the card avatar. */
  logo: string;
  /** Env-var name an administrator can use instead of the admin UI. */
  envVar?: string;
  /** Help URL pointing at the provider's console / docs. */
  docsUrl: string;
  /** Whether this provider can run without an API key (OllaBridge, Ollama). */
  keyless: boolean;
  /** Whether the provider supports a "device pairing" flow (OllaBridge). */
  pairing: boolean;
};

export const PROVIDER_CATALOGUE: Record<ProviderId, ProviderCatalogueEntry> = {
  ollabridge: {
    id: "ollabridge",
    name: "OllaBridge",
    tag: "BUNDLED · DEFAULT",
    tier: "bundled",
    protocol: "openai-compat",
    // OllaBridge's dashboard tells users to enter this URL as the
    // "Server URL". chat-impl.ts is tolerant — appends /v1 when the
    // base doesn't already include a version segment.
    defaultBaseUrl: "https://ruslanmv-ollabridge.hf.space",
    defaultModel: "qwen2.5:1.5b",
    description:
      "LearnAI's hosted bridge to open-weight models. Zero-config default — works on every install without an API key.",
    perks: ["Free for personal use", "Device pairing for premium models", "OpenAI-SDK compatible"],
    color: "#7c3aed",
    logo: "OB",
    envVar: "OLLABRIDGE_URL",
    docsUrl: "https://huggingface.co/spaces/ruslanmv/ollabridge",
    keyless: true,
    pairing: true,
  },
  openai: {
    id: "openai",
    name: "OpenAI",
    tag: "PAID",
    tier: "paid",
    protocol: "openai-compat",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultModel: "gpt-4o-mini",
    description: "GPT-class models for production-grade quality. Pay-as-you-go billing.",
    perks: ["Strong reasoning", "Vision-capable", "$5 minimum top-up"],
    color: "#10a37f",
    logo: "○",
    envVar: "OPENAI_API_KEY",
    docsUrl: "https://platform.openai.com/api-keys",
    keyless: false,
    pairing: false,
  },
  anthropic: {
    id: "anthropic",
    name: "Anthropic",
    tag: "PAID",
    tier: "paid",
    protocol: "anthropic",
    defaultBaseUrl: "https://api.anthropic.com",
    defaultModel: "claude-sonnet-4-6",
    description: "Claude family for long-context tutoring and careful explanations.",
    perks: ["200K context", "Safer outputs", "Pay-as-you-go"],
    color: "#d97706",
    logo: "✱",
    envVar: "ANTHROPIC_API_KEY",
    docsUrl: "https://console.anthropic.com/settings/keys",
    keyless: false,
    pairing: false,
  },
  xai: {
    id: "xai",
    name: "xAI · Grok",
    tag: "FREE CREDITS",
    tier: "free-credits",
    protocol: "openai-compat",
    defaultBaseUrl: "https://api.x.ai/v1",
    defaultModel: "grok-4-fast",
    description:
      "Grok models. New accounts receive $25 in promotional credits on signup (30-day expiry).",
    perks: ["$25 promotional credits", "OpenAI-SDK compatible", "Cheap fast tier"],
    color: "#0f1430",
    logo: "𝕏",
    envVar: "XAI_API_KEY",
    docsUrl: "https://console.x.ai",
    keyless: false,
    pairing: false,
  },
  ollama: {
    id: "ollama",
    name: "Ollama (local)",
    tag: "LOCAL · PRIVATE",
    tier: "local",
    protocol: "openai-compat",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultModel: "llama3.2",
    description: "Self-hosted local models on your own hardware. Private, offline-capable, free.",
    perks: ["Fully private", "Fast on M-series / RTX", "Free, no quotas"],
    color: "#0ea5a4",
    logo: "🦙",
    docsUrl: "https://ollama.com/download",
    keyless: true,
    pairing: false,
  },
  custom: {
    id: "custom",
    name: "Custom · OpenAI-compatible",
    tag: "BYO",
    tier: "byo",
    protocol: "openai-compat",
    defaultBaseUrl: "https://your-endpoint/v1",
    defaultModel: "your-model",
    description:
      "Any endpoint that speaks the OpenAI Chat Completions wire format — vLLM, LM Studio, LocalAI, etc.",
    perks: ["Self-hosted vLLM / LM Studio", "Full control", "Bring your own token"],
    color: "#4a5070",
    logo: "⚙",
    docsUrl: "https://platform.openai.com/docs/api-reference/chat/create",
    keyless: false,
    pairing: false,
  },
};

export const PROVIDER_IDS = Object.keys(PROVIDER_CATALOGUE) as ProviderId[];

/** Per-instance enabled-and-configured provider record. */
export type ProviderConfig = {
  id: ProviderId;
  /** Display name override — falls back to catalogue name. */
  label?: string;
  /** Effective base URL — falls back to catalogue default. */
  baseUrl: string;
  /** Effective default model id. */
  model: string;
  /** API key. Encrypted at rest in prod; in this demo stored in memory. */
  apiKey?: string;
  /** Position in the fallback chain (1 = primary). */
  priority: number;
  /** Soft monthly spend cap in USD. UI surfaces a 50/80/95% alert. */
  monthlyCapUsd?: number;
  /** When the admin paired via device-pairing (OllaBridge only). */
  pairingDeviceId?: string;
  /** Whether the admin has enabled this provider in the fallback chain. */
  enabled: boolean;
  /** ISO timestamp of the last successful test. */
  lastTestedAt?: string;
  /** Health status from the last connection probe. */
  lastTestStatus?: "ok" | "error" | "untested";
  /** Error message from the last failed probe (truncated). */
  lastTestMessage?: string;
};

/** Default admin config — OllaBridge enabled, others available to add. */
export function defaultProviderConfig(): ProviderConfig[] {
  return [
    {
      id: "ollabridge",
      baseUrl: PROVIDER_CATALOGUE.ollabridge.defaultBaseUrl,
      model: PROVIDER_CATALOGUE.ollabridge.defaultModel,
      priority: 1,
      enabled: true,
      lastTestStatus: "untested",
    },
  ];
}

/**
 * Friendly model labels per provider. The admin's model picker uses
 * these as suggestions; arbitrary strings are still accepted because
 * every provider releases new models faster than this list updates.
 */
export const SUGGESTED_MODELS: Record<ProviderId, string[]> = {
  ollabridge: ["qwen2.5:1.5b", "qwen2.5:7b", "qwen2.5:14b", "llava:13b"],
  openai: ["gpt-4o-mini", "gpt-4o", "gpt-4.1", "gpt-4.1-mini", "gpt-5"],
  anthropic: ["claude-haiku-4-5-20251001", "claude-sonnet-4-6", "claude-opus-4-7"],
  xai: ["grok-4-fast", "grok-4", "grok-4-vision"],
  ollama: ["llama3.2", "llama3.2:1b", "qwen2.5", "phi3", "gemma2"],
  custom: [],
};
