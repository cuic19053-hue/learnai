"use client";

/**
 * Design Gallery — interactive index of every WikiTest screen.
 *
 * Mirrors the prototype at `WikiTest Gallery.html`:
 *   - Sidebar (280 px) grouped by section, with an "00/52" counter
 *     prefix on each tab.
 *   - Stage area renders the active screen inside a card.
 *   - Hash routing (#exam-focus) so screens can be deep-linked.
 *   - Keyboard nav: Left / Right arrow keys between screens.
 *
 * The component map starts empty and is populated batch by batch.
 * Screens not yet shipped render a "Coming in batch N" placeholder so
 * the gallery navigation works even before every screen lands.
 */

import { useEffect, useMemo, useState, type FC } from "react";
import { GALLERY, GALLERY_FLAT, GALLERY_TOTAL } from "@/lib/learn/gallery-screens";
import {
  ScholarHome,
  WikiHub,
  WikiDetail,
  WikiTrain,
  WikiExam,
  ExamFocusMode,
  WikiResults,
  WikiLibrary,
} from "@/components/learn/wikitest/wikitest-core";
import {
  MiloLetters,
  LetterForgeAdmin,
  OnboardingNew,
  MiloGamesHub,
  MiloNumbers,
  LittleLearnerHome,
  MiloLettersHome,
  MiloPlay,
  ParentAreaPreview,
} from "@/components/learn/wikitest/wikitest-little-learner";
import {
  CertificationsHub,
  CertSimulator,
  CertIngestion,
  CertWizardStep1,
  CertWizardStep2,
  CertWizardStep3,
  CertWizardStep4,
} from "@/components/learn/wikitest/wikitest-certs";
import {
  StoryForgeHome,
  QuestForgeHome,
  ProjectForgeHome,
  ScholarExamForge,
  CertForgeHome,
  SafetyForgeHome,
} from "@/components/learn/wikitest/wikitest-forges";
import { BuildersPortal } from "@/components/learn/wikitest/wikitest-builders-portal";
import {
  ForgePlan,
  ForgeGenerating,
  ForgeReady,
  ForgeQueue,
} from "@/components/learn/wikitest/wikitest-forge-wizard";
import {
  QHODetail,
  QHOTrain,
  QHOExam,
  QCDetail,
  QCTrain,
  QCExam,
  MoEDetail,
  MoETrain,
  MoEExam,
  DefenseHub,
  DeepStudy,
  MockDefense,
  DefenseReport,
  ProjectsHubScholar,
  ScholarWizardStep1,
  ScholarWizardStep2,
  ScholarWizardStep3,
  ScholarWizardStep4,
  WorldComparisonGrid,
  LittleLearnerParentWizard,
  SeniorWizard,
  AdminProviders,
  AddProviderModal,
  OllaBridgeConfig,
  GrokConfig,
  AdminRouting,
  AdminAudio,
  Admin3DAvatar,
  WikiGenerating,
} from "@/components/learn/wikitest/wikitest-rest";

/**
 * Component registry. Subsequent batches add entries here as they
 * land screens. Each entry is a plain function component (no props)
 * because the gallery only needs to render a self-contained preview.
 */
