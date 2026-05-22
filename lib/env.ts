/**
 * Centralized environment access. Read every process.env.* value through
 * this module so the rest of the codebase can stay typed and so missing
 * configuration produces actionable warnings instead of silent failures.
 */

const isProd = process.env.NODE_ENV === "production";

function read(name: string): string | undefined {
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProd,
  isDev: !isProd,

  // Auth
  nextAuthSecret: read("NEXTAUTH_SECRET"),
  nextAuthUrl: read("NEXTAUTH_URL"),
  googleClientId: read("GOOGLE_CLIENT_ID"),
  googleClientSecret: read("GOOGLE_CLIENT_SECRET"),

  // Persistence
  databaseUrl: read("DATABASE_URL"),

  // AI / agent layer
  openaiApiKey: read("OPENAI_API_KEY"),
  anthropicApiKey: read("ANTHROPIC_API_KEY"),
  xaiApiKey: read("XAI_API_KEY"),
  // OllaBridge bundled bridge — used by lib/ai/config-store seedFromEnv.
  ollabridgeUrl: read("OLLABRIDGE_URL"),
  ollabridgeModel: read("OLLABRIDGE_MODEL"),
  ollabridgeToken: read("OLLABRIDGE_TOKEN"),
  contextforgeUrl: read("CONTEXTFORGE_URL"),
  contextforgeToken: read("CONTEXTFORGE_TOKEN"),
};

export const flags = {
  authConfigured: !!env.nextAuthSecret,
  databaseConfigured: !!env.databaseUrl,
  googleConfigured: !!env.googleClientId && !!env.googleClientSecret,
  /** OllaBridge default works without a key, so AI is always "configured". */
  aiConfigured: true,
  openaiConfigured: !!env.openaiApiKey,
  anthropicConfigured: !!env.anthropicApiKey,
  xaiConfigured: !!env.xaiApiKey,
  agentLayerConfigured: !!env.contextforgeUrl,
};

/**
 * Log a single startup warning per missing-but-recommended setting.
 * Safe to call from server modules; no-op on the client.
 */
let warned = false;
export function warnAboutMissingEnv(): void {
  if (warned || typeof window !== "undefined") return;
  warned = true;
  const missing: string[] = [];
  if (!flags.authConfigured) missing.push("NEXTAUTH_SECRET (sign-in disabled, guest mode only)");
  if (!flags.databaseConfigured) missing.push("DATABASE_URL (no persistence)");
  if (!flags.googleConfigured) missing.push("GOOGLE_CLIENT_ID/SECRET (Google sign-in disabled)");
  if (missing.length > 0) {
    // eslint-disable-next-line no-console
    console.warn("[learnai] Running with reduced configuration:\n  - " + missing.join("\n  - "));
  }
}
