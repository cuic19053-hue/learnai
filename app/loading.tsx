export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex min-h-screen items-center justify-center bg-gray-50"
    >
      <div className="flex items-center gap-3 text-gray-600">
        <span
          aria-hidden
          className="h-3 w-3 animate-pulse rounded-full bg-primary"
        />
        <span>Loading…</span>
      </div>
    </div>
  );
}
