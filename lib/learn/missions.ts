/**
 * Mission catalog — replaces the previous `SAMPLE` hard-coded list in
 * `app/learn/missions/page.tsx` and makes "Resume" world-aware.
 *
 * Each mission carries a `practice` payload (drop targets, draggable
 * tokens, hint ladder, opening feedback). The lesson route reads the
 * `?mission=` query, looks up the mission here, and hands the practice
 * payload to LessonPlayer — which used to render the volcano practice
 * for every world.
 *
 * Worlds without explicit practice payloads (kids, senior — they have
 * their own lesson surfaces) fall back to LessonPlayer's default
 * volcano payload so existing demos keep working.
 */

export type MissionStatus = "active" | "completed" | "locked";

export type MissionPracticePayload = {
  /** Headline rendered above the diagram, e.g. "Drag each label to …". */
  prompt: string;
  /** Subject pill text (rendered next to journey name in the header). */
  subject: string;
  /** Diagram label used by the ImgSlot. */
  diagramLabel: string;
  /** Linear gradient applied to the diagram backdrop. */
  diagramGradient: string;
  /** Target slots on the diagram. */
  targets: Array<{
    id: string;
    label: string;
    /** Percent strings, e.g. "18%". */
    x: string;
    y: string;
  }>;
  /** Draggable tokens that the learner places. */
  tokens: Array<{ id: string; label: string; emoji: string }>;
  /** Optional seed state — useful for the "already started" preview
   *  the design uses on Volcano (Vent placed). Keyed by target id. */
  initialPlaced?: Record<string, string | null>;
  /** First feedback bubble shown before the learner does anything. */
  initialFeedback?: string;
  /** Three-rung hint ladder. The first two come pre-revealed. */
  hintLadder: Array<{ emoji: string; text: string }>;
  /** Optional teacher override per mission. */
  teacherName?: string;
  teacherEmoji?: string;
};

export type Mission = {
  id: string;
  title: string;
  subject: string;
  status: MissionStatus;
  progressPct: number;
  /** Only set when the mission has bespoke practice content; missing
   *  means "fall back to the world's default practice". */
  practice?: MissionPracticePayload;
};

// ── Per-mission practice payloads ───────────────────────────────────

const FRACTIONS_PRACTICE: MissionPracticePayload = {
  prompt: "拖拽算式卡片到通分与化简的正确步骤",
  subject: "数学",
  diagramLabel: "🔢 沪教版六年级数学 - 分数通分与约分",
  diagramGradient: "linear-gradient(180deg, #f5f3ff 0%, #e0e7ff 60%, #c7d2fe 100%)",
  targets: [
    { id: "lcm", label: "1 · 寻找分母 4 与 6 的最小公倍数", x: "20%", y: "30%" },
    { id: "common", label: "2 · 分子分母同乘使分母化为 12", x: "50%", y: "55%" },
    { id: "result", label: "3 · 分子相加并化简为最简分数", x: "82%", y: "80%" },
  ],
  tokens: [
    { id: "lcm", emoji: "🔍", label: "求 4 和 6 的最小公倍数 12" },
    { id: "common", emoji: "➕", label: "3/12 + 2/12" },
    { id: "result", emoji: "✅", label: "5/12" },
    { id: "wrong", emoji: "🪤", label: "5/24 (分母直接相加错误)" },
  ],
  initialPlaced: { lcm: "lcm", common: null, result: null },
  initialFeedback:
    "很好的开端！异分母分数加减法第一步是先通分，找到分母的最小公倍数。",
  hintLadder: [
    { emoji: "💡", text: "计算 1/4 + 1/6 时，先找 4 和 6 的最小公倍数 12。" },
    { emoji: "➕", text: "将 1/4 化为 3/12，1/6 化为 2/12。" },
    { emoji: "✅", text: "同分母分数相加：分母不变，分子相加得到 5/12。" },
  ],
  teacherName: "诺瓦导师",
  teacherEmoji: "📐",
};

