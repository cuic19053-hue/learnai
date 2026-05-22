/**
 * Project wizard data model. Same spine across every world; the
 * presentational details vary by audience.
 */

import type { WorldSlug } from "@/lib/learn/worlds";

export type WizardVariant = "standard" | "parent" | "calm";

/** A learning method tag for the final plan. */
export type PlanMethod = {
  icon: string;
  title: string;
  reason: string;
};

export type PlanWeek = {
  label: string;
  date: string;
  title: string;
  methods: string;
  /** When true the week is rendered as the diagnosed weak spot. */
  highlight?: boolean;
  /** When true the week is rendered as the deadline / exam row. */
  dim?: boolean;
};

/** What gets persisted when the wizard submits. */
export type ProjectDraft = {
  id: string;
  worldSlug: WorldSlug;
  /** Free-form topic. */
  topic: string;
  /** Free-form outcome / "what done looks like". */
  outcome: string;
  /** File names + url strings the learner attached in step 2. */
  sources: string[];
  daysPerWeek: number;
  minutesPerDay: number;
  /** Optional ISO yyyy-mm-dd deadline. */
  deadline?: string;
  /** Selected format / learning preferences. */
  prefs: string[];
  /** Hand-picked greeting label for the home card. */
  status: "idea" | "in_progress";
  createdAt: string;
};

/** Per-world wizard configuration. */
export type WizardConfig = {
  slug: WorldSlug;
  variant: WizardVariant;
  /** Who operates the wizard ("Parent · for Sofia", "You · Jess"). */
  operator: string;
  /** Step-1 question — drives the modal headline. */
  question: string;
  /** Inline subhead under the question. */
  subhead: string;
  /** Placeholder text for the topic input. */
  placeholder: string;
  /** 6-8 quick-pick topic chips. */
  starters: string[];
  /** Label for the outcome / mood / sprint sub-section. */
  outcomeLabel: string;
  /** Outcome quick-pick options — first is the recommended default. */
  outcomeOptions: string[];
  /** First-step tutor "whisper" — short, anchored to the world's reality. */
  tutorWhisper: string;
  /** One-liner explaining why the prompt is shaped this way. */
  whyPrompt: string;
  /** Default pace shown on step 3 (or summarised on the single-page variants). */
  defaultDaysPerWeek: number;
  defaultMinutesPerDay: number;
  /** Default selected format prefs (ids must match the FORMAT_PREFS catalogue). */
  defaultPrefs: string[];
  /** Optional deadline summary copy ("5 wk · 30 min/day · weekday"). */
  defaultPaceCopy: string;
  /** A sample week-by-week plan rendered on the preview step. */
  samplePlan: {
    title: string;
    headline: string;
    summary: string;
    metaChips: string[];
    weeks: PlanWeek[];
    methods: PlanMethod[];
    projection?: { value: string; unit: string; note: string };
  };
};

export const FORMAT_PREFS: Array<{ id: string; icon: string; label: string }> = [
  { id: "practice", icon: "✏️", label: "Lots of practice" },
  { id: "worked", icon: "🧮", label: "Worked examples" },
  { id: "flash", icon: "🃏", label: "Flashcards" },
  { id: "summary", icon: "🗺️", label: "One-page summaries" },
  { id: "video", icon: "🎬", label: "Short videos" },
  { id: "voice", icon: "🎤", label: "Explain back (voice)" },
];

const SHARED_METHODS: PlanMethod[] = [
  { icon: "🎯", title: "Active recall", reason: "best for exam recall · 2006" },
  { icon: "🔁", title: "Spaced repetition", reason: "closes forgetting curve · Ebbinghaus" },
  { icon: "🧮", title: "Worked → twin problem", reason: "matched to your sources" },
  { icon: "🪜", title: "Kumon mastery ladder", reason: "don't move on until you've got it" },
];

