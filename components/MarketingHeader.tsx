"use client";

import Link from "next/link";
import { useState } from "react";
import LoginModal from "./LoginModal";

export default function MarketingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <nav className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary" />
              <span className="text-xl font-bold text-dark">AI智能学习助手</span>
            </Link>

            <div className="hidden items-center gap-8 md:flex">
              <Link href="/" className="text-gray-600 transition-colors hover:text-primary">
                首页
              </Link>
              <Link href="/explore" className="text-gray-600 transition-colors hover:text-primary">
                名师团队
              </Link>
              <a href="#pricing" className="text-gray-600 transition-colors hover:text-primary">
                价格方案
              </a>
              <a href="#about" className="text-gray-600 transition-colors hover:text-primary">
                关于我们
              </a>
            </div>

            <div className="flex items-center gap-3">
              {/* IMPORTANT: Explore is public */}
              <Link
                href="/explore"
                className="hidden rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:inline-flex"
              >
                探索课程
              </Link>

              {/* Login optional: modal only on click */}
              <button
                onClick={() => setOpen(true)}
                className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-secondary"
              >
                立即体验
              </button>

              <button className="text-gray-600 md:hidden" aria-label="打开菜单">
                ☰
              </button>
            </div>
          </div>
        </nav>
      </header>

      <LoginModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
