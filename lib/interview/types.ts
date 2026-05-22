/**
 * Interview Trainer — shared types.
 *
 * The wizard state is held client-side; API routes are stateless and accept
 * the relevant slice of state as input. This keeps the backend free of
 * per-session storage during the MVP. When Prisma persistence is added the
 * same types serialise straight into rows.
 */

export type InterviewGoal =
  | "specific_job"
  | "general_practice"
  | "role_type";

export type InterviewMode =
  | "full-simulation"
  | "training-only"
  | "presentation-only";

export type Seniority =
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "lead"
  | "manager"
  | "director"
  | "executive";

export type CandidateProfile = {
  fullName?: string;
  cvText?: string;
  linkedinUrl?: string;
  yearsExperience?: number;
  mainTech?: string[];
  mainLeadership?: string;
};

export type JobBrief = {
  companyName: string;
  roleTitle: string;
  seniority?: Seniority;
  jobDescription: string;
  jobUrl?: string;
  employmentType?: string;
};

export type FitAnalysis = {
  jobSummary: string;
  keyRequirements: string[];
  candidateStrengths: string[];
  candidateGaps: string[];
  riskAreas: string[];
  likelyTopics: string[];
  recommendedPath: string[];
};

export type TrainingBankId =
  | "recruiter"
  | "ai_llm"
  | "system_design"
  | "leadership"
  | "behavioural"
  | "salary";

export type TrainingBank = {
  id: TrainingBankId;
  title: string;
  description: string;
  questions: string[];
};

export type StarFlags = {
  situation: boolean;
  task: boolean;
  action: boolean;
  result: boolean;
};

export type AnswerScore = {
  score0to10: number;
  signal: "weak" | "average" | "strong";
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  star?: StarFlags;
};

export type PresentationFeedback = {
  durationSec: number;
  score0to10: number;
  clarity: number;
  structure: number;
  roleRelevance: number;
  confidence: number;
  timingFeedback: string;
  strengths: string[];
  weaknesses: string[];
  missingPoints: string[];
  improvedScript: string;
};

export type TurnRecordingRef = {
  /** Object URL (blob:). Local to the browser, never sent over the wire. */
  url: string;
  mimeType: string;
  durationSec: number;
  sizeBytes: number;
};

export type InterviewTurn = {
  index: number;
  round: 1 | 2 | 3;
  question: string;
  answer: string;
  score0to10: number;
  signal: "weak" | "average" | "strong";
  feedbackBullets: string[];
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
  communication: {
    clarity: number;
    structure: number;
    confidence: number;
    relevance: number;
  };
  /** Optional local recording (set only when the user opts into audio). */
  recording?: TurnRecordingRef;
};

export type ReadinessReport = {
  overallReadiness: number;
  technicalReadiness: number;
  leadershipReadiness: number;
  communicationReadiness: number;
  strongAreas: string[];
  weakAreas: string[];
  topRisks: string[];
  bestAnswers: Array<{ question: string; quote: string; reason: string }>;
  nextTrainingRecommendations: string[];
  finalAdvice: string;
};

export type WizardStep =
  | "goal"
  | "job"
  | "profile"
  | "analysis"
  | "training"
  | "presentation"
  | "simulation"
  | "report";
