import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileClient from "@/components/settings/ProfileClient";

export const metadata: Metadata = {
  title: "Profile",
  description: "View and edit your LearnAI account.",
};

export const dynamic = "force-dynamic";

/**
 * Account profile page.
 *
 * Guards itself server-side: a guest hitting /settings/profile is sent
 * to /login with a callbackUrl so they end up here after sign-in
 * instead of having to navigate twice.
 */
export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/settings/profile")}`);
  }

  // Hit the database directly here — cheaper than a self-fetch and
  // gives the client a fully-populated initial state to avoid a flash
  // of "loading…" on the first render.
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      createdAt: true,
      password: true, // we never send this to the client — see below
      accounts: { select: { provider: true } },
    },
  });

  if (!user) {
    // Edge case: session points at a User row that was deleted after
    // the JWT was issued. Force a fresh sign-in so the next request
    // doesn't see a phantom user.
    redirect("/login");
  }

  return (
    <ProfileClient
      profile={{
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        providers: user.accounts.map((a) => a.provider),
        // True without leaking the actual hash — the UI uses this only
        // to render the "change password" affordance.
        hasPassword: !!user.password,
      }}
    />
  );
}
