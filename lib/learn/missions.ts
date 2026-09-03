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

const PYTHON_CALCULATOR_PRACTICE: MissionPracticePayload = {
  prompt: "将代码代码块放入 divide(a, b) 函数的正确位置",
  subject: "信息技术",
  diagramLabel: "🐍 divide(a, b) — Python 除法函数模板",
  diagramGradient: "linear-gradient(180deg, #f5f3ff 0%, #e0e7ff 60%, #c7d2fe 100%)",
  targets: [
    { id: "guard", label: "1 · 检查除数 b 是否为 0", x: "20%", y: "30%" },
    { id: "raise", label: "2 · 抛出明确的除零错误", x: "50%", y: "55%" },
    { id: "return", label: "3 · 否则返回 a / b 的计算结果", x: "82%", y: "80%" },
  ],
  tokens: [
    { id: "guard", emoji: "🛡️", label: "if b == 0:" },
    { id: "raise", emoji: "🚨", label: "raise ZeroDivisionError('除数不能为0')" },
    { id: "return", emoji: "✅", label: "return a / b" },
    { id: "noop", emoji: "🪤", label: "return None  # 盲目吞掉错误" },
  ],
  initialPlaced: { guard: "guard", raise: null, return: null },
  initialFeedback:
    "很好！防御性判断放在第一步。当 b 为 0 时，应当主动抛出异常，而不是静默返回 None。",
  hintLadder: [
    { emoji: "💡", text: "在计算前先检查输入参数，防止程序崩溃。" },
    { emoji: "🚨", text: "Python 中常用 ZeroDivisionError 表示除零异常。" },
    { emoji: "✅", text: "遇到非法参数直接 return None 会隐瞒潜在的 Bug。" },
  ],
  teacherName: "诺瓦导师",
  teacherEmoji: "🦉",
};

const LOGIC_GATES_PRACTICE: MissionPracticePayload = {
  prompt: "将真值表与对应的逻辑门匹配",
  subject: "信息技术",
  diagramLabel: "🔌 逻辑门真值表 (A, B → 输出)",
  diagramGradient: "linear-gradient(180deg, #ecfeff 0%, #cffafe 60%, #a5f3fc 100%)",
  targets: [
    { id: "and", label: "全1为1 · 其他为0", x: "18%", y: "40%" },
    { id: "or", label: "全0为0 · 其他为1", x: "50%", y: "40%" },
    { id: "not", label: "取反：0→1 · 1→0", x: "82%", y: "40%" },
  ],
  tokens: [
    { id: "and", emoji: "∧", label: "与门 (AND)" },
    { id: "or", emoji: "∨", label: "或门 (OR)" },
    { id: "not", emoji: "¬", label: "非门 (NOT)" },
    { id: "xor", emoji: "⊕", label: "异或门 (XOR)" },
  ],
  initialFeedback:
    "观察真值表，然后拖拽对应的逻辑门。与门是严格的 — 只有当两个输入均为 1 时输出才是 1。",
  hintLadder: [
    { emoji: "💡", text: "与门只有在两个输入均为 1 时输出 1。" },
    { emoji: "🔌", text: "或门只有在两个输入均为 0 时输出 0。" },
    { emoji: "🔁", text: "非门接收一个输入并对其进行反转。" },
  ],
  teacherName: "诺瓦导师",
  teacherEmoji: "🦉",
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
  GRADE_7: [
    {
      id: "GRADE_7-volcano",
      title: "沪教版七年级生命科学 - 显微镜的使用",
      subject: "生命科学",
      status: "active",
      progressPct: 50,
    },
    {
      id: "GRADE_7-clouds",
      title: "自然地理：水循环与降水的形成",
      subject: "地理",
      status: "completed",
      progressPct: 100,
      practice: CLOUDS_RAIN_PRACTICE,
    },
    {
      id: "GRADE_7-reading",
      title: "语文阅读：动物观察与心理推断",
      subject: "语文",
      status: "active",
      progressPct: 25,
      practice: READING_TIGER_PRACTICE,
    },
    {
      id: "GRADE_7-river",
      title: "逻辑思维：逻辑推理与过河问题",
      subject: "逻辑",
      status: "active",
      progressPct: 20,
      practice: RIVER_PUZZLE_PRACTICE,
    },
  ],
  GRADE_8: [
    {
      id: "python-calculator",
      title: "沪科版八年级物理/信息：Python 计算器与逻辑判断",
      subject: "信息技术",
      status: "active",
      progressPct: 67,
      practice: PYTHON_CALCULATOR_PRACTICE,
    },
    {
      id: "logic-gates",
      title: "逻辑电路：与门、或门与非门原理",
      subject: "信息技术",
      status: "active",
      progressPct: 30,
      practice: LOGIC_GATES_PRACTICE,
    },
    {
      id: "algebra-x",
      title: "沪教版八年级数学：一元一次方程求解",
      subject: "数学",
      status: "completed",
      progressPct: 100,
      practice: ALGEBRA_PRACTICE,
    },
    {
      id: "GRADE_8-ttt",
      title: "综合实践：制作井字棋小游戏",
      subject: "编程",
      status: "locked",
      progressPct: 0,
    },
  ],
  GRADE_9: [
    {
      id: "GRADE_9-trig",
      title: "沪教版九年级数学：锐角三角函数 (sin, cos, tan)",
      subject: "数学",
      status: "active",
      progressPct: 40,
      practice: TRIG_PRACTICE,
    },
    {
      id: "GRADE_9-quadratics",
      title: "沪教版九年级数学：一元二次方程求根公式",
      subject: "数学",
      status: "active",
      progressPct: 68,
      practice: QUADRATICS_PRACTICE,
    },
    {
      id: "GRADE_9-probability",
      title: "九年级数学中考复习：概率初步与树状图",
      subject: "数学",
      status: "active",
      progressPct: 75,
      practice: PROBABILITY_PRACTICE,
    },
    {
      id: "GRADE_9-exam",
      title: "上海中考全科模拟套卷 A",
      subject: "中考",
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
