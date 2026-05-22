/**
 * Prompt templates for the AI Interview Trainer.
 *
 * Each builder returns an array of ChatMessage. The system message sets the
 * persona; the user message carries the structured request and asks for
 * JSON-only output, matching the expected schemas in lib/interview/types.ts.
 */

import type { ChatMessage } from "@/lib/ai/provider";
import type { CandidateProfile, InterviewTurn, JobBrief } from "./types";

const CORE_COACH = `You are an expert career coach and senior technical interviewer.
You give direct, supportive, evidence-based feedback. You always return strict JSON
that matches the requested schema, with no commentary outside the JSON.`;

function formatProfile(p?: CandidateProfile): string {
  if (!p) return "Not provided.";
  const lines: string[] = [];
  if (p.fullName) lines.push(`Name: ${p.fullName}`);
  if (p.yearsExperience != null) lines.push(`Years of experience: ${p.yearsExperience}`);
  if (p.mainTech?.length) lines.push(`Main technologies: ${p.mainTech.join(", ")}`);
  if (p.mainLeadership) lines.push(`Leadership: ${p.mainLeadership}`);
  if (p.linkedinUrl) lines.push(`LinkedIn: ${p.linkedinUrl}`);
  if (p.cvText) lines.push(`CV:\n${p.cvText.slice(0, 4000)}`);
  return lines.length ? lines.join("\n") : "Not provided.";
}

/* ────────────────────────────────────────────────────────────────────── */
/*  1. Fit analysis                                                       */
/* ────────────────────────────────────────────────────────────────────── */

