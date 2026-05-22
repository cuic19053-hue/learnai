"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Mark from "@/components/design/Mark";

type Profile = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
  createdAt: string;
  providers: string[];
  hasPassword: boolean;
};

export default function ProfileClient({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [name, setName] = useState(profile.name ?? "");
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [signingOutAll, setSigningOutAll] = useState(false);

  const trimmedName = name.trim();
  const dirty = trimmedName !== (profile.name ?? "").trim() && trimmedName.length > 0;
  const providerLabel = profile.providers.length > 0 ? labelFor(profile.providers[0]) : "Email";

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    if (!dirty) return;
    setError(null);
    setSavedNote(null);
    setSaving(true);
    try {
      const r = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Save failed (${r.status})`);
      }
      setSavedNote("Saved.");
      // Refresh so server components (header dropdown, world greeting)
      // pick up the new name on the next nav.
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function signOutEverywhere() {
    const ok = window.confirm(
      "Sign out of every device, including this browser? You'll need to sign in again afterwards."
    );
    if (!ok) return;
    setError(null);
    setSavedNote(null);
    setSigningOutAll(true);
    try {
      const r = await fetch("/api/me/sessions", { method: "DELETE" });
      if (!r.ok) {
        const body = (await r.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Failed (${r.status})`);
      }
      // Invalidate the local cookie + bounce to /. The tokenVersion
      // bump on the server will already have killed every other device
      // — they'll see /login on their next request.
      await signOut({ callbackUrl: "/", redirect: false });
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-out failed.");
      setSigningOutAll(false);
    }
  }

  async function deleteAccount() {
    if (confirmDelete.trim() !== (profile.email ?? "")) {
      setError("Type your account email exactly to confirm.");
      return;
    }
    setError(null);
    setDeleting(true);
    try {
      const r = await fetch("/api/me", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmEmail: confirmDelete.trim() }),
      });
      if (!r.ok) {
        const body = (await r.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? `Delete failed (${r.status})`);
      }
      // Sign out so the now-stale session cookie is cleared, then send
      // them to a friendly farewell page (just "/" for now).
      await signOut({ callbackUrl: "/", redirect: false });
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
      setDeleting(false);
    }
  }

  const initial = (profile.name ?? profile.email ?? "?")[0]?.toUpperCase() ?? "?";

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="border-b border-line-soft bg-white">
        <div className="mx-auto flex h-16 max-w-[960px] items-center justify-between px-5">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <Link href="/settings" className="text-[13px] font-bold text-ink-soft hover:text-ink">
            ← Back to settings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[720px] px-5 pb-20 pt-10">
        <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-brand-1">
          Your profile
        </div>
        <h1 className="mt-2 text-[34px] font-extrabold tracking-[-0.02em] text-ink md:text-[40px]">
          {profile.name ?? "Your account"}
        </h1>
        <p className="mt-2 max-w-[520px] text-[14px] text-ink-soft">
          Edit how your name appears across LearnAI, or delete your account permanently.
        </p>

        {/* Identity card */}
        <section
          className="mt-8 flex items-center gap-4 rounded-2xl p-5"
          style={{
            background: "#fff",
            border: "1px solid var(--line-soft)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <div
            className="grid h-14 w-14 flex-none place-items-center overflow-hidden rounded-full text-xl font-extrabold text-white"
            style={{ background: "var(--brand-grad)" }}
            aria-hidden
          >
            {profile.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.image}
                alt=""
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[16px] font-extrabold text-ink">
              {profile.name ?? "—"}
            </div>
            <div className="truncate text-[13px] text-ink-soft" title={profile.email ?? ""}>
              {profile.email ?? "—"}
            </div>
            <div className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
              Signed in with {providerLabel} · {profile.role}
            </div>
          </div>
        </section>

        {/* Editable fields */}
        <form
          onSubmit={saveName}
          className="mt-5 rounded-2xl p-5"
          style={{
            background: "#fff",
            border: "1px solid var(--line-soft)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <label htmlFor="profile-name" className="text-[13px] font-bold text-ink">
            Display name
          </label>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            Shown in the header, on the welcome banner, and to your AI tutor.
          </p>
          <input
            id="profile-name"
            type="text"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            disabled={saving}
            className="mt-3 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-brand-1 focus:ring-4 focus:ring-brand-1/10"
          />

          {/* Email is read-only — changing it on an OAuth account is a
              separate flow that requires verifying the new address. */}
          <label htmlFor="profile-email" className="mt-5 block text-[13px] font-bold text-ink">
            Email address
          </label>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            {profile.providers.length > 0
              ? `Linked to ${providerLabel} — change it in your ${providerLabel} account.`
              : "Email change is coming soon — get in touch via /help to request one today."}
          </p>
          <input
            id="profile-email"
            type="email"
            value={profile.email ?? ""}
            readOnly
            disabled
            className="mt-3 w-full rounded-xl border border-line bg-line-soft px-3.5 py-3 text-[15px] text-ink-soft"
          />

          {savedNote ? (
            <div
              role="status"
              className="mt-4 rounded-lg px-3 py-2 text-[12.5px] font-semibold"
              style={{ background: "rgba(45,187,108,0.1)", color: "#0a6b39" }}
            >
              {savedNote}
            </div>
          ) : null}
          {error ? (
            <div
              role="alert"
              className="mt-4 rounded-lg px-3 py-2 text-[12.5px] font-semibold"
              style={{ background: "#fef2f2", color: "#991b1b" }}
            >
              {error}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={!dirty || saving}
              className="la-btn"
              style={{ padding: "12px 18px", fontSize: 14, opacity: !dirty || saving ? 0.5 : 1 }}
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {dirty ? (
              <button
                type="button"
                onClick={() => {
                  setName(profile.name ?? "");
                  setError(null);
                }}
                className="la-btn ghost"
                style={{ padding: "12px 14px", fontSize: 13 }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        {/* Privacy — export everything we hold for this user */}
        <section
          className="mt-6 rounded-2xl p-5"
          style={{
            background: "#fff",
            border: "1px solid var(--line-soft)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <h2 className="text-[16px] font-extrabold text-ink">Your data</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            Download every row LearnAI holds for your account in a single JSON file — profile,
            preferences, progress, projects, linked providers. We never include passwords or
            authentication tokens.
          </p>
          <a
            href="/api/me/export"
            className="la-btn ghost mt-3 inline-flex"
            style={{ padding: "10px 14px", fontSize: 13 }}
            // download is hinted by the API's Content-Disposition header,
            // this attribute is belt-and-braces for older browsers.
            download
          >
            ⬇ Export my data
          </a>
        </section>

        {/* Sessions — sign out every device at once */}
        <section
          className="mt-6 rounded-2xl p-5"
          style={{
            background: "#fff",
            border: "1px solid var(--line-soft)",
            boxShadow: "var(--shadow-1)",
          }}
        >
          <h2 className="text-[16px] font-extrabold text-ink">Sessions</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            Signed in via {providerLabel}. If you think someone else has access to your account,
            signing out everywhere will revoke every device — including this one — and require you
            to sign in again.
          </p>
          <button
            type="button"
            onClick={signOutEverywhere}
            disabled={signingOutAll}
            className="la-btn ghost mt-3"
            style={{ padding: "10px 14px", fontSize: 13, opacity: signingOutAll ? 0.5 : 1 }}
          >
            {signingOutAll ? "Signing out…" : "Sign out everywhere"}
          </button>
        </section>

        {/* Danger zone — full account deletion */}
        <section
          className="mt-6 rounded-2xl p-5"
          style={{ background: "#fff", border: "1.5px solid #fecaca" }}
        >
          <h2 className="text-[16px] font-extrabold text-ink">Delete my account</h2>
          <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">
            Permanent. Removes your profile, projects, preferences, and progress from the LearnAI
            database. You can sign up again afterwards — nothing recovers from this action. Type{" "}
            <code className="rounded bg-line-soft px-1.5 py-0.5 text-[11.5px]">
              {profile.email}
            </code>{" "}
            below to confirm.
          </p>
          <input
            type="email"
            placeholder="type your account email"
            value={confirmDelete}
            onChange={(e) => setConfirmDelete(e.target.value)}
            className="mt-3 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
          />
          <button
            type="button"
            onClick={deleteAccount}
            disabled={deleting || confirmDelete.trim() !== (profile.email ?? "")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-red-700 disabled:opacity-40"
          >
            {deleting ? "Deleting…" : "Delete my account permanently"}
          </button>
        </section>
      </main>
    </div>
  );
}

function labelFor(provider: string): string {
  switch (provider) {
    case "google":
      return "Google";
    case "email":
      return "Magic link";
    case "credentials":
      return "Email + password";
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}
