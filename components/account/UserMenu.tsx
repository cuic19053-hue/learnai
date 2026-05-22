"use client";

/**
 * Header avatar with a real dropdown menu.
 *
 * Replaces the inert `<Link href="/login">` button in LearnerHomeShell
 * with a popover that surfaces the signed-in user's name, email, and
 * provider — plus shortcuts to Settings, Profile, and Sign out. Guests
 * see a single "Sign in" link and an avatar that says "G".
 *
 * Closes on: outside-click, Escape, scroll-away, any nav click inside.
 * Doesn't render a portal — it's positioned absolutely inside the
 * header's flex row so it inherits the page's stacking context.
 */

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Props = {
  /**
   * Initial shown inside the avatar when there's no session yet (or
   * during the brief "loading" phase before useSession() hydrates).
   * Defaults to "G" for Guest.
   */
  fallbackInitial?: string;
};

export default function UserMenu({ fallbackInitial = "G" }: Props) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape so the menu behaves like every
  // other floating popover the learner has used on the web.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isAuthed = status === "authenticated" && session?.user;
  const name = isAuthed ? (session.user.name ?? "Learner") : "Guest";
  const email = isAuthed ? (session.user.email ?? null) : null;
  const image = isAuthed ? (session.user.image ?? null) : null;
  const initial =
    isAuthed && name && name.length > 0 ? name.trim()[0].toUpperCase() : fallbackInitial;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={isAuthed ? `Account menu for ${name}` : "Account menu"}
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full font-extrabold text-white"
        style={{ background: "var(--brand-grad)" }}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span>{initial}</span>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-40 mt-2 w-64 overflow-hidden rounded-2xl bg-white"
          style={{ boxShadow: "0 20px 60px rgba(15,20,48,.18)", border: "1px solid var(--line)" }}
        >
          {isAuthed ? (
            <>
              <div className="border-b border-line-soft p-4">
                <div className="text-[14px] font-extrabold text-ink">{name}</div>
                {email ? (
                  <div className="mt-0.5 truncate text-[12px] text-ink-soft" title={email}>
                    {email}
                  </div>
                ) : null}
                <div className="mt-1 text-[11px] font-bold uppercase tracking-wider text-ink-mute">
                  {session.user.role ?? "STUDENT"}
                </div>
              </div>
              <MenuLink href="/settings/profile" onClick={() => setOpen(false)}>
                👤 Profile
              </MenuLink>
              <MenuLink href="/settings" onClick={() => setOpen(false)}>
                ⚙ Settings
              </MenuLink>
              <MenuLink href="/learn/switch" onClick={() => setOpen(false)}>
                🌍 Switch world
              </MenuLink>
              <div className="border-t border-line-soft" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  // callbackUrl tells NextAuth where to send the user
                  // after the session cookie is cleared.
                  void signOut({ callbackUrl: "/" });
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[13.5px] font-semibold text-ink hover:bg-line-soft"
              >
                ↩ Sign out
              </button>
            </>
          ) : (
            <>
              <div className="border-b border-line-soft p-4">
                <div className="text-[14px] font-extrabold text-ink">Guest mode</div>
                <div className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                  Progress lives only on this device. Sign in to sync across devices.
                </div>
              </div>
              <MenuLink href="/login" onClick={() => setOpen(false)}>
                → Sign in
              </MenuLink>
              <MenuLink href="/settings" onClick={() => setOpen(false)}>
                ⚙ Settings
              </MenuLink>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

function MenuLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:bg-line-soft"
    >
      {children}
    </Link>
  );
}