const PARALLEL_LINES_PRACTICE: MissionPracticePayload = {
  prompt: "拖拽角的位置名称标签到平行线截角图形对应位置",
  subject: "数学",
  diagramLabel: "📐 沪教版七年级数学 - 平行线的性质与判定",
  diagramGradient: "linear-gradient(180deg, #ecfeff 0%, #cffafe 60%, #a5f3fc 100%)",
  targets: [
    { id: "corr", label: "同位角相等 (∠1与∠5)", x: "18%", y: "40%" },
    { id: "alt", label: "内错角相等 (∠3与∠5)", x: "50%", y: "40%" },
    { id: "cons", label: "同旁内角互补 (∠4与∠5)", x: "82%", y: "40%" },
  ],
  tokens: [
    { id: "corr", emoji: "📐", label: "同位角" },
    { id: "alt", emoji: "🔀", label: "内错角" },
    { id: "cons", emoji: "↔️", label: "同旁内角" },
    { id: "opp", emoji: "✖️", label: "对顶角" },
  ],
  initialFeedback:
    "观察图形，两条平行线被第三条直线所截，同位角相等、内错角相等、同旁内角互补。",
  hintLadder: [
    { emoji: "💡", text: "在截线同侧且在两条被截直线同一位置的角是同位角。" },
    { emoji: "🔀", text: "在截线两侧且在两条被截直线之间的角是内错角 (Z 字形)。" },
    { emoji: "↔️", text: "在截线同侧且在两条被截直线之间的角是同旁内角 (U 字形)。" },
  ],
  teacherName: "诺瓦导师",
  teacherEmoji: "📐",
};

const ALGEBRA_PRACTICE: MissionPracticePayload = {
  prompt: "按照正确的步骤求解方程 3x + 5 = 20 中的未知数 x",
  subject: "数学",
  diagramLabel: "📐 求解未知数 x — 步骤演示",
  diagramGradient: "linear-gradient(180deg, #fdf4ff 0%, #fae8ff 60%, #f5d0fe 100%)",
  targets: [
    { id: "subtract", label: "1 · 移项化简含 x 的项", x: "18%", y: "30%" },
    { id: "divide", label: "2 · 求解未知数 x", x: "50%", y: "50%" },
    { id: "check", label: "3 · 代入原方程检验", x: "82%", y: "75%" },
  ],
  tokens: [
    { id: "subtract", emoji: "➖", label: "等式两边同时减去 5 → 3x = 15" },
    { id: "divide", emoji: "➗", label: "等式两边同时除以 3 → x = 5" },
    { id: "check", emoji: "✅", label: "代入 x = 5 检验 → 3(5)+5 = 20 ✓" },
    { id: "expand", emoji: "🪤", label: "等式两边乘以 3 (错误步骤)" },
  ],
  initialFeedback:
    "解方程时优先隔离变量，再求解未知数，最后代入原方程化简检验。",
  hintLadder: [
    { emoji: "💡", text: "先处理常数项 +5，两边同减 5。" },
    { emoji: "➗", text: "得到 3x = 15 后，两边同除以 3。" },
    { emoji: "✅", text: "代入检验是必不可少的步骤，能及时发现计算错误。" },
  ],
  teacherName: "诺瓦导师",
  teacherEmoji: "🦉",
};

const CLOUDS_RAIN_PRACTICE: MissionPracticePayload = {
  prompt: "Drag each stage to its place in the water cycle",
  subject: "Science",
  diagramLabel: "☁️ The water cycle (sun → cloud → rain → river)",
  diagramGradient: "linear-gradient(180deg, #dbeafe 0%, #93c5fd 60%, #60a5fa 100%)",
  targets: [
    { id: "evaporate", label: "1 · Sun warms the water", x: "18%", y: "75%" },
    { id: "condense", label: "2 · Cools high in the sky", x: "50%", y: "30%" },
    { id: "precipitate", label: "3 · Falls back to earth", x: "82%", y: "55%" },
  ],
  tokens: [
    { id: "evaporate", emoji: "🌞", label: "Evaporation" },
    { id: "condense", emoji: "☁️", label: "Condensation" },
    { id: "precipitate", emoji: "🌧️", label: "Precipitation" },
    { id: "freeze", emoji: "❄️", label: "Freezing (not in this cycle)" },
  ],
  initialPlaced: { evaporate: "evaporate", condense: null, precipitate: null },
  initialFeedback:
    "Good start! The sun warms the water so it evaporates. What happens when that water vapor rises and meets cooler air?",
  hintLadder: [
    { emoji: "💡", text: "When warm vapor meets cold air, it turns back into tiny water drops." },
    { emoji: "☁️", text: "Those drops cluster together — that's a cloud forming." },
    { emoji: "🌧️", text: "When the drops get heavy enough, they fall as rain." },
  ],
  teacherName: "Rex",
  teacherEmoji: "🦊",
};

