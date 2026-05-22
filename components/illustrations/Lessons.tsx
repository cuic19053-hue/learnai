/**
 * Lesson-content illustrations. Authored in-house, CC0.
 */

type Props = { className?: string; title?: string };

const BASE = "block h-full w-full";

/* ────────────────────────────────────────────────────────────────────── */
/*  Volcano cross-section — used as the hero card preview                  */
/* ────────────────────────────────────────────────────────────────────── */

export function VolcanoCrossSection({
  className = "",
  title = "Cross-section of a volcano showing the magma chamber, vent, and ash cloud",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 160"
      role="img"
      aria-labelledby="illu-volcano-title"
      className={`${BASE} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-volcano-title">{title}</title>
      <defs>
        <linearGradient id="vol-sky" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fef9e7" />
          <stop offset="100%" stopColor="#fde2c8" />
        </linearGradient>
        <linearGradient id="vol-rock" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#92400e" />
          <stop offset="100%" stopColor="#451a03" />
        </linearGradient>
        <radialGradient id="vol-magma" cx="50%" cy="60%" r="60%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#dc2626" />
        </radialGradient>
        <radialGradient id="vol-ash" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6b7280" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#374151" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect width="320" height="160" fill="url(#vol-sky)" />

      {/* Ash cloud */}
      <g>
        <ellipse cx="160" cy="32" rx="56" ry="20" fill="url(#vol-ash)" />
        <circle cx="120" cy="32" r="14" fill="url(#vol-ash)" />
        <circle cx="200" cy="28" r="18" fill="url(#vol-ash)" />
        <circle cx="170" cy="20" r="12" fill="url(#vol-ash)" />
      </g>

      {/* Mountain silhouette */}
      <polygon points="60,160 160,40 260,160" fill="url(#vol-rock)" />

      {/* Vent + erupting plume */}
      <polygon points="152,40 168,40 175,70 145,70" fill="#7c2d12" />
      <path d="M150 40 Q 160 18 170 40" fill="#f59e0b" opacity="0.8" />

      {/* Magma chamber */}
      <ellipse cx="160" cy="130" rx="42" ry="16" fill="url(#vol-magma)" />

      {/* Channel from chamber to vent */}
      <path
        d="M148 130 Q 156 100 152 70 L 168 70 Q 164 100 172 130 Z"
        fill="#dc2626"
        opacity="0.85"
      />

      {/* Lava flowing down the side */}
      <path
        d="M170 70 Q 200 100 230 130 L 240 140 L 220 145 L 210 138 Q 188 110 168 78 Z"
        fill="#f97316"
        opacity="0.9"
      />

      {/* Layered crust ground */}
      <rect y="146" width="320" height="14" fill="#78350f" />
      <line x1="0" y1="150" x2="320" y2="150" stroke="#451a03" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Three apples on a cream backdrop — counting prompt for Little Learner  */
/* ────────────────────────────────────────────────────────────────────── */

export function Apples({ className = "", title = "Three red apples on a wooden table" }: Props) {
  return (
    <svg
      viewBox="0 0 320 160"
      role="img"
      aria-labelledby="illu-apples-title"
      className={`${BASE} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-apples-title">{title}</title>
      <defs>
        <linearGradient id="apple-bg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff8e1" />
          <stop offset="100%" stopColor="#fde68a" />
        </linearGradient>
        <radialGradient id="apple-skin" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fb7185" />
          <stop offset="100%" stopColor="#b91c1c" />
        </radialGradient>
      </defs>
      <rect width="320" height="160" fill="url(#apple-bg)" />
      {/* Table line */}
      <rect y="130" width="320" height="30" fill="#92400e" opacity="0.85" />
      <line x1="0" y1="130" x2="320" y2="130" stroke="#451a03" strokeWidth="1" />
      {[
        [90, 90, 26],
        [160, 88, 30],
        [230, 92, 24],
      ].map(([cx, cy, r], i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={r} fill="url(#apple-skin)" />
          {/* Highlight */}
          <ellipse
            cx={(cx as number) - r * 0.35}
            cy={(cy as number) - r * 0.45}
            rx={r * 0.2}
            ry={r * 0.13}
            fill="#fff"
            opacity="0.6"
          />
          {/* Stem */}
          <rect
            x={(cx as number) - 1.5}
            y={(cy as number) - r - 4}
            width="3"
            height="6"
            rx="1.5"
            fill="#3f2611"
          />
          {/* Leaf */}
          <path
            d={`M ${(cx as number) + 1} ${(cy as number) - r - 2} q 8 -4 10 4 q -8 2 -10 -4 z`}
            fill="#15803d"
          />
        </g>
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Stylised Python code snippet for Builder                               */
/* ────────────────────────────────────────────────────────────────────── */

export function PythonSnippet({
  className = "",
  title = "Stylised Python function that handles divide-by-zero",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 160"
      role="img"
      aria-labelledby="illu-python-title"
      className={`${BASE} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-python-title">{title}</title>
      <defs>
        <linearGradient id="py-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f1430" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#py-bg)" />
      {/* Window chrome */}
      <circle cx="18" cy="16" r="4" fill="#ef4444" />
      <circle cx="32" cy="16" r="4" fill="#f59e0b" />
      <circle cx="46" cy="16" r="4" fill="#22c55e" />
      {/* Editor-style code blocks (abstract — colour bars not real text) */}
      {(
        [
          {
            y: 42,
            blocks: [
              { x: 16, w: 56, c: "#a78bfa" },
              { x: 76, w: 36, c: "#34d399" },
            ],
          },
          {
            y: 60,
            blocks: [
              { x: 28, w: 40, c: "#fde047" },
              { x: 72, w: 80, c: "#f9a8d4" },
            ],
          },
          { y: 78, blocks: [{ x: 28, w: 80, c: "#94a3b8" }] },
          {
            y: 96,
            blocks: [
              { x: 28, w: 40, c: "#fde047" },
              { x: 72, w: 50, c: "#f9a8d4" },
              { x: 126, w: 60, c: "#94a3b8" },
            ],
          },
          { y: 114, blocks: [{ x: 40, w: 120, c: "#34d399" }] },
          { y: 132, blocks: [{ x: 28, w: 56, c: "#a78bfa" }] },
        ] as const
      ).map((row, i) => (
        <g key={i}>
          {row.blocks.map((b, j) => (
            <rect
              key={j}
              x={b.x}
              y={row.y}
              width={b.w}
              height="6"
              rx="2"
              fill={b.c}
              opacity="0.85"
            />
          ))}
        </g>
      ))}
      {/* Cursor */}
      <rect x="166" y="96" width="2" height="8" fill="#fff">
        <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
      </rect>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  30-60-90 right triangle for Scholar trigonometry                       */
/* ────────────────────────────────────────────────────────────────────── */

export function TrigAngle({
  className = "",
  title = "A right triangle with a thirty-degree angle highlighted",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 160"
      role="img"
      aria-labelledby="illu-trig-title"
      className={`${BASE} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-trig-title">{title}</title>
      <defs>
        <linearGradient id="trig-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fff8e1" />
          <stop offset="100%" stopColor="#fef3c7" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#trig-bg)" />
      {/* Triangle: right angle at lower-left, 30° at right vertex, hypotenuse */}
      <polygon
        points="60,130 260,130 60,40"
        fill="#f59e0b"
        opacity="0.18"
        stroke="#b45309"
        strokeWidth="2"
      />
      {/* Right-angle square */}
      <polygon points="60,118 72,118 72,130" fill="none" stroke="#b45309" strokeWidth="1.5" />
      {/* 30° arc near right vertex */}
      <path d="M 230 130 A 30 30 0 0 0 248 116" fill="none" stroke="#dc2626" strokeWidth="2" />
      {/* Side labels */}
      <text
        x="160"
        y="148"
        textAnchor="middle"
        fontSize="13"
        fontFamily="ui-monospace, monospace"
        fill="#451a03"
      >
        b
      </text>
      <text
        x="40"
        y="86"
        textAnchor="middle"
        fontSize="13"
        fontFamily="ui-monospace, monospace"
        fill="#451a03"
      >
        a
      </text>
      <text
        x="170"
        y="78"
        textAnchor="middle"
        fontSize="13"
        fontFamily="ui-monospace, monospace"
        fill="#451a03"
      >
        c
      </text>
      <text x="220" y="124" fontSize="13" fontFamily="ui-monospace, monospace" fill="#dc2626">
        30°
      </text>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Phishing email mock-up for Senior Learner                              */
/* ────────────────────────────────────────────────────────────────────── */

export function ScamEmail({
  className = "",
  title = "A suspicious-looking email message with a red warning flag",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 160"
      role="img"
      aria-labelledby="illu-scam-title"
      className={`${BASE} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-scam-title">{title}</title>
      <defs>
        <linearGradient id="scam-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fce7f3" />
          <stop offset="100%" stopColor="#fbcfe8" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#scam-bg)" />
      {/* Email card */}
      <rect
        x="44"
        y="24"
        width="232"
        height="112"
        rx="14"
        fill="#fff"
        stroke="#e6e8f5"
        strokeWidth="1.5"
      />
      {/* Avatar + sender */}
      <circle cx="64" cy="48" r="10" fill="#dde3f0" />
      <text x="64" y="52" textAnchor="middle" fontSize="11" fill="#6b7280">
        ✉
      </text>
      {/* Sender name + suspicious domain bars */}
      <rect x="84" y="40" width="100" height="6" rx="2" fill="#0f1430" opacity="0.85" />
      <rect x="84" y="50" width="140" height="4" rx="2" fill="#6b7280" opacity="0.7" />
      {/* Subject + body bars */}
      <rect x="58" y="72" width="200" height="6" rx="2" fill="#0f1430" opacity="0.85" />
      <rect x="58" y="86" width="200" height="4" rx="2" fill="#94a3b8" />
      <rect x="58" y="96" width="170" height="4" rx="2" fill="#94a3b8" />
      <rect x="58" y="106" width="120" height="4" rx="2" fill="#2e5bff" opacity="0.85" />
      {/* Urgency banner */}
      <rect x="58" y="118" width="78" height="12" rx="3" fill="#dc2626" opacity="0.9" />
      <text x="62" y="127" fontSize="9" fill="#fff" fontWeight="700">
        URGENT
      </text>
      {/* Red flag */}
      <g transform="translate(258 32)">
        <rect x="0" y="0" width="2" height="22" fill="#7c2d12" />
        <polygon points="2,0 18,4 2,8" fill="#dc2626" />
      </g>
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Generic empty state — used as a graceful default everywhere            */
/* ────────────────────────────────────────────────────────────────────── */

export function EmptyState({ className = "", title = "Friendly placeholder illustration" }: Props) {
  return (
    <svg
      viewBox="0 0 320 160"
      role="img"
      aria-labelledby="illu-empty-title"
      className={`${BASE} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-empty-title">{title}</title>
      <defs>
        <linearGradient id="empty-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e8eeff" />
          <stop offset="100%" stopColor="#f0e9ff" />
        </linearGradient>
        <linearGradient id="empty-shape" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2e5bff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <rect width="320" height="160" fill="url(#empty-bg)" />
      <circle
        cx="160"
        cy="80"
        r="44"
        fill="none"
        stroke="url(#empty-shape)"
        strokeWidth="2.5"
        strokeDasharray="4 6"
      />
      <circle cx="160" cy="80" r="14" fill="url(#empty-shape)" opacity="0.4" />
      <circle cx="160" cy="80" r="6" fill="#fff" />
    </svg>
  );
}
