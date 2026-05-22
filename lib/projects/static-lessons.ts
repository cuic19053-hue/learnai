/**
 * Pre-baked fallback lessons for the 5 demo projects.
 *
 * When the AI provider is slow / unavailable / returns malformed JSON,
 * the demo experience must still work — a "Use this →" tap can't end
 * in a 504. The /lesson endpoint serves one of these static lessons
 * when AI generation fails for a known demo id.
 *
 * Content quality: each lesson is written to the same shape the AI
 * is asked to produce — concept + key terms + 3 exercises tagged with
 * a named method — so the UI experience is identical.
 */

import type { ProjectLesson } from "./lesson";

function lesson(
  id: string,
  body: Omit<ProjectLesson, "id" | "projectId" | "generatedAt">
): ProjectLesson {
  return {
    id: `static-${id}`,
    projectId: id,
    generatedAt: new Date(0).toISOString(),
    ...body,
  };
}

export const STATIC_LESSONS: Record<string, ProjectLesson> = {
  "demo-calculus-derivatives": lesson("demo-calculus-derivatives", {
    title: "Derivatives — the rate of change",
    sources: ["en.wikipedia.org/wiki/Derivative"],
    concept: [
      "A derivative measures how a function changes as its input changes. If position is f(t), the derivative f'(t) is velocity — how fast position changes with time at that instant.",
      "The formal definition uses a limit: f'(x) = lim h→0 (f(x+h) − f(x)) / h. The 'rise over run' becomes infinitely small. Geometrically, f'(x) is the slope of the line tangent to the graph of f at point x.",
      "Three workhorse rules let you skip the limit for most functions: the power rule (d/dx xⁿ = n·xⁿ⁻¹), the product rule (d/dx [f·g] = f'·g + f·g'), and the chain rule (d/dx [f(g(x))] = f'(g(x))·g'(x)). The chain rule is the hardest to internalise but unlocks everything composed.",
    ].join("\n\n"),
    keyTerms: [
      { term: "Derivative", definition: "Instantaneous rate of change of a function at a point." },
      {
        term: "Tangent line",
        definition: "Line touching a curve at one point with the same slope as the curve there.",
      },
      {
        term: "Chain rule",
        definition:
          "Derivative of a composition: differentiate the outside, multiply by the derivative of the inside.",
      },
    ],
    exercises: [
      {
        id: "ex1",
        kind: "multiple_choice",
        prompt: "What is the derivative of f(x) = x³ with respect to x?",
        choices: ["x²", "3x²", "3x", "x³⁄3"],
        correctIndex: 1,
        explanation: "By the power rule, d/dx [xⁿ] = n·xⁿ⁻¹. For n = 3 that gives 3x².",
        hint: "Multiply by the exponent, then drop the exponent by one.",
        method: "Active recall",
      },
      {
        id: "ex2",
        kind: "short_answer",
        prompt: "Differentiate f(x) = (2x + 1)⁵ using the chain rule. Give the simplified answer.",
        expectedAnswer: "10(2x + 1)^4",
        explanation:
          "Chain rule: outside derivative is 5·(2x+1)⁴, inside derivative is 2, multiply to get 10(2x+1)⁴.",
        hint: "Outside is (·)⁵; inside is 2x + 1. Take the outside derivative as if the inside were a single variable, then multiply by the inside's derivative.",
        method: "Worked example → twin",
      },
      {
        id: "ex3",
        kind: "explain_back",
        prompt:
          "In one sentence, explain why the chain rule exists — what conceptual problem does it solve?",
        expectedAnswer:
          "When a function is composed of an inner function inside an outer function, the chain rule lets us compute the total rate of change by multiplying the local rates of change of each layer.",
        explanation:
          "Composition means changes propagate through layers. The chain rule says the total rate is the product of the per-layer rates — exactly like multiplying gear ratios.",
        method: "Feynman technique",
      },
    ],
  }),

  "demo-qho": lesson("demo-qho", {
    title: "Quantum harmonic oscillator — ladder operators",
    sources: ["en.wikipedia.org/wiki/Quantum_harmonic_oscillator"],
    concept: [
      "The quantum harmonic oscillator (QHO) is the quantum version of a mass-on-a-spring: H = p²/2m + ½ m ω² x². It's the most-solved model in physics because almost any small oscillation around an equilibrium looks like one.",
      "Diagonalising H is easiest with ladder operators a = √(mω/2ℏ) (x + i p/(mω)) and its adjoint a†. They satisfy the commutation relation [a, a†] = 1, and the Hamiltonian becomes H = ℏω (a†a + ½). The number operator N = a†a has integer eigenvalues n = 0, 1, 2, …",
      "Energy levels are evenly spaced at Eₙ = ℏω (n + ½). The 'half' is the zero-point energy — even the ground state |0⟩ has energy ℏω/2, a purely quantum effect. The operators a and a† 'lower' and 'raise' between adjacent levels: a|n⟩ = √n |n−1⟩ and a†|n⟩ = √(n+1) |n+1⟩.",
    ].join("\n\n"),
    keyTerms: [
      {
        term: "Ladder operators",
        definition: "a (lowering) and a† (raising); take a state to the adjacent energy level.",
      },
      {
        term: "Number operator",
        definition: "N = a†a; its eigenvalue counts which level |n⟩ a state is in.",
      },
      {
        term: "Zero-point energy",
        definition: "Ground-state energy ℏω/2 — minimum energy is non-zero in QM.",
      },
    ],
    exercises: [
      {
        id: "ex1",
        kind: "multiple_choice",
        prompt: "What is the commutator [a, a†] for the QHO ladder operators?",
        choices: ["0", "1", "iℏ", "a†a"],
        correctIndex: 1,
        explanation:
          "[a, a†] = 1 (the identity) — this is the defining algebra that makes the ladder construction work.",
        hint: "It's a simple constant, derived from [x, p] = iℏ.",
        method: "Active recall",
      },
      {
        id: "ex2",
        kind: "short_answer",
        prompt:
          "What does the operator a†·a return when applied to the state |3⟩, and what does this operator represent?",
        expectedAnswer: "3|3⟩; it is the number operator counting the energy level.",
        explanation:
          "a†a is the number operator N. N|n⟩ = n|n⟩, so on |3⟩ it returns 3|3⟩ — telling you which level you're in.",
        hint: "Apply the lowering operator first, then the raising operator, and track the √n coefficients.",
        method: "Worked example → twin",
      },
      {
        id: "ex3",
        kind: "explain_back",
        prompt: "In one sentence, explain why the QHO ground state has non-zero energy.",
        expectedAnswer:
          "The uncertainty principle forbids x and p from both being exactly zero, so the lowest-energy state still has ℏω/2 of zero-point energy.",
        explanation:
          "Heisenberg's Δx·Δp ≥ ℏ/2 means a state with zero kinetic and zero potential energy is forbidden — the ground state is the best compromise, with energy ℏω/2.",
        method: "Feynman technique",
      },
    ],
  }),

  "demo-quantum-computing": lesson("demo-quantum-computing", {
    title: "Quantum computing basics — gates and the Bell state",
    sources: ["en.wikipedia.org/wiki/Quantum_computing"],
    concept: [
      "A qubit is a two-state quantum system that can be in superposition: |ψ⟩ = α|0⟩ + β|1⟩ with |α|² + |β|² = 1. Two complex amplitudes encode it, but measurement collapses to either 0 (prob |α|²) or 1 (prob |β|²).",
      "Quantum gates are unitary 2x2 matrices acting on a qubit (or 4x4 on two qubits). The Hadamard gate H takes |0⟩ → (|0⟩+|1⟩)/√2 — perfect superposition. H is its own inverse: H·H = I.",
      "Entanglement is the engine of quantum advantage. The simplest entangled state is the Bell state |Φ⁺⟩ = (|00⟩ + |11⟩)/√2. You make it with one circuit: apply H to qubit 1, then CNOT with qubit 1 as control and qubit 2 as target.",
    ].join("\n\n"),
    keyTerms: [
      {
        term: "Qubit",
        definition:
          "Two-state quantum unit. Superposition + interference + entanglement are the resources.",
      },
      {
        term: "Hadamard gate (H)",
        definition: "Creates an equal superposition. H|0⟩ = (|0⟩+|1⟩)/√2, H|1⟩ = (|0⟩−|1⟩)/√2.",
      },
      {
        term: "CNOT gate",
        definition:
          "Two-qubit gate; flips the target if the control is |1⟩. The workhorse of entanglement.",
      },
    ],
    exercises: [
      {
        id: "ex1",
        kind: "multiple_choice",
        prompt:
          "Two qubits start as |00⟩. You apply H to qubit 1, then CNOT (control = qubit 1, target = qubit 2). What state results?",
        choices: ["(|00⟩ + |01⟩)/√2", "(|00⟩ + |11⟩)/√2", "|11⟩", "(|10⟩ + |01⟩)/√2"],
        correctIndex: 1,
        explanation:
          "H|0⟩ ⊗ |0⟩ = (|00⟩+|10⟩)/√2. CNOT flips the second qubit when the first is |1⟩, giving (|00⟩+|11⟩)/√2 — the Bell state |Φ⁺⟩.",
        hint: "Apply H first to get a superposition, then trace what CNOT does to each branch.",
        method: "Worked example → twin",
      },
      {
        id: "ex2",
        kind: "true_false",
        prompt: "Applying the Hadamard gate twice to |0⟩ gives back |0⟩.",
        choices: ["True", "False"],
        correctIndex: 0,
        explanation: "H is its own inverse — H² = I. So H·H|0⟩ = I|0⟩ = |0⟩.",
        hint: "What's the matrix product H·H?",
        method: "Active recall",
      },
      {
        id: "ex3",
        kind: "explain_back",
        prompt:
          "In one sentence, explain why measuring one qubit of a Bell state determines the result of measuring the other.",
        expectedAnswer:
          "Because the Bell state is a single entangled superposition over |00⟩ and |11⟩, measuring the first qubit collapses the whole state to whichever branch it found — so the second is correlated even before being measured.",
        explanation:
          "Entanglement means the two qubits don't have independent states. The amplitudes only support |00⟩ and |11⟩ — measuring either qubit picks a branch for both.",
        method: "Feynman technique",
      },
    ],
  }),

  "demo-mixture-of-experts": lesson("demo-mixture-of-experts", {
    title: "Mixture of Experts — sparse routing and the trade-off",
    sources: ["en.wikipedia.org/wiki/Mixture_of_experts"],
    concept: [
      "A Mixture of Experts (MoE) replaces a single dense feed-forward layer with N small expert networks plus a learned gating network. The gate routes each token to a small subset (the 'top-k' experts, usually k = 1 or 2). Only the selected experts run.",
      "The decoupling matters: total parameters scale with N, but compute per token scales with k. An 8×7B top-2 MoE has roughly N · Pₑ = 56B total parameters but only k · Pₑ ≈ 14B active per token. Same FLOPs as a 14B dense model, much more capacity.",
      "The two failure modes are well-named. Expert collapse: a few experts get all the traffic, the rest die. Dead experts: never selected, so they never train. The standard fixes are an auxiliary load-balancing loss (penalises uneven routing) and noisy top-k routing (random tie-breaking).",
    ].join("\n\n"),
    keyTerms: [
      {
        term: "Gating network",
        definition: "Small network that scores each expert per token; top-k get routed traffic.",
      },
      {
        term: "Top-k routing",
        definition: "Send each token to its k highest-scoring experts (k = 1 or 2 typically).",
      },
      {
        term: "Load balancing loss",
        definition:
          "Auxiliary term that penalises imbalanced expert usage; keeps every expert training.",
      },
    ],
    exercises: [
      {
        id: "ex1",
        kind: "multiple_choice",
        prompt: "An 8×7B top-2 MoE has roughly how many active parameters per token?",
        choices: ["7B", "14B", "56B", "8B"],
        correctIndex: 1,
        explanation:
          "Active = k · expert_size = 2 × 7B = 14B. The other 42B are stored but not used per token.",
        hint: "k experts run per token. Each expert has 7B params.",
        method: "Active recall",
      },
      {
        id: "ex2",
        kind: "short_answer",
        prompt:
          "Two failure modes of MoE routing are 'expert collapse' (a few experts get most tokens) and 'dead experts' (some never get any). Name the standard training-time fix for both.",
        expectedAnswer:
          "An auxiliary load-balancing loss (often combined with noisy top-k routing).",
        explanation:
          "Add an auxiliary loss that penalises imbalanced routing — gradients then push the gate towards even usage. Noisy top-k adds randomness so dead experts get occasional traffic to train on.",
        hint: "Think about adding a loss term that punishes the gate when traffic is lopsided.",
        method: "Worked example → twin",
      },
      {
        id: "ex3",
        kind: "explain_back",
        prompt:
          "In one sentence, explain the central trade-off MoE buys you compared to a dense model of the same active-parameter count.",
        expectedAnswer:
          "MoE gives you more total capacity (more parameters to store specialisation) at the same per-token compute cost, in exchange for harder training (routing imbalance) and higher memory footprint.",
        explanation:
          "Same FLOPs per token, much more capacity in the parameter store. The price is training stability and memory for the inactive experts.",
        method: "Feynman technique",
      },
    ],
  }),

  "demo-transformer-defense": lesson("demo-transformer-defense", {
    title: "Transformer defense — attention, position, and what the committee will ask",
    sources: [
      "en.wikipedia.org/wiki/Transformer_(deep_learning_architecture)",
      "Vaswani et al. 2017 (Attention is All You Need)",
    ],
    concept: [
      "The Transformer is a sequence model whose only learned per-token operation is multi-head self-attention: Attention(Q,K,V) = softmax(QKᵀ/√dₖ)·V. Q, K, V are linear projections of the input. The softmax-over-keys gives every token a normalised weight on every other token — so the architecture is permutation-equivariant.",
      "Permutation-equivariance is a problem if order matters (it almost always does). The original paper added sinusoidal absolute position encodings to the input embeddings. Modern Transformers use rotary position embeddings (RoPE) inside the attention layer — they encode relative position with a frequency-based rotation of Q and K.",
      "Defense-prep heuristic: every claim in the paper has an ablation, every architectural choice has an alternative. Be ready for the methodologist's questions: 'why scale by √dₖ?' (variance of dot product); 'how do you know heads specialise?' (Voita et al. 2019); 'why pre-norm vs post-norm?' (training stability at depth).",
    ].join("\n\n"),
    keyTerms: [
      {
        term: "Self-attention",
        definition: "Each token attends to every other; weights are softmax(QKᵀ/√dₖ).",
      },
      {
        term: "Position encoding",
        definition:
          "Mechanism that breaks permutation-equivariance — sinusoidal, learned, or rotary (RoPE).",
      },
      {
        term: "Pre-norm vs post-norm",
        definition:
          "Where the LayerNorm sits relative to the residual; pre-norm trains deeper, post-norm was the original.",
      },
    ],
    exercises: [
      {
        id: "ex1",
        kind: "multiple_choice",
        prompt: "Why is the dot product in scaled dot-product attention divided by √dₖ?",
        choices: [
          "To make the softmax invariant to sequence length.",
          "To keep the variance of QKᵀ ~ 1 so softmax doesn't saturate.",
          "To match the dimensionality of V.",
          "It's an empirical regulariser, not theoretically motivated.",
        ],
        correctIndex: 1,
        explanation:
          "If Q and K have i.i.d. zero-mean unit-variance entries, QKᵀ has variance dₖ. Dividing by √dₖ keeps the softmax inputs in a regime where gradients don't vanish.",
        hint: "Compute the variance of the dot product of two random vectors of dimension dₖ.",
        method: "Active recall",
      },
      {
        id: "ex2",
        kind: "short_answer",
        prompt:
          "A reviewer asks: 'Why use rotary position embeddings (RoPE) instead of the original sinusoidal absolute encodings?' Give the one-sentence answer you'd give in a defense.",
        expectedAnswer:
          "RoPE encodes relative position by rotating Q and K, so attention scores depend on token distance, not absolute index — which extrapolates better to longer sequences.",
        explanation:
          "Sinusoidal absolute encodings are added to the embedding once; RoPE rotates Q and K so the dot product carries relative-position information naturally and extends past the training length.",
        hint: "Compare what each encoding makes the attention score depend on.",
        method: "Worked example → twin",
      },
      {
        id: "ex3",
        kind: "explain_back",
        prompt:
          "In one sentence, explain why multi-head attention is more expressive than single-head attention with the same total dimensionality.",
        expectedAnswer:
          "Splitting into heads lets each subspace specialise on a different pattern — different heads can attend to local syntax, long-range coreference, or copying — instead of being forced into one shared similarity function.",
        explanation:
          "Heads create multiple low-rank similarity functions instead of one full-rank one. Voita et al. (2019) showed they specialise in identifiable ways.",
        method: "Feynman technique",
      },
    ],
  }),
};

export function getStaticLesson(projectId: string): ProjectLesson | null {
  return STATIC_LESSONS[projectId] ?? null;
}
