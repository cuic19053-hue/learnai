"use client";

import { useMemo, useState, useTransition } from "react";
import {
  PROVIDER_CATALOGUE,
  PROVIDER_IDS,
  SUGGESTED_MODELS,
  type ProviderConfig,
  type ProviderId,
} from "@/lib/ai/providers";

type WireProvider = ProviderConfig & { hasApiKey?: boolean };

type Props = {
  initialProviders: WireProvider[];
};

export default function ProvidersPanel({ initialProviders }: Props) {
  const [providers, setProviders] = useState<WireProvider[]>(initialProviders);
  const [addingOpen, setAddingOpen] = useState(false);
  const [editId, setEditId] = useState<ProviderId | null>(null);
  const [pairingOpen, setPairingOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const configuredIds = useMemo(() => new Set(providers.map((p) => p.id)), [providers]);
  const ollabridge = providers.find((p) => p.id === "ollabridge");
  const others = providers.filter((p) => p.id !== "ollabridge");
  const available = PROVIDER_IDS.filter((id) => !configuredIds.has(id));

  async function refreshList() {
    try {
      const res = await fetch("/api/admin/providers", { cache: "no-store" });
      const data = await res.json();
      if (data?.ok && Array.isArray(data.providers)) {
        setProviders(data.providers as WireProvider[]);
      }
    } catch {
      // ignore — keep last good state
    }
  }

  return (
    <>
      <div className="px-5 py-7 md:px-9">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs text-ink-mute">Admin · Settings · AI Providers</div>
            <h1 className="mt-1 text-[28px] font-extrabold tracking-[-0.02em] text-ink">
              AI providers
            </h1>
            <p className="mt-1 max-w-[720px] text-[14px] text-ink-soft">
              LearnAI ships with <b>OllaBridge</b> as a zero-config default — every learner has
              working AI from day one. Add commercial providers to upgrade quality, run private with
              Ollama, or claim Grok&apos;s $25 free credits.
            </p>
          </div>
          <button
            type="button"
            className="la-btn"
            onClick={() => setAddingOpen(true)}
            style={{ padding: "11px 16px", fontSize: 13 }}
          >
            + Add provider
          </button>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-[13px] font-semibold text-rose-700"
          >
            {error}
          </div>
        ) : null}

        {/* Persistence warning — admin saves are in-memory only until the
            DB-backed config lands. Env vars are the durable path. */}
        <div
          role="note"
          className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-900"
        >
          <span aria-hidden className="mt-0.5 text-[16px]">
            ⚠️
          </span>
          <div className="flex-1">
            <div className="font-extrabold">Saves persist for this server process only.</div>
            <p className="mt-0.5">
              On Vercel and other serverless hosts the in-memory store resets on every cold start.
              For production, set keys via env vars (
              <code className="rounded bg-white px-1 py-[1px] text-[11px]">OPENAI_API_KEY</code>,{" "}
              <code className="rounded bg-white px-1 py-[1px] text-[11px]">ANTHROPIC_API_KEY</code>,{" "}
              <code className="rounded bg-white px-1 py-[1px] text-[11px]">XAI_API_KEY</code>,{" "}
              <code className="rounded bg-white px-1 py-[1px] text-[11px]">OLLABRIDGE_*</code>) —
              they re-seed the chain on every boot. DB-backed admin persistence ships next.
            </p>
          </div>
        </div>

        {/* Status strip */}
        <div className="mt-5 flex flex-wrap items-center gap-2 text-[12px]">
          <span className="la-pill" style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}>
            ⚡ {providers.filter((p) => p.enabled).length} enabled
          </span>
          <span
            className="la-pill"
            style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
          >
            🧩 {providers.length} configured · {available.length} available
          </span>
          <span className="la-pill" style={{ background: "#dcfce7", color: "#166534" }}>
            ● {providers.filter((p) => p.lastTestStatus === "ok").length} healthy
          </span>
        </div>

        {/* OllaBridge hero card */}
        {ollabridge ? (
          <DefaultProviderCard
            cfg={ollabridge}
            onEdit={() => setEditId("ollabridge")}
            onPair={() => setPairingOpen(true)}
            onTest={async () => {
              await runTest("ollabridge", refreshList);
            }}
          />
        ) : null}

        {/* Configured providers (non-default) */}
        {others.length > 0 ? (
          <>
            <h2 className="mt-8 text-[14px] font-extrabold tracking-tight text-ink">
              Configured providers
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {others.map((p) => (
                <ProviderCard
                  key={p.id}
                  cfg={p}
                  onEdit={() => setEditId(p.id)}
                  onTest={async () => runTest(p.id, refreshList)}
                  onRemove={async () => {
                    if (!confirm(`Remove ${PROVIDER_CATALOGUE[p.id].name}?`)) return;
                    await fetch(`/api/admin/providers?id=${p.id}`, { method: "DELETE" });
                    await refreshList();
                  }}
                />
              ))}
            </div>
          </>
        ) : null}

        {/* Available to add */}
        {available.length > 0 ? (
          <>
            <h2 className="mt-8 text-[14px] font-extrabold tracking-tight text-ink">
              Available to add
            </h2>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {available.map((id) => (
                <AvailableCard
                  key={id}
                  id={id}
                  onClick={() => {
                    setEditId(id);
                  }}
                />
              ))}
            </div>
          </>
        ) : null}

        {/* Routing chain */}
        <h2 className="mt-10 text-[14px] font-extrabold tracking-tight text-ink">Fallback chain</h2>
        <p className="mt-1 text-[12px] text-ink-mute">
          When a higher-priority provider errors out (timeout, 5xx, empty content) the chat engine
          falls through to the next entry — so learners never see a billing error.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {providers.filter((p) => p.enabled).length === 0 ? (
            <span className="text-[12px] text-ink-mute">No providers enabled.</span>
          ) : (
            providers
              .filter((p) => p.enabled)
              .map((p, i, arr) => (
                <span key={p.id} className="inline-flex items-center gap-2">
                  <span
                    className="la-pill"
                    style={{
                      background: PROVIDER_CATALOGUE[p.id].color,
                      color: "#fff",
                      fontWeight: 700,
                    }}
                  >
                    {i + 1}. {PROVIDER_CATALOGUE[p.id].name}
                  </span>
                  {i < arr.length - 1 ? (
                    <span className="text-ink-mute" aria-hidden>
                      →
                    </span>
                  ) : null}
                </span>
              ))
          )}
        </div>
      </div>

      {/* Add-provider drawer */}
      {addingOpen ? (
        <AddProviderModal
          available={available}
          onClose={() => setAddingOpen(false)}
          onPick={(id) => {
            setAddingOpen(false);
            setEditId(id);
          }}
        />
      ) : null}

      {/* Per-provider edit drawer */}
      {editId ? (
        <ProviderConfigDrawer
          id={editId}
          existing={providers.find((p) => p.id === editId) ?? null}
          onClose={() => setEditId(null)}
          onSaved={async () => {
            setEditId(null);
            await refreshList();
          }}
          onError={(msg) => setError(msg)}
        />
      ) : null}

      {/* OllaBridge pairing modal */}
      {pairingOpen ? (
        <PairingModal
          onClose={() => setPairingOpen(false)}
          onPaired={async () => {
            setPairingOpen(false);
            await refreshList();
          }}
        />
      ) : null}
    </>
  );
}

