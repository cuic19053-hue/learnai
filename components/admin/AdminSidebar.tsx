"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Mark from "@/components/design/Mark";

type NavItem = {
  icon: string;
  label: string;
  href: string;
  badge?: string;
  /** Substrings of the URL pathname that count as "this item is active". */
  match?: string[];
};
type NavGroup = { title: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    title: "OVERVIEW",
    items: [
      { icon: "🏠", label: "Overview", href: "/admin", match: ["/admin"] },
      { icon: "👥", label: "Learners", href: "/admin/learners" },
      { icon: "🔁", label: "Loops", href: "/admin/loops" },
      { icon: "🌍", label: "Worlds", href: "/admin/worlds" },
    ],
  },
  {
    title: "TUTORS · AI",
    items: [
      { icon: "🤖", label: "AI providers", href: "/admin/providers" },
      { icon: "🎭", label: "Personas", href: "/admin/personas" },
    ],
  },
  {
    title: "TRUST",
    items: [
      { icon: "🛡️", label: "Safety", href: "/admin/safety" },
      { icon: "📜", label: "Audit log", href: "/admin/audit" },
    ],
  },
  {
    title: "BUSINESS",
    items: [{ icon: "💳", label: "Billing", href: "/admin/billing" }],
  },
];

/**
 * Admin sidebar — flex column with three panes. Active state is
 * computed from the URL pathname, so every route inside /admin gets the
 * right tab highlighted automatically.
 */
export default function AdminSidebar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname() ?? "/admin";

  function isActive(it: NavItem): boolean {
    // Exact match for /admin to avoid every sub-route appearing as Overview.
    if (it.href === "/admin") return pathname === "/admin";
    return pathname.startsWith(it.href);
  }

  return (
    <aside
      className="hidden h-screen flex-col border-r border-line-soft md:flex"
      style={{ background: "#fbfbff", width: 260 }}
    >
      {/* Header */}
      <div
        className="flex-shrink-0 border-b border-line-soft"
        style={{ padding: "18px 16px 14px" }}
      >
        <Link href="/admin">
          <Mark size={28} fontSize={17} />
        </Link>
        <div className="mt-3 flex items-center gap-2 rounded-[10px] border border-line-soft bg-white px-2.5 py-2">
          <div
            className="grid h-[22px] w-[22px] place-items-center rounded-md text-[11px] font-extrabold text-white"
            style={{ background: "var(--brand-grad)" }}
          >
            L
          </div>
          <div className="flex-1 truncate">
            <div className="text-xs font-bold text-ink">LearnAI</div>
            <div className="text-[10px] text-ink-mute">Admin workspace</div>
          </div>
        </div>
      </div>

      {/* Middle nav */}
      <nav
        className="flex-1 overflow-y-auto px-2 pb-4 pt-3.5"
        style={{ minHeight: 0 }}
        aria-label="Admin navigation"
      >
        {NAV_GROUPS.map((g) => (
          <div key={g.title} className="mb-[18px]">
            <div className="la-mono px-3 pb-2 text-[10px] font-bold tracking-[0.08em] text-ink-mute">
              {g.title}
            </div>
            {g.items.map((it) => {
              const active = isActive(it);
              return (
                <Link
                  key={it.label}
                  href={it.href}
                  className="mb-[2px] flex cursor-pointer items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px]"
                  style={{
                    background: active ? "#fff" : "transparent",
                    boxShadow: active ? "var(--shadow-1)" : "none",
                    fontWeight: active ? 700 : 600,
                    color: active ? "var(--ink)" : "var(--ink-soft)",
                  }}
                >
                  <span className="w-[18px] text-center text-[15px]" aria-hidden>
                    {it.icon}
                  </span>
                  <span className="flex-1">{it.label}</span>
                  {it.badge ? (
                    <span
                      className="rounded-full px-[7px] py-[2px] text-[10px] font-extrabold text-white"
                      style={{ background: "var(--brand-grad)" }}
                    >
                      {it.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="relative flex-shrink-0 border-t border-line-soft p-3"
        style={{ background: "#fbfbff" }}
      >
        {menuOpen ? <AdminAccountMenu onClose={() => setMenuOpen(false)} /> : null}
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          className="flex w-full items-center gap-2.5 rounded-xl border-2 bg-white px-2.5 py-2 text-left"
          style={{
            borderColor: "var(--brand-1)",
            boxShadow: "0 0 0 4px rgba(46,91,255,.08)",
          }}
        >
          <div
            className="grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold text-white"
            style={{ background: "var(--brand-grad)" }}
            aria-hidden
          >
            RM
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-ink">Ruslan M.</div>
            <div className="truncate text-[10px] text-ink-mute">admin@learnai</div>
          </div>
          <span className="text-xs text-ink-mute" aria-hidden>
            {menuOpen ? "⌄" : "⌃"}
          </span>
        </button>
      </div>
    </aside>
  );
}

function AdminAccountMenu({ onClose }: { onClose: () => void }) {
  const items = [
    { icon: "ⓘ", label: "About", href: "/admin" },
    { icon: "⚙", label: "Settings", href: "/admin" },
    { icon: "?", label: "Help", href: "/admin" },
  ];
  return (
    <div
      role="menu"
      aria-label="Account menu"
      className="absolute z-10 rounded-2xl bg-white p-1.5"
      style={{
        bottom: "calc(100% + 8px)",
        left: 12,
        right: 12,
        boxShadow: "0 18px 48px rgba(15,20,48,.18), 0 0 0 1px var(--line)",
      }}
    >
      <div className="mb-1 border-b border-line-soft px-3 py-2.5 pb-3">
        <div className="text-[13px] font-bold text-ink">Ruslan M.</div>
        <div className="text-[11px] text-ink-mute">admin@learnai</div>
      </div>
      {items.map((it) => (
        <Link
          key={it.label}
          href={it.href}
          role="menuitem"
          onClick={onClose}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-ink hover:bg-line-soft"
        >
          <span className="w-4 text-center text-ink-mute">{it.icon}</span>
          {it.label}
        </Link>
      ))}
      <div className="mx-1.5 my-1 h-px bg-line-soft" />
      <button
        type="button"
        role="menuitem"
        onClick={onClose}
        className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] font-semibold text-red-600 hover:bg-red-50"
      >
        <span className="w-4 text-center">↪</span>
        Log out
      </button>
    </div>
  );
}
