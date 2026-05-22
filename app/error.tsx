"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[app] error boundary:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <h1 className="text-2xl font-bold text-dark">Something went wrong</h1>
        <p className="mt-3 text-gray-600">
          You can keep using LearnAI as a guest while we fix this.
        </p>
        {error.digest ? (
          <p className="mt-2 text-xs text-gray-400">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-secondary"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