export function analyzeFitPrompt(input: {
  job: JobBrief;
  profile?: CandidateProfile;
  language?: string;
}): ChatMessage[] {
  const { job, profile, language = "English" } = input;
  return [
    { role: "system", content: CORE_COACH },
    {
      role: "user",
      content: `Analyse the fit between this candidate and this job. Return ONLY this JSON object:

{
  "jobSummary": string,
  "keyRequirements": string[],
  "candidateStrengths": string[],
  "candidateGaps": string[],
  "riskAreas": string[],
  "likelyTopics": string[],
  "recommendedPath": string[]
}

Rules:
- jobSummary: max 2 sentences.
- keyRequirements: 4-8 items, short.
- candidateStrengths/Gaps: cite specifics from the CV when possible.
- likelyTopics: concrete interview topics, not generic.
- recommendedPath: 4-6 actionable steps the candidate should take.
- Language: ${language}

Company: ${job.companyName}
Role: ${job.roleTitle}
Seniority: ${job.seniority ?? "unspecified"}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 6000)}

CANDIDATE PROFILE:
${formatProfile(profile)}`,
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────── */
/*  2. Training plan (question banks)                                     */
/* ────────────────────────────────────────────────────────────────────── */

export function trainingPlanPrompt(input: {
  job: JobBrief;
  profile?: CandidateProfile;
  language?: string;
}): ChatMessage[] {
  const { job, profile, language = "English" } = input;
  return [
    { role: "system", content: CORE_COACH },
    {
      role: "user",
      content: `Generate a personalised training plan for this candidate and job.
Return ONLY this JSON object — six banks, each with 3-6 short questions a real
interviewer would ask. Questions must be specific to this JD, not generic.

{
  "banks": [
    { "id": "recruiter",     "title": string, "description": string, "questions": string[] },
    { "id": "ai_llm",        "title": string, "description": string, "questions": string[] },
    { "id": "system_design", "title": string, "description": string, "questions": string[] },
    { "id": "leadership",    "title": string, "description": string, "questions": string[] },
    { "id": "behavioural",   "title": string, "description": string, "questions": string[] },
    { "id": "salary",        "title": string, "description": string, "questions": string[] }
  ]
}

Language: ${language}.

Company: ${job.companyName}
Role: ${job.roleTitle}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 6000)}

CANDIDATE PROFILE:
${formatProfile(profile)}`,
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────── */
/*  3. Score one training attempt                                         */
/* ────────────────────────────────────────────────────────────────────── */

export function scoreAttemptPrompt(input: {
  question: string;
  answer: string;
  job: JobBrief;
  profile?: CandidateProfile;
  language?: string;
}): ChatMessage[] {
  const { question, answer, job, profile, language = "English" } = input;
  return [
    { role: "system", content: CORE_COACH },
    {
      role: "user",
      content: `Score this candidate's answer to a specific interview question.
Return ONLY this JSON object:

{
  "score0to10": number,
  "signal": "weak" | "average" | "strong",
  "strengths": string[],
  "weaknesses": string[],
  "improvedAnswer": string,
  "star": { "situation": boolean, "task": boolean, "action": boolean, "result": boolean }
}

Rules:
- score0to10: integer. weak ≤ 4, average 5-7, strong ≥ 8.
- improvedAnswer: under 120 words, first-person, plausible for this candidate.
- star flags: true only if that element is explicitly present.
- Language: ${language}

Company: ${job.companyName}
Role: ${job.roleTitle}

QUESTION:
${question}

CANDIDATE ANSWER:
${answer.slice(0, 4000)}

CANDIDATE PROFILE (for context):
${formatProfile(profile)}`,
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────── */
/*  4. Score 5-minute self-presentation                                   */
/* ────────────────────────────────────────────────────────────────────── */

export function presentationPrompt(input: {
  job: JobBrief;
  profile?: CandidateProfile;
  presentationText: string;
  durationSeconds: number;
  language?: string;
}): ChatMessage[] {
  const { job, profile, presentationText, durationSeconds, language = "English" } = input;
  return [
    { role: "system", content: CORE_COACH },
    {
      role: "user",
      content: `Evaluate this candidate's 5-minute self-presentation for the job below.
Return ONLY this JSON object:

{
  "score0to10": number,
  "clarity": number,
  "structure": number,
  "roleRelevance": number,
  "confidence": number,
  "timingFeedback": string,
  "strengths": string[],
  "weaknesses": string[],
  "missingPoints": string[],
  "improvedScript": string
}

Rules:
- All numeric scores are integers 0-10.
- improvedScript: a rewritten version designed to be spoken in roughly 5 minutes
  (≈ 650-750 words). First-person, structured for: 0:30 hook · 1:30 background ·
  3:00 proof with numbers · 4:00 leadership · 4:30 why this company · 5:00 close.
- Language: ${language}

DURATION: ${durationSeconds} seconds  (target ≈ 300 s)

Company: ${job.companyName}
Role: ${job.roleTitle}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 4000)}

CANDIDATE PROFILE:
${formatProfile(profile)}

PRESENTATION TEXT:
${presentationText.slice(0, 6000)}`,
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────── */
/*  5. One simulation turn — score answer + ask next                       */
/* ────────────────────────────────────────────────────────────────────── */

export function simulationTurnPrompt(input: {
  job: JobBrief;
  profile?: CandidateProfile;
  history: InterviewTurn[];
  userAnswer: string;
  round: 1 | 2 | 3;
  language?: string;
}): ChatMessage[] {
  const { job, profile, history, userAnswer, round, language = "English" } = input;
  const roundName =
    round === 1 ? "Recruiter screen"
    : round === 2 ? "Technical deep-dive"
    : "Leadership / system design";

  return [
    { role: "system", content: CORE_COACH },
    {
      role: "user",
      content: `You are conducting a realistic mock interview. Current round: ${round} / 3 (${roundName}).
Score the candidate's last answer and ask exactly one next question.

Return ONLY this JSON object:

{
  "feedbackBullets": string[],
  "strengths": string[],
  "weaknesses": string[],
  "improvedAnswer": string,
  "score0to10": number,
  "signal": "weak" | "average" | "strong",
  "nextQuestion": string,
  "tags": string[],
  "communication": {
    "clarity": number,
    "structure": number,
    "confidence": number,
    "relevance": number
  }
}

Rules:
- nextQuestion: ONE question, calibrated. If the last answer was weak, tighten and
  follow up on a specific gap. If strong, escalate difficulty.
- Stay inside the round's theme. Don't ask leadership questions in round 2.
- Language: ${language}.

Company: ${job.companyName}
Role: ${job.roleTitle}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 4000)}

CANDIDATE PROFILE:
${formatProfile(profile)}

INTERVIEW HISTORY (last 8):
${JSON.stringify(history.slice(-8))}

CANDIDATE'S LATEST ANSWER:
${userAnswer.slice(0, 4000)}`,
    },
  ];
}

/* ────────────────────────────────────────────────────────────────────── */
/*  6. Final readiness report                                              */
/* ────────────────────────────────────────────────────────────────────── */

export function readinessReportPrompt(input: {
  job: JobBrief;
  profile?: CandidateProfile;
  trainingAttempts: Array<{ question: string; score: number }>;
  presentationScore?: number;
  history: InterviewTurn[];
  language?: string;
}): ChatMessage[] {
  const { job, profile, trainingAttempts, presentationScore, history, language = "English" } =
    input;
  return [
    { role: "system", content: CORE_COACH },
    {
      role: "user",
      content: `Synthesise a final readiness report for this candidate, this job.
Return ONLY this JSON object:

{
  "overallReadiness": number,
  "technicalReadiness": number,
  "leadershipReadiness": number,
  "communicationReadiness": number,
  "strongAreas": string[],
  "weakAreas": string[],
  "topRisks": string[],
  "bestAnswers": [{ "question": string, "quote": string, "reason": string }],
  "nextTrainingRecommendations": string[],
  "finalAdvice": string
}

Rules:
- All readiness scores are integers 0-10. Be honest.
- bestAnswers: pick 1-3 from the simulation history.
- nextTrainingRecommendations: 3-5 specific actions.
- finalAdvice: max 3 sentences.
- Language: ${language}.

Company: ${job.companyName}
Role: ${job.roleTitle}

JOB DESCRIPTION:
${job.jobDescription.slice(0, 3000)}

CANDIDATE PROFILE:
${formatProfile(profile)}

TRAINING ATTEMPTS (question → score):
${JSON.stringify(trainingAttempts.slice(0, 30))}

5-MIN PRESENTATION SCORE: ${presentationScore ?? "not done"}

SIMULATION HISTORY (turn summaries):
${JSON.stringify(
  history.map((t) => ({
    round: t.round,
    q: t.question,
    score: t.score0to10,
    signal: t.signal,
    weaknesses: t.weaknesses,
  })),
)}`,
    },
  ];
}