const REGISTRY: Record<string, FC> = {
  // Batch 2 — WikiTest core (8 screens)
  ScholarHome,
  WikiHub,
  WikiDetail,
  WikiTrain,
  WikiExam,
  ExamFocusMode,
  WikiResults,
  WikiLibrary,
  // Batch 3 — Certifications (7 screens)
  CertificationsHub,
  CertSimulator,
  CertIngestion,
  CertWizardStep1,
  CertWizardStep2,
  CertWizardStep3,
  CertWizardStep4,
  // Batch 4 — World Forge homes (6 screens)
  StoryForgeHome,
  QuestForgeHome,
  ProjectForgeHome,
  BuildersPortal,
  ScholarExamForge,
  CertForgeHome,
  SafetyForgeHome,
  // Batch 5 — Exam Forge wizard (4 screens)
  ForgePlan,
  ForgeGenerating,
  ForgeReady,
  ForgeQueue,
  // Batch 6 — Example domains (9 screens)
  QHODetail,
  QHOTrain,
  QHOExam,
  QCDetail,
  QCTrain,
  QCExam,
  MoEDetail,
  MoETrain,
  MoEExam,
  // Batch 7 — Thesis Defense (4 screens)
  DefenseHub,
  DeepStudy,
  MockDefense,
  DefenseReport,
  // Batch 8 — Project wizard variants (8 screens)
  ProjectsHubScholar,
  ScholarWizardStep1,
  ScholarWizardStep2,
  ScholarWizardStep3,
  ScholarWizardStep4,
  WorldComparisonGrid,
  LittleLearnerParentWizard,
  SeniorWizard,
  // Batch 9 — Admin · providers + audio + avatar (7 screens)
  AdminProviders,
  AddProviderModal,
  OllaBridgeConfig,
  GrokConfig,
  AdminRouting,
  AdminAudio,
  Admin3DAvatar,
  // Batch 10 — Appendix
  WikiGenerating,
  // Batch 11 — Little-Learner: Milo + LetterForge (5 screens)
  MiloLetters,
  LetterForgeAdmin,
  OnboardingNew,
  MiloGamesHub,
  MiloNumbers,
  // Batch — Little Learner 3-layer redesign + parent area
  LittleLearnerHome,
  MiloLettersHome,
  MiloPlay,
  ParentAreaPreview,
};

function PlaceholderScreen({ batch, comp }: { batch: number; comp: string }) {
  return (
    <div
      style={{
        width: 1280,
        minHeight: 720,
        display: "grid",
        placeItems: "center",
        background: "var(--surface-soft)",
      }}
    >
      <div style={{ textAlign: "center", color: "var(--ink-mute)", padding: 48 }}>
        <div className="la-mono" style={{ fontSize: 11, letterSpacing: ".08em", marginBottom: 8 }}>
          COMING IN BATCH {batch}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: "var(--ink)", marginBottom: 8 }}>
          Screen not yet ported
        </div>
        <div style={{ fontSize: 13, marginBottom: 16 }}>
          Component <code className="la-mono">{comp}</code> will land with the next batch of the
          frontend port.
        </div>
        <div style={{ fontSize: 12, maxWidth: 460, lineHeight: 1.6 }}>
          See <code className="la-mono">/tmp/design/extracted/learnai/project/</code> for the source
          JSX in the design handoff bundle.
        </div>
      </div>
    </div>
  );
}

