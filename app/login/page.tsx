"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Where guests land after dismissing the login screen. /learn is profile-
 * aware: returning learners go to their stage home, brand-new guests fall
 * through to /onboarding. We pick /learn/builder for the very first click
 * so a brand-new visitor lands on a real, populated dashboard immediately
 * (Mission card + Loop chips + teacher chat) without going through setup.
 */
const GUEST_HOME = "/learn/builder";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Sign-in is not available right now. You can keep learning as a guest below.");
      return;
    }
    router.push(GUEST_HOME);
  }

  function markGuest() {
    if (typeof window !== "undefined") {
      localStorage.setItem("guestMode", "true");
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-5 rounded-2xl bg-white p-7 shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-dark">Sign in to save your progress</h1>
          <p className="mt-2 text-sm text-gray-600">
            Signing in is optional. Use LearnAI freely as a guest — sign in only when you want your
            progress synced across devices.
          </p>
        </div>

        {/* Real <Link> — navigates even before JS hydrates. */}
        <Link
          href={GUEST_HOME}
          onClick={markGuest}
          prefetch
          className="flex w-full items-center justify-center rounded-lg bg-primary px-4 py-3 text-base font-semibold text-white transition hover:bg-secondary"
        >
          Continue without an account →
        </Link>

        <div className="relative py-1">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-2 text-gray-500">or sign in to sync progress</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn("google", { callbackUrl: GUEST_HOME })}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <span className="text-lg font-bold text-red-500">G</span>
          <span>Continue with Google</span>
        </button>

        <form onSubmit={handleCredentialsLogin} className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs text-gray-700">Email address</label>
            <input
              type="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-700">Password</label>
            <input
              type="password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? <p className="text-xs text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg border border-primary px-4 py-3 font-semibold text-primary hover:bg-primary hover:text-white disabled:opacity-60"
          >
            {loading ? "Signing in…" : "Sign in with email"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          New here?{" "}
          <Link href="/register" className="text-primary hover:underline">
            Create an account
          </Link>{" "}
          — or just{" "}
          <Link href={GUEST_HOME} onClick={markGuest} className="text-primary hover:underline">
            keep going as a guest
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
