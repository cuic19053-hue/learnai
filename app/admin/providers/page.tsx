import type { Metadata } from "next";
import { listProviders } from "@/lib/ai/config-store";
import ProvidersPanel from "@/components/admin/providers/ProvidersPanel";

export const metadata: Metadata = {
  title: "AI providers — Admin",
  description:
    "Configure the AI providers powering LearnAI. OllaBridge is the bundled default. Add OpenAI, Anthropic, xAI Grok, Ollama, or any OpenAI-compatible endpoint.",
};

export const dynamic = "force-dynamic";

export default function AdminProvidersPage() {
  // Strip API keys before handing to the client component — the UI
  // shows a masked dot-string only. Edits POST back to the API with
  // a fresh key value.
  const initial = listProviders().map((p) => ({
    ...p,
    apiKey: p.apiKey ? `${"•".repeat(8)}${p.apiKey.slice(-4)}` : undefined,
    hasApiKey: !!p.apiKey,
  }));
  return <ProvidersPanel initialProviders={initial} />;
}
