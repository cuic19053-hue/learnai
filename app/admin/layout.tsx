import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Admin layout — fixed sidebar + scrollable main.
 *
 * Server-side gate: every /admin/* route requires a signed-in user
 * with role === "ADMIN". Anyone else is bounced to /login with a
 * returnTo query so post-login they land back on the page they
 * asked for.
 *
 * In dev / preview environments where the database isn't wired,
 * NextAuth degrades to guest mode and `getServerSession` returns
 * null — we still send those visitors to /login, where the form
 * explains the local fallback.
 *
 * Bypass: set `ADMIN_GATE_DISABLED=1` for local development on a
 * laptop without a working database. Never set in production.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const gateDisabled = process.env.ADMIN_GATE_DISABLED === "1";
  if (!gateDisabled) {
    const session = await getServerSession(authOptions);
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (!session || role !== "ADMIN") {
      redirect("/login?returnTo=/admin");
    }
  }

  return (
    <div className="grid h-screen" style={{ gridTemplateColumns: "260px minmax(0, 1fr)" }}>
      <AdminSidebar />
      <main id="main" className="overflow-auto" style={{ background: "#f7f8fc" }}>
        {children}
      </main>
    </div>
  );
}
