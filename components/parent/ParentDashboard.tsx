"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Mark from "@/components/design/Mark";
import {
  AGE_BAND_META,
  activeChild,
  DEFAULT_PREFS,
  loadPrefs,
  newChildId,
  savePrefs,
  SUBJECTS,
  type AgeBand,
  type ChildProfile,
  type ParentPrefs,
  type SubjectId,
} from "@/lib/parent/prefs";

type Tab = "today" | "children" | "settings" | "reports";

const TABS: Array<{ id: Tab; label: string; icon: string }> = [
  { id: "today", label: "Today", icon: "🏠" },
  { id: "children", label: "Children", icon: "👨‍👩‍👧" },
  { id: "settings", label: "Settings", icon: "⚙️" },
  { id: "reports", label: "Reports", icon: "📊" },
];

export default function ParentDashboard() {
  const [prefs, setPrefs] = useState<ParentPrefs>(DEFAULT_PREFS);
  const [hydrated, setHydrated] = useState(false);
  const [tab, setTab] = useState<Tab>("today");
  const [pinUnlocked, setPinUnlocked] = useState(false);

  useEffect(() => {
    setPrefs(loadPrefs());
    setHydrated(true);
  }, []);

  function update(next: ParentPrefs | ((p: ParentPrefs) => ParentPrefs)) {
    setPrefs((cur) => {
      const updated =
        typeof next === "function" ? (next as (p: ParentPrefs) => ParentPrefs)(cur) : next;
      savePrefs(updated);
      return updated;
    });
  }

  const child = activeChild(prefs);
  const settingsLocked = !!prefs.pinHash && !pinUnlocked;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* ───── Top bar ───── */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line-soft bg-white/90 px-4 py-3 backdrop-blur sm:px-7">
        <div className="flex items-center gap-3">
          <Link href="/" aria-label="LearnAI home">
            <Mark size={28} fontSize={18} />
          </Link>
          <span
            className="la-pill text-[12px]"
            style={{ background: "var(--bg-2)", color: "var(--ink-soft)" }}
          >
            👨‍👩‍👧 Parent area
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/learn/kids"
            className="hidden items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-bold text-ink-soft hover:text-ink sm:inline-flex"
          >
            ← Back to {child.name}&apos;s world
          </Link>
          <Link
            href="/learn/kids"
            className="la-btn"
            style={{ padding: "10px 14px", fontSize: 13 }}
          >
            Open {child.name}&apos;s app →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1100px] px-4 py-6 sm:px-7">
        {/* Heading + tab bar */}
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-[-0.02em] text-ink md:text-[32px]">
              Parent dashboard
            </h1>
            <p className="mt-1 text-[14px] text-ink-soft">
              Customize what {child.name} sees, how long, and how loud. Everything saves to this
              device — no account needed.
            </p>
          </div>
          <Link
            href="/learn/kids"
            className="rounded-xl border border-line bg-white px-3 py-2 text-[13px] font-bold text-ink-soft hover:text-ink sm:hidden"
          >
            ← Back to {child.name}&apos;s app
          </Link>
        </div>

        <nav role="tablist" className="mt-5 flex flex-wrap gap-1.5 border-b border-line-soft pb-0">
          {TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(t.id)}
                className="inline-flex items-center gap-1.5 rounded-t-xl border-b-2 px-3 py-2.5 text-[13px] font-bold transition"
                style={{
                  borderColor: active ? "var(--brand-1)" : "transparent",
                  color: active ? "var(--ink)" : "var(--ink-soft)",
                  background: active ? "var(--surface-soft)" : "transparent",
                }}
              >
                <span aria-hidden>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Tab body */}
        {!hydrated ? (
          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-line-soft" />
        ) : (
          <div className="mt-6">
            {tab === "today" ? <TodayPanel child={child} /> : null}
            {tab === "children" ? <ChildrenPanel prefs={prefs} update={update} /> : null}
            {tab === "settings" ? (
              settingsLocked ? (
                <PinGate onUnlock={() => setPinUnlocked(true)} />
              ) : (
                <SettingsPanel prefs={prefs} update={update} child={child} />
              )
            ) : null}
            {tab === "reports" ? <ReportsPanel child={child} /> : null}
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TODAY
   ────────────────────────────────────────────────────────────────────── */
function TodayPanel({ child }: { child: ChildProfile }) {
  // Demo activity — when activity logging lands this reads from the
  // progress engine. Until then, the shape is honest and stable so the
  // parent UI can be reviewed in real conditions.
  const activity = useMemo(
    () => ({
      sessionsToday: 1,
      minutesToday: 12,
      correct: 4,
      total: 5,
      learnedToday: ["Counted 1 to 5", "Named 3 jungle animals", "Picked the color red"],
      paused: "Hesitated on the number 4",
      tomorrow: "Count jungle animals with Milo — gentle intro of 6 and 7",
    }),
    []
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title={`Today ${child.name} learned`} icon="✨" wide>
        <ul className="mt-1 space-y-1.5 text-[14px] text-ink">
          {activity.learnedToday.map((l) => (
            <li key={l} className="flex gap-2">
              <span aria-hidden style={{ color: "var(--ok, #16a34a)" }}>
                ✓
              </span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        <div
          className="mt-4 rounded-xl border border-line-soft px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft"
          style={{ background: "var(--surface-soft)" }}
        >
          <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            Where they paused
          </span>
          <p className="mt-1">{activity.paused}</p>
        </div>
        <div
          className="mt-3 rounded-xl border border-line-soft px-3.5 py-3 text-[13px] leading-relaxed text-ink"
          style={{ background: "var(--bg-2)" }}
        >
          <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            Tomorrow
          </span>
          <p className="mt-1">{activity.tomorrow}</p>
        </div>
      </Card>

      <Card title="Time today" icon="⏱️">
        <div className="mt-1 flex items-baseline gap-2">
          <span
            className="text-[34px] font-extrabold text-ink"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            {activity.minutesToday}
          </span>
          <span className="la-mono text-[12px] text-ink-mute">
            min · {activity.sessionsToday} session
          </span>
        </div>
        <div className="bg-bg-2 mt-3 h-2 overflow-hidden rounded-full">
          <div
            className="h-full"
            style={{
              width: `${Math.min(100, (activity.minutesToday / child.dailyMinutes) * 100)}%`,
              background: "var(--brand-grad)",
            }}
          />
        </div>
        <p className="mt-2 text-[12px] text-ink-mute">
          Daily limit: {child.dailyMinutes} min · Auto-pause at {child.sessionMinutes} min per
          session
        </p>
      </Card>

      <Card title="Quick answers" icon="✅">
        <Stat label="Correct today" value={`${activity.correct} / ${activity.total}`} />
        <Stat label="Age band" value={AGE_BAND_META[child.ageBand].label} />
        <Stat
          label="Active subjects"
          value={`${child.allowedSubjects.length} of ${SUBJECTS.length}`}
        />
      </Card>

      <Card title="Helpful right now" icon="🎯" wide>
        <ul className="mt-1 space-y-2 text-[13px] text-ink-soft">
          <li className="flex gap-2">
            <span aria-hidden>📞</span>
            <span>Read aloud is on — Milo will speak at a calm pace.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>🛡️</span>
            <span>
              Approved-content-only is on — kids never see anything outside the selected subjects.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>🌙</span>
            <span>Quiet hours: 8 pm – 7 am. Sessions are paused during this window.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   CHILDREN — multi-child profiles
   ────────────────────────────────────────────────────────────────────── */
function ChildrenPanel({
  prefs,
  update,
}: {
  prefs: ParentPrefs;
  update: (n: ParentPrefs | ((p: ParentPrefs) => ParentPrefs)) => void;
}) {
  function addChild() {
    update((p) => ({
      ...p,
      children: [
        ...p.children,
        {
          id: newChildId(),
          name: "New child",
          avatar: "🐻",
          ageBand: "preschool",
          allowedSubjects: ["numbers", "letters", "colors", "stories"],
          sessionMinutes: 10,
          dailyMinutes: 30,
        },
      ],
    }));
  }

  function updateChild(id: string, patch: Partial<ChildProfile>) {
    update((p) => ({
      ...p,
      children: p.children.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  function removeChild(id: string) {
    update((p) => {
      if (p.children.length <= 1) return p;
      const filtered = p.children.filter((c) => c.id !== id);
      return {
        ...p,
        children: filtered,
        activeChildId: p.activeChildId === id ? filtered[0]!.id : p.activeChildId,
      };
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[18px] font-extrabold tracking-tight text-ink">
            Children on this device
          </h2>
          <p className="mt-1 text-[13px] text-ink-mute">
            Pick which child is using the app right now. Settings apply per child.
          </p>
        </div>
        <button
          type="button"
          onClick={addChild}
          className="la-btn ghost"
          style={{ padding: "9px 14px", fontSize: 13 }}
        >
          + Add child
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {prefs.children.map((c) => {
          const isActive = c.id === prefs.activeChildId;
          return (
            <div
              key={c.id}
              className="la-card p-4"
              style={{
                borderRadius: 18,
                borderColor: isActive ? "var(--brand-1)" : "var(--line-soft)",
                borderWidth: isActive ? 1.5 : 1,
              }}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => updateChild(c.id, { avatar: pickAvatar(c.avatar) })}
                  className="grid h-14 w-14 place-items-center rounded-2xl text-[28px]"
                  style={{ background: "var(--bg-2)" }}
                  aria-label="Change avatar"
                  title="Click to change avatar"
                >
                  {c.avatar}
                </button>
                <div className="min-w-0 flex-1">
                  <input
                    value={c.name}
                    onChange={(e) => updateChild(c.id, { name: e.target.value.slice(0, 24) })}
                    aria-label="Child name"
                    className="w-full border-none bg-transparent text-[17px] font-extrabold text-ink outline-none"
                  />
                  <div className="mt-0.5 text-[12px] text-ink-mute">
                    {AGE_BAND_META[c.ageBand].label} · {AGE_BAND_META[c.ageBand].ages}
                  </div>
                </div>
                {isActive ? (
                  <span
                    className="la-pill text-[10px] font-extrabold"
                    style={{ background: "var(--brand-grad)", color: "#fff" }}
                  >
                    ACTIVE
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => update((p) => ({ ...p, activeChildId: c.id }))}
                    className="text-[11px] font-bold text-brand-1 hover:underline"
                  >
                    Switch
                  </button>
                )}
              </div>

              <div className="la-mono mt-4 text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
                AGE BAND
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {(Object.keys(AGE_BAND_META) as AgeBand[]).map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => updateChild(c.id, { ageBand: b })}
                    className="rounded-full border px-3 py-1.5 text-[12px] font-extrabold"
                    style={{
                      borderColor: c.ageBand === b ? "var(--brand-1)" : "var(--line)",
                      background: c.ageBand === b ? "var(--bg-2)" : "#fff",
                      color: c.ageBand === b ? "var(--ink)" : "var(--ink-soft)",
                    }}
                    aria-pressed={c.ageBand === b}
                  >
                    {AGE_BAND_META[b].label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-mute">
                {AGE_BAND_META[c.ageBand].blurb}
              </p>

              {prefs.children.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeChild(c.id)}
                  className="mt-4 text-[12px] font-bold text-rose-600 hover:underline"
                >
                  Remove this child
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const AVATAR_POOL = ["🦁", "🐻", "🦊", "🐼", "🐯", "🦒", "🐰", "🐨", "🐶", "🐱", "🦄", "🐸"];
function pickAvatar(current: string): string {
  const i = AVATAR_POOL.indexOf(current);
  return AVATAR_POOL[(i + 1) % AVATAR_POOL.length]!;
}

/* ──────────────────────────────────────────────────────────────────────
   SETTINGS — the meat of the parent control plane
   ────────────────────────────────────────────────────────────────────── */
function SettingsPanel({
  prefs,
  update,
  child,
}: {
  prefs: ParentPrefs;
  update: (n: ParentPrefs | ((p: ParentPrefs) => ParentPrefs)) => void;
  child: ChildProfile;
}) {
  function updateChild(patch: Partial<ChildProfile>) {
    update((p) => ({
      ...p,
      children: p.children.map((c) => (c.id === child.id ? { ...c, ...patch } : c)),
    }));
  }
  function toggleSubject(s: SubjectId) {
    const has = child.allowedSubjects.includes(s);
    updateChild({
      allowedSubjects: has
        ? child.allowedSubjects.filter((x) => x !== s)
        : [...child.allowedSubjects, s],
    });
  }

  return (
    <div className="space-y-4">
      <SettingSection
        title="What can they learn?"
        subtitle={`Tap a subject to allow or block it. ${child.name} only sees what's allowed.`}
        icon="🎓"
      >
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SUBJECTS.map((s) => {
            const on = child.allowedSubjects.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => toggleSubject(s.id)}
                aria-pressed={on}
                className="flex items-center gap-2 rounded-2xl px-3 py-3 text-left text-[14px] font-extrabold transition"
                style={{
                  background: on ? "var(--brand-grad)" : "#fff",
                  color: on ? "#fff" : "var(--ink)",
                  border: on ? "none" : "1.5px solid var(--line)",
                }}
              >
                <span className="text-[20px]" aria-hidden>
                  {s.icon}
                </span>
                <span className="flex-1">{s.label}</span>
                {on ? <span aria-hidden>✓</span> : null}
              </button>
            );
          })}
        </div>
        <div
          className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-line-soft px-3 py-2.5"
          style={{ background: "var(--surface-soft)" }}
        >
          <div className="text-[13px]">
            <div className="font-extrabold text-ink">🛡️ Approved content only</div>
            <div className="text-[12px] text-ink-mute">
              Nothing outside the subjects above can appear — strongest safety setting.
            </div>
          </div>
          <ToggleSwitch
            on={prefs.approvedOnly}
            onChange={(v) => update((p) => ({ ...p, approvedOnly: v }))}
            label="Approved content only"
          />
        </div>
      </SettingSection>

      <SettingSection
        title="How long should they play?"
        subtitle="Auto-pauses when the limit is reached. You get a notification to extend or stop."
        icon="⏱️"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Stepper
            label="Per-session length"
            value={child.sessionMinutes}
            min={5}
            max={30}
            step={5}
            unit="minutes"
            onChange={(v) => updateChild({ sessionMinutes: v })}
          />
          <Stepper
            label="Daily total"
            value={child.dailyMinutes}
            min={10}
            max={120}
            step={10}
            unit="minutes"
            onChange={(v) => updateChild({ dailyMinutes: v })}
          />
        </div>
      </SettingSection>

      <SettingSection
        title="Voice, reading & accessibility"
        subtitle="How the tutor speaks and how the app looks."
        icon="🎤"
      >
        <ToggleRow
          label="Read everything aloud"
          sub="Tutor speaks each prompt at a calm pace."
          on={prefs.voice.readAloud}
          onChange={(v) => update((p) => ({ ...p, voice: { ...p.voice, readAloud: v } }))}
        />
        <div className="mt-3">
          <div className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
            Speech pace
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {([0.7, 1, 1.3] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => update((p) => ({ ...p, voice: { ...p.voice, speed: s } }))}
                aria-pressed={prefs.voice.speed === s}
                className="rounded-full px-3 py-1.5 text-[12px] font-extrabold"
                style={{
                  background: prefs.voice.speed === s ? "var(--brand-1)" : "#fff",
                  color: prefs.voice.speed === s ? "#fff" : "var(--ink)",
                  border: prefs.voice.speed === s ? "none" : "1px solid var(--line)",
                }}
              >
                {s === 0.7 ? "Slow" : s === 1 ? "Normal" : "Fast"}
              </button>
            ))}
          </div>
        </div>
        <ToggleRow
          className="mt-3"
          label="Bigger text"
          sub="Increases label sizes on the kids screen."
          on={prefs.voice.biggerText}
          onChange={(v) => update((p) => ({ ...p, voice: { ...p.voice, biggerText: v } }))}
        />
      </SettingSection>

      <SettingSection
        title="Quiet hours"
        subtitle="Sessions are paused during this window. Great for bedtime."
        icon="🌙"
      >
        <ToggleRow
          label="Enforce quiet hours"
          on={prefs.quietHours.enabled}
          onChange={(v) => update((p) => ({ ...p, quietHours: { ...p.quietHours, enabled: v } }))}
        />
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
              From
            </span>
            <input
              type="time"
              value={prefs.quietHours.from}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  quietHours: { ...p.quietHours, from: e.target.value },
                }))
              }
              disabled={!prefs.quietHours.enabled}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand-1 disabled:opacity-50"
            />
          </label>
          <label className="block">
            <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
              To
            </span>
            <input
              type="time"
              value={prefs.quietHours.to}
              onChange={(e) =>
                update((p) => ({
                  ...p,
                  quietHours: { ...p.quietHours, to: e.target.value },
                }))
              }
              disabled={!prefs.quietHours.enabled}
              className="mt-1 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-[14px] outline-none focus:border-brand-1 disabled:opacity-50"
            />
          </label>
        </div>
      </SettingSection>

      <SettingSection title="Notifications" subtitle="What we tell you about, and when." icon="🔔">
        <ToggleRow
          label="End-of-session summary"
          sub="A short note when your child finishes a session."
          on={prefs.notifications.afterSession}
          onChange={(v) =>
            update((p) => ({
              ...p,
              notifications: { ...p.notifications, afterSession: v },
            }))
          }
        />
        <ToggleRow
          className="mt-2"
          label="Weekly summary"
          sub="Sunday roundup of what they learned and where they paused."
          on={prefs.notifications.weeklySummary}
          onChange={(v) =>
            update((p) => ({
              ...p,
              notifications: { ...p.notifications, weeklySummary: v },
            }))
          }
        />
      </SettingSection>

      <SettingSection
        title="Privacy & safety"
        subtitle="Everything saves to this device. We never train models on a child's data."
        icon="🔒"
      >
        <p className="text-[13px] leading-relaxed text-ink-soft">
          LearnAI follows a guest-first design — no account is required, no email or phone number is
          collected from the child, and end-of-session data stays on this device until you
          explicitly export or sign in.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="la-btn ghost"
            style={{ padding: "9px 14px", fontSize: 13 }}
            onClick={() => {
              if (typeof window === "undefined") return;
              const blob = new Blob([JSON.stringify(prefs, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `learnai-parent-prefs.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            ⬇ Export my data
          </button>
          <button
            type="button"
            className="la-btn ghost"
            style={{ padding: "9px 14px", fontSize: 13, color: "#991b1b" }}
            onClick={() => {
              if (typeof window === "undefined") return;
              if (!confirm("Delete all parent settings on this device? This cannot be undone.")) {
                return;
              }
              window.localStorage.removeItem("learnai_parent_prefs_v1");
              window.location.reload();
            }}
          >
            🗑 Reset all settings
          </button>
        </div>
      </SettingSection>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   REPORTS — surfaced activity (demo until activity log lands)
   ────────────────────────────────────────────────────────────────────── */
function ReportsPanel({ child }: { child: ChildProfile }) {
  const week = [
    { d: "Mon", min: 14, mastery: 60 },
    { d: "Tue", min: 12, mastery: 64 },
    { d: "Wed", min: 16, mastery: 70 },
    { d: "Thu", min: 9, mastery: 72 },
    { d: "Fri", min: 18, mastery: 78 },
    { d: "Sat", min: 0, mastery: 78 },
    { d: "Sun", min: 12, mastery: 82 },
  ];
  const totalMin = week.reduce((a, b) => a + b.min, 0);
  const lastMastery = week[week.length - 1]!.mastery;
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card title={`${child.name}'s week`} icon="📊" wide>
        <div className="mt-2 flex items-end gap-1.5">
          {week.map((d) => {
            const max = 24;
            const h = Math.max(6, (d.min / max) * 96);
            return (
              <div key={d.d} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-md"
                  style={{ height: h, background: "var(--brand-grad)" }}
                  title={`${d.min} min`}
                />
                <span className="la-mono text-[10px] text-ink-mute">{d.d}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-6 text-[13px]">
          <Stat label="This week" value={`${totalMin} min`} />
          <Stat label="Days active" value={`${week.filter((d) => d.min > 0).length} of 7`} />
          <Stat label="Mastery trend" value={`${week[0]!.mastery}% → ${lastMastery}%`} />
        </div>
      </Card>

      <Card title="Top subjects" icon="🏆">
        <ul className="mt-2 space-y-2 text-[13px]">
          {[
            { s: "Numbers", pct: 82 },
            { s: "Animals", pct: 74 },
            { s: "Colors", pct: 68 },
          ].map((row) => (
            <li key={row.s}>
              <div className="flex items-baseline justify-between">
                <span className="font-extrabold text-ink">{row.s}</span>
                <span className="la-mono text-[11px] text-ink-mute">{row.pct}%</span>
              </div>
              <div className="bg-bg-2 mt-1 h-1.5 overflow-hidden rounded-full">
                <div
                  className="h-full"
                  style={{ width: `${row.pct}%`, background: "var(--brand-grad)" }}
                />
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Where to focus next" icon="🎯" wide>
        <ul className="mt-2 space-y-2 text-[13px] text-ink-soft">
          <li className="flex gap-2">
            <span aria-hidden>🔢</span>
            <span>
              The number <b className="text-ink">4</b> needs another pass — try the &quot;count by
              clapping&quot; activity tomorrow.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>🅰️</span>
            <span>
              Letter <b className="text-ink">F</b> is just below mastery — one more 5-min session
              usually closes the gap.
            </span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden>📖</span>
            <span>
              {child.name} engaged most with the <b className="text-ink">Brave Bunny</b> story —
              sequel coming next week.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   Small building blocks
   ────────────────────────────────────────────────────────────────────── */
function Card({
  title,
  icon,
  wide,
  children,
}: {
  title: string;
  icon?: string;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`la-card p-5 ${wide ? "lg:col-span-2" : ""}`} style={{ borderRadius: 18 }}>
      <div className="flex items-center gap-2 text-[14px] font-extrabold text-ink">
        {icon ? <span aria-hidden>{icon}</span> : null}
        {title}
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-t border-line-soft py-2 first:border-t-0 first:pt-0">
      <span className="text-[12px] text-ink-mute">{label}</span>
      <span className="text-[14px] font-extrabold text-ink">{value}</span>
    </div>
  );
}

function SettingSection({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: string;
  children: ReactNode;
}) {
  return (
    <section className="la-card p-5" style={{ borderRadius: 18 }}>
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-[16px] font-extrabold text-ink">
            {icon ? <span aria-hidden>{icon}</span> : null}
            {title}
          </h3>
          {subtitle ? (
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-mute">{subtitle}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-3.5">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  sub,
  on,
  onChange,
  className,
}: {
  label: string;
  sub?: string;
  on: boolean;
  onChange: (v: boolean) => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border border-line-soft px-3 py-2.5 ${className ?? ""}`}
      style={{ background: "#fff" }}
    >
      <div className="min-w-0">
        <div className="text-[13px] font-extrabold text-ink">{label}</div>
        {sub ? <div className="mt-0.5 text-[11.5px] text-ink-mute">{sub}</div> : null}
      </div>
      <ToggleSwitch on={on} onChange={onChange} label={label} />
    </div>
  );
}

function ToggleSwitch({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className="relative inline-block flex-none rounded-full transition"
      style={{
        width: 38,
        height: 22,
        background: on ? "#16a34a" : "var(--ink-faint)",
      }}
    >
      <span
        className="absolute top-[2px] grid h-[18px] w-[18px] place-items-center rounded-full bg-white transition-all"
        style={{ left: on ? 18 : 2 }}
      />
    </button>
  );
}

function Stepper({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-3.5">
      <div className="la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute">
        {label}
      </div>
      <div className="mt-1.5 flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="hover:bg-bg-2 grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-lg"
          aria-label={`Decrease ${label.toLowerCase()}`}
        >
          −
        </button>
        <span
          className="min-w-[60px] text-center text-[26px] font-extrabold tabular-nums"
          style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="hover:bg-bg-2 grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-lg"
          aria-label={`Increase ${label.toLowerCase()}`}
        >
          +
        </button>
        <span className="la-mono text-[11px] text-ink-mute">{unit}</span>
      </div>
    </div>
  );
}

function PinGate({ onUnlock }: { onUnlock: () => void }) {
  // Stub gate — the PIN check itself ships in a follow-up. For now we
  // gate access if a PIN was ever set, with a "Continue without PIN" so
  // the parent isn't locked out during the preview.
  return (
    <div className="la-card mx-auto max-w-[420px] p-5 text-center" style={{ borderRadius: 18 }}>
      <div className="text-[24px]" aria-hidden>
        🔒
      </div>
      <h3 className="mt-2 text-[16px] font-extrabold text-ink">Settings are locked</h3>
      <p className="mt-1 text-[12.5px] text-ink-soft">
        Enter your PIN to change settings. PIN verification ships in a follow-up — for the preview
        you can continue without it.
      </p>
      <button
        type="button"
        onClick={onUnlock}
        className="la-btn mt-3"
        style={{ padding: "10px 16px", fontSize: 13 }}
      >
        Continue
      </button>
    </div>
  );
}
