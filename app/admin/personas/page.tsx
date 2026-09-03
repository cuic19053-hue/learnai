import type { Metadata } from "next";
import { Chip, Crumbs, PageHeader } from "@/components/admin/shared";

export const metadata: Metadata = { title: "Admin · Personas" };

type Teacher = {
  id: string;
  name: string;
  ic: string;
  tag: string;
  style: string;
  tone: string;
  voice: string;
  stages: string;
  model: string;
  status: "enabled" | "draft";
  universal?: boolean;
  focus: string;
  color?: string;
  current?: boolean;
};

const TEACHERS: Teacher[] = [
  {
    id: "nova",
    name: "Nova",
    ic: "🦉",
    tag: "Patient & curious",
    style: 'Loves to ask "what if?". Great for projects.',
    tone: "Warm · Inquisitive",
    voice: "Soft, slow",
    stages: "all",
    model: "qwen2.5:7b",
    status: "enabled",
    universal: true,
    focus: "Universal",
  },
  {
    id: "rex",
    name: "Rex",
    ic: "🦊",
    tag: "Quick & playful",
    style: "Energetic and game-loving. Best for streaks.",
    tone: "Fast · Encouraging",
    voice: "Bright, punchy",
    stages: "all",
    model: "qwen2.5:7b",
    status: "enabled",
    universal: true,
    focus: "Universal",
  },
  {
    id: "sage",
    name: "Sage",
    ic: "🐢",
    tag: "Calm & methodical",
    style: "Walks step by step. Great for big ideas.",
    tone: "Calm · Structured",
    voice: "Steady, measured",
    stages: "all",
    model: "qwen2.5:14b",
    status: "enabled",
    universal: true,
    focus: "Universal",
  },
  {
    id: "pixel",
    name: "Pixel",
    ic: "🤖",
    tag: "Project-focused",
    style: "Builds real things with you. Loves shipping.",
    tone: "Direct · Pragmatic",
    voice: "Crisp, clear",
    stages: "all",
    model: "qwen2.5:14b",
    status: "enabled",
    universal: true,
    focus: "Universal",
  },
  {
    id: "milo",
    name: "Milo the Owl",
    ic: "🦉",
    tag: "Playful storyteller",
    style: "Playful stories, counting, and gentle voice.",
    tone: "Warm · Slow",
    voice: "Gentle, sing-song",
    stages: "LITTLE",
    model: "qwen2.5:7b",
    status: "enabled",
    focus: "Ages 3–6",
    color: "#ec4899",
    current: true,
  },
  {
    id: "luna",
    name: "Luna",
    ic: "📚",
    tag: "Reading & imagination",
    style: "Reading, imagination, and curiosity quests.",
    tone: "Bright · Curious",
    voice: "Lively",
    stages: "GRADE_7",
    model: "qwen2.5:7b",
    status: "enabled",
    focus: "Ages 7–11",
    color: "#4338ca",
  },
  {
    id: "ada-jr",
    name: "Ada Jr.",
    ic: "🛠️",
    tag: "Coding missions",
    style: "Coding missions, logic, and project hints.",
    tone: "Direct · Hands-on",
    voice: "Crisp",
    stages: "GRADE_8",
    model: "qwen2.5:14b",
    status: "enabled",
    focus: "Ages 12–15",
    color: "#7c3aed",
  },
  {
    id: "mentor-max",
    name: "Mentor Max",
    ic: "🎓",
    tag: "Exam coach",
    style: "Exam prep, weak-area focus, teach-until-learned.",
    tone: "Focused · Patient",
    voice: "Steady",
    stages: "GRADE_9",
    model: "grok-4-fast",
    status: "enabled",
    focus: "Ages 16–18",
    color: "#c2410c",
  },
  {
    id: "professor-turing",
    name: "Professor Turing",
    ic: "💼",
    tag: "CS & certification",
    style: "CS, AI, cloud, and certification tracks.",
    tone: "Precise · Rigorous",
    voice: "Authoritative",
    stages: "UNI · PRO",
    model: "gpt-4o",
    status: "enabled",
    focus: "Ages 18+",
    color: "#0f766e",
  },
  {
    id: "sofia",
    name: "Sofia",
    ic: "🌿",
    tag: "Patient digital helper",
    style: "Patient, slow, voice-first digital literacy.",
    tone: "Calm · Reassuring",
    voice: "Slow, warm",
    stages: "SENIOR",
    model: "qwen2.5:7b",
    status: "enabled",
    focus: "Senior",
    color: "#16a34a",
  },
  {
    id: "forge",
    name: "Forge",
    ic: "🔨",
    tag: "Project lead",
    style: '"Ship it. Polish later." Hackathon energy.',
    tone: "Direct · Forceful",
    voice: "Crisp",
    stages: "GRADE_8",
    model: "qwen2.5:14b",
    status: "draft",
    focus: "Ages 12–15",
    color: "#7c3aed",
  },
];

