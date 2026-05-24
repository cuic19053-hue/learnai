/**
 * The Design Gallery's full catalogue — 52 screens across 11 sections,
 * mirroring the handoff bundle's `WikiTest Gallery.html`.
 *
 * Each entry is decoupled from its implementation: a screen's `comp`
 * key is looked up at render time against a `Record<string, FC>` the
 * gallery's client component owns. That keeps this file pure data and
 * lets us land screens batch-by-batch without re-shaping the catalog.
 *
 * The `slug` for each entry doubles as the URL hash on /admin/design-
 * gallery (e.g. /admin/design-gallery#exam-focus) so individual screens
 * can be shared.
 */

export type GalleryScreen = {
  /** URL hash + React key. */
  slug: string;
  /** Sidebar label. Mirrors the design bundle exactly. */
  label: string;
  /** Component lookup key. The client provides the actual FC at runtime. */
  comp: string;
  /** Batch number (1-10) that ships this screen. Used to render a
   *  "Coming in batch N" placeholder when the comp isn't registered yet. */
  batch: number;
};

export type GallerySection = {
  /** Section heading shown in the sidebar. */
  title: string;
  screens: GalleryScreen[];
};

export const GALLERY: GallerySection[] = [
  {
    title: "Start",
    screens: [
      {
        slug: "home",
        label: "0 · Scholar Home (where WikiTest lives)",
        comp: "ScholarHome",
        batch: 2,
      },
    ],
  },
  {
    title: "WikiTest core",
    screens: [
      { slug: "hub", label: "1 · WikiTest landing (simplified)", comp: "WikiHub", batch: 2 },
      {
        slug: "detail",
        label: "2 · Test ready — Differential equation",
        comp: "WikiDetail",
        batch: 2,
      },
      { slug: "train", label: "3 · Train mode — Loop · tutor chat", comp: "WikiTrain", batch: 2 },
      { slug: "exam", label: "4 · Exam in progress", comp: "WikiExam", batch: 2 },
      {
        slug: "exam-focus",
        label: "⛶ Focus mode · distraction-free exam",
        comp: "ExamFocusMode",
        batch: 2,
      },
      { slug: "results", label: "5 · Readiness report", comp: "WikiResults", batch: 2 },
      { slug: "library", label: "6 · Your WikiTest library", comp: "WikiLibrary", batch: 2 },
    ],
  },
  {
    title: "Certifications · vendor-cited exam simulator",
    screens: [
      {
        slug: "cert-hub",
        label: "Certifications hub · AWS · Azure · GCP · IBM",
        comp: "CertificationsHub",
        batch: 3,
      },
      {
        slug: "cert-sim",
        label: "Simulator · SAA-C03 · cited explanation",
        comp: "CertSimulator",
        batch: 3,
      },
      {
        slug: "cert-ing",
        label: "Sources databank · ingestion + chunking",
        comp: "CertIngestion",
        batch: 3,
      },
      {
        slug: "cert-w1",
        label: "+ Add cert · Step 1 · Vendor + metadata",
        comp: "CertWizardStep1",
        batch: 3,
      },
      {
        slug: "cert-w2",
        label: "+ Add cert · Step 2 · Sources (URLs)",
        comp: "CertWizardStep2",
        batch: 3,
      },
      {
        slug: "cert-w3",
        label: "+ Add cert · Step 3 · Generation config",
        comp: "CertWizardStep3",
        batch: 3,
      },
      {
        slug: "cert-w4",
        label: "+ Add cert · Step 4 · Preview & publish",
        comp: "CertWizardStep4",
        batch: 3,
      },
    ],
  },
  {
    title: "World-specific Forge homes · one per audience",
    screens: [
      {
        slug: "forge-story",
        label: "Little Learner · StoryForge",
        comp: "StoryForgeHome",
        batch: 4,
      },
      { slug: "forge-quest", label: "Explorer · QuestForge", comp: "QuestForgeHome", batch: 4 },
      {
        slug: "forge-project",
        label: "Builder · ProjectForge",
        comp: "ProjectForgeHome",
        batch: 4,
      },
      {
        slug: "forge-exam",
        label: "Scholar · ExamForge (flagship)",
        comp: "ScholarExamForge",
        batch: 4,
      },
      { slug: "forge-cert", label: "Professional · CertForge", comp: "CertForgeHome", batch: 4 },
      { slug: "forge-safety", label: "Senior · SafetyForge", comp: "SafetyForgeHome", batch: 4 },
    ],
  },
  {
    title: "Little Learner · Milo + LetterForge",
    screens: [
      {
        slug: "milo-letters",
        label: "Milo Letters · multi-lang trace (tablet)",
        comp: "MiloLetters",
        batch: 11,
      },
      {
        slug: "letterforge-admin",
        label: "LetterForge · admin (glyphs + langs + scoring)",
        comp: "LetterForgeAdmin",
        batch: 11,
      },
      {
        slug: "onboarding-new",
        label: "Onboarding · 3 steps · routes to Milo Letters",
        comp: "OnboardingNew",
        batch: 11,
      },
      {
        slug: "milo-games",
        label: "Milo Games hub · 8 mini-games",
        comp: "MiloGamesHub",
        batch: 11,
      },
      {
        slug: "milo-numbers",
        label: "Milo Numbers · count the apples",
        comp: "MiloNumbers",
        batch: 11,
      },
    ],
  },
  {
    title: "Little Learner · 3-layer redesign",
    screens: [
      {
        slug: "ll-home",
        label: "Layer 1 · Little Learner Home (today + areas)",
        comp: "LittleLearnerHome",
        batch: 12,
      },
      {
        slug: "ll-letters",
        label: "Layer 2 · Milo Letters home",
        comp: "MiloLettersHome",
        batch: 12,
      },
      {
        slug: "ll-play",
        label: "Layer 3 · Milo Play · Park A",
        comp: "MiloPlay",
        batch: 12,
      },
      {
        slug: "ll-parent",
        label: "Parent area · hold-2s locked",
        comp: "ParentAreaPreview",
        batch: 12,
      },
    ],
  },
  {
    title: "Exam Forge · real-time synthetic question wizard",
    screens: [
      { slug: "forge-plan", label: "Forge · Step 1 · Plan & sources", comp: "ForgePlan", batch: 5 },
      {
        slug: "forge-gen",
        label: "Forge · Step 2 · Generating LIVE",
        comp: "ForgeGenerating",
        batch: 5,
      },
      {
        slug: "forge-ready",
        label: "Forge · Step 3 · Ready — start learning",
        comp: "ForgeReady",
        batch: 5,
      },
      { slug: "forge-queue", label: "Forge · Library of forges", comp: "ForgeQueue", batch: 5 },
    ],
  },
  {
    title: "Example 2 · Quantum harmonic oscillator",
    screens: [
      {
        slug: "qho-detail",
        label: "QHO · Test ready (Physics · advanced)",
        comp: "QHODetail",
        batch: 6,
      },
      { slug: "qho-train", label: "QHO · Train · ladder operators", comp: "QHOTrain", batch: 6 },
      { slug: "qho-exam", label: "QHO · Exam · number operator", comp: "QHOExam", batch: 6 },
    ],
  },
  {
    title: "Example 3 · Quantum computing",
    screens: [
      {
        slug: "qc-detail",
        label: "QC · Test ready (CS · intermediate)",
        comp: "QCDetail",
        batch: 6,
      },
      {
        slug: "qc-train",
        label: "QC · Train · quantum gates + circuit",
        comp: "QCTrain",
        batch: 6,
      },
      { slug: "qc-exam", label: "QC · Exam · Bell-state circuit MCQ", comp: "QCExam", batch: 6 },
    ],
  },
  {
    title: "Example 4 · Mixture of experts",
    screens: [
      {
        slug: "moe-detail",
        label: "MoE · Test ready (ML · advanced)",
        comp: "MoEDetail",
        batch: 6,
      },
      { slug: "moe-train", label: "MoE · Train · routing diagram", comp: "MoETrain", batch: 6 },
      {
        slug: "moe-exam",
        label: "MoE · Exam · load-imbalance + free-response",
        comp: "MoEExam",
        batch: 6,
      },
    ],
  },
  {
    title: "Example 5 · Thesis Defense (PhD / Master)",
    screens: [
      { slug: "def-hub", label: "Defense Hub · multi-source kit", comp: "DefenseHub", batch: 7 },
      { slug: "def-study", label: "Deep Study · Socratic + Feynman", comp: "DeepStudy", batch: 7 },
      {
        slug: "def-mock",
        label: "Mock Defense · 3-panel committee",
        comp: "MockDefense",
        batch: 7,
      },
      {
        slug: "def-report",
        label: "Readiness Report · transcript-grounded",
        comp: "DefenseReport",
        batch: 7,
      },
    ],
  },
  {
    title: "Project creation wizard",
    screens: [
      {
        slug: "wiz-trigger",
        label: "Trigger · Projects page",
        comp: "ProjectsHubScholar",
        batch: 8,
      },
      {
        slug: "wiz-s1",
        label: "Scholar · Step 1 · Topic + Outcome",
        comp: "ScholarWizardStep1",
        batch: 8,
      },
      { slug: "wiz-s2", label: "Scholar · Step 2 · Sources", comp: "ScholarWizardStep2", batch: 8 },
      {
        slug: "wiz-s3",
        label: "Scholar · Step 3 · Pace + Format",
        comp: "ScholarWizardStep3",
        batch: 8,
      },
      {
        slug: "wiz-s4",
        label: "Scholar · Step 4 · AI plan preview",
        comp: "ScholarWizardStep4",
        batch: 8,
      },
      {
        slug: "wiz-cmp",
        label: "Six audiences · same Step 1",
        comp: "WorldComparisonGrid",
        batch: 8,
      },
      {
        slug: "wiz-little",
        label: "Little Learner · parent-led setup",
        comp: "LittleLearnerParentWizard",
        batch: 8,
      },
      {
        slug: "wiz-senior",
        label: "Senior · calm, large-text variant",
        comp: "SeniorWizard",
        batch: 8,
      },
    ],
  },
  {
    title: "Admin · AI providers + audio + 3D avatars",
    screens: [
      {
        slug: "adm-prov",
        label: "AI Providers · OllaBridge default",
        comp: "AdminProviders",
        batch: 9,
      },
      { slug: "adm-add", label: "Add Provider · picker modal", comp: "AddProviderModal", batch: 9 },
      {
        slug: "adm-ollab",
        label: "OllaBridge · device pairing",
        comp: "OllaBridgeConfig",
        batch: 9,
      },
      { slug: "adm-grok", label: "xAI Grok · free $25 credits", comp: "GrokConfig", batch: 9 },
      {
        slug: "adm-routing",
        label: "Routing & Policy · fallback + caps",
        comp: "AdminRouting",
        batch: 9,
      },
      { slug: "adm-audio", label: "Audio · Text-to-Voice + STT", comp: "AdminAudio", batch: 9 },
      { slug: "adm-avatar", label: "3D Avatar · settings only", comp: "Admin3DAvatar", batch: 9 },
    ],
  },
  {
    title: "Appendix",
    screens: [
      {
        slug: "pipeline",
        label: "Under-the-hood · WikiTest pipeline",
        comp: "WikiGenerating",
        batch: 10,
      },
    ],
  },
];

export const GALLERY_FLAT: Array<GalleryScreen & { section: string }> = GALLERY.flatMap((s) =>
  s.screens.map((sc) => ({ ...sc, section: s.title }))
);

/** Total screen count, exposed for the Gallery counter chip. */
export const GALLERY_TOTAL = GALLERY_FLAT.length;