export default function GalleryClient() {
  const [activeSlug, setActiveSlug] = useState<string>(() => {
    if (typeof window === "undefined") return GALLERY_FLAT[0]!.slug;
    const hash = window.location.hash.slice(1);
    return GALLERY_FLAT.find((f) => f.slug === hash)?.slug ?? GALLERY_FLAT[0]!.slug;
  });

  const idx = useMemo(
    () =>
      Math.max(
        0,
        GALLERY_FLAT.findIndex((f) => f.slug === activeSlug)
      ),
    [activeSlug]
  );
  const active = GALLERY_FLAT[idx] ?? GALLERY_FLAT[0]!;

  // Hash sync + keyboard nav
  useEffect(() => {
    const next = `#${activeSlug}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [activeSlug]);

  useEffect(() => {
    const go = (delta: number) => {
      const len = GALLERY_FLAT.length;
      const targetIdx = (idx + delta + len) % len;
      setActiveSlug(GALLERY_FLAT[targetIdx]!.slug);
    };
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [idx]);

  const Cmp = REGISTRY[active.comp];

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg)" }}
    >
      {/* Header */}
      <header
        style={{
          height: 56,
          padding: "0 18px",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
          background: "#fff",
          borderBottom: "1px solid var(--line)",
          boxShadow: "0 1px 0 rgba(15,20,48,.03)",
          zIndex: 5,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: "var(--brand-grad)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: 13,
              boxShadow: "0 4px 12px rgba(46,91,255,.25)",
            }}
          >
            L
          </span>
          <h1 style={{ margin: 0, fontSize: 14, fontWeight: 800, letterSpacing: "-0.01em" }}>
            Learn
            <span
              style={{
                background: "var(--brand-grad)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              AI
            </span>{" "}
            · Design Gallery
          </h1>
        </span>
        <span
          style={{
            padding: "4px 10px",
            borderRadius: 99,
            fontSize: 11,
            fontWeight: 700,
            background: "var(--bg-2)",
            color: "var(--ink-soft)",
          }}
        >
          {active.section}
        </span>

        <nav style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            onClick={() =>
              setActiveSlug(
                GALLERY_FLAT[(idx - 1 + GALLERY_FLAT.length) % GALLERY_FLAT.length]!.slug
              )
            }
            style={navBtnStyle}
            aria-label="Previous screen"
          >
            ← Prev
          </button>
          <span
            className="la-mono"
            style={{ fontSize: 11, color: "var(--ink-mute)", minWidth: 60, textAlign: "center" }}
          >
            {String(idx + 1).padStart(2, "0")} / {GALLERY_TOTAL}
          </span>
          <button
            type="button"
            onClick={() => setActiveSlug(GALLERY_FLAT[(idx + 1) % GALLERY_FLAT.length]!.slug)}
            style={navBtnStyle}
            aria-label="Next screen"
          >
            Next →
          </button>
        </nav>
      </header>

      {/* Body */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "280px 1fr", minHeight: 0 }}>
        {/* Sidebar */}
        <aside
          style={{
            overflowY: "auto",
            padding: "14px 12px",
            background: "var(--surface-soft)",
            borderRight: "1px solid var(--line)",
          }}
        >
          {GALLERY.map((sec) => (
            <div key={sec.title}>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: "var(--ink-mute)",
                  letterSpacing: "0.08em",
                  padding: "14px 10px 6px",
                }}
              >
                {sec.title.toUpperCase()}
              </div>
              {sec.screens.map((sc) => {
                const flatIdx = GALLERY_FLAT.findIndex((f) => f.slug === sc.slug);
                const isActive = sc.slug === activeSlug;
                return (
                  <button
                    key={sc.slug}
                    type="button"
                    onClick={() => setActiveSlug(sc.slug)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      width: "100%",
                      textAlign: "left",
                      border: "none",
                      background: isActive ? "var(--brand-grad)" : "transparent",
                      color: isActive ? "#fff" : "var(--ink-soft)",
                      fontWeight: isActive ? 700 : 400,
                      padding: "8px 10px",
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontFamily: "inherit",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      className="la-mono"
                      style={{ fontSize: 10, opacity: isActive ? 0.9 : 0.7, minWidth: 22 }}
                    >
                      {String(flatIdx + 1).padStart(2, "0")}
                    </span>
                    <span>{sc.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </aside>

        {/* Stage */}
        <div
          style={{
            overflow: "auto",
            background: "linear-gradient(135deg, var(--bg-2) 0%, var(--bg) 100%)",
            padding: 24,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 14,
              boxShadow: "0 20px 60px rgba(15,20,48,.12), 0 2px 6px rgba(15,20,48,.04)",
              overflow: "hidden",
            }}
          >
            {Cmp ? <Cmp /> : <PlaceholderScreen batch={active.batch} comp={active.comp} />}
          </div>
        </div>
      </div>
    </div>
  );
}

const navBtnStyle: React.CSSProperties = {
  border: "1px solid var(--line)",
  background: "#fff",
  cursor: "pointer",
  padding: "6px 12px",
  borderRadius: 8,
  fontFamily: "inherit",
  fontSize: 12,
  fontWeight: 600,
  color: "var(--ink-soft)",
};