export const WIZARD_CONFIG: Record<WorldSlug, WizardConfig> = {
  kids: {
    slug: "kids",
    variant: "parent",
    operator: "Parent · for your little one",
    question: "What should we explore today?",
    subhead:
      "Pick a theme. Milo (the AI tutor) will turn it into a story-shaped lesson. You stay in control of time and content.",
    placeholder: "e.g. jungle animals · numbers up to 10 · colors",
    starters: [
      "Counting 1–5",
      "Animals 🦁",
      "Colors 🌈",
      "Letters A–E",
      "Feelings 🙂",
      "Shapes ◯△□",
    ],
    outcomeLabel: "Session length",
    outcomeOptions: ["10 min", "5 min", "15 min", "20 min"],
    tutorWhisper:
      "I'll do a 10-min story about the chosen theme — short focused play, with auto-pauses.",
    whyPrompt:
      "Little Learner sessions stay short and themed — repetition and a single safe context build vocabulary fastest at this age.",
    defaultDaysPerWeek: 5,
    defaultMinutesPerDay: 10,
    defaultPrefs: ["voice", "video"],
    defaultPaceCopy: "10 min · voice on · strict safety",
    samplePlan: {
      title: "Jungle animals · count to 7",
      headline: "A 10-minute story-shaped lesson",
      summary:
        "Milo introduces three jungle animals and counts them aloud. Sofia repeats and counts back — Active recall + Kumon ladder.",
      metaChips: ["10 min", "voice on", "ages 3–6"],
      weeks: [],
      methods: [
        { icon: "🎯", title: "Active recall", reason: "repeats numbers until owned" },
        { icon: "🪜", title: "Kumon ladder", reason: "no new number until prior is solid" },
      ],
    },
  },
  explorer: {
    slug: "explorer",
    variant: "standard",
    operator: "You · Captain Explorer",
    question: "What does your brain want to discover today?",
    subhead: "Pick a topic — we'll build a 3-experiment quest with worked steps and a notebook.",
    placeholder: "e.g. volcanoes · sharks · how to draw cartoons",
    starters: [
      "🌋 Volcanoes",
      "🦈 Sharks",
      "🪐 Planets",
      "🧪 Slime science",
      "🎨 Cartooning",
      "🌪️ Weather",
    ],
    outcomeLabel: "Mission goal",
    outcomeOptions: ["🏆 Earn a badge", "📓 Build a notebook", "🎤 Tell a friend"],
    tutorWhisper:
      "Great pick! We'll make a 3-experiment quest with worked-out steps and a notebook page each day.",
    whyPrompt:
      "Explorer projects are framed as quests — kids retain more when the topic is wrapped in a narrative.",
    defaultDaysPerWeek: 3,
    defaultMinutesPerDay: 15,
    defaultPrefs: ["practice", "video"],
    defaultPaceCopy: "3 days · 15 min/day · quest framing",
    samplePlan: {
      title: "Volcano quest — 3 experiments",
      headline: "Three days, three discoveries",
      summary:
        "A vinegar-and-baking-soda lava cake, a paper-mache volcano cross-section, and a real-eruption case study from Hawaii. One notebook page per day.",
      metaChips: ["3 days", "15 min/day", "notebook"],
      weeks: [
        {
          label: "Day 1",
          date: "Today",
          title: "Lava-cake science: chemical reactions",
          methods: "hook · explain · build",
        },
        {
          label: "Day 2",
          date: "Tomorrow",
          title: "Cross-section anatomy: magma chamber to vent",
          methods: "drawing · labelling",
        },
        {
          label: "Day 3",
          date: "Day after",
          title: "Case study: Kīlauea — real eruption",
          methods: "video · recall",
        },
      ],
      methods: [
        {
          icon: "🎬",
          title: "Dual coding",
          reason: "video + text recall better than either alone",
        },
        { icon: "🪜", title: "Worked → try yourself", reason: "watch one, draw one" },
        { icon: "📔", title: "Notebook closure", reason: "writing it down cements it" },
      ],
    },
  },
  builder: {
    slug: "builder",
    variant: "standard",
    operator: "You · the builder",
    question: "What are you building?",
    subhead: "Pick a build. We'll plan it in two-week sprints with real GitHub commits.",
    placeholder: "e.g. Build a calculator in Python · my first Discord bot",
    starters: [
      "🐍 Python from scratch",
      "🎮 First Pygame",
      "📱 React Native app",
      "🤖 Discord bot",
      "🌐 Personal website",
      "🎨 Generative art",
    ],
    outcomeLabel: "Definition of done",
    outcomeOptions: [
      "🚀 Ship to GitHub",
      "🎬 Demo video",
      "👫 Show 3 friends",
      "🏅 Hackathon entry",
    ],
    tutorWhisper:
      "Solid. Stretch goal: pretty up the UI at the end. Doable in 2 weeks with 4 commits.",
    whyPrompt:
      "Builder projects always have a 'ship' definition — making something real is the strongest retention driver at this age.",
    defaultDaysPerWeek: 4,
    defaultMinutesPerDay: 40,
    defaultPrefs: ["practice", "worked"],
    defaultPaceCopy: "2 weeks · 4 commits · ship on day 14",
    samplePlan: {
      title: "Python calculator — first ship",
      headline: "Build, test, and ship in 2 weeks",
      summary:
        "Add, subtract, multiply, divide. Handle divide-by-zero. Tests with pytest. Stretch: dress it up with PyQt and push to GitHub.",
      metaChips: ["2 weeks", "40 min × 4 days", "ship to GitHub"],
      weeks: [
        {
          label: "Wk 1",
          date: "May 21–27",
          title: "Add / subtract / multiply / divide functions",
          methods: "worked → twin · pytest",
        },
        {
          label: "Wk 2",
          date: "May 28–Jun 3",
          title: "Edge cases · PyQt UI · publish",
          methods: "Socratic · refactor · ship",
        },
      ],
      methods: SHARED_METHODS.slice(0, 3),
    },
  },
  scholar: {
    slug: "scholar",
    variant: "standard",
    operator: "You · the scholar",
    question: "What do you want to crush?",
    subhead:
      "One project, one outcome. Mentor Max turns it into a week-by-week plan back-planned from your exam date.",
    placeholder: "e.g. Trigonometry mastery for SAT · AP Bio cells unit",
    starters: [
      "📐 Trig sprint",
      "🧬 AP Bio · cells",
      "🇺🇸 APUSH · Reconstruction",
      "🎲 Probability",
      "🧪 Stoichiometry",
      "📚 Essay practice",
    ],
    outcomeLabel: "Outcome",
    outcomeOptions: [
      "📈 Score ≥ 700 on practice SAT",
      "📅 Pass the June test",
      "🎯 Fix my weak areas",
      "🎓 Confidence ≥ 8/10",
    ],
    tutorWhisper:
      "Trig for SAT · 24 days. I'll back-plan from your June 14 test date and hit identities hard — that's the weak spot in your diagnostic.",
    whyPrompt:
      "Scholar projects always pair a topic with a measurable outcome — the second-best predictor of mastery (after time-on-task) is goal specificity.",
    defaultDaysPerWeek: 5,
    defaultMinutesPerDay: 30,
    defaultPrefs: ["practice", "worked", "summary"],
    defaultPaceCopy: "5 wk · 30 min/day · exam back-plan",
    samplePlan: {
      title: "Trigonometry — SAT Math sprint",
      headline: "Master the 6 trig sub-skills tested on the SAT in 24 days",
      summary:
        "Anchored to your syllabus and your precalc PDF. Identity drills are the diagnosed weak spot — we'll hit them in week 3.",
      metaChips: ["30 min × 5 days", "Jun 14 deadline", "3 sources", "≥ 700 SAT Math"],
      weeks: [
        {
          label: "Wk 1",
          date: "May 21–25",
          title: "Unit circle + radians (foundations)",
          methods: "hook · explain · drill",
        },
        {
          label: "Wk 2",
          date: "May 26–Jun 1",
          title: "Sine, cosine, tangent · graphs",
          methods: "interleave · worked twin",
        },
        {
          label: "Wk 3",
          date: "Jun 2–8",
          title: "Identities — your diagnosed weak spot",
          methods: "Socratic · spaced cards",
          highlight: true,
        },
        {
          label: "Wk 4",
          date: "Jun 9–13",
          title: "Mixed SAT-style practice + review",
          methods: "active recall · timed sprints",
        },
        {
          label: "Exam",
          date: "Jun 14",
          title: "SAT Math · trig subset · 12 questions",
          methods: "real test",
          dim: true,
        },
      ],
      methods: SHARED_METHODS,
      projection: {
        value: "720",
        unit: "SAT Math · trig section",
        note: "Beats your goal (≥700) by 20 — projection from diagnostic + plan adherence.",
      },
    },
  },
  adult: {
    slug: "adult",
    variant: "standard",
    operator: "You · Senior Engineer",
    question: "Which credential or skill are you chasing?",
    subhead:
      "We'll cluster the plan around your weakest domain and back-plan from your exam date — weekday-friendly.",
    placeholder: "e.g. AWS Solutions Architect Associate · System design L6",
    starters: [
      "☁️ AWS SAA-C03",
      "🔐 CISSP",
      "🤖 Andrew Ng deep-learning",
      "🏗 System design L6",
      "📊 SQL for analytics",
      "🎙 Public speaking",
    ],
    outcomeLabel: "Outcome",
    outcomeOptions: [
      "📜 Pass the cert exam",
      "💼 Interview-ready",
      "🏢 Apply at work next quarter",
      "🪜 Promo packet",
    ],
    tutorWhisper:
      "SAA-C03 · 5 weeks at 30 min/day. We'll cluster around your weakest domain — Networking, currently at 50% mastery.",
    whyPrompt:
      "Professional projects always have a credential or career artefact in mind — the plan is shaped by your real schedule, not an idealised one.",
    defaultDaysPerWeek: 5,
    defaultMinutesPerDay: 30,
    defaultPrefs: ["practice", "summary"],
    defaultPaceCopy: "5 wk · 30 min/day · weekday",
    samplePlan: {
      title: "AWS SAA-C03 — sprint to certified",
      headline: "Pass the SAA-C03 in 5 weeks · 30 min weekday cadence",
      summary:
        "Clustered around your weakest domain (VPC Networking · 50%). Practice exams every Friday, with timed sprints in the final week.",
      metaChips: ["30 min × 5 weekdays", "5 weeks", "VPC focus", "practice exams Fri"],
      weeks: [
        {
          label: "Wk 1",
          date: "May 21–25",
          title: "VPC fundamentals — subnets, route tables, NAT",
          methods: "explain · worked twin",
          highlight: true,
        },
        {
          label: "Wk 2",
          date: "May 28–Jun 1",
          title: "IAM, KMS, security best practice",
          methods: "drill · cite-the-doc",
        },
        {
          label: "Wk 3",
          date: "Jun 4–8",
          title: "Storage (S3, EBS, EFS) + cost models",
          methods: "compare-and-contrast",
        },
        {
          label: "Wk 4",
          date: "Jun 11–15",
          title: "High-availability + DR scenarios",
          methods: "case study · Socratic",
        },
        {
          label: "Wk 5",
          date: "Jun 18–22",
          title: "Full timed mocks + flag review",
          methods: "active recall · spaced",
        },
      ],
      methods: SHARED_METHODS,
      projection: {
        value: "82%",
        unit: "projected mock-exam score",
        note: "Above SAA-C03 cut score (72%). Strongest domain: Design Secure Architectures.",
      },
    },
  },
  senior: {
    slug: "senior",
    variant: "calm",
    operator: "You · in your own time",
    question: "What would you like to learn?",
    subhead: "Take your time. There's no rush. You can change your mind on the next step.",
    placeholder: "Try: spotting scam messages · texting grandkids · memory games",
    starters: [
      "🛡️ Spotting scam messages",
      "📱 Texting & photos",
      "🧠 Memory games",
      "💳 Online banking safety",
      "🌍 Email basics",
      "📞 Video calls",
    ],
    outcomeLabel: "How much each day",
    outcomeOptions: ["☕ 10 min · slow", "🌅 15 min · calm", "⏸ I'll pause often"],
    tutorWhisper:
      "A great one. We'll practice with real examples — short sessions, easy pace. You can pause any time.",
    whyPrompt:
      "Senior projects keep sessions short, calm, and tied to a real-world skill. Accessibility controls are surfaced in the wizard, not buried in settings.",
    defaultDaysPerWeek: 5,
    defaultMinutesPerDay: 10,
    defaultPrefs: ["video", "voice"],
    defaultPaceCopy: "Calm · 10 min · read-aloud on",
    samplePlan: {
      title: "Spotting scam messages",
      headline: "Practice with real examples — calm pace, short sessions",
      summary:
        "Real text-message and email examples from the BBB. We'll go slowly, with read-aloud and a simple yes / no check at each step.",
      metaChips: ["10 min/day", "read-aloud", "no time pressure"],
      weeks: [
        {
          label: "Day 1",
          date: "Today",
          title: "The 5 tells of a scam message",
          methods: "video · plain language",
        },
        {
          label: "Day 2",
          date: "Tomorrow",
          title: "Real examples — yes or no?",
          methods: "active recall · gentle",
        },
        {
          label: "Day 3",
          date: "Day 3",
          title: "What to do if you're not sure",
          methods: "scenario · safe-side rules",
        },
      ],
      methods: [
        { icon: "🎤", title: "Read-aloud", reason: "you listen, not strain your eyes" },
        { icon: "🪞", title: "Mirror practice", reason: "say it out loud once, you remember it" },
      ],
    },
  },
};

export function configFor(slug: WorldSlug): WizardConfig {
  return WIZARD_CONFIG[slug];
}
