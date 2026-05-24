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
  explorer: [
    {
      id: "explorer-volcano",
      title: "Why does a volcano erupt?",
      subject: "Science",
      status: "active",
      progressPct: 50,
    },
    {
      id: "explorer-clouds",
      title: "How do clouds make rain?",
      subject: "Science",
      status: "completed",
      progressPct: 100,
    },
    {
      id: "explorer-river",
      title: "Solve the river puzzle",
      subject: "Logic",
      status: "active",
      progressPct: 20,
    },
  ],
  builder: [
    {
      id: "builder-calc",
      title: "Build a calculator in Python",
      subject: "Coding",
      status: "active",
      progressPct: 67,
    },
    {
      id: "builder-logic",
      title: "Logic gates: AND, OR, NOT",
      subject: "Coding",
      status: "active",
      progressPct: 30,
    },
    {
      id: "builder-algebra",
      title: "Algebra: solving for x",
      subject: "Math",
      status: "completed",
      progressPct: 100,
    },
    {
      id: "builder-ttt",
      title: "Build a tic-tac-toe game",
      subject: "Coding",
      status: "locked",
      progressPct: 0,
    },
  ],
  scholar: [
    {
      id: "scholar-trig",
      title: "Trigonometry: sine & cosine",
      subject: "Math",
      status: "active",
      progressPct: 40,
    },
    {
      id: "scholar-probability",
      title: "Probability fundamentals",
      subject: "Math",
      status: "active",
      progressPct: 75,
    },
    {
      id: "scholar-exam",
      title: "Practice exam: Set A",
      subject: "Exam",
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
