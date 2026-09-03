/**
 * Remaining gallery screens (Batches 6-10, 31 screens).
 *
 *   Batch 6 — Example domains (9 screens · QHO + QC + MoE)
 *   Batch 7 — Thesis defense (4 screens)
 *   Batch 8 — Project wizard variants (8 screens)
 *   Batch 9 — Admin · providers + audio + avatar (7 screens)
 *   Batch 10 — Appendix: under-the-hood pipeline (1 screen)
 *
 * To keep this batch shippable, each screen is a compact-but-faithful
 * port that captures the design intent (key cards, copy, layout) of
 * its source JSX prototype. The shared chrome (`SidebarShell`,
 * `Icon`) from batch 1 wraps every page.
 */

"use client";

import { LATopBar, LASidebar, WTBreadcrumb } from "@/components/learn/shared/SidebarShell";
import { Icon } from "@/components/learn/shared/wikitest-icons";

// ─── Generic page skeleton used across the rest of the gallery ────

function PageShell({
  trail,
  world = "GRADE_9",
  teacher = "Mentor Max",
  teacherIcon = "🎓",
  avatarBg = "#7c3aed",
  initials = "J",
  children,
}: {
  trail: string[];
  world?: "GRADE_9" | "Professional" | "GRADE_8" | "Playful";
  teacher?: string;
  teacherIcon?: string;
  avatarBg?: string;
  initials?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="wt-shell" style={{ width: 1280, minHeight: 900 }}>
      <LATopBar world={world} streak={1} xp={45} initials={initials} avatarBg={avatarBg} />
      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: 836 }}>
        <LASidebar active="WikiTest" teacherName={teacher} teacherIcon={teacherIcon} />
        <main>
          <WTBreadcrumb trail={trail} />
          {children}
        </main>
      </div>
    </div>
  );
}

function DemoCard({
  title,
  body,
  accent,
}: {
  title: string;
  body: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="la-card" style={{ padding: 24, borderLeft: `4px solid ${accent}` }}>
      <div
        className="la-mono"
        style={{ fontSize: 10, color: accent, letterSpacing: ".08em", fontWeight: 800 }}
      >
        {title.toUpperCase()}
      </div>
      <div style={{ marginTop: 8 }}>{body}</div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Batch 6 · Example domains (9 screens)
// ───────────────────────────────────────────────────────────────────

export function QHODetail() {
  return (
    <PageShell trail={["GRADE_9", "WikiTest", "Quantum harmonic oscillator"]}>
      <section style={{ padding: "32px 28px", maxWidth: 920, margin: "0 auto" }}>
        <span
          className="la-pill"
          style={{ background: "var(--s-physics-bg)", color: "var(--s-physics)" }}
        >
          ⚛ Physics · advanced
        </span>
        <h1
          className="la-serif"
          style={{ fontSize: 42, fontWeight: 800, margin: "12px 0 8px", letterSpacing: "-0.02em" }}
        >
          Quantum harmonic oscillator
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 14.5,
            lineHeight: 1.55,
            maxWidth: 720,
            margin: "0 0 20px",
          }}
        >
          The QHO is the bridge between classical springs and quantum reality — and the model behind
          everything from molecular vibrations to quantum field theory.
        </p>
        <DemoCard
          accent="var(--s-physics)"
          title="You will learn"
          body={
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
              <li>The ladder operator algebra (â, â†) and number operator</li>
              <li>Energy spectrum: E_n = ℏω(n + ½)</li>
              <li>Hermite polynomials and ground-state wavefunction</li>
              <li>Connection to phonons, photons, and second quantization</li>
            </ul>
          }
        />
        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button className="la-btn">
            <Icon.brain /> Learn first
          </button>
          <button className="la-btn ghost">
            <Icon.bolt /> Take test now
          </button>
        </div>
      </section>
    </PageShell>
  );
}