const READING_TIGER_PRACTICE: MissionPracticePayload = {
  prompt: "Match each clue to what the tiger cubs probably feel",
  subject: "Reading",
  diagramLabel: "🐯 Story scene · three tiger cubs in the tall grass",
  diagramGradient: "linear-gradient(180deg, #fef3c7 0%, #fde68a 60%, #fcd34d 100%)",
  targets: [
    { id: "hungry", label: "1 · 'their bellies grumbled'", x: "18%", y: "40%" },
    { id: "scared", label: "2 · 'they huddled close together'", x: "50%", y: "60%" },
    { id: "playful", label: "3 · 'they tumbled and pounced'", x: "82%", y: "30%" },
  ],
  tokens: [
    { id: "hungry", emoji: "🍖", label: "Hungry" },
    { id: "scared", emoji: "😨", label: "Scared" },
    { id: "playful", emoji: "🤸", label: "Playful" },
    { id: "sleepy", emoji: "😴", label: "Sleepy" },
  ],
  initialFeedback:
    "Reading is detective work — pick the feeling word that matches the clue the author gave you.",
  hintLadder: [
    { emoji: "💡", text: "A grumbling belly is a sign your body needs food." },
    { emoji: "🤗", text: "When you're afraid, you often want to be close to someone." },
    { emoji: "🎈", text: "Tumbling and pouncing are signs of play, not danger." },
  ],
  teacherName: "Rex",
  teacherEmoji: "🦊",
};

const RIVER_PUZZLE_PRACTICE: MissionPracticePayload = {
  prompt: "Order the river-crossing moves so everyone gets across safely",
  subject: "Logic",
  diagramLabel: "🚣 River puzzle · fox, chicken, grain, one small boat",
  diagramGradient: "linear-gradient(180deg, #d1fae5 0%, #a7f3d0 60%, #6ee7b7 100%)",
  targets: [
    { id: "first", label: "Move 1", x: "18%", y: "50%" },
    { id: "second", label: "Move 2 (the trick)", x: "50%", y: "50%" },
    { id: "third", label: "Move 3", x: "82%", y: "50%" },
  ],
  tokens: [
    { id: "first", emoji: "🐔", label: "Take the chicken across" },
    { id: "second", emoji: "↩️", label: "Take the fox across, bring the chicken back" },
    { id: "third", emoji: "🌾", label: "Take the grain across, then return for the chicken" },
    { id: "wrong", emoji: "🪤", label: "Leave the fox alone with the chicken" },
  ],
  initialFeedback:
    "The fox can't be alone with the chicken, and the chicken can't be alone with the grain. Plan every trip.",
  hintLadder: [
    { emoji: "💡", text: "Start by moving the one thing that neither of the others wants to eat." },
    { emoji: "↩️", text: "You're allowed to bring someone back — that's the key to the puzzle." },
    {
      emoji: "🚣",
      text: "Never leave the chicken alone with the fox, or the grain alone with the chicken.",
    },
  ],
  teacherName: "Rex",
  teacherEmoji: "🦊",
};

const TRIG_PRACTICE: MissionPracticePayload = {
  prompt: "将三角函数公式匹配到直角三角形对应边长比例",
  subject: "数学",
  diagramLabel: "📐 直角三角形 (对边 · 邻边 · 斜边)",
  diagramGradient: "linear-gradient(180deg, #fff7ed 0%, #fed7aa 60%, #fdba74 100%)",
  targets: [
    { id: "sin", label: "1 · 正弦 sin θ", x: "20%", y: "30%" },
    { id: "cos", label: "2 · 余弦 cos θ", x: "50%", y: "55%" },
    { id: "tan", label: "3 · 正切 tan θ", x: "82%", y: "80%" },
  ],
  tokens: [
    { id: "sin", emoji: "📏", label: "对边 / 斜边" },
    { id: "cos", emoji: "📐", label: "邻边 / 斜边" },
    { id: "tan", emoji: "🧭", label: "对边 / 邻边" },
    { id: "csc", emoji: "🪤", label: "斜边 / 邻边 (余割/正割错误项)" },
  ],
  initialFeedback:
    "牢记三角函数定义：正弦(sin)是对边比斜边，余弦(cos)是邻边比斜边，正切(tan)是对边比邻边。",
  hintLadder: [
    { emoji: "💡", text: "斜边总是直角三角形中最长的边 — 位于直角的对立面。" },
    { emoji: "📐", text: "“对边”是面向你正在研究的夹角 θ 的那条边。" },
    { emoji: "🧭", text: "正切是唯一不涉及斜边的比值。" },
  ],
  teacherName: "导师 Max",
  teacherEmoji: "🎓",
};

