"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Mark from "@/components/design/Mark";

type SignInModalProps = {
  open: boolean;
  onClose: () => void;
  /** Default landing target after sign-in. */
  callbackUrl?: string;
  /** Open in "sign up" mode rather than "sign in". Identical surface,
   *  different copy — matches the design's "Don't have an account? Sign up" toggle. */
  defaultMode?: "signin" | "signup";
};

type ProviderStatus = {
  signInEnabled: boolean;
  google: boolean;
  email: boolean;
};

/**
 * Two-column sign-in / sign-up modal.
 *
 * Left rail: Google + email-first flow + "Continue without an account"
 * escape hatch. Right rail: a steady marketing block (sync, privacy,
 * free) so the surface always feels like a real product even when
 * sign-in isn't configured yet.
 *
 * Behaviour rules:
 *   - Google button is always visible. If Google isn't configured we
 *     show an inline note instead of a silent failure.
 *   - Email-first: enter email → next step (magic-link OR password
 *     entry depending on provider config). Falls back to a friendly
 *     guest-mode notice when no provider is wired up.
 *   - "Continue without an account" is always the safe path.
 */
export default function SignInModal({
  open,
  onClose,
  callbackUrl = "/learn/builder",
  defaultMode = "signin",
}: SignInModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsPassword, setNeedsPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [status, setStatus] = useState<ProviderStatus | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync defaultMode on open.
  useEffect(() => {
    if (open) setMode(defaultMode);
  }, [open, defaultMode]);

  // Lifecycle: probe providers, lock body scroll, focus dialog, close on Esc.
  useEffect(() => {
    if (!open) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    setError(null);
    setNotice(null);
    setNeedsPassword(false);
    setPassword("");

    if (!status) {
      fetch("/api/auth/status")
        .then((r) => r.json())
        .then((d) => {
          setStatus({
            signInEnabled: !!d?.signInEnabled,
            google: !!d?.providers?.google,
            email: !!d?.providers?.email,
          });
        })
        .catch(() => setStatus({ signInEnabled: false, google: false, email: false }));
    }

    return () => {
      window.removeEventListener("keydown", onEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, status]);

  function continueAsGuest() {
    if (typeof window !== "undefined") {
      localStorage.setItem("guestMode", "true");
      window.location.href = callbackUrl;
    }
  }

  function onGoogle() {
    setError(null);
    setNotice(null);
    if (!status?.signInEnabled || !status.google) {
      setNotice(
        "当前部署尚未配置 Google 快捷登录，您可以直接作为游客免登录体验。"
      );
      return;
    }
    void signIn("google", { callbackUrl });
  }

  async function onEmailContinue(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    const value = email.trim();
    if (!value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError("请输入有效的电子邮箱地址。");
      return;
    }
    if (!status) return;

    // Guest-only deployment.
    if (!status.signInEnabled) {
      setNotice(
        mode === "signup"
          ? "当前尚未开启账号注册功能 — 但您可以作为游客使用所有功能，无需填写邮箱。"
          : "当前尚未开启账号登录功能。您可以点击下方“以游客身份继续”，进度将保存在本设备上。"
      );
      return;
    }

    // Magic-link email provider configured → request a link.
    if (status.email && !needsPassword) {
      setSubmitting(true);
      try {
        await signIn("email", { email: value, callbackUrl, redirect: false });
        setNotice(
          `登录邮件已发送至 ${value}，请查收信箱。链接有效期为 24 小时。`
        );
      } catch {
        setError("无法发送登录邮件，请稍后再试。");
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Credentials provider — flip to password step.
    if (!needsPassword) {
      setNeedsPassword(true);
      return;
    }

    setSubmitting(true);
    const res = await signIn("credentials", {
      email: value,
      password,
      redirect: false,
    });
    setSubmitting(false);
    if (res?.error) {
      setError("邮箱与密码不匹配，请重试或以游客身份继续。");
      return;
    }
    onClose();
    if (typeof window !== "undefined") window.location.href = callbackUrl;
  }

  const isSignup = mode === "signup";
  const heroTitle = isSignup ? "创建您的账号" : "欢迎回来";
  const heroSub = isSignup
    ? "免费体验，无需信用卡。登录后可跨设备同步学习进度。"
    : "登录您的账号以继续学习进程。";
  const primaryLabel = needsPassword
    ? submitting
      ? "正在登录…"
      : "登录"
    : submitting
      ? "正在发送…"
      : isSignup
        ? "使用邮箱继续"
        : "使用邮箱继续";

  const modal = (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 overflow-y-auto"
          style={{ zIndex: 1000 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="signin-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div
            aria-hidden
            className="fixed inset-0"
            style={{
              background: "rgba(15,20,48,0.45)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              zIndex: 0,
            }}
            onMouseDown={onClose}
          />

          {/* Centered wrapper */}
          <div
            className="relative flex min-h-full items-center justify-center p-3 sm:p-6"
            style={{ zIndex: 1 }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) onClose();
            }}
          >
            <motion.div
              ref={dialogRef}
              tabIndex={-1}
              className="relative w-full max-w-[920px] overflow-hidden rounded-3xl bg-white outline-none"
              style={{ boxShadow: "0 30px 80px rgba(15,20,48,.28)" }}
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="grid grid-cols-1 md:grid-cols-[1.05fr_minmax(0,0.85fr)]">
                {/* ─────────── LEFT: Form ─────────── */}
                <div className="relative p-6 sm:p-9">
                  <div className="flex items-start justify-between gap-3">
                    <Mark size={36} fontSize={22} />
                    <button
                      type="button"
                      onClick={onClose}
                      aria-label="Close"
                      className="grid h-9 w-9 place-items-center rounded-full text-ink-mute hover:bg-line-soft hover:text-ink md:hidden"
                    >
                      ✕
                    </button>
                  </div>

                  <h2
                    id="signin-title"
                    className="mt-7 text-[28px] font-extrabold tracking-[-0.02em] text-ink"
                  >
                    {heroTitle}
                  </h2>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-soft">{heroSub}</p>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={onGoogle}
                    className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white px-4 py-3.5 text-[15px] font-semibold text-ink hover:bg-line-soft"
                  >
                    <GoogleGlyph />
                    使用 Google 账号继续
                  </button>

                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-line-soft" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-3 text-[12px] text-ink-mute">或</span>
                    </div>
                  </div>

                  {/* Email form */}
                  <form onSubmit={onEmailContinue} noValidate>
                    <label htmlFor="signin-email" className="text-[13px] font-bold text-ink-soft">
                      电子邮箱地址
                    </label>
                    <div className="relative mt-1.5">
                      <span
                        aria-hidden
                        className="absolute inset-y-0 left-3 flex items-center text-ink-mute"
                      >
                        ✉
                      </span>
                      <input
                        id="signin-email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={submitting}
                        className="w-full rounded-xl border border-line bg-white py-3 pl-9 pr-3.5 text-[14px] outline-none focus:border-brand-1 focus:ring-4 focus:ring-brand-1/10 disabled:opacity-60"
                      />
                    </div>

                    {needsPassword ? (
                      <div className="mt-3">
                        <label
                          htmlFor="signin-password"
                          className="text-[13px] font-bold text-ink-soft"
                        >
                          密码
                        </label>
                        <input
                          id="signin-password"
                          type="password"
                          autoComplete={isSignup ? "new-password" : "current-password"}
                          required
                          autoFocus
                          placeholder="请输入密码"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          disabled={submitting}
                          className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[14px] outline-none focus:border-brand-1 focus:ring-4 focus:ring-brand-1/10"
                        />
                      </div>
                    ) : null}

                    {error ? (
                      <div
                        role="alert"
                        className="mt-3 rounded-lg px-3 py-2 text-[12.5px] font-semibold"
                        style={{ background: "#fef2f2", color: "#991b1b" }}
                      >
                        {error}
                      </div>
                    ) : null}
                    {notice ? (
                      <div
                        role="status"
                        className="mt-3 rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed"
                        style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}
                      >
                        {notice}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="la-btn mt-5 w-full"
                      style={{ padding: "14px 18px", fontSize: 15 }}
                    >
                      {primaryLabel}
                    </button>
                  </form>

                  {/* Toggle sign-in ↔ sign-up */}
                  <div className="mt-4 text-center text-[13px] text-ink-soft">
                    {isSignup ? "已有账号？" : "还没有账号？"}
                    <button
                      type="button"
                      onClick={() => {
                        setMode(isSignup ? "signin" : "signup");
                        setNeedsPassword(false);
                        setError(null);
                        setNotice(null);
                      }}
                      className="font-bold text-brand-1 hover:underline"
                    >
                      {isSignup ? "直接登录" : "免费注册"}
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="my-5 border-t border-line-soft" />

                  {/* Guest path */}
                  <button
                    type="button"
                    onClick={continueAsGuest}
                    className="block w-full text-center text-[14px] font-semibold text-brand-1 hover:underline"
                  >
                    以游客身份免登录继续
                  </button>

                  {/* Terms */}
                  <p className="mt-6 text-[12px] leading-relaxed text-ink-mute">
                    继续操作即表示您同意我们的{" "}
                    <Link href="/legal/terms" className="underline hover:text-ink-soft">
                      服务条款
                    </Link>{" "}
                    与{" "}
                    <Link href="/legal/privacy" className="underline hover:text-ink-soft">
                      隐私政策
                    </Link>
                    。
                  </p>
                </div>

                {/* ─────────── RIGHT: Marketing rail ─────────── */}
                <aside
                  className="relative hidden flex-col p-9 md:flex"
                  style={{ background: "var(--surface-soft)" }}
                >
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="关闭"
                    className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full text-ink-mute hover:bg-white hover:text-ink"
                  >
                    ✕
                  </button>

                  <div className="mt-4 flex flex-col items-center">
                    <ShieldIcon />
                    <h3 className="mt-5 text-center text-[22px] font-extrabold leading-tight tracking-[-0.01em] text-ink">
                      以适合您的方式学习
                      <br />
                      安全、隐私且无忧。
                    </h3>
                  </div>

                  <ul className="mt-8 flex-1 space-y-5">
                    <Perk
                      icon={<MonitorIcon />}
                      title="多设备无缝同步"
                      body="随时随地在任何设备上接续您的学习进度。"
                    />
                    <Perk
                      icon={<LockIcon />}
                      title="数据由您自主掌控"
                      body="尊重隐私，严格保护您的个人学习数据与记录。"
                    />
                    <Perk
                      icon={<BoltIcon />}
                      title="随时免费开启体验"
                      body="无需信用卡，零门槛即刻享受智能辅导。"
                    />
                  </ul>

                  <div className="mt-6 flex items-center justify-end gap-3 text-[12px] text-ink-mute">
                    <Link href="/legal/privacy" className="hover:text-ink-soft">
                      Privacy
                    </Link>
                    <span aria-hidden>·</span>
                    <Link href="/legal/terms" className="hover:text-ink-soft">
                      Terms
                    </Link>
                    <span aria-hidden>·</span>
                    <Link href="/help" className="hover:text-ink-soft">
                      Help
                    </Link>
                  </div>
                </aside>
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  if (!mounted || typeof document === "undefined") return null;
  return createPortal(modal, document.body);
}

/* ── Perk row ──────────────────────────────────────────────────────── */
function Perk({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <li className="flex gap-3.5">
      <div
        className="grid h-11 w-11 flex-none place-items-center rounded-full"
        style={{ background: "var(--brand-grad-soft)" }}
        aria-hidden
      >
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[14px] font-extrabold text-ink">{title}</div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-soft">{body}</p>
      </div>
    </li>
  );
}

/* ── Icons ─────────────────────────────────────────────────────────── */
function ShieldIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" aria-hidden style={{ color: "var(--brand-1)" }}>
      <path
        d="M30 6l18 7v13c0 11.5-7.5 22-18 26-10.5-4-18-14.5-18-26V13z"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d="M21 30l6 6 12-12"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--brand-1)" }}
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--brand-1)" }}
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function BoltIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--brand-1)" }}
    >
      <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
    </svg>
  );
}

function GoogleGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 18 18" aria-hidden>
      <path
        d="M17.6 9.2c0-.6-.1-1.2-.2-1.8H9v3.4h4.8a4.1 4.1 0 0 1-1.8 2.7v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.2-3.8H.9v2.3A9 9 0 0 0 9 18z"
        fill="#34A853"
      />
      <path d="M3.8 10.7a5.4 5.4 0 0 1 0-3.4V5H.9a9 9 0 0 0 0 8l2.9-2.3z" fill="#FBBC05" />
      <path
        d="M9 3.6c1.3 0 2.5.5 3.5 1.4l2.6-2.6A9 9 0 0 0 .9 5l2.9 2.3C4.6 5.2 6.6 3.6 9 3.6z"
        fill="#EA4335"
      />
    </svg>
  );
}