export function QHOTrain() {
  return (
    <PageShell trail={["GRADE_9", "WikiTest", "QHO", "Train"]}>
      <section style={{ padding: "28px 36px", maxWidth: 980, margin: "0 auto" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          SECTION 03 / 06 · LADDER OPERATORS
        </div>
        <h2
          className="la-serif"
          style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.3, margin: "0 0 16px" }}
        >
          The ladder operator trick
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "var(--ink-soft)" }}>
          Define{" "}
          <span className="la-serif" style={{ fontStyle: "italic" }}>
            â = (1/√(2mℏω))(mωx + ip)
          </span>
          . Then{" "}
          <span className="la-serif" style={{ fontStyle: "italic" }}>
            â |n⟩ = √n |n−1⟩
          </span>{" "}
          lowers by one quantum and{" "}
          <span className="la-serif" style={{ fontStyle: "italic" }}>
            ↠|n⟩ = √(n+1) |n+1⟩
          </span>{" "}
          raises by one.
        </p>
        <div className="wt-math" style={{ display: "block", marginTop: 18, fontSize: 22 }}>
          [â, â†] = 1 &nbsp;&nbsp; Ĥ = ℏω(N̂ + ½) &nbsp;&nbsp; N̂ = â†â
        </div>
        <div
          className="la-card"
          style={{ marginTop: 18, padding: 16, background: "var(--surface-soft)" }}
        >
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--brand-1)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            CHECK-IN
          </div>
          <p style={{ fontSize: 14, fontWeight: 700, margin: "8px 0 12px" }}>
            What does N̂ measure?
          </p>
          {[
            { k: "A", t: "Quantum number n (excitation level)", sel: true },
            { k: "B", t: "Energy of the ground state" },
            { k: "C", t: "Hermite-polynomial degree" },
          ].map((o) => (
            <div
              key={o.k}
              className={"wt-mcq" + (o.sel ? " selected" : "")}
              style={{ marginTop: 6 }}
            >
              <span className="key">{o.k}</span>
              <span>{o.t}</span>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function QHOExam() {
  return (
    <PageShell trail={["GRADE_9", "WikiTest", "QHO", "Exam"]}>
      <section style={{ padding: "32px 36px", maxWidth: 880, margin: "0 auto" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
          }}
        >
          QUESTION 07 / 10 · SHORT ANSWER · 2 PTS
        </div>
        <h2
          className="la-serif"
          style={{ fontSize: 26, fontWeight: 700, lineHeight: 1.35, margin: "10px 0 16px" }}
        >
          State the eigenvalues of the number operator N̂ and prove they are non-negative integers.
        </h2>
        <div
          style={{
            border: "1.5px solid var(--brand-1)",
            borderRadius: 16,
            padding: 16,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 17,
            color: "var(--ink)",
            minHeight: 160,
          }}
        >
          N̂|n⟩ = n|n⟩ for n = 0, 1, 2, …<br />
          Since N̂ = â†â and ⟨n|N̂|n⟩ = ⟨n|â†â|n⟩ = ‖â|n⟩‖² ≥ 0, all eigenvalues n ≥ 0.
        </div>
      </section>
    </PageShell>
  );
}

export function QCDetail() {
  return (
    <PageShell
      trail={["GRADE_8", "WikiTest", "Quantum computing"]}
      world="GRADE_8"
      teacher="Nova"
      teacherIcon="⚡"
      avatarBg="#7c3aed"
    >
      <section style={{ padding: "32px 28px", maxWidth: 920, margin: "0 auto" }}>
        <span className="la-pill" style={{ background: "var(--s-cs-bg)", color: "var(--s-cs)" }}>
          💻 Computer Science · intermediate
        </span>
        <h1
          className="la-serif"
          style={{ fontSize: 42, fontWeight: 800, margin: "12px 0 8px", letterSpacing: "-0.02em" }}
        >
          Quantum computing
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.55, maxWidth: 720 }}>
          Qubits, gates, and the algorithms that make a quantum computer beat its classical
          counterpart on certain problems.
        </p>
        <DemoCard
          accent="var(--s-cs)"
          title="You will learn"
          body={
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
              <li>Qubits, superposition, and the Bloch sphere</li>
              <li>Single-qubit gates: X, Y, Z, H</li>
              <li>Two-qubit gates: CNOT and entanglement</li>
              <li>The Bell-state circuit and how to read one</li>
            </ul>
          }
        />
      </section>
    </PageShell>
  );
}

export function QCTrain() {
  return (
    <PageShell
      trail={["GRADE_8", "WikiTest", "QC", "Train"]}
      world="GRADE_8"
      teacher="Nova"
      teacherIcon="⚡"
      avatarBg="#7c3aed"
    >
      <section style={{ padding: "28px 36px", maxWidth: 980, margin: "0 auto" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
            fontWeight: 700,
          }}
        >
          SECTION 04 / 06 · QUANTUM GATES + CIRCUITS
        </div>
        <h2 className="la-serif" style={{ fontSize: 26, fontWeight: 700, margin: "10px 0 12px" }}>
          Bell circuit step-by-step
        </h2>
        <p style={{ fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-soft)" }}>
          Apply <b>H</b> to the first qubit, then <b>CNOT</b> with first as control. The output is a
          maximally entangled Bell state.
        </p>
        <div
          className="la-card"
          style={{
            marginTop: 18,
            padding: 18,
            background: "var(--surface-soft)",
            fontFamily: "var(--font-mono)",
            fontSize: 14,
          }}
        >
          <pre style={{ margin: 0, lineHeight: 1.6 }}>{`q0 ─[H]─■──
        │
q1 ─────⊕──

|00⟩ → (|00⟩ + |11⟩)/√2     (Bell state)`}</pre>
        </div>
      </section>
    </PageShell>
  );
}

export function QCExam() {
  return (
    <PageShell
      trail={["GRADE_8", "WikiTest", "QC", "Exam"]}
      world="GRADE_8"
      teacher="Nova"
      teacherIcon="⚡"
      avatarBg="#7c3aed"
    >
      <section style={{ padding: "32px 36px", maxWidth: 880, margin: "0 auto" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
          }}
        >
          QUESTION 04 / 10 · MCQ · 1 PT
        </div>
        <h2
          className="la-serif"
          style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.4, margin: "10px 0 16px" }}
        >
          The Bell circuit applies H to q0 then CNOT(q0 → q1). What is the output state from |00⟩?
        </h2>
        {[
          { k: "A", t: "(|00⟩ + |11⟩)/√2", sel: true },
          { k: "B", t: "(|01⟩ + |10⟩)/√2" },
          { k: "C", t: "(|00⟩ − |11⟩)/√2" },
          { k: "D", t: "|11⟩" },
        ].map((o) => (
          <div key={o.k} className={"wt-mcq" + (o.sel ? " selected" : "")} style={{ marginTop: 8 }}>
            <span className="key">{o.k}</span>
            <span>{o.t}</span>
          </div>
        ))}
      </section>
    </PageShell>
  );
}

