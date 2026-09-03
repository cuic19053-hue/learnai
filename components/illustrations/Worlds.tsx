/**
 * Brand SVG illustrations for the four Worlds cards on the homepage.
 *
 * Authored in-house. Original work — CC0. No third-party assets.
 * Each illustration:
 *   • Uses the journey token colours directly (mirrored from globals.css)
 *   • Carries a <title> for screen readers; everything else is aria-hidden
 *   • Has a viewBox of 320×140 so the parent can size freely
 *   • Renders without any external network request
 */

type Props = {
  className?: string;
  /** Override the accessible title; defaults to a sensible per-world label. */
  title?: string;
};

const BASE_CLASS = "block h-full w-full";

/* ────────────────────────────────────────────────────────────────────── */
/*  Playful World — Little Learner (pink + amber)                         */
/* ────────────────────────────────────────────────────────────────────── */

export function PlayfulWorld({
  className = "",
  title = "Playful World — bright stars and a happy sun",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 140"
      role="img"
      aria-labelledby="illu-playful-title"
      className={`${BASE_CLASS} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-playful-title">{title}</title>
      <defs>
        <linearGradient id="playful-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fce0ec" />
          <stop offset="100%" stopColor="#fff1d6" />
        </linearGradient>
        <radialGradient id="playful-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe27a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </radialGradient>
      </defs>

      <rect width="320" height="140" fill="url(#playful-bg)" />

      {/* Sun */}
      <circle cx="240" cy="48" r="30" fill="url(#playful-sun)" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="240"
          y1="48"
          x2={240 + 42 * Math.cos((deg * Math.PI) / 180)}
          y2={48 + 42 * Math.sin((deg * Math.PI) / 180)}
          stroke="#f59e0b"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.7"
        />
      ))}

      {/* Stars */}
      {[
        [56, 36, 6],
        [104, 24, 5],
        [156, 48, 7],
        [76, 72, 4],
        [128, 88, 5],
      ].map(([cx, cy, r], i) => (
        <g key={i} transform={`translate(${cx} ${cy})`} fill="#ec4899">
          <polygon
            points={`0,-${r} ${r * 0.3},-${r * 0.3} ${r},0 ${r * 0.3},${r * 0.3} 0,${r} -${r * 0.3},${r * 0.3} -${r},0 -${r * 0.3},-${r * 0.3}`}
          />
        </g>
      ))}

      {/* Soft hill */}
      <path
        d="M0 120 Q 80 100 160 115 T 320 110 L 320 140 L 0 140 Z"
        fill="#fbcfe8"
        opacity="0.7"
      />
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Mission World — GRADE_8 (violet + blue)                                */
/* ────────────────────────────────────────────────────────────────────── */

export function MissionWorld({
  className = "",
  title = "Mission World — a rocket arcing across geometric peaks",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 140"
      role="img"
      aria-labelledby="illu-mission-title"
      className={`${BASE_CLASS} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-mission-title">{title}</title>
      <defs>
        <linearGradient id="mission-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#efe7ff" />
          <stop offset="100%" stopColor="#e6ecff" />
        </linearGradient>
        <linearGradient id="mission-trail" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0" />
          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.6" />
        </linearGradient>
      </defs>

      <rect width="320" height="140" fill="url(#mission-bg)" />

      {/* Mountains */}
      <polygon
        points="0,140 60,80 100,110 150,60 200,100 260,70 320,110 320,140"
        fill="#c4b5fd"
        opacity="0.85"
      />
      <polygon
        points="0,140 40,100 100,130 160,90 220,120 280,95 320,125 320,140"
        fill="#a78bfa"
        opacity="0.5"
      />

      {/* Rocket trail (arc) */}
      <path
        d="M40 110 Q 160 -20 280 50"
        fill="none"
        stroke="url(#mission-trail)"
        strokeWidth="3"
        strokeDasharray="2 4"
        strokeLinecap="round"
      />

      {/* Rocket */}
      <g transform="translate(258 56) rotate(40)">
        <path d="M0 -14 L 6 4 L 0 8 L -6 4 Z" fill="#2e5bff" />
        <circle cx="0" cy="-4" r="2.5" fill="#fff" />
        <path d="M-6 4 L -10 10 L -2 6 Z" fill="#7c3aed" />
        <path d="M6 4 L 10 10 L 2 6 Z" fill="#7c3aed" />
      </g>

      {/* Tiny stars */}
      {[
        [60, 30],
        [110, 18],
        [220, 22],
        [280, 30],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#7c3aed" />
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Career World — Professional (teal + blue)                              */
/* ────────────────────────────────────────────────────────────────────── */

export function CareerWorld({
  className = "",
  title = "Career World — rising chart over a city skyline",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 140"
      role="img"
      aria-labelledby="illu-career-title"
      className={`${BASE_CLASS} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-career-title">{title}</title>
      <defs>
        <linearGradient id="career-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d6f1f0" />
          <stop offset="100%" stopColor="#e6ecff" />
        </linearGradient>
      </defs>

      <rect width="320" height="140" fill="url(#career-bg)" />

      {/* Skyline buildings */}
      {[
        [40, 100, 32, 40],
        [78, 80, 28, 60],
        [110, 70, 36, 70],
        [150, 90, 28, 50],
        [184, 65, 40, 75],
        [228, 85, 30, 55],
        [262, 75, 36, 65],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} fill="#0ea5a4" opacity={i % 2 ? 0.55 : 0.7} />
          {/* tiny windows */}
          {Array.from({ length: Math.floor((h as number) / 12) }).map((_, r) =>
            Array.from({ length: Math.max(1, Math.floor((w as number) / 10)) }).map((_, c) => (
              <rect
                key={`${r}-${c}`}
                x={(x as number) + 4 + c * 10}
                y={(y as number) + 4 + r * 12}
                width="3"
                height="4"
                fill="#fff"
                opacity="0.7"
              />
            ))
          )}
        </g>
      ))}

      {/* Chart trend line */}
      <polyline
        points="20,110 60,90 110,75 160,55 210,45 260,30 300,18"
        fill="none"
        stroke="#2e5bff"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon points="294,18 306,18 300,8" fill="#2e5bff" />

      {/* Data points */}
      {[
        [60, 90],
        [110, 75],
        [160, 55],
        [210, 45],
        [260, 30],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill="#fff" stroke="#2e5bff" strokeWidth="2" />
      ))}
    </svg>
  );
}

/* ────────────────────────────────────────────────────────────────────── */
/*  Calm World — Senior Learner (green)                                    */
/* ────────────────────────────────────────────────────────────────────── */

export function CalmWorld({
  className = "",
  title = "Calm World — gentle waves and a leaf at sunrise",
}: Props) {
  return (
    <svg
      viewBox="0 0 320 140"
      role="img"
      aria-labelledby="illu-calm-title"
      className={`${BASE_CLASS} ${className}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <title id="illu-calm-title">{title}</title>
      <defs>
        <linearGradient id="calm-bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e7f8ee" />
          <stop offset="100%" stopColor="#f3fbf5" />
        </linearGradient>
        <radialGradient id="calm-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.7" />
        </radialGradient>
      </defs>

      <rect width="320" height="140" fill="url(#calm-bg)" />

      {/* Soft sun */}
      <circle cx="240" cy="46" r="22" fill="url(#calm-sun)" />

      {/* Three calm waves */}
      <path
        d="M0 78 Q 80 64 160 78 T 320 78"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M0 98 Q 80 84 160 98 T 320 98"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.7"
      />
      <path
        d="M0 118 Q 80 104 160 118 T 320 118"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Leaf */}
      <g transform="translate(72 58) rotate(-25)">
        <path d="M0 0 Q 16 -22 36 0 Q 16 22 0 0 Z" fill="#22c55e" opacity="0.85" />
        <path d="M0 0 Q 18 -2 36 0" fill="none" stroke="#15803d" strokeWidth="1.3" />
        <line
          x1="0"
          y1="0"
          x2="-8"
          y2="6"
          stroke="#15803d"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
