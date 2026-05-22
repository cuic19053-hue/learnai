"use client";

import { signIn, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Mark from "@/components/design/Mark";

/**
 * Where guests land after dismissing the login screen. /learn is
 * profile-aware: returning learners go to their stage home, brand-new
 * guests fall through to /onboarding. We pick /learn/builder for the
 * very first click so a brand-new visitor lands on a real, populated
 * dashboard immediately.
 */
const GUEST_HOME = "/learn/builder";

type ProviderStatus = {
  signInEnabled: boolean;
  google: boolean;
  email: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);

  // If the visitor is already signed in (e.g. they just completed Google
  // OAuth and the callback landed them back here), don't keep them on a
  // login form — bounce them straight into their world. Without this,
  // the OAuth round-trip looked like a no-op: cookie set, then back to
  // /login showing the same form.
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.replace(GUEST_HOME);
    }
  }, [sessionStatus, router]);

  useEffect(() => {
    fetch("/api/auth/status")
      .then((r) => r.json())
      .then((d) =>
        setStatus({
          signInEnabled: !!d?.signInEnabled,
          google: !!d?.providers?.google,
          email: !!d?.providers?.email,
        })
      )
      .catch(() => setStatus({ signInEnabled: false, google: false, email: false }));
  }, []);

  function markGuest() {
    if (typeof window !== "undefined") {
      localStorage.setItem("guestMode", "true");
    }
  }

  function onGoogle() {
    setError(null);
    setNotice(null);
    if (!status?.signInEnabled || !status.google) {
      setNotice(
        "Google sign-in isn't enabled on this site yet. You can keep going as a guest below."
      );
      return;
    }
    void signIn("google", { callbackUrl: GUEST_HOME });
  }

  async function onEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const value = email.trim();
    if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError("Enter a valid email address to continue.");
      return;
    }
    if (!status) return;

    if (!status.signInEnabled) {
      setNotice(
        mode === "signup"
          ? "Account creation isn't enabled here yet — but everything works as a guest, no email needed."
          : "Sign-in isn't enabled on this site yet. Continue as a guest — your progress lives on this device."
      );
      return;
    }

    if (status.email && !needsPassword) {
      setSubmitting(true);
      try {
        await signIn("email", { email: value, callbackUrl: GUEST_HOME, redirect: false });
        setNotice(
          `Check your inbox — we sent a sign-in link to ${value}. The link expires in 24 hours.`
        );
      } catch {
        setError("Couldn't send the sign-in email. Try again in a moment.");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    if (!needsPassword) {
      setNeedsPassword(true);
      return;
    }

    setSubmitting(true);
    const res = await signIn("credentials", {
      email: value,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (res?.error) {
      setError("That email and password didn't match. Try again, or continue as a guest.");
      return;
    }
    router.push(GUEST_HOME);
  }

  const isSignup = mode === "signup";
  const primaryLabel = needsPassword
    ? submitting
      ? "Signing in…"
      : "Sign in"
    : submitting
      ? "Sending…"
      : "Continue with email";

  return (
    <main
      className="flex min-h-screen items-center justify-center px-3 py-6 sm:py-10"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="w-full max-w-[920px] overflow-hidden rounded-3xl bg-white"
        style={{ boxShadow: "0 30px 80px rgba(15,20,48,.18)" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-[1.05fr_minmax(0,0.85fr)]">
          {/* ─────── LEFT: Form ─────── */}
          <div className="p-6 sm:p-9">
            <div className="flex items-center justify-between">
              <Mark size={36} fontSize={22} />
              <Link href="/" className="text-[12.5px] font-bold text-ink-soft hover:text-ink">
                ← Home
              </Link>
            </div>

            <h1 className="mt-7 text-[28px] font-extrabold tracking-[-0.02em] text-ink">
              {isSignup ? "Create your account" : "Welcome back"}
            </h1>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">
              {isSignup
                ? "Free to start. No card. Sync your progress when you sign in."
                : "Sign in to continue your learning progress."}
            </p>

            {/* Google */}
            <button
              type="button"
              onClick={onGoogle}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink hover:bg-line-soft"
            >
              <GoogleGlyph />
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-line-soft" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-[12px] text-ink-mute">or</span>
              </div>
            </div>

            <form onSubmit={onEmailContinue} noValidate>
              <label htmlFor="login-email" className="text-[13px] font-bold text-ink-soft">
                Email address
              </label>
              <div className="relative mt-1.5">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-3 flex items-center text-ink-mute"
                >
                  ✉
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitting}
                  className="w-full rounded-xl border border-line bg-white py-3 pl-9 pr-3.5 text-[14px] outline-none focus:border-brand-1 focus:ring-4 focus:ring-brand-1/10 disabled:opacity-60"
                />
              </div>

              {needsPassword ? (
                <div className="mt-3">
                  <label htmlFor="login-password" className="text-[13px] font-bold text-ink-soft">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    autoComplete={isSignup ? "new-password" : "current-password"}
                    required
                    autoFocus
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={submitting}
                    className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] outline-none focus:border-brand-1 focus:ring-4 focus:ring-brand-1/10"
                  />
                </div>
              ) : null}

              {error ? (
                <div
                  role="alert"
                  className="mt-3 rounded-lg px-3 py-2 text-[12.5px] font-semibold"
                  style={{ background: "#fef2f2", color: "#991b1b" }}
                >
                  {error}
                </div>
              ) : null}
              {notice ? (
                <div
                  role="status"
                  className="mt-3 rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
                  style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}
                >
                  {notice}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="la-btn mt-5 w-full"
                style={{ padding: "14px 18px", fontSize: 15 }}
              >
                {primaryLabel}
              </button>
            </form>

            {/* Sign-in ↔ Sign-up toggle */}
            <div className="mt-4 text-center text-[13px] text-ink-soft">
              {isSignup ? "Already have an account? " : "Don't have an account? "}
              <button
                type="button"
                onClick={() => {
                  setMode(isSignup ? "signin" : "signup");
                  setNeedsPassword(false);
                  setError(null);
                  setNotice(null);
                }}
                className="font-bold text-brand-1 hover:underline"
              >
                {isSignup ? "Sign in" : "Sign up"}
              </button>
            </div>

            <div className="my-5 border-t border-line-soft" />

            {/* Guest path — real <Link> so it navigates even before JS hydrates */}
            <Link
              href={GUEST_HOME}
              onClick={markGuest}
              prefetch
              className="block w-full text-center text-[14px] font-semibold text-brand-1 hover:underline"
            >
              Continue without an account →
            </Link>

            <p className="mt-6 text-[12px] leading-relaxed text-ink-mute">
              By continuing, you agree to our{" "}
              <Link href="/legal/terms" className="underline hover:text-ink-soft">
                Terms
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline hover:text-ink-soft">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* ─────── RIGHT: Marketing rail ─────── */}
          <aside
            className="hidden flex-col p-9 md:flex"
            style={{ background: "var(--surface-soft)" }}
          >
            <div className="mt-4 flex flex-col items-center">
              <ShieldIcon />
              <h3 className="mt-5 text-center text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-ink">
                Learn your way
                <br />
                Securely and privately.
              </h3>
            </div>

            <ul className="mt-8 flex-1 space-y-5">
              <Perk
                icon={<MonitorIcon />}
                title="Sync across devices"
                body="Pick up where you left off on any device."
              />
              <Perk
                icon={<LockIcon />}
                title="Your data, your control"
                body="We respect your privacy and keep your data secure."
              />
              <Perk
                icon={<BoltIcon />}
                title="Free to get started"
                body="No credit card required. Free for at least the first year."
              />
            </ul>

            <div className="mt-6 flex items-center justify-end gap-3 text-[12px] text-ink-mute">
              <Link href="/legal/privacy" className="hover:text-ink-soft">
                Privacy
              </Link>
              <span aria-hidden>·</span>
              <Link href="/legal/terms" className="hover:text-ink-soft">
                Terms
              </Link>
              <span aria-hidden>·</span>
              <Link href="/help" className="hover:text-ink-soft">
                Help
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

/* ── Marketing rail building blocks ─────────────────────────────── */
function Perk({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="flex gap-3.5">
      <div
        className="grid h-11 w-11 flex-none place-items-center rounded-full"
        style={{ background: "var(--brand-grad-soft)" }}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-extrabold text-ink">{title}</div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </li>
  );
}

function ShieldIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden style={{ color: "var(--brand-1)" }}>
      <path
        d="M30 6l18 7v13c0 11.5-7.5 22-18 26-10.5-4-18-14.5-18-26V13z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M21 30l6 6 12-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--brand-1)" }}
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--brand-1)" }}
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--brand-1)" }}
    >
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H.9v2.3A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path d="M3.8 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l2.9-2.3z" fill="#FBBC05" />
      <path
        d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 0 0 .9 5l2.9 2.3C4.6 5.2 6.6 3.6 9 3.6z"
        fill="#EA4335"
      />
    </svg>
  );
}