export default function AdminPersonas() {
  const universals = TEACHERS.filter((t) => t.universal);
  const specialists = TEACHERS.filter((t) => !t.universal);
  const current = TEACHERS.find((t) => t.current) ?? TEACHERS[0]!;

  return (
    <>
      <Crumbs trail={["Admin", "Personas"]} />
      <div className="px-5 py-7 md:px-9">
        <PageHeader
          eyebrow={
            <span
              className="la-pill text-[11px]"
              style={{ background: "#fff", boxShadow: "0 0 0 1px var(--line)" }}
            >
              🎭 {TEACHERS.length} personas · .hpersona format · schema{" "}
              <code className="la-mono">learnai.persona.v1</code>
            </span>
          }
          title="Personas"
          subtitle="AI tutor personalities. Universals are offered everywhere; Specialists target one stage. Each persona binds a system prompt, tools, voice, and avatar — all editable."
          right={
            <>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                📥 Import .hpersona
              </button>
              <button
                type="button"
                className="la-btn ghost"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                🌐 Browse community packs
              </button>
              <button
                type="button"
                className="la-btn"
                style={{ padding: "9px 14px", fontSize: 13 }}
              >
                + New persona
              </button>
            </>
          }
        />

        <div className="mt-5 flex flex-wrap gap-2">
          <Chip on>All · {TEACHERS.length}</Chip>
          <Chip>🌐 Universal · {universals.length}</Chip>
          <Chip>🦁 Little · 1</Chip>
          <Chip>🚀 GRADE_7 · 1</Chip>
          <Chip>🛠️ GRADE_8 · 2</Chip>
          <Chip>🎓 GRADE_9 · 1</Chip>
          <Chip>💼 Pro · 1</Chip>
          <Chip>🌿 Senior · 1</Chip>
          <span
            aria-hidden
            style={{ width: 1, height: 20, background: "var(--line)", margin: "0 4px" }}
          />
          <Chip>📦 With tools</Chip>
          <Chip>✏️ Drafts · {TEACHERS.filter((t) => t.status === "draft").length}</Chip>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <SectionLabel>UNIVERSAL · OFFERED TO EVERY LEARNER</SectionLabel>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {universals.map((t) => (
                <PersonaCard key={t.id} t={t} />
              ))}
            </div>

            <SectionLabel className="mt-5">SPECIALISTS · ONE STAGE EACH</SectionLabel>
            <div className="mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {specialists.map((t) => (
                <PersonaCard key={t.id} t={t} />
              ))}
            </div>
          </div>

          <PersonaEditor t={current} />
        </div>
      </div>
    </>
  );
}

