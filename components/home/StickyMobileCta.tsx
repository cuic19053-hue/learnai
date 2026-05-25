"use client";

/**
 * Small floating "Start free" CTA pinned to the bottom of the
 * viewport on mobile. Appears after the user scrolls past the hero
 * (~600 px) so it doesn't compete with the in-hero CTA, and never
 * shows on desktop (where the sticky header already has it).
 */

import { useEffect, useState } from "react";
import Link from "next/link";

export default function StickyMobileCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      aria-hidden={!show}
      className="md:hidden"
      style={{
        position: "fixed",
        left: 16,
        right: 16,
        bottom: "max(16px, env(safe-area-inset-bottom, 0px) + 12px)",
        zIndex: 40,
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(20px)",
        transition: "opacity .2s, transform .2s",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      <Link
        href="/onboarding"
        className="block rounded-full text-center"
        style={{
          padding: "14px 22px",
          background: "var(--brand-grad)",
          color: "#fff",
          fontWeight: 800,
          fontSize: 15,
          textDecoration: "none",
          boxShadow: "0 18px 40px rgba(46,91,255,.35)",
        }}
      >
        Start learning free
      </Link>
    </div>
  );
}