async function runTest(id: ProviderId, refresh: () => Promise<void>) {
  await fetch("/api/admin/providers/test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ id }),
  });
  await refresh();
}

/* ── Default provider hero card ──────────────────────────────────── */
function DefaultProviderCard({
  cfg,
  onEdit,
  onPair,
  onTest,
}: {
  cfg: WireProvider;
  onEdit: () => void;
  onPair: () => void;
  onTest: () => void;
}) {
  const meta = PROVIDER_CATALOGUE[cfg.id];
  return (
    <div
      className="la-card mt-6 overflow-hidden p-6"
      style={{
        borderRadius: 22,
        borderColor: meta.color,
        borderWidth: 1.5,
        boxShadow: "0 0 0 4px rgba(124,58,237,.08)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className="grid h-14 w-14 flex-none place-items-center rounded-2xl text-white"
            style={{ background: meta.color, fontWeight: 800, fontSize: 22 }}
            aria-hidden
          >
            {meta.logo}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-extrabold tracking-tight text-ink">{meta.name}</h2>
              <span
                className="la-pill text-[10px] font-extrabold"
                style={{ background: meta.color, color: "#fff" }}
              >
                {meta.tag}
              </span>
              <HealthDot status={cfg.lastTestStatus ?? "untested"} />
            </div>
            <p className="mt-1 max-w-[640px] text-[13px] leading-relaxed text-ink-soft">
              {meta.description}
            </p>
            <div className="la-mono mt-2 text-[11px] text-ink-mute">
              {cfg.baseUrl} · model <b className="text-ink">{cfg.model}</b>
              {cfg.pairingDeviceId ? ` · paired to ${cfg.pairingDeviceId}` : ""}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onTest}
            className="la-btn ghost"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            Test connection
          </button>
          <button
            type="button"
            onClick={onPair}
            className="la-btn ghost"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            📺 Pair device
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="la-btn"
            style={{ padding: "9px 14px", fontSize: 13 }}
          >
            Configure
          </button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {meta.perks.map((p) => (
          <div
            key={p}
            className="rounded-xl border border-line-soft px-3 py-2 text-[12px] font-semibold text-ink-soft"
            style={{ background: "var(--surface-soft)" }}
          >
            {p}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Configured-provider card (non-default) ──────────────────────── */
function ProviderCard({
  cfg,
  onEdit,
  onTest,
  onRemove,
}: {
  cfg: WireProvider;
  onEdit: () => void;
  onTest: () => void;
  onRemove: () => void;
}) {
  const meta = PROVIDER_CATALOGUE[cfg.id];
  return (
    <div className="la-card p-4" style={{ borderRadius: 18 }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div
            className="grid h-11 w-11 flex-none place-items-center rounded-xl text-white"
            style={{ background: meta.color, fontWeight: 800, fontSize: 18 }}
            aria-hidden
          >
            {meta.logo}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[15px] font-extrabold text-ink">{meta.name}</span>
              <span
                className="la-pill text-[10px]"
                style={{ background: `${meta.color}22`, color: meta.color }}
              >
                {meta.tag}
              </span>
              <HealthDot status={cfg.lastTestStatus ?? "untested"} />
            </div>
            <div className="la-mono mt-1 truncate text-[11px] text-ink-mute">
              {cfg.baseUrl} · {cfg.model}
            </div>
            {cfg.lastTestMessage ? (
              <div className="mt-1 line-clamp-2 text-[11px] text-rose-600">
                {cfg.lastTestMessage}
              </div>
            ) : null}
          </div>
        </div>
        <span className="la-mono text-[10px] font-extrabold text-ink-mute">#{cfg.priority}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-ink-soft">
          <input
            type="checkbox"
            checked={cfg.enabled}
            onChange={async (e) => {
              await fetch("/api/admin/providers", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  ...cfg,
                  apiKey: undefined, // do not echo masked dots back as the key
                  enabled: e.target.checked,
                }),
              });
              // Local mirror — saving on the server is the source of truth.
              cfg.enabled = e.target.checked;
            }}
          />
          Enabled
        </label>
        <button
          type="button"
          onClick={onTest}
          className="hover:bg-bg-2 ml-auto rounded-md px-2.5 py-1 text-[11px] font-bold text-ink-soft"
        >
          Test
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="hover:bg-bg-2 rounded-md px-2.5 py-1 text-[11px] font-bold text-ink-soft"
        >
          Configure
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-md px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

/* ── Available-to-add card ───────────────────────────────────────── */
function AvailableCard({ id, onClick }: { id: ProviderId; onClick: () => void }) {
  const meta = PROVIDER_CATALOGUE[id];
  const recommended = id === "xai";
  return (
    <button
      type="button"
      onClick={onClick}
      className="la-card flex flex-col p-4 text-left transition hover:-translate-y-0.5"
      style={{ borderRadius: 18 }}
    >
      <div className="flex items-start gap-3">
        <div
          className="grid h-11 w-11 flex-none place-items-center rounded-xl text-white"
          style={{ background: meta.color, fontWeight: 800, fontSize: 18 }}
          aria-hidden
        >
          {meta.logo}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-extrabold text-ink">{meta.name}</span>
            <span
              className="la-pill text-[10px]"
              style={{ background: `${meta.color}22`, color: meta.color }}
            >
              {meta.tag}
            </span>
            {recommended ? (
              <span
                className="la-pill text-[10px] font-extrabold"
                style={{ background: "var(--brand-grad)", color: "#fff" }}
              >
                RECOMMENDED
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{meta.description}</p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {meta.perks.map((p) => (
          <span key={p} className="la-pill text-[10px]" style={{ background: "var(--bg-2)" }}>
            {p}
          </span>
        ))}
      </div>
      <span className="mt-3 text-[12px] font-extrabold" style={{ color: meta.color }}>
        Add →
      </span>
    </button>
  );
}

/* ── Add-provider catalogue modal ────────────────────────────────── */
function AddProviderModal({
  available,
  onClose,
  onPick,
}: {
  available: ProviderId[];
  onClose: () => void;
  onPick: (id: ProviderId) => void;
}) {
  return (
    <ModalShell title="Add a provider" onClose={onClose} width={780}>
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Pick the provider you&apos;d like to add. The next step is a short config form — API key if
        needed, base URL, default model.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {available.map((id) => (
          <AvailableCard key={id} id={id} onClick={() => onPick(id)} />
        ))}
        {available.length === 0 ? (
          <div className="bg-bg-2 rounded-xl border border-line-soft px-3 py-3 text-[13px] text-ink-soft">
            Every supported provider is already configured.
          </div>
        ) : null}
      </div>
    </ModalShell>
  );
}

/* ── Per-provider config drawer ──────────────────────────────────── */
function ProviderConfigDrawer({
  id,
  existing,
  onClose,
  onSaved,
  onError,
}: {
  id: ProviderId;
  existing: WireProvider | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
  onError: (msg: string) => void;
}) {
  const meta = PROVIDER_CATALOGUE[id];
  const [baseUrl, setBaseUrl] = useState(existing?.baseUrl ?? meta.defaultBaseUrl);
  const [model, setModel] = useState(existing?.model ?? meta.defaultModel);
  const [apiKey, setApiKey] = useState("");
  const [priority, setPriority] = useState(existing?.priority ?? 2);
  const [monthlyCap, setMonthlyCap] = useState(existing?.monthlyCapUsd ?? 25);
  const [enabled, setEnabled] = useState(existing?.enabled ?? true);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/providers", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            id,
            baseUrl,
            model,
            // Don't blow away an existing key when the field is blank — the
            // wire shows masked dots only, so empty input = "no change".
            ...(apiKey.trim() ? { apiKey: apiKey.trim() } : {}),
            priority,
            monthlyCapUsd: monthlyCap,
            enabled,
          }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          onError(data?.error ?? "Save failed.");
          return;
        }
        await onSaved();
      } catch (e) {
        onError((e as Error).message);
      }
    });
  }

  const needsKey = !meta.keyless;
  const suggestedModels = SUGGESTED_MODELS[id];

  return (
    <ModalShell
      title={existing ? `Configure ${meta.name}` : `Add ${meta.name}`}
      onClose={onClose}
      width={620}
    >
      {/* Provider-specific banner */}
      {id === "xai" ? (
        <div className="mb-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-[12.5px] leading-relaxed text-emerald-800">
          <strong>$25 promotional credits</strong> applied automatically on signup at{" "}
          <a className="underline" href={meta.docsUrl} target="_blank" rel="noreferrer noopener">
            console.x.ai
          </a>{" "}
          (30-day expiry). The xAI data-sharing program was discontinued in 2025 — keys are
          private-use only.
        </div>
      ) : null}
      {id === "anthropic" ? (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-800">
          Anthropic uses its own <code>/v1/messages</code> endpoint and <code>x-api-key</code>{" "}
          header — LearnAI handles the translation automatically.
        </div>
      ) : null}
      {id === "ollama" ? (
        <div className="bg-bg-2 mb-4 rounded-xl border border-line px-4 py-3 text-[12.5px] leading-relaxed text-ink-soft">
          Ollama runs on your own machine. Start it with <code>ollama serve</code> then pull a
          model: <code>ollama pull llama3.2</code>. LearnAI talks to it on{" "}
          <code>localhost:11434</code>.
        </div>
      ) : null}

      <div className="space-y-3">
        <Field label="Base URL">
          <input
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-brand-1"
            placeholder={meta.defaultBaseUrl}
          />
        </Field>

        <Field label="Default model">
          <div className="flex gap-2">
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="flex-1 rounded-xl border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-brand-1"
              placeholder={meta.defaultModel}
              list={`models-${id}`}
            />
            {suggestedModels.length > 0 ? (
              <datalist id={`models-${id}`}>
                {suggestedModels.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            ) : null}
          </div>
          {suggestedModels.length > 0 ? (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {suggestedModels.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setModel(m)}
                  className="rounded-full border border-line bg-white px-2.5 py-1 text-[11px] font-semibold text-ink-soft hover:border-ink-soft"
                >
                  {m}
                </button>
              ))}
            </div>
          ) : null}
        </Field>

        {needsKey ? (
          <Field
            label="API key"
            hint={
              existing?.hasApiKey
                ? "A key is already saved (shown masked above). Leave blank to keep it; paste a new one to replace."
                : `Create one at ${new URL(meta.docsUrl).host}.`
            }
          >
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 font-mono text-[13px] outline-none focus:border-brand-1"
              placeholder={existing?.hasApiKey ? existing.apiKey : `${meta.envVar ?? "API_KEY"}…`}
              autoComplete="off"
              spellCheck={false}
            />
          </Field>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority (1 = primary)">
            <input
              type="number"
              min={1}
              max={10}
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
              className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-brand-1"
            />
          </Field>
          {!meta.keyless ? (
            <Field label="Monthly spend cap (USD)">
              <input
                type="number"
                min={0}
                max={5000}
                value={monthlyCap}
                onChange={(e) => setMonthlyCap(Number(e.target.value))}
                className="w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[13.5px] outline-none focus:border-brand-1"
              />
            </Field>
          ) : (
            <Field label="Status">
              <div className="bg-bg-2 rounded-xl border border-line px-3 py-2.5 text-[13px] text-ink-soft">
                Free — no spend cap needed
              </div>
            </Field>
          )}
        </div>

        <label className="flex items-center gap-2 rounded-xl border border-line-soft bg-surface-soft px-3 py-2.5 text-[13px] font-semibold text-ink-soft">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Enabled in the fallback chain
        </label>

        {meta.envVar ? (
          <div className="rounded-xl border border-dashed border-line bg-white px-3 py-2.5 text-[11.5px] leading-relaxed text-ink-mute">
            <div className="la-mono font-extrabold uppercase tracking-[0.08em]">
              Prefer env over UI?
            </div>
            <code className="mt-1 block whitespace-pre text-[11px]">
              export {meta.envVar}=&quot;your-key-here&quot;
            </code>
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={onClose}
          className="la-btn ghost"
          style={{ padding: "10px 14px", fontSize: 13 }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={save}
          disabled={pending}
          className="la-btn"
          style={{ padding: "10px 16px", fontSize: 13 }}
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </ModalShell>
  );
}

/* ── OllaBridge device-pairing modal ─────────────────────────────── */
function PairingModal({
  onClose,
  onPaired,
}: {
  onClose: () => void;
  onPaired: () => void | Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<
    null | { ok: true; latencyMs?: number; sample?: string } | { ok: false; message: string }
  >(null);

  const cleaned = code.toUpperCase().replace(/[^A-Z0-9-]/g, "");
  const looksLikeCode = /^[A-Z0-9]{4}-?[A-Z0-9]{4}$/.test(cleaned);

  function submit() {
    if (!looksLikeCode || pending) return;
    setResult(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/providers/pairing", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ code: cleaned }),
        });
        const data = await res.json();
        if (!res.ok || !data?.ok) {
          setResult({ ok: false, message: data?.error ?? "Couldn't save the pairing code." });
          return;
        }
        // Show probe result inline before closing.
        setResult(data.probe);
        if (data.probe?.ok) {
          window.setTimeout(async () => {
            await onPaired();
          }, 800);
        }
      } catch (e) {
        setResult({ ok: false, message: (e as Error).message });
      }
    });
  }

  return (
    <ModalShell title="Pair an OllaBridge device" onClose={onClose} width={580}>
      <p className="text-[13px] leading-relaxed text-ink-soft">
        Open{" "}
        <a
          className="font-extrabold underline"
          href="https://ruslanmv-ollabridge.hf.space"
          target="_blank"
          rel="noreferrer noopener"
        >
          ruslanmv-ollabridge.hf.space
        </a>{" "}
        in another tab, sign in, and copy the pairing code from your dashboard. Paste it below —
        we&apos;ll save it and immediately test the connection.
      </p>

      <label className="mt-4 block">
        <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
          Pairing code
        </span>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text").trim();
            if (v) {
              e.preventDefault();
              setCode(v);
            }
          }}
          placeholder="FYNS-1159"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="mt-1.5 w-full rounded-2xl border-2 border-dashed bg-white px-4 py-4 text-center font-mono text-[26px] font-extrabold tracking-[0.12em] outline-none focus:border-brand-1"
          style={{
            borderColor: looksLikeCode ? "var(--brand-1)" : "var(--line)",
            color: looksLikeCode ? "var(--ink)" : "var(--ink-mute)",
            letterSpacing: "0.18em",
          }}
        />
        <div className="mt-1.5 text-[11px] text-ink-mute">
          Format: 4 chars · dash · 4 chars (we&apos;ll auto-normalise).
        </div>
      </label>

      <button
        type="button"
        onClick={submit}
        disabled={!looksLikeCode || pending}
        className="la-btn mt-4 w-full"
        style={{ padding: "12px 18px", fontSize: 14 }}
      >
        {pending ? "Pairing + testing connection…" : "Pair & test"}
      </button>

      {result ? (
        <div
          role="status"
          className={`mt-4 rounded-xl border px-4 py-3 text-[13px] ${
            result.ok
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
        >
          {result.ok ? (
            <>
              <div className="font-extrabold">
                ✓ Paired and connected
                {"latencyMs" in result && result.latencyMs ? ` · ${result.latencyMs} ms` : ""}
              </div>
              {"sample" in result && result.sample ? (
                <div className="la-mono mt-1 text-[11px]">
                  model reply: <span className="font-extrabold">{result.sample}</span>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="font-extrabold">Couldn&apos;t reach OllaBridge</div>
              <div className="la-mono mt-1 text-[11px]">{result.message}</div>
            </>
          )}
        </div>
      ) : null}

      <ol className="mt-5 space-y-1.5 text-[12px] leading-relaxed text-ink-soft">
        <li>
          1. Open <code className="bg-bg-2 rounded px-1">ruslanmv-ollabridge.hf.space</code> in
          another tab.
        </li>
        <li>2. Sign in with the account hosting your premium models.</li>
        <li>
          3. Click <b>Device Pairing</b> — your dashboard shows a code.
        </li>
        <li>
          4. Paste the code here and click <b>Pair &amp; test</b>.
        </li>
      </ol>
    </ModalShell>
  );
}

/* ── Shared modal shell + bits ───────────────────────────────────── */
function ModalShell({
  title,
  width = 640,
  onClose,
  children,
}: {
  title: string;
  width?: number;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[100] overflow-y-auto">
      <div
        aria-hidden
        className="fixed inset-0"
        style={{ background: "rgba(15,20,48,0.45)" }}
        onMouseDown={onClose}
      />
      <div className="relative flex min-h-full items-start justify-center p-4 sm:p-8">
        <div
          className="relative w-full overflow-hidden rounded-3xl bg-white shadow-2xl"
          style={{ maxWidth: width }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-line-soft px-6 py-4">
            <h2 className="text-[18px] font-extrabold tracking-tight text-ink">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="grid h-9 w-9 place-items-center rounded-full text-ink-mute hover:bg-line-soft"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {hint ? <div className="mt-1 text-[11px] text-ink-mute">{hint}</div> : null}
    </label>
  );
}

function HealthDot({ status }: { status: string }) {
  const color = status === "ok" ? "#16a34a" : status === "error" ? "#dc2626" : "#9ca3af";
  const label = status === "ok" ? "Healthy" : status === "error" ? "Failing" : "Untested";
  return (
    <span className="la-pill text-[10px]" style={{ background: `${color}22`, color }} title={label}>
      <span
        aria-hidden
        style={{
          width: 7,
          height: 7,
          borderRadius: 99,
          background: color,
          display: "inline-block",
          marginRight: 4,
        }}
      />
      {label}
    </span>
  );
}
