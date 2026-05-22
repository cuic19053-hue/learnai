/**
 * AI provider entry point — multi-provider fallback chain.
 *
 * Walks every enabled provider in admin-configured priority order. The
 * first provider that returns a non-error response wins. Errors at any
 * tier (timeout, 5xx, empty content) trigger fallback to the next entry
 * so the learner never sees a billing error or a paid-provider quota
 * failure — they get the bundled OllaBridge response instead.
 *
 * Verified end-to-end with the LearnAI teacher prompt — see commit history.
 */

import "server-only";
import { env } from "@/lib/env";
import {
  AiProviderError,
  chatViaProvider,
  type ChatMessage,
  type ChatOptions,
} from "./chat-impl";
import { activeProviders } from "./config-store";

export type { ChatMessage, ChatOptions };
export { AiProviderError };

/**
 * Send a chat completion. Walks the configured fallback chain on
 * transport errors. Throws AiProviderError only if *every* provider
 * in the chain fails.
 */
export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const chain = activeProviders();
  if (chain.length === 0) {
    throw new AiProviderError(
      "No AI providers are configured. The admin must enable at least one provider.",
      503,
    );
  }

  const errors: Array<{ provider: string; message: string; status: number }> = [];
  for (const config of chain) {
    try {
      const text = await chatViaProvider(config, messages, options);
      return text;
    } catch (err) {
      if (err instanceof AiProviderError) {
        errors.push({ provider: config.id, message: err.message, status: err.status });
        // Continue to next provider in chain.
        continue;
      }
      throw err;
    }
  }

  // Every provider failed — surface the most informative error.
  const last = errors[errors.length - 1] ?? {
    provider: "unknown",
    message: "no providers available",
    status: 503,
  };
  throw new AiProviderError(
    `All ${errors.length} AI providers failed. Last (${last.provider}): ${last.message}`,
    last.status,
  );
}

/**
 * Strip a fenced ```json block (or any ```...``` block) if the model
 * wrapped its output. Some LLMs do this even when asked for raw JSON.
 */
function stripCodeFence(text: string): string {
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/i);
  return fence ? fence[1]!.trim() : text.trim();
}

/**
 * Chat that demands a JSON object. Auto-strips code fences and parses.
 * Throws AiProviderError on parse failure.
 */
export async function jsonChat<T = unknown>(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<T> {
  const raw = await chat(messages, { temperature: 0.2, ...options });
  const stripped = stripCodeFence(raw);
  try {
    return JSON.parse(stripped) as T;
  } catch {
    // One more try — find the first {...} block in the output.
    const m = stripped.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]) as T;
      } catch {
        /* fall through */
      }
    }
    throw new AiProviderError(
      `AI returned non-JSON output (got: ${stripped.slice(0, 120)}…)`,
      502,
    );
  }
}

/** Diagnostics surface for /api/health and the admin overview. */
export function aiSummary() {
  const chain = activeProviders();
  return {
    activeChainSize: chain.length,
    chain: chain.map((c) => ({
      id: c.id,
      priority: c.priority,
      baseUrl: c.baseUrl,
      model: c.model,
      hasKey: !!c.apiKey,
      lastTestStatus: c.lastTestStatus ?? "untested",
    })),
    openAiKeyConfigured: Boolean(env.openaiApiKey),
  };
}