const QUADRATICS_PRACTICE: MissionPracticePayload = {
  prompt: "将一元二次方程求根公式的各部分放入对应位置",
  subject: "数学",
  diagramLabel: "📊 求根公式 x = (-b ± √(b²-4ac)) / 2a",
  diagramGradient: "linear-gradient(180deg, #ede9fe 0%, #c4b5fd 60%, #a78bfa 100%)",
  targets: [
    { id: "negB", label: "1 · 分子开头的符号与项", x: "18%", y: "40%" },
    { id: "discrim", label: "2 · 根号内的判别式 Δ", x: "50%", y: "50%" },
    { id: "denom", label: "3 · 分母项", x: "82%", y: "60%" },
  ],
  tokens: [
    { id: "negB", emoji: "➖", label: "-b" },
    { id: "discrim", emoji: "🔍", label: "b² - 4ac" },
    { id: "denom", emoji: "✂️", label: "2a" },
    { id: "wrong", emoji: "🪤", label: "b² + 4ac (符号混淆项)" },
  ],
  initialFeedback:
    "一元二次方程求根公式由三部分组成：分子首项 -b，根号内的判别式 Δ=b²-4ac，以及分母 2a。",
  hintLadder: [
    { emoji: "💡", text: "分子中 b 前面的符号固定为负号。" },
    { emoji: "🔍", text: "判别式 b² − 4ac 决定方程是否有实数根。" },
    { emoji: "✂️", text: "分母是 2a，而不是仅仅为 a。" },
  ],
  teacherName: "导师 Max",
  teacherEmoji: "🎓",
};

const PROBABILITY_PRACTICE: MissionPracticePayload = {
  prompt: "Match each event to its probability on a fair six-sided die",
  subject: "Math",
  diagramLabel: "🎲 Probability scale · 0 (impossible) → 1 (certain)",
  diagramGradient: "linear-gradient(180deg, #fee2e2 0%, #fecaca 60%, #fca5a5 100%)",
  targets: [
    { id: "one6", label: "1/6 · single outcome", x: "18%", y: "40%" },
    { id: "even", label: "1/2 · half of outcomes", x: "50%", y: "50%" },
    { id: "le6", label: "1 · always true", x: "82%", y: "60%" },
  ],
  tokens: [
    { id: "one6", emoji: "🎯", label: "Roll a 3" },
    { id: "even", emoji: "⚖️", label: "Roll an even number" },
    { id: "le6", emoji: "✅", label: "Roll a number ≤ 6" },
    { id: "wrong", emoji: "🪤", label: "Roll a 7" },
  ],
  initialFeedback:
    "Probability is the favourable outcomes divided by all possible outcomes. The trap option (rolling a 7) is impossible — its probability is 0.",
  hintLadder: [
    { emoji: "💡", text: "A fair die has six equally likely outcomes: 1, 2, 3, 4, 5, 6." },
    { emoji: "⚖️", text: "Three of those (2, 4, 6) are even — so 3/6 = 1/2." },
    { emoji: "✅", text: "Every roll is ≤ 6, so that event is certain: probability 1." },
  ],
  teacherName: "Mentor Max",
  teacherEmoji: "🎓",
};

const VPC_PRACTICE: MissionPracticePayload = {
  prompt: "Drag each label to the correct part of the AWS VPC diagram",
  subject: "Cloud",
  diagramLabel: "☁️ AWS VPC diagram (subnets · gateways · route table)",
  diagramGradient: "linear-gradient(180deg, #e6ecff 0%, #c7d2fe 60%, #a5b4fc 100%)",
  targets: [
    { id: "igw", label: "Internet Gateway", x: "18%", y: "20%" },
    { id: "public", label: "Public subnet", x: "50%", y: "40%" },
    { id: "private", label: "Private subnet", x: "82%", y: "65%" },
  ],
  tokens: [
    { id: "igw", emoji: "🌐", label: "Internet Gateway" },
    { id: "public", emoji: "🟢", label: "Public subnet" },
    { id: "private", emoji: "🔒", label: "Private subnet" },
    { id: "nat", emoji: "🛡️", label: "NAT Gateway" },
  ],
  initialPlaced: { igw: null, public: "public", private: null },
  initialFeedback:
    "Nice — the public subnet is right. Public subnets have a route to the IGW. Now place the Internet Gateway at the VPC edge.",
  hintLadder: [
    { emoji: "💡", text: "An Internet Gateway sits at the edge of the VPC." },
    { emoji: "☁️", text: "A public subnet has a 0.0.0.0/0 route to the IGW." },
    { emoji: "🔬", text: "A private subnet has no IGW route — it reaches the internet via NAT." },
  ],
  teacherName: "Professor Turing",
  teacherEmoji: "💼",
};

