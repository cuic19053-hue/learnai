/**
 * Deterministic JD-keyword → competency mapping.
 *
 * Used as a *fast first pass* to seed the fit analysis and the training-bank
 * weighting before the LLM call. Keeps the system useful even when the AI is
 * unreachable.
 */

export type FocusArea =
  | "ai_llm"
  | "rag"
  | "agents"
  | "prompt_eng"
  | "hallucinations"
  | "llm_cost"
  | "node"
  | "python"
  | "frontend"
  | "system_design"
  | "sql"
  | "distributed"
  | "incidents"
  | "leadership"
  | "hiring"
  | "mentoring"
  | "product_pushback"
  | "cross_functional";

type Match = { area: FocusArea; pattern: RegExp; weight: number };

const PATTERNS: Match[] = [
  { area: "ai_llm", pattern: /\b(ai\/llm|llms?|gpt|claude|gemini|openai|anthropic)\b/i, weight: 5 },
  { area: "rag", pattern: /\brag\b|retrieval[- ]augmented/i, weight: 4 },
  { area: "agents", pattern: /\bagents?\b|orchestration|mcp/i, weight: 4 },
  { area: "prompt_eng", pattern: /\bprompt(s|ing| engineering)?\b/i, weight: 3 },
  { area: "hallucinations", pattern: /hallucination/i, weight: 4 },
  { area: "llm_cost", pattern: /\b(cost|latency)\b.*\b(llm|token|model)\b|token cost/i, weight: 3 },
  { area: "node", pattern: /\bnode\.?js\b/i, weight: 3 },
  { area: "python", pattern: /\bpython\b/i, weight: 3 },
  { area: "frontend", pattern: /\b(react|next\.?js|frontend|front-end)\b/i, weight: 2 },
  { area: "system_design", pattern: /\bsystem design\b|scalab(le|ility)|architect/i, weight: 4 },
  { area: "sql", pattern: /\bsql\b|postgres|mysql|window function/i, weight: 4 },
  { area: "distributed", pattern: /\bdistributed (systems?|services?)\b|microservice|eventual consistency/i, weight: 3 },
  { area: "incidents", pattern: /\bincident|on[- ]call|production (issues?|debug)/i, weight: 4 },
  { area: "leadership", pattern: /\blead(er|ership|ing)\b|manag(e|ing) (a|the) team/i, weight: 5 },
  { area: "hiring", pattern: /\bhir(e|ing)\b|recruit/i, weight: 3 },
  { area: "mentoring", pattern: /\bmentor(ing|ship)?\b|coach(ing)?/i, weight: 3 },
  { area: "product_pushback", pattern: /push(ing)? back|product partnership/i, weight: 2 },
  { area: "cross_functional", pattern: /cross[- ]functional|collaborat/i, weight: 2 },
];

const LABELS: Record<FocusArea, string> = {
  ai_llm: "AI / LLM production experience",
  rag: "RAG systems",
  agents: "Agent orchestration",
  prompt_eng: "Prompt engineering",
  hallucinations: "Hallucination detection",
  llm_cost: "LLM cost & latency optimisation",
  node: "Node.js",
  python: "Python",
  frontend: "Frontend (React / Next.js)",
  system_design: "System design at scale",
  sql: "SQL & query performance",
  distributed: "Distributed systems",
  incidents: "Production incidents & on-call",
  leadership: "Technical leadership",
  hiring: "Hiring & interviewing",
  mentoring: "Mentoring & coaching",
  product_pushback: "Product partnership & pushback",
  cross_functional: "Cross-functional collaboration",
};

/**
 * Score each focus area against a job description. Returns areas with a
 * positive score, ordered by weight desc.
 */
export function detectFocusAreas(
  jd: string,
): Array<{ area: FocusArea; label: string; score: number }> {
  const scored = new Map<FocusArea, number>();
  for (const { area, pattern, weight } of PATTERNS) {
    if (pattern.test(jd)) {
      scored.set(area, (scored.get(area) ?? 0) + weight);
    }
  }
  return Array.from(scored.entries())
    .map(([area, score]) => ({ area, label: LABELS[area], score }))
    .sort((a, b) => b.score - a.score);
}

export function focusAreaLabel(area: FocusArea): string {
  return LABELS[area];
}
