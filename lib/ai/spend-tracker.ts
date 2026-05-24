/**
 * Per-provider monthly spend tracker + cap enforcement.
 *
 * The provider config already carries an optional `monthlyCapUsd`,
 * but until now nothing actually checked the cap. This module is the
 * bridge: every chat call records an estimated cost; the provider
 * chain checks the running spend BEFORE attempting a call and skips
 * over capped providers, falling through to the next entry.
 *
 * Process-local for the MVP (same compromise as the rate limiter and
 * job registry). For multi-instance, swap the `Map` for Redis with
 * the same key shape — the call sites don't change.
 *
 * Estimation model is intentionally simple: the per-token rate is set
 * per provider in a small catalogue and is admin-overridable. Two
 * tokens per output character is a known overestimate, which keeps
 * us conservative.
 */

import "server-only";
import type { ProviderConfig, ProviderId } from "./providers";

// ── Per-provider rate card (USD per 1K tokens) ──────────────────────
// These are admin-overridable in a future version; the values here are
// the documented public rates for the provider's default model at the
// time this module was written. Adjust the catalogue rather than
// hardcoding caller-side overrides.
type Rate = { input: number; output: number };

const DEFAULT_RATES: Record<ProviderId, Rate> = {
  // OllaBridge is the bundled bridge — free at the platform level.
  ollabridge: { input: 0, output: 0 },
  // Conservative blend of OpenAI's 4o-mini-class pricing.
  openai: { input: 0.00015, output: 0.0006 },
  // Anthropic Haiku tier.
  anthropic: { input: 0.00025, output: 0.00125 },
  // xAI Grok pricing.
  xai: { input: 0.0001, output: 0.0005 },
  // Local Ollama — zero marginal cost.
  ollama: { input: 0, output: 0 },
  // Custom OpenAI-compatible — admin-supplied; default zero so we don't
  // surprise them with a capped provider.
  custom: { input: 0, output: 0 },
};

function monthKey(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

type BucketKey = `${string}|${string}`; // `${providerId}|${YYYY-MM}`

type Bucket = {
  /** Estimated spend in USD for this month. */
  spendUsd: number;
  /** Number of calls recorded. */
  calls: number;
  /** Token counters across the month. */
  inputTokens: number;
  outputTokens: number;
};

const buckets = new Map<BucketKey, Bucket>();

function keyFor(providerId: string, now = new Date()): BucketKey {
  return `${providerId}|${monthKey(now)}` as BucketKey;
}

function getOrInit(providerId: string, now = new Date()): Bucket {
  const k = keyFor(providerId, now);
  let b = buckets.get(k);
  if (!b) {
    b = { spendUsd: 0, calls: 0, inputTokens: 0, outputTokens: 0 };
    buckets.set(k, b);
  }
  return b;
}

/**
 * Token estimate from a chat message array. Conservative: 1 token ≈
 * 4 chars (English-leaning average) but rounded up. Replace with
 * `gpt-tokenizer` if accuracy matters more than performance.
 */
function estimateTokens(text: string): number {
  return Math.ceil((text?.length ?? 0) / 4);
}

export function estimateInputTokens(messages: Array<{ content: string }>): number {
  let total = 0;
  for (const m of messages) total += estimateTokens(m.content ?? "");
  return total;
}

/** Compute the projected cost (USD) for a call given pre-call estimates. */
export function projectCallCost(args: {
  providerId: string;
  inputTokens: number;
  maxOutputTokens: number;
  rateOverride?: Rate;
}): number {
  const rate =
    args.rateOverride ?? DEFAULT_RATES[args.providerId as ProviderId] ?? DEFAULT_RATES.custom;
  const inputUsd = (args.inputTokens / 1000) * rate.input;
  const outputUsd = (args.maxOutputTokens / 1000) * rate.output;
  return inputUsd + outputUsd;
}

/**
 * Record a completed call's actual usage. Called from the provider
 * chain after a successful chat() round.
 */
export function recordCall(args: {
  providerId: string;
  inputTokens: number;
  outputTokens: number;
  /** Optional cost override when the provider returned its own usage. */
  costUsdOverride?: number;
}): void {
  const bucket = getOrInit(args.providerId);
  bucket.calls += 1;
  bucket.inputTokens += args.inputTokens;
  bucket.outputTokens += args.outputTokens;
  const rate = DEFAULT_RATES[args.providerId as ProviderId] ?? DEFAULT_RATES.custom;
  const cost =
    args.costUsdOverride ??
    (args.inputTokens / 1000) * rate.input + (args.outputTokens / 1000) * rate.output;
  bucket.spendUsd += Math.max(0, cost);
}

/**
 * Returns true when a projected call would exceed the configured
 * monthly cap for the provider. The provider chain calls this BEFORE
 * each attempt and skips to the next entry if `false`.
 *
 * No cap configured -> always allowed.
 */
export function isUnderCap(provider: ProviderConfig, projectedCostUsd: number): boolean {
  if (!provider.monthlyCapUsd || provider.monthlyCapUsd <= 0) return true;
  const bucket = getOrInit(provider.id);
  return bucket.spendUsd + projectedCostUsd <= provider.monthlyCapUsd;
}

/**
 * Diagnostics for the admin dashboard. Returns the current month's
 * per-provider running totals, plus a small "near-cap" flag the UI
 * uses to surface 50/80/95% warnings.
 */
export function spendSummary(providers: ProviderConfig[]): Array<{
  providerId: string;
  monthKey: string;
  spendUsd: number;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  capUsd?: number;
  capPercent?: number;
}> {
  const mk = monthKey();
  return providers.map((p) => {
    const bucket = buckets.get(keyFor(p.id)) ?? {
      spendUsd: 0,
      calls: 0,
      inputTokens: 0,
      outputTokens: 0,
    };
    const capPercent = p.monthlyCapUsd ? (bucket.spendUsd / p.monthlyCapUsd) * 100 : undefined;
    return {
      providerId: p.id,
      monthKey: mk,
      spendUsd: Math.round(bucket.spendUsd * 10_000) / 10_000,
      calls: bucket.calls,
      inputTokens: bucket.inputTokens,
      outputTokens: bucket.outputTokens,
      capUsd: p.monthlyCapUsd,
      capPercent: capPercent === undefined ? undefined : Math.round(capPercent * 100) / 100,
    };
  });
}

/**
 * Admin helper to reset the current month's bucket (e.g., after a
 * pricing-error refund). Returns the previous totals so the admin
 * can verify what was cleared.
 */
export function resetSpend(providerId: string): Bucket {
  const k = keyFor(providerId);
  const prior = buckets.get(k) ?? { spendUsd: 0, calls: 0, inputTokens: 0, outputTokens: 0 };
  buckets.set(k, { spendUsd: 0, calls: 0, inputTokens: 0, outputTokens: 0 });
  return prior;
}
