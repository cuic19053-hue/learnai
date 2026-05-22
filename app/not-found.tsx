import Link from "next/link";

export const metadata = {
  title: "Page not found | LearnAI",
};

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-2 text-2xl font-bold text-dark">We can&apos;t find that page</h1>
        <p className="mt-3 text-gray-600">
          The lesson you&apos;re looking for has moved or never existed. Pick a learning journey
          from the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-primary px-5 py-2 font-semibold text-white hover:bg-secondary"
          >
            Go home
          </Link>
          <Link
            href="/onboarding"
            className="rounded-lg border px-5 py-2 font-semibold text-gray-700 hover:bg-gray-50"
          >
            Start learning
          </Link>
        </div>
      </div>
    </main>
  );
}