export function MoEDetail() {
  return (
    <PageShell
      trail={["Professional", "WikiTest", "Mixture of experts"]}
      world="Professional"
      teacher="Prof. Turing"
      teacherIcon="💼"
      avatarBg="#0f766e"
      initials="R"
    >
      <section style={{ padding: "32px 28px", maxWidth: 920, margin: "0 auto" }}>
        <span className="la-pill" style={{ background: "var(--s-cs-bg)", color: "var(--s-cs)" }}>
          🤖 Machine Learning · advanced
        </span>
        <h1
          className="la-serif"
          style={{ fontSize: 42, fontWeight: 800, margin: "12px 0 8px", letterSpacing: "-0.02em" }}
        >
          Mixture of experts (MoE)
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14.5, lineHeight: 1.55, maxWidth: 720 }}>
          A routing network sends each input to a small number of expert sub-networks. Used in
          modern LLMs (Mixtral, GShard, Switch) to scale parameter count without scaling FLOPs.
        </p>
        <DemoCard
          accent="var(--s-cs)"
          title="You will learn"
          body={
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
              <li>Router + top-k gating</li>
              <li>Load-balancing loss (auxiliary loss)</li>
              <li>Sparse vs dense MoE trade-offs</li>
              <li>Why Mixtral 8x7B beats Llama 2 70B at less inference cost</li>
            </ul>
          }
        />
      </section>
    </PageShell>
  );
}

export function MoETrain() {
  return (
    <PageShell
      trail={["Professional", "WikiTest", "MoE", "Train"]}
      world="Professional"
      teacher="Prof. Turing"
      teacherIcon="💼"
      avatarBg="#0f766e"
      initials="R"
    >
      <section style={{ padding: "28px 36px", maxWidth: 980, margin: "0 auto" }}>
        <h2 className="la-serif" style={{ fontSize: 24, fontWeight: 700, margin: "0 0 14px" }}>
          The routing diagram
        </h2>
        <div
          className="la-card"
          style={{
            padding: 22,
            background: "var(--surface-soft)",
            fontFamily: "var(--font-mono)",
            fontSize: 13.5,
          }}
        >
          <pre
            style={{ margin: 0, lineHeight: 1.6 }}
          >{`token ──► gate (softmax) ──► top-2 experts (E2, E5)
                                  │
                                  ▼
                       weighted sum of expert outputs
                                  │
                                  ▼
                            next layer`}</pre>
        </div>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginTop: 16 }}>
          The auxiliary <b>load-balancing loss</b> penalises overuse of any one expert — without it,
          the router collapses to a single expert and the rest die. The loss is added to the
          language-model objective during training.
        </p>
      </section>
    </PageShell>
  );
}

export function MoEExam() {
  return (
    <PageShell
      trail={["Professional", "WikiTest", "MoE", "Exam"]}
      world="Professional"
      teacher="Prof. Turing"
      teacherIcon="💼"
      avatarBg="#0f766e"
      initials="R"
    >
      <section style={{ padding: "32px 36px", maxWidth: 880, margin: "0 auto" }}>
        <div
          className="la-mono"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
          }}
        >
          QUESTION 06 / 10 · FREE RESPONSE · 3 PTS
        </div>
        <h2 className="la-serif" style={{ fontSize: 24, fontWeight: 700, margin: "10px 0 16px" }}>
          Your MoE model collapses to using one expert for every input. Explain why this happens and
          what auxiliary objective fixes it.
        </h2>
        <textarea
          rows={8}
          placeholder="Write your answer…"
          style={{
            width: "100%",
            padding: 14,
            borderRadius: 12,
            border: "1.5px solid var(--brand-1)",
            fontFamily: "inherit",
            fontSize: 14,
            background: "var(--surface-soft)",
            lineHeight: 1.55,
            resize: "vertical",
          }}
        />
      </section>
    </PageShell>
  );
}

// ───────────────────────────────────────────────────────────────────
// Batch 7 · Thesis Defense (4 screens)
// ───────────────────────────────────────────────────────────────────