function PersonaCard({ t }: { t: Teacher }) {
  return (
    <div
      className="la-card p-3.5"
      style={{
        borderRadius: 16,
        border: t.current
          ? `1.5px solid ${t.color ?? "var(--brand-1)"}`
          : "1px solid var(--line-soft)",
        boxShadow: t.current ? "0 0 0 3px rgba(46,91,255,.08)" : "var(--shadow-1)",
        opacity: t.status === "draft" ? 0.78 : 1,
      }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="grid h-11 w-11 flex-none place-items-center rounded-xl text-[22px]"
          style={{ background: t.color ? `${t.color}22` : "var(--bg-2)" }}
          aria-hidden
        >
          {t.ic}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="text-[14px] font-extrabold text-ink">{t.name}</div>
            {t.current ? (
              <span
                className="la-pill text-[9px] font-extrabold"
                style={{ background: "var(--brand-grad)", color: "#fff", padding: "2px 6px" }}
              >
                EDITING
              </span>
            ) : null}
            {t.status === "draft" ? (
              <span
                className="la-pill text-[9px] font-extrabold"
                style={{ background: "#fef3c7", color: "#b45309", padding: "2px 6px" }}
              >
                DRAFT
              </span>
            ) : null}
          </div>
          <div className="la-mono text-[10px] text-ink-mute">
            {t.id}.hpersona · {t.focus}
          </div>
        </div>
      </div>
      <p className="mt-2 text-[12px] leading-snug text-ink-soft">{t.style}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        <span className="la-pill text-[9px]">{t.tone}</span>
        <span className="la-pill text-[9px]">🔊 {t.voice}</span>
        <span className="la-pill text-[9px]" style={{ background: "var(--bg-2)" }}>
          {t.model}
        </span>
      </div>
    </div>
  );
}

function PersonaEditor({ t }: { t: Teacher }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="la-card p-5" style={{ borderRadius: 18 }}>
        <div className="flex items-center gap-3">
          <div
            className="grid h-14 w-14 flex-none place-items-center rounded-2xl text-[28px]"
            style={{ background: t.color ? `${t.color}22` : "var(--bg-2)" }}
            aria-hidden
          >
            {t.ic}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[18px] font-extrabold text-ink">{t.name}</h3>
              <span
                className="la-pill text-[10px] font-extrabold"
                style={{ background: "#dcfce7", color: "#16a34a" }}
              >
                enabled
              </span>
            </div>
            <div className="la-mono mt-0.5 text-[11px] text-ink-mute">
              examples/{t.id}.hpersona · v3 · last edit 2 days ago
            </div>
          </div>
          <button
            type="button"
            className="hover:bg-bg-2 grid h-9 w-9 place-items-center rounded-md text-ink-mute"
            aria-label="More"
          >
            ⋯
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <PStat label="Sessions today" v="412" />
          <PStat label="Loop completion" v="74%" color="#16a34a" />
          <PStat label="Avg satisfaction" v="★ 9.1" color="#16a34a" />
        </div>
      </div>

      <div className="la-card p-5" style={{ borderRadius: 18 }}>
        <div className="flex items-center justify-between">
          <h4 className="text-[14px] font-extrabold text-ink">System prompt</h4>
          <button
            type="button"
            className="la-btn ghost"
            style={{ padding: "5px 10px", fontSize: 11 }}
          >
            Edit
          </button>
        </div>
        <pre
          className="la-mono mt-2 max-h-[160px] overflow-auto rounded-xl p-3 text-[11.5px] leading-relaxed"
          style={{ background: "var(--ink)", color: "#e4e7f5" }}
        >
          {`# Identity
You are "${t.name}" — ${t.style}

# Style
${t.tone}. Voice: ${t.voice}. Loop step-by-step.

# Safety
Refuse anything outside the allowed subjects for ${t.focus}.
Redirect to a parent if asked about adult topics.`}
        </pre>
      </div>

      <div className="la-card p-5" style={{ borderRadius: 18 }}>
        <h4 className="text-[14px] font-extrabold text-ink">Tools enabled</h4>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <ToolRow ic="🎤" name="voice.output" on />
          <ToolRow ic="👂" name="voice.input" on />
          <ToolRow ic="📷" name="image.show" on />
          <ToolRow ic="🎨" name="canvas.draw" on />
          <ToolRow ic="🔢" name="counting.exercise" on />
          <ToolRow ic="🎵" name="audio.sound-fx" on />
          <ToolRow ic="🌐" name="web.search" />
          <ToolRow ic="⚙" name="code.exec" />
        </div>
      </div>

      <div className="la-card p-5" style={{ borderRadius: 18 }}>
        <h4 className="text-[14px] font-extrabold text-ink">Bindings</h4>
        <div className="mt-2 divide-y divide-line-soft">
          <Binding label="Model" value={t.model} sub="via OllaBridge · fast · cheap" />
          <Binding
            label="Voice"
            value="OpenAI · alloy · rate 0.9 · pitch 1.15"
            sub="gentle, sing-song"
          />
          <Binding
            label="Avatar"
            value={`${t.id}_v3.glb · viseme lip-sync`}
            sub="3D Avatar · enabled"
          />
          <Binding label="World" value={`${t.focus}`} sub="default tutor on first run" />
        </div>
      </div>

      <div className="la-card p-5" style={{ borderRadius: 18 }}>
        <h4 className="text-[14px] font-extrabold text-ink">Loop · method plan</h4>
        <div className="mt-2 flex flex-col gap-1.5">
          {[
            ["Hook", "Active recall · prior numbers"],
            ["Explain", "Worked example with characters"],
            ["Practice", "Kumon mastery ladder"],
            ["Feedback", "Voice + visual cheer"],
            ["Reflect", "One emoji + retell"],
            ["Evolve", "Sticker reward · parent ping"],
          ].map(([step, m]) => (
            <div
              key={step}
              className="grid items-center gap-3 py-0.5"
              style={{ gridTemplateColumns: "80px 1fr" }}
            >
              <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
                {step}
              </span>
              <span className="text-[12px] font-semibold text-ink">{m}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          className="la-btn ghost flex-1"
          style={{ padding: "10px 12px", fontSize: 13 }}
        >
          ▶ Test conversation
        </button>
        <button
          type="button"
          className="la-btn ghost flex-1"
          style={{ padding: "10px 12px", fontSize: 13 }}
        >
          Duplicate as draft
        </button>
      </div>
    </div>
  );
}

function PStat({ label, v, color }: { label: string; v: string; color?: string }) {
  return (
    <div className="rounded-lg p-2.5" style={{ background: "var(--surface-soft)" }}>
      <div className="la-mono text-[9px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
        {label}
      </div>
      <div
        className="la-mono mt-0.5 text-[16px] font-extrabold"
        style={{ color: color ?? "var(--ink)" }}
      >
        {v}
      </div>
    </div>
  );
}

function ToolRow({ ic, name, on }: { ic: string; name: string; on?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 rounded-md px-2.5 py-1.5"
      style={{
        background: on ? "#dcfce7" : "var(--surface-soft)",
        opacity: on ? 1 : 0.5,
      }}
    >
      <span aria-hidden className="text-[13px]">
        {ic}
      </span>
      <span
        className="la-mono flex-1 text-[11px] font-semibold"
        style={{ color: on ? "#166534" : "var(--ink-mute)" }}
      >
        {name}
      </span>
      {on ? (
        <span aria-hidden className="text-[11px] font-extrabold" style={{ color: "#16a34a" }}>
          ✓
        </span>
      ) : null}
    </div>
  );
}

function Binding({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="grid gap-3 py-2" style={{ gridTemplateColumns: "60px 1fr" }}>
      <span className="la-mono text-[10px] font-extrabold uppercase tracking-[0.06em] text-ink-mute">
        {label}
      </span>
      <div>
        <div className="la-mono text-[12px] font-extrabold text-ink">{value}</div>
        <div className="la-mono text-[10px] text-ink-mute">{sub}</div>
      </div>
    </div>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`la-mono text-[11px] font-extrabold uppercase tracking-[0.08em] text-ink-mute ${className ?? ""}`}
    >
      {children}
    </div>
  );
}
