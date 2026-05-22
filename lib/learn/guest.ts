import { cookies } from "next/headers";

export const GUEST_ID_COOKIE = "learnai_guest_id";

function randomId(): string {
  // Stable-enough random id for anonymous learner identity. Not cryptographic.
  return `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function readGuestId(): Promise<string | null> {
  const store = await cookies();
  return store.get(GUEST_ID_COOKIE)?.value ?? null;
}

/**
 * Ensure a stable guest id exists. Call from server components/route handlers
 * that need an anonymous identity (e.g. when saving progress before sign-up).
 */
export async function ensureGuestId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(GUEST_ID_COOKIE)?.value;
  if (existing) return existing;
  const id = randomId();
  store.set(GUEST_ID_COOKIE, id, {
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
  return id;
}