const IAM_PRACTICE: MissionPracticePayload = {
  prompt: "Match each IAM policy snippet to the access it grants",
  subject: "Security",
  diagramLabel: "🛡️ IAM least-privilege grid (Read · Write · Admin)",
  diagramGradient: "linear-gradient(180deg, #fef3c7 0%, #fde68a 100%)",
  targets: [
    { id: "read", label: "Read-only · one bucket", x: "20%", y: "30%" },
    { id: "passrole", label: "Pass a role to a service", x: "50%", y: "55%" },
    { id: "admin", label: "Full admin (avoid)", x: "82%", y: "30%" },
  ],
  tokens: [
    { id: "read", emoji: "👁️", label: "s3:GetObject (one bucket)" },
    { id: "passrole", emoji: "🤝", label: "iam:PassRole" },
    { id: "admin", emoji: "🚫", label: "AdministratorAccess" },
    { id: "wide", emoji: "🪣", label: "s3:* on every bucket" },
  ],
  initialFeedback:
    "Least privilege wins. Each policy goes in the box that matches the smallest set of permissions it grants.",
  hintLadder: [
    { emoji: "💡", text: "s3:GetObject scoped to one ARN is read-only on that bucket." },
    { emoji: "🤝", text: "iam:PassRole lets one service hand a role to another." },
    { emoji: "🚫", text: "AdministratorAccess is the textbook anti-pattern — too broad." },
  ],
  teacherName: "Professor Turing",
  teacherEmoji: "💼",
};

const S3_LIFECYCLE_PRACTICE: MissionPracticePayload = {
  prompt: "Order the S3 storage classes from hottest to coldest",
  subject: "Storage",
  diagramLabel: "🧊 S3 lifecycle timeline (newest → archive)",
  diagramGradient: "linear-gradient(180deg, #d1fae5 0%, #a7f3d0 50%, #6ee7b7 100%)",
  targets: [
    { id: "standard", label: "1 · Hot", x: "16%", y: "50%" },
    { id: "ia", label: "2 · Warm", x: "42%", y: "50%" },
    { id: "glacier", label: "3 · Cold", x: "68%", y: "50%" },
    { id: "deep", label: "4 · Archive", x: "92%", y: "50%" },
  ],
  tokens: [
    { id: "standard", emoji: "⚡", label: "S3 Standard" },
    { id: "ia", emoji: "🌤️", label: "S3 Standard-IA" },
    { id: "glacier", emoji: "❄️", label: "Glacier Instant Retrieval" },
    { id: "deep", emoji: "🧊", label: "Glacier Deep Archive" },
  ],
  initialPlaced: { standard: "standard", ia: null, glacier: null, deep: null },
  initialFeedback:
    "Standard is the hottest tier — frequent access, lowest latency. Where does Standard-IA fit next?",
  hintLadder: [
    { emoji: "💡", text: "Hotter tiers cost more per GB but less per retrieval." },
    { emoji: "❄️", text: "Glacier classes are cheap to store but slower to retrieve." },
    { emoji: "🧊", text: "Deep Archive is the cheapest and the slowest — measured in hours." },
  ],
  teacherName: "Professor Turing",
  teacherEmoji: "💼",
};

// ── World → missions catalog ────────────────────────────────────────

