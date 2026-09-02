"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Mark from "@/components/design/Mark";
import { Arrow } from "@/components/design/icons";
import SignInModal from "@/components/SignInModal";

/**
 * Marketing header with two animations:
 *   • Page-load entrance — logo, nav links (staggered), CTA
 *   • Scroll state — soft shadow + stronger blur once the page scrolls
 *
 * Everything respects `prefers-reduced-motion`.
 */
export default function StickyHeader() {
  const reduce = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const fadeIn = reduce
    ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
    : { initial: { opacity: 0, y: -8 }, animate: { opacity: 1, y: 0 } };

  return (
    <header
      className="sticky top-0 z-30 border-b border-line-soft transition-shadow duration-200"
      style={{
        height: 72,
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
        backdropFilter: scrolled ? "blur(14px) saturate(140%)" : "blur(8px)",
        WebkitBackdropFilter: scrolled ? "blur(14px) saturate(140%)" : "blur(8px)",
        boxShadow: scrolled ? "0 4px 16px rgba(15,20,48,.05)" : "none",
      }}
    >
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6 md:px-12">
        <motion.div {...fadeIn} transition={{ duration: 0.5, ease: "easeOut" }}>
          <Link href="/" aria-label="LearnAI home">
            <Mark size={32} fontSize={20} />
          </Link>
        </motion.div>

        <motion.nav
          aria-label="Primary"
          className="hidden items-center gap-7 md:flex"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
          }}
        >
          {[
            { href: "#journeys", label: "学习旅程" },
            { href: "#how", label: "运作机制" },
            { href: "/organizations", label: "合作与机构" },
            { href: "/teachers", label: "名师团队" },
          ].map((l) => (
            <motion.div
              key={l.href}
              variants={{
                hidden: reduce ? { opacity: 1 } : { opacity: 0, y: -4 },
                show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
              }}
            >
              <Link href={l.href} className="la-navlink">
                {l.label}
              </Link>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div
          className="flex items-center gap-2"
          initial={reduce ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.45 }}
        >
          {/* Small, low-key Sign in — opens the modal in place. Never auto-redirects. */}
          <button
            type="button"
            onClick={() => setSignInOpen(true)}
            className="rounded-lg px-3 py-2 text-[14px] font-semibold text-ink-soft hover:text-ink"
            aria-label="登录"
          >
            登录
          </button>
          <Link
            href="/onboarding"
            className="la-btn group"
            style={{ padding: "10px 18px" }}
            aria-label="免费开始"
          >
            免费开始
            <span className="inline-flex transition-transform group-hover:translate-x-1">
              <Arrow />
            </span>
          </Link>
        </motion.div>
      </div>

      <SignInModal open={signInOpen} onClose={() => setSignInOpen(false)} />
    </header>
  );
}
