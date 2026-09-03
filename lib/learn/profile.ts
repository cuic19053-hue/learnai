import { cookies } from "next/headers";
import type { LearnerProfile, LearnerStage } from "./stages";

export const PROFILE_COOKIE = "learnai_profile";

const STAGE_ATTENTION: Record<LearnerStage, number> = {
  GRADE_6: 5,
  GRADE_7: 10,
  GRADE_8: 20,
  GRADE_9: 25,
  UNIVERSITY: 30,
  PROFESSIONAL: 30,
  SENIOR: 15,
};

export function defaultAttentionMinutes(stage: LearnerStage): number {
  return STAGE_ATTENTION[stage];
}

function safeParse(raw: string | undefined): LearnerProfile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.stage !== "string") return null;
    return parsed as LearnerProfile;
  } catch {
    return null;
  }
}

export async function readProfile(): Promise<LearnerProfile | null> {
  const store = await cookies();
  return safeParse(store.get(PROFILE_COOKIE)?.value);
}

export async function writeProfile(profile: LearnerProfile): Promise<void> {
  const store = await cookies();
  store.set(PROFILE_COOKIE, JSON.stringify(profile), {
    path: "/",
    sameSite: "lax",
    // Profile is read by client components (e.g. age-aware UI), so it
    // cannot be httpOnly. Mark secure in production to avoid plaintext
    // cookies on insecure origins.
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function clearProfile(): Promise<void> {
  const store = await cookies();
  store.delete(PROFILE_COOKIE);
}