export const MISSIONS: Record<string, Mission[]> = {
  kids: [
    {
      id: "kids-count-animals",
      title: "Count jungle animals with Milo",
      subject: "Numbers",
      status: "active",
      progressPct: 30,
    },
    {
      id: "kids-letter-a",
      title: "Find the letter A",
      subject: "Letters",
      status: "active",
      progressPct: 0,
    },
    {
      id: "kids-colors",
      title: "Match the colours",
      subject: "Colours",
      status: "locked",
      progressPct: 0,
    },
  ],
  GRADE_6: [
    {
      id: "GRADE_6-fractions",
      title: "沪教版六年级数学：分数的化简与四则运算",
      subject: "数学",
      status: "active",
      progressPct: 60,
      practice: FRACTIONS_PRACTICE,
    },
    {
      id: "GRADE_6-decimals",
      title: "沪教版六年级数学：分数与小数的互化与比较",
      subject: "数学",
      status: "completed",
      progressPct: 100,
    },
    {
      id: "GRADE_6-cuboids",
      title: "沪教版六年级数学：长方体与正方体的表面积与体积",
      subject: "数学",
      status: "active",
      progressPct: 30,
    },
    {
      id: "GRADE_6-rationals",
      title: "沪教版六年级数学：有理数概念与数轴加减法",
      subject: "数学",
      status: "locked",
      progressPct: 0,
    },
  ],
  GRADE_7: [
    {
      id: "GRADE_7-parallel",
      title: "沪教版七年级数学：相交线与平行线的性质与判定",
      subject: "数学",
      status: "active",
      progressPct: 50,
      practice: PARALLEL_LINES_PRACTICE,
    },
    {
      id: "GRADE_7-radicals",
      title: "沪教版七年级数学：实数与平方根/二次根式化简",
      subject: "数学",
      status: "completed",
      progressPct: 100,
    },
    {
      id: "GRADE_7-polynomials",
      title: "沪教版七年级数学：整式的乘除与因式分解核心技巧",
      subject: "数学",
      status: "active",
      progressPct: 25,
    },
    {
      id: "GRADE_7-angles",
      title: "沪教版七年级数学：余角、补角与尺规作图画法",
      subject: "数学",
      status: "active",
      progressPct: 20,
    },
  ],
  GRADE_8: [
    {
      id: "python-calculator",
      title: "沪教版八年级数学：一元二次方程解法与求根公式",
      subject: "数学",
      status: "active",
      progressPct: 67,
      practice: QUADRATICS_PRACTICE,
    },
    {
      id: "logic-gates",
      title: "沪教版八年级数学：正比例函数与一次函数的图像与性质",
      subject: "数学",
      status: "active",
      progressPct: 30,
    },
    {
      id: "algebra-x",
      title: "沪教版八年级数学：全等三角形证明与SAS/ASA判定",
      subject: "数学",
      status: "completed",
      progressPct: 100,
      practice: ALGEBRA_PRACTICE,
    },
    {
      id: "GRADE_8-ttt",
      title: "沪教版八年级数学：勾股定理及其逆定理在几何中的应用",
      subject: "数学",
      status: "locked",
      progressPct: 0,
    },
  ],
  GRADE_9: [
    {
      id: "GRADE_9-trig",
      title: "沪教版九年级数学：锐角三角函数与解直角三角形",
      subject: "数学",
      status: "active",
      progressPct: 40,
      practice: TRIG_PRACTICE,
    },
    {
      id: "GRADE_9-quadratics",
      title: "沪教版九年级数学：相似三角形判定与比例线段应用",
      subject: "数学",
      status: "active",
      progressPct: 68,
    },
    {
      id: "GRADE_9-probability",
      title: "沪教版九年级数学：二次函数图象性质与顶点式综合题",
      subject: "数学",
      status: "active",
      progressPct: 75,
      practice: PROBABILITY_PRACTICE,
    },
    {
      id: "GRADE_9-exam",
      title: "上海中考数学全真模拟冲刺套卷 A (压轴题专题)",
      subject: "中考数学",
      status: "locked",
      progressPct: 0,
    },
  ],
  adult: [
    {
      id: "vpc-networking-subnets-routes",
      title: "VPC networking: subnets & routes",
      subject: "Cloud",
      status: "active",
      progressPct: 50,
      practice: VPC_PRACTICE,
    },
    {
      id: "iam-policies-practice",
      title: "IAM policies in practice",
      subject: "Security",
      status: "active",
      progressPct: 55,
      practice: IAM_PRACTICE,
    },
    {
      id: "s3-lifecycle-storage-classes",
      title: "S3 lifecycle & storage classes",
      subject: "Storage",
      status: "active",
      progressPct: 40,
      practice: S3_LIFECYCLE_PRACTICE,
    },
    {
      id: "mock-saa-c03-block-2",
      title: "Mock SAA-C03: Block 2",
      subject: "Exam",
      status: "locked",
      progressPct: 0,
    },
  ],
  senior: [
    {
      id: "senior-scams",
      title: "Spotting scam messages",
      subject: "Digital safety",
      status: "active",
      progressPct: 60,
    },
    {
      id: "senior-whatsapp",
      title: "Use WhatsApp safely",
      subject: "Digital safety",
      status: "active",
      progressPct: 0,
    },
  ],
};

export function findMission(worldSlug: string, missionId: string | undefined): Mission | null {
  if (!missionId) return null;
  const list = MISSIONS[worldSlug];
  if (!list) return null;
  return list.find((m) => m.id === missionId) ?? null;
}