export function DefenseHub() {
  return (
    <PageShell trail={["University", "Defense Hub"]}>
      <section style={{ padding: "32px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <span className="la-pill" style={{ background: "var(--brand-grad)", color: "#fff" }}>
          ⚜ THESIS DEFENSE · PHD / MASTER
        </span>
        <h1
          className="la-serif"
          style={{ fontSize: 36, fontWeight: 800, margin: "12px 0 6px", letterSpacing: "-0.02em" }}
        >
          A 3-panel committee, on demand.
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 15,
            lineHeight: 1.6,
            margin: "0 0 22px",
            maxWidth: 720,
          }}
        >
          Upload your thesis chapters, papers you cite, and any rebuttal notes. We assemble a domain
          expert, a methods chair, and a devil's advocate. Run a Socratic deep study, then a mock
          defense, then a transcript-grounded readiness report.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            {
              ic: "🔬",
              t: "Deep Study (Socratic + Feynman)",
              s: "Drill chapter by chapter with the methods chair.",
            },
            {
              ic: "🎙",
              t: "Mock Defense (3-panel committee)",
              s: "Live 30-minute Q&A with three personas.",
            },
            {
              ic: "📋",
              t: "Readiness Report (transcript-grounded)",
              s: "Per-chapter coverage, weak areas, suggested rehearsals.",
            },
          ].map((c) => (
            <div key={c.t} className="la-card" style={{ padding: 18 }}>
              <div style={{ fontSize: 28 }}>{c.ic}</div>
              <div style={{ fontSize: 15, fontWeight: 800, marginTop: 8 }}>{c.t}</div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--ink-soft)",
                  margin: "6px 0 0",
                  lineHeight: 1.55,
                }}
              >
                {c.s}
              </p>
            </div>
          ))}
        </div>

        <div className="la-card" style={{ padding: 18, marginTop: 22 }}>
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            SOURCE KIT
          </div>
          <div
            style={{ marginTop: 10, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
          >
            {[
              "thesis-v3.pdf (124 p)",
              "chapter4-revisions.docx",
              "reviewer-1-comments.pdf",
              "Tang et al. 2024 (cited)",
              "Smith 2021 (cited)",
              "lab-notebook-2025.md",
            ].map((s) => (
              <div
                key={s}
                className="la-mono"
                style={{
                  padding: "8px 10px",
                  background: "var(--surface-soft)",
                  borderRadius: 8,
                  fontSize: 11.5,
                }}
              >
                📄 {s}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function DeepStudy() {
  return (
    <PageShell trail={["University", "Defense", "Deep Study"]}>
      <section style={{ padding: "28px 28px", maxWidth: 980, margin: "0 auto" }}>
        <h2 className="la-serif" style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px" }}>
          Chapter 4 — Methods · Socratic deep study
        </h2>
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)", margin: "0 0 18px" }}>
          The methods chair drills you with hardest-question-first. Use the Feynman pad to explain
          like you would to a first-year grad student.
        </p>
        <div className="la-card" style={{ padding: 18, background: "var(--surface-soft)" }}>
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--brand-1)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            METHODS CHAIR · DR. RAO
          </div>
          <p style={{ fontSize: 15, fontWeight: 700, margin: "8px 0 14px" }}>
            Your sample of n=148 is small for a multi-arm comparison. Defend the statistical power
            calculation and the choice of post-hoc test.
          </p>
          <textarea
            rows={6}
            placeholder="Explain like you're talking to a first-year grad student…"
            style={{
              width: "100%",
              padding: 14,
              borderRadius: 12,
              border: "1.5px solid var(--brand-1)",
              fontFamily: "inherit",
              fontSize: 14,
              background: "#fff",
              lineHeight: 1.55,
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <button className="la-btn">
              <Icon.spark /> Submit answer
            </button>
            <button className="la-btn ghost">Mark as "unsure" · skip for now</button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

export function MockDefense() {
  return (
    <PageShell trail={["University", "Defense", "Mock Defense"]}>
      <section style={{ padding: "26px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 22 }}>
          <div>
            <div
              className="la-mono"
              style={{ fontSize: 10, color: "var(--bad)", letterSpacing: ".08em", fontWeight: 800 }}
            >
              ● LIVE · 14:22 / 30:00
            </div>
            <h2
              className="la-serif"
              style={{ fontSize: 22, fontWeight: 700, margin: "8px 0 16px" }}
            >
              Round 4 of 8 — Devil's advocate asks…
            </h2>
            <div
              className="la-card"
              style={{ padding: 18, background: "#fef2f2", borderLeft: "4px solid var(--bad)" }}
            >
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--bad)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                }}
              >
                DEVIL'S ADVOCATE · DR. NDIAYE
              </div>
              <p style={{ fontSize: 15, fontWeight: 700, margin: "8px 0 0", lineHeight: 1.5 }}>
                "If your method only wins by 1.2% over the baseline and the confidence interval
                crosses zero, why should the committee believe this is a contribution rather than
                noise?"
              </p>
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button className="la-btn">🎙 Record answer</button>
              <button className="la-btn ghost">Type instead</button>
              <button className="la-btn ghost">⏭ Defer · ask another panelist</button>
            </div>
          </div>
          <aside>
            <div className="la-card" style={{ padding: 14 }}>
              <div
                className="la-mono"
                style={{
                  fontSize: 10,
                  color: "var(--ink-mute)",
                  letterSpacing: ".08em",
                  fontWeight: 800,
                }}
              >
                COMMITTEE
              </div>
              {[
                { n: "Dr. Saito", role: "Domain expert", state: "asked" },
                { n: "Dr. Rao", role: "Methods chair", state: "asked" },
                { n: "Dr. Ndiaye", role: "Devil's advocate", state: "asking" },
              ].map((c) => (
                <div
                  key={c.n}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0" }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 99,
                      background: c.state === "asking" ? "var(--bad-bg)" : "var(--bg-2)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                    }}
                  >
                    {c.n.split(" ")[1]![0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{c.n}</div>
                    <div className="la-mono" style={{ fontSize: 10.5, color: "var(--ink-mute)" }}>
                      {c.role.toUpperCase()}
                    </div>
                  </div>
                  {c.state === "asking" ? (
                    <span
                      className="la-pill"
                      style={{ background: "var(--bad-bg)", color: "var(--bad)", fontSize: 10 }}
                    >
                      ASKING
                    </span>
                  ) : (
                    <Icon.check color="var(--ok)" />
                  )}
                </div>
              ))}
            </div>
            <div className="la-card" style={{ padding: 14, marginTop: 12 }}>
              <div
                className="la-mono"
                style={{ fontSize: 10, color: "var(--ink-mute)", letterSpacing: ".08em" }}
              >
                TRANSCRIPT
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  color: "var(--ink-soft)",
                  lineHeight: 1.5,
                  marginTop: 6,
                  fontFamily: "var(--font-mono)",
                }}
              >
                14:21 candidate: …confidence intervals overlap zero in only two of six runs…
                <br />
                14:18 candidate: …multiple-testing correction was Holm-Bonferroni…
                <br />
                14:11 chair: …expand on n=148 sample size choice…
              </div>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
}

export function DefenseReport() {
  return (
    <PageShell trail={["University", "Defense", "Readiness Report"]}>
      <section style={{ padding: "28px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            padding: "26px 28px",
            borderRadius: 22,
            color: "#fff",
            background: "linear-gradient(135deg, #16a34a 0%, #0f766e 100%)",
            marginBottom: 20,
          }}
        >
          <div className="la-mono" style={{ fontSize: 11, opacity: 0.85, letterSpacing: ".08em" }}>
            READINESS · TRANSCRIPT-GROUNDED
          </div>
          <h1 className="la-serif" style={{ fontSize: 30, fontWeight: 800, margin: "6px 0 4px" }}>
            You're 72% ready to defend.
          </h1>
          <p style={{ opacity: 0.92, fontSize: 14.5, margin: 0, maxWidth: 700 }}>
            Strong on chapters 1, 2, and 5. Soft on the methods chapter and reviewer-2's main
            objection. Two more deep-study sessions on Chapter 4 should clear it.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <DemoCard
            accent="var(--ok)"
            title="Strong"
            body={
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
                <li>Chapter 2 · Background — 91% coverage in transcript</li>
                <li>Chapter 5 · Results — 88% · cited every claim</li>
                <li>Chapter 1 · Intro — 85% · clearly motivated</li>
              </ul>
            }
          />
          <DemoCard
            accent="var(--bad)"
            title="Weak"
            body={
              <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, lineHeight: 1.6 }}>
                <li>Chapter 4 · Methods — 54% · two unanswered probes</li>
                <li>Reviewer-2's main objection — not addressed in any answer</li>
                <li>Limitations section — only one limitation stated</li>
              </ul>
            }
          />
        </div>

        <div className="la-card" style={{ padding: 18, marginTop: 14 }}>
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            SUGGESTED REHEARSALS
          </div>
          {[
            "Deep study · Ch 4 methods · 25 min",
            "Mock defense · methods-only round · 15 min",
            "Cite-check Reviewer 2's claim about external validity",
          ].map((s, i) => (
            <div
              key={s}
              style={{
                padding: "10px 0",
                borderTop: i ? "1px solid var(--line-soft)" : "none",
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
              }}
            >
              <span>{s}</span>
              <button className="la-btn ghost" style={{ padding: "5px 10px", fontSize: 11 }}>
                Schedule →
              </button>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

// ───────────────────────────────────────────────────────────────────
// Batch 8 · Project wizard variants (8 screens)
// ───────────────────────────────────────────────────────────────────

function WizardShell({
  step,
  total = 4,
  title,
  sub,
  variant = "default",
  children,
}: {
  step: number;
  total?: number;
  title: string;
  sub: string;
  variant?: "default" | "parent" | "calm";
  children: React.ReactNode;
}) {
  const wrap: React.CSSProperties =
    variant === "calm"
      ? { fontSize: 18, lineHeight: 1.7 }
      : variant === "parent"
        ? { background: "#fcedf3" }
        : {};
  return (
    <PageShell trail={["GRADE_9", "Projects", "New project"]}>
      <section style={{ padding: "32px 32px", maxWidth: 1000, margin: "0 auto", ...wrap }}>
        <div
          className="la-mono"
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: "var(--ink-mute)",
            letterSpacing: ".08em",
          }}
        >
          STEP {step} / {total} · {variant.toUpperCase()}
        </div>
        <h1
          className="la-serif"
          style={{ fontSize: 32, fontWeight: 800, margin: "8px 0 6px", letterSpacing: "-0.02em" }}
        >
          {title}
        </h1>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 14.5,
            lineHeight: 1.6,
            maxWidth: 720,
            margin: "0 0 20px",
          }}
        >
          {sub}
        </p>
        {children}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
          <button className="la-btn ghost">← Back</button>
          <button className="la-btn">{step === total ? "Create project" : "Continue →"}</button>
        </div>
      </section>
    </PageShell>
  );
}

export function ProjectsHubGRADE_9() {
  return (
    <PageShell trail={["GRADE_9", "Projects"]}>
      <section style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: 18,
          }}
        >
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Your projects</h1>
            <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "4px 0 0" }}>
              Multi-day learning plans. Pick a project to resume, or start a new one.
            </p>
          </div>
          <button className="la-btn">
            <Icon.spark /> New project
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { t: "Trigonometry mastery sprint", days: "5 days · 25 min/day", prog: 62 },
            { t: "AP Chemistry · acids & bases", days: "7 days · 30 min/day", prog: 24 },
            { t: "Differential equations primer", days: "4 days · 20 min/day", prog: 100 },
          ].map((p) => (
            <div key={p.t} className="la-card" style={{ padding: 18 }}>
              <div className="la-serif" style={{ fontSize: 18, fontWeight: 800 }}>
                {p.t}
              </div>
              <div
                className="la-mono"
                style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}
              >
                {p.days}
              </div>
              <div className="wt-meter" style={{ marginTop: 12, height: 6 }}>
                <div className="fill" style={{ width: `${p.prog}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
                <span className="la-mono" style={{ fontSize: 11 }}>
                  {p.prog}%
                </span>
                <button className="la-btn ghost" style={{ padding: "5px 10px", fontSize: 11 }}>
                  Open →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function GRADE_9WizardStep1() {
  return (
    <WizardShell
      step={1}
      title="Topic + outcome"
      sub="What do you want to be able to do at the end?"
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section label="Topic">
          <input placeholder="Differential equations" style={inputStyle} />
        </Section>
        <Section label="Outcome">
          <input placeholder="Score 80%+ on the chapter 6 exam" style={inputStyle} />
        </Section>
      </div>
    </WizardShell>
  );
}

export function GRADE_9WizardStep2() {
  return (
    <WizardShell
      step={2}
      title="Sources"
      sub="Where will you learn from? Add any combination of URLs, files, or notes."
    >
      <div
        className="la-card"
        style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}
      >
        {[
          "📄 syllabus-math12.pdf",
          "🔗 en.wikipedia.org/wiki/Differential_equation",
          "✏️ class notes",
        ].map((s) => (
          <div
            key={s}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 4px",
              fontSize: 13,
              borderBottom: "1px solid var(--line-soft)",
            }}
          >
            <span>{s}</span>
            <button className="la-iconbtn">✕</button>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <button className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
            + URL
          </button>
          <button className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
            + Upload
          </button>
          <button className="la-btn ghost" style={{ padding: "6px 12px", fontSize: 12 }}>
            + Note
          </button>
        </div>
      </div>
    </WizardShell>
  );
}

export function GRADE_9WizardStep3() {
  return (
    <WizardShell step={3} title="Pace + format" sub="How many days and how long each day?">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Section label="Days per week">
          <SegRow opts={["3", "4", "5", "6", "7"]} activeIdx={2} />
        </Section>
        <Section label="Minutes per day">
          <SegRow opts={["15", "25", "30", "45", "60"]} activeIdx={1} />
        </Section>
        <Section label="Format">
          <SegRow opts={["Mixed", "Mostly practice", "Mostly review"]} activeIdx={0} />
        </Section>
        <Section label="Deadline">
          <input type="date" style={inputStyle} />
        </Section>
      </div>
    </WizardShell>
  );
}

export function GRADE_9WizardStep4() {
  return (
    <WizardShell
      step={4}
      title="AI plan preview"
      sub="Mentor Max drafted a 5-day plan. Approve to create the project."
    >
      <div className="la-card" style={{ padding: 0, overflow: "hidden" }}>
        {[
          { day: "Day 1 · Mon", t: "Hook & motivation", min: 25, kind: "Read + check-in" },
          { day: "Day 2 · Tue", t: "Worked examples", min: 25, kind: "Watch + solve 3" },
          { day: "Day 3 · Wed", t: "Practice drill", min: 25, kind: "10-question quiz" },
          { day: "Day 4 · Thu", t: "Re-train weak parts", min: 25, kind: "Mentor walks misses" },
          { day: "Day 5 · Fri", t: "Mock exam", min: 25, kind: "Cited test · grade" },
        ].map((d, i) => (
          <div
            key={d.day}
            style={{
              padding: "12px 16px",
              display: "grid",
              gridTemplateColumns: "140px 1fr 90px 130px",
              gap: 12,
              alignItems: "center",
              borderTop: i ? "1px solid var(--line-soft)" : "none",
            }}
          >
            <span
              className="la-mono"
              style={{ fontSize: 11, color: "var(--brand-1)", fontWeight: 700 }}
            >
              {d.day}
            </span>
            <span style={{ fontSize: 14, fontWeight: 700 }}>{d.t}</span>
            <span className="la-mono" style={{ fontSize: 12 }}>
              {d.min} min
            </span>
            <span className="la-mono" style={{ fontSize: 11, color: "var(--ink-mute)" }}>
              {d.kind}
            </span>
          </div>
        ))}
      </div>
    </WizardShell>
  );
}

export function WorldComparisonGrid() {
  const worlds = [
    { n: "Little Learner", q: "Pick a theme for your child", c: "#ec4899" },
    { n: "GRADE_7", q: "What are you curious about?", c: "#4338ca" },
    { n: "GRADE_8", q: "What do you want to build?", c: "#7c3aed" },
    { n: "GRADE_9", q: "What exam are you prepping for?", c: "#c2410c" },
    { n: "Professional", q: "Which cert next?", c: "#0f766e" },
    { n: "Senior Learner", q: "What feels confusing online?", c: "#0ea5a4" },
  ];
  return (
    <PageShell trail={["Compare", "Step 1 across worlds"]}>
      <section style={{ padding: "28px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 6px" }}>
          The same Step 1, six audiences
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, margin: "0 0 22px" }}>
          The wizard adapts its first question to the picked audience. Compare side by side.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {worlds.map((w) => (
            <div
              key={w.n}
              className="la-card"
              style={{ padding: 18, borderTop: `4px solid ${w.c}` }}
            >
              <div
                className="la-mono"
                style={{ fontSize: 10, color: w.c, letterSpacing: ".08em", fontWeight: 800 }}
              >
                {w.n.toUpperCase()}
              </div>
              <div
                style={{ fontSize: 18, fontWeight: 800, marginTop: 8, letterSpacing: "-0.01em" }}
              >
                {w.q}
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}

export function LittleLearnerParentWizard() {
  return (
    <WizardShell
      step={1}
      total={3}
      variant="parent"
      title="What should we teach your little one?"
      sub="Tap a theme. Milo will turn it into a 10-minute tap-and-learn quiz."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {[
          { ic: "🔤", t: "Letters A–E" },
          { ic: "🔢", t: "Counting 1–7" },
          { ic: "🌈", t: "Colors" },
          { ic: "🐻", t: "Bedtime story" },
          { ic: "🦁", t: "Jungle animals" },
          { ic: "🎵", t: "Music & rhythm" },
        ].map((t) => (
          <button
            key={t.t}
            type="button"
            style={{
              padding: 18,
              borderRadius: 16,
              background: "#fff",
              border: "1.5px solid var(--line)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            <span style={{ fontSize: 28 }}>{t.ic}</span> {t.t}
          </button>
        ))}
      </div>
    </WizardShell>
  );
}

export function SeniorWizard() {
  return (
    <WizardShell
      step={1}
      total={3}
      variant="calm"
      title="What feels confusing online?"
      sub="Big text. Take your time. We pick one calm lesson based on what you tap."
    >
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {[
          "Strange messages on my phone",
          "Calling family on video",
          "Buying things online",
          "Strong passwords",
          "Photos and backups",
          "Saying yes to apps",
        ].map((t) => (
          <button
            key={t}
            type="button"
            style={{
              padding: "20px 22px",
              borderRadius: 14,
              background: "#fff",
              border: "1.5px solid var(--line)",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: 18,
              fontWeight: 700,
              textAlign: "left",
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </WizardShell>
  );
}

// ───────────────────────────────────────────────────────────────────
// Batch 9 · Admin · providers + audio + avatar (7 screens)
// ───────────────────────────────────────────────────────────────────

export function AdminShell({ trail, children }: { trail: string[]; children: React.ReactNode }) {
  return (
    <PageShell
      trail={trail}
      world="Professional"
      teacher="Admin console"
      teacherIcon="⚙️"
      avatarBg="#0f766e"
      initials="A"
    >
      {children}
    </PageShell>
  );
}

export function AdminProviders() {
  return (
    <AdminShell trail={["Admin", "AI Providers"]}>
      <section style={{ padding: "28px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em" }}>
          AI Providers
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, margin: "4px 0 22px" }}>
          OllaBridge Cloud is the primary route. Local PCs are paired as connected compute under it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          <DemoCard
            accent="var(--brand-1)"
            title="Primary route"
            body={
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>OllaBridge Cloud · qwen2.5</div>
                <div
                  className="la-mono"
                  style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}
                >
                  api.ollabridge.com · 1 model · healthy
                </div>
              </div>
            }
          />
          <DemoCard
            accent="var(--ok)"
            title="Connected compute"
            body={
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Local PC · "studio"</div>
                <div
                  className="la-mono"
                  style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}
                >
                  Paired 3 d ago · RTX 4080
                </div>
              </div>
            }
          />
          <DemoCard
            accent="var(--ink-mute)"
            title="Fallback providers"
            body={
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>OpenAI · Anthropic · xAI Grok</div>
                <div
                  className="la-mono"
                  style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}
                >
                  Configured · used only on cap exhaustion
                </div>
              </div>
            }
          />
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button className="la-btn">
            <Icon.spark /> Add a provider
          </button>
          <button className="la-btn ghost">📺 Pair a device</button>
          <button className="la-btn ghost">Routing & policy</button>
        </div>
      </section>
    </AdminShell>
  );
}

export function AddProviderModal() {
  return (
    <AdminShell trail={["Admin", "AI Providers", "Add"]}>
      <section style={{ padding: "60px 28px", maxWidth: 760, margin: "0 auto" }}>
        <div className="la-card" style={{ padding: 24 }}>
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            ADD PROVIDER
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 14px" }}>
            Pick a provider to add
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { ic: "🤖", t: "xAI Grok", s: "Free $25 credits · recommended", rec: true },
              { ic: "🌐", t: "OpenAI", s: "GPT-4o / 4o-mini" },
              { ic: "🧠", t: "Anthropic", s: "Claude Haiku / Sonnet" },
              { ic: "🛠", t: "Custom OpenAI-compatible", s: "Self-hosted endpoint" },
            ].map((p) => (
              <button
                key={p.t}
                type="button"
                style={{
                  textAlign: "left",
                  padding: 14,
                  borderRadius: 12,
                  background: "#fff",
                  border: `1.5px solid ${p.rec ? "var(--brand-1)" : "var(--line)"}`,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{p.ic}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800 }}>{p.t}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-mute)" }}>{p.s}</div>
                  </div>
                  {p.rec ? (
                    <span
                      className="la-pill"
                      style={{ background: "var(--brand-grad)", color: "#fff", fontSize: 10 }}
                    >
                      RECOMMENDED
                    </span>
                  ) : null}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

export function OllaBridgeConfig() {
  return (
    <AdminShell trail={["Admin", "AI Providers", "OllaBridge"]}>
      <section style={{ padding: "28px 28px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px" }}>
          Pair an OllaBridge device
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div className="la-card" style={{ padding: 16 }}>
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-mute)",
                letterSpacing: ".08em",
                fontWeight: 800,
              }}
            >
              PRIMARY · MY PC IS ASKING TO PAIR
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "8px 0 12px" }}>
              Run <code className="la-mono">ollabridge pair</code> on your PC. Type the ABCD-1234
              code it prints below.
            </p>
            <input
              placeholder="ABCD-1234"
              style={{
                ...inputStyle,
                textAlign: "center",
                fontFamily: "var(--font-mono)",
                fontSize: 18,
                letterSpacing: ".18em",
              }}
            />
            <button className="la-btn" style={{ marginTop: 10, width: "100%" }}>
              Approve pairing
            </button>
          </div>
          <div className="la-card" style={{ padding: 16 }}>
            <div
              className="la-mono"
              style={{
                fontSize: 10,
                color: "var(--ink-mute)",
                letterSpacing: ".08em",
                fontWeight: 800,
              }}
            >
              HEADLESS · GENERATE A CODE
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "8px 0 12px" }}>
              For a PC with no display.
            </p>
            <button className="la-btn ghost" style={{ width: "100%" }}>
              Generate pairing code
            </button>
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

export function GrokConfig() {
  return (
    <AdminShell trail={["Admin", "AI Providers", "xAI Grok"]}>
      <section style={{ padding: "28px 28px", maxWidth: 800, margin: "0 auto" }}>
        <div
          className="la-card"
          style={{ padding: 22, background: "linear-gradient(135deg, #f3f0ff, #fde2e2)" }}
        >
          <div
            className="la-mono"
            style={{
              fontSize: 11,
              color: "var(--brand-1)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            xAI GROK · FREE $25 CREDITS
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "8px 0 6px" }}>
            Two minutes to get a free fallback provider
          </h2>
          <ol style={{ fontSize: 14, lineHeight: 1.7, paddingLeft: 18 }}>
            <li>Visit console.x.ai and create an API key.</li>
            <li>Paste it below. We'll validate against /v1/models before saving.</li>
            <li>Choose a monthly cap (we recommend $20 to stay under the free credits).</li>
          </ol>
          <input placeholder="xai-…" style={inputStyle} />
          <button className="la-btn" style={{ marginTop: 10 }}>
            Validate & save
          </button>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminRouting() {
  return (
    <AdminShell trail={["Admin", "Routing & policy"]}>
      <section style={{ padding: "28px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px" }}>Routing & policy</h2>
        <div className="la-card" style={{ padding: 18 }}>
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            FALLBACK CHAIN
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              marginTop: 10,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {[
              { n: "OllaBridge", spend: "$0.00 / $0" },
              { n: "Local PC", spend: "$0.00 / —" },
              { n: "xAI Grok", spend: "$12.40 / $25" },
              { n: "OpenAI", spend: "$3.10 / $50" },
            ].map((p, i) => (
              <span
                key={p.n}
                style={{
                  padding: "8px 14px",
                  borderRadius: 12,
                  background: i === 0 ? "var(--brand-grad)" : "#fff",
                  color: i === 0 ? "#fff" : "var(--ink)",
                  border: i === 0 ? "none" : "1px solid var(--line)",
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {i + 1} · {p.n}
                <span className="la-mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 6 }}>
                  {p.spend}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

export function AdminAudio() {
  return (
    <AdminShell trail={["Admin", "Audio"]}>
      <section style={{ padding: "28px 28px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 14px" }}>
          Audio · text-to-voice + speech-to-text
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <DemoCard
            accent="var(--brand-1)"
            title="Text-to-voice"
            body={
              <div>
                <div style={{ fontWeight: 800 }}>Web Speech API (default · free · in browser)</div>
                <div
                  className="la-mono"
                  style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}
                >
                  Falls back to Piper ONNX when configured · cloud TTS (Polly / ElevenLabs) optional
                </div>
              </div>
            }
          />
          <DemoCard
            accent="var(--ok)"
            title="Speech-to-text"
            body={
              <div>
                <div style={{ fontWeight: 800 }}>OpenAI Whisper API (recommended)</div>
                <div
                  className="la-mono"
                  style={{ fontSize: 11, color: "var(--ink-mute)", marginTop: 4 }}
                >
                  Falls back to Azure Speech · or self-hosted faster-whisper
                </div>
              </div>
            }
          />
        </div>
      </section>
    </AdminShell>
  );
}

export function Admin3DAvatar() {
  return (
    <AdminShell trail={["Admin", "3D Avatar"]}>
      <section style={{ padding: "28px 28px", maxWidth: 760, margin: "0 auto" }}>
        <div className="la-card" style={{ padding: 22 }}>
          <div
            className="la-mono"
            style={{
              fontSize: 10,
              color: "var(--ink-mute)",
              letterSpacing: ".08em",
              fontWeight: 800,
            }}
          >
            3D AVATAR · SETTINGS ONLY
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "6px 0 6px" }}>Per-tutor avatar</h2>
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            Picks an avatar that mirrors lip-sync to the TTS voice. Rendered client-side via
            three.js. Disabled by default — admins opt-in per world.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 10,
              marginTop: 14,
            }}
          >
            {["🐯 Milo", "🌙 Luna", "⚡ Nova", "🎓 Mentor Max", "💼 Prof. Turing", "🌿 Aiya"].map(
              (a) => (
                <button
                  key={a}
                  type="button"
                  style={{
                    padding: "14px 10px",
                    borderRadius: 12,
                    border: "1.5px solid var(--line)",
                    background: "#fff",
                    fontFamily: "inherit",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {a}
                </button>
              )
            )}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}

// ───────────────────────────────────────────────────────────────────
// Batch 10 · Appendix (1 screen)
// ───────────────────────────────────────────────────────────────────

export function WikiGenerating() {
  return (
    <PageShell trail={["Appendix", "WikiTest pipeline"]}>
      <section style={{ padding: "28px 28px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 className="la-serif" style={{ fontSize: 26, fontWeight: 700, margin: "0 0 14px" }}>
          WikiTest pipeline — under the hood
        </h2>
        <p
          style={{
            color: "var(--ink-soft)",
            fontSize: 14,
            margin: "0 0 22px",
            maxWidth: 720,
            lineHeight: 1.6,
          }}
        >
          How a Wikipedia URL becomes a cited, exam-style test in 30–60 seconds.
        </p>
        <div
          className="la-card"
          style={{
            padding: 20,
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            lineHeight: 1.75,
            color: "var(--ink-soft)",
          }}
        >
          <pre
            style={{ margin: 0, whiteSpace: "pre-wrap" }}
          >{`URL → parse → fetch (rate-limit + cache 24h)
         → extract sections (clean HTML, strip nav)
         → chunk (~350 tok, 70 tok overlap, sentence-aware)
         → per-chunk: LLM via provider chain (jsonChat)
                 ↳ JSON: {kind, prompt, options?, citation, explanation}
         → filter (citation must be verbatim substring of chunk)
         → dedup (Jaccard > 0.75 → drop)
         → assemble + cache by content hash (24h)
         → persist to WikiTestSnapshot for the learner library
LIVE: streamed via SSE so the UI shows questions as they arrive.`}</pre>
        </div>
      </section>
    </PageShell>
  );
}

// ─── Shared helpers ──────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid var(--line)",
  fontFamily: "inherit",
  fontSize: 13.5,
  background: "#fff",
};

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        className="la-mono"
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: ".08em",
          color: "var(--ink-mute)",
          marginBottom: 6,
        }}
      >
        {label.toUpperCase()}
      </div>
      {children}
    </div>
  );
}

function SegRow({ opts, activeIdx }: { opts: string[]; activeIdx: number }) {
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
      {opts.map((o, i) => (
        <button
          key={o}
          type="button"
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            cursor: "pointer",
            fontFamily: "inherit",
            background: i === activeIdx ? "var(--brand-grad)" : "#fff",
            color: i === activeIdx ? "#fff" : "var(--ink-soft)",
            border: i === activeIdx ? "none" : "1px solid var(--line)",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
