import type { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";

/**
 * Admin layout — fixed sidebar + scrollable main. Active state on the
 * sidebar is computed from the URL pathname, so every nested route gets
 * its tab highlighted without per-page wiring.
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="grid h-screen"
      style={{ gridTemplateColumns: "260px minmax(0, 1fr)" }}
    >
      <AdminSidebar />
      <main
        id="main"
        className="overflow-auto"
        style={{ background: "#f7f8fc" }}
      >
        {children}
      </main>
    </div>
  );
}
