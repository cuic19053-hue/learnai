<p align="center">
  <img src="public/logo.svg" alt="LearnAI" width="120" height="120" />
</p>

<h1 align="center">LearnAI</h1>

<p align="center">
  <strong>An open-source AI teacher for every human, at every stage of life.</strong>
</p>

<p align="center">
  One pedagogical engine. Six learning worlds. Ten time-tested teaching methods. <br/>
  Free to use. No card. No app to install.
</p>

<p align="center">
  <a href="https://learnai.app"><img src="https://img.shields.io/badge/Try_LearnAI-→_learnai.app-2e5bff?style=for-the-badge" alt="Try LearnAI"/></a>
  &nbsp;
  <a href="https://github.com/sponsors/ruslanmv"><img src="https://img.shields.io/badge/💖_Become_a_sponsor-ec4899?style=for-the-badge" alt="Become a sponsor"/></a>
</p>

<p align="center">
  <a href="https://www.apache.org/licenses/LICENSE-2.0"><img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License: Apache 2.0"/></a>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-15-black" alt="Next.js 15"/></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.7-3178C6" alt="TypeScript"/></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-Enabled-6366F1" alt="MCP Enabled"/></a>
</p>

> 👉 **The product lives at [learnai.app](https://learnai.app).** This repository is the source — open for transparency, audit, and contribution. Learners don't have to install anything; they just open the link.

---

## Why this matters

For 2,500 years, humanity has known what great teaching looks like. Socrates asked questions. Vygotsky pushed learners just past where they were comfortable. Ebbinghaus mapped the forgetting curve. Feynman invented "explain it back to me." Sweller proved that watching a worked example before trying one yourself isn't laziness — it's how humans actually learn.

The problem was never the method. **The problem was always scale.** A great teacher could reach 30 children. A great tutor could reach one.

For the first time in history, that constraint is gone. A language model can sit beside every learner on Earth — patient, available at 3 a.m., never tired, never short with the kid who needs the same concept explained four times. The question stopped being *"is AI smart enough to teach?"* and started being *"what kind of teacher should it be?"*

LearnAI is the answer we want to live with.

- **Not a chatbot bolted onto a textbook.** A complete pedagogical loop — Hook → Explain → Practice → Feedback → Reflect → Evolve — that runs the same way for a 4-year-old learning to count and a PhD student rehearsing a thesis defense.
- **Not one-size-fits-all.** Six age-aware worlds, each with its own UI, tutor persona, and pace. A 4-year-old never sees the SAT prep screen. A senior never gets a Discord-bot tutorial.
- **Not a black box.** Every adaptive choice is explainable. Every recommendation cites the data behind it. Every generated test cites the source paragraph. *Why this? Why now?* — answered inline, on every screen.
- **Not extractive.** No ads. No upsell pop-ups. No child's data sold. Works completely as a guest. Sign in only to sync across devices.
- **Not locked in.** Apache 2.0 source means we can never silently turn this into a paywalled product. The hosted service is the product; the open source is the guarantee that it stays honest.

> **Our bet:** the next billion learners won't come online through a textbook or a YouTube channel. They'll come online through a personal AI teacher. That teacher should be open-source, pedagogically literate, and culturally portable. If that's not us, it'll be someone whose incentives are very different.

---

## The Loop

Every lesson — for every age — runs the same six steps:

> 🧲 **Hook** → 💡 **Explain** → ✏️ **Practice** → 💬 **Feedback** → 🪞 **Reflect** → 🌱 **Evolve**

The surface adapts. The pedagogy doesn't.

---

## Pedagogy — 10 historical methods, one engine

LearnAI implements **ten learning methods drawn from 2,500 years of education history**, picked for being both *simple* and *evidence-backed*:

| # | Method | Tradition | Year | Loop step |
|---|---|---|---|---|
| 1 | ❓ Socratic dialogue | Ancient Greece | 5th c. BCE | Hook |
| 2 | 🏛️ Method of Loci (memory palace) | Ancient Greece | ~500 BCE | Explain · Evolve |
| 3 | 🔁 Spaced repetition | Germany (Ebbinghaus) | 1885 | Evolve |
| 4 | 🎯 Active recall (testing effect) | Cognitive science | 2006 | Practice · Feedback |
| 5 | 🧮 Worked example → twin | Sweller, cognitive load theory | 1985 | Explain · Practice |
| 6 | 🎲 Interleaving | Bjork lab | 1990s | Practice |
| 7 | 🗣️ Feynman technique | USA (Feynman) | 1960s | Feedback · Reflect |
| 8 | 🪜 Kumon mastery ladder | Japan (Toru Kumon) | 1958 | Practice |
| 9 | 📈 Zone of Proximal Development | Soviet Union (Vygotsky) | 1934 | Practice |
| 10 | 🗺️ Shatalov reference signal | Soviet Union (Shatalov) | 1970s | Reflect |

Each lesson assembles a method plan — one method per Loop step, tuned to the learner's stage. **Pedagogy as code, not as marketing language.**

---

## Six learning worlds

| World | Ages | Surface | Example lesson |
|---|---|---|---|
| 🦁 **Little Learner** | 3–6 | Stories, voice, color | Count jungle animals with Milo |
| 🚀 **Explorer** | 7–11 | Quests, badges, curiosity | Why does a volcano erupt? |
| 🛠️ **Builder** | 12–15 | Projects, code, missions | Build a calculator in Python |
| 🎓 **Scholar** | 16–18 | Exam prep, weak-area focus | Trigonometry mastery sprint |
| 💼 **Professional** | 18+ | Paths, certifications | AWS networking review |
| 🌿 **Senior Learner** | 65+ | Calm, large text, voice | How to spot a scam message |

Onboarding routes the learner to the right world. They never see the others.

---

## What makes this different

- **Pedagogy as code, not as marketing.** Ten methods catalogued in code, assembled into per-stage plans, surfaced in the UI with their citations. Other products mention "Socratic method" in a launch tweet. We tag the prompt chip with the method name and a tooltip.
- **Open-source, provider-agnostic AI.** Swap the model freely. Your lessons don't change. Your data stays put.
- **Guest-first, by architecture.** Most AI products require sign-up before the first useful action. LearnAI runs from the first click — no email, no card, no waiting.
- **Citations, not vibes.** Every WikiTest question lists the source heading. Every adaptive recommendation cites the data that produced it.
- **Accessibility built in.** The Senior world isn't bolted on — it's a first-class variant with bigger type, calmer copy, and surfaced accessibility controls in the project wizard itself.

---

## Support the project

LearnAI is free for learners forever, funded by sponsors during its first year on free-tier cloud. If it's useful to you, [sponsor on GitHub](https://github.com/sponsors/ruslanmv) or star the repo — both help.

---

## Roadmap

**Shipped**

- [x] Six age-adaptive learning worlds
- [x] 5-step onboarding (Who → Journey → Teacher → Goal → Ready)
- [x] Lesson player with the Loop and adaptive tuning
- [x] Guest-first auth — no sign-in required to learn
- [x] Progress engine — XP, streaks, cross-tab sync
- [x] Admin console — Overview / Learners / Loops / Worlds / AI Providers / Personas / Safety / Billing / Audit
- [x] **WikiTest** — paste-a-Wikipedia-URL-to-a-graded-test with cited explanations
- [x] **Project creation wizard** — six audiences, three variants (4-step / parent-led / calm), 5 ready-to-use demos
- [x] **Project workspace** — AI-generated lesson + interactive grading with inline tutor feedback
- [x] **Persistent AI tutor rail** — context-aware, technique-labelled, with "Why this?" on every adaptive choice
- [x] **Parent dashboard** — YouTube-Kids-style multi-child profiles, subject allow-list, quiet hours, accessibility, data export
- [x] Certifications module (AWS · Azure · GCP · IBM)
- [x] Languages module (7 languages, CEFR A1 → B2)

**In flight**

- [ ] MaterialTest — same pipeline for PDF + YouTube transcript + photo of a worksheet
- [ ] Voice-mode Feynman exercise (mic → Whisper → AI critique)
- [ ] Spaced-repetition queue in the progress engine
- [ ] Offline-first PWA shell
- [ ] i18n for the top 10 languages
- [ ] Defense Mode (Socratic chains + Feynman explain-back for graduate prep)
- [ ] Lesson marketplace — publish a lesson, fork someone else's

See [`docs/ROADMAP.md`](./docs/ROADMAP.md) for the full plan.

---

## Contributing

Pull requests welcome on bugs, design, lessons, translations, and pedagogical critiques. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the guide, [`docs/DEVELOPMENT.md`](./docs/DEVELOPMENT.md) for architecture and the local-dev setup, and [`SECURITY.md`](./SECURITY.md) for responsible disclosure.

---

## License

Apache 2.0 — see [`LICENSE`](./LICENSE).

Wikipedia-sourced content (WikiTest article text) is reused under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) with attribution preserved on every page that displays it.

---

<p align="center">
  <img src="public/logo.svg" alt="LearnAI" width="40" height="40" /><br/>
  <strong>Built by <a href="https://ruslanmv.com">Ruslan Magana</a> and contributors.</strong><br/>
  <em>Education is a right. Let's make a great teacher available to every learner on Earth.</em><br/><br/>
  <a href="https://github.com/sponsors/ruslanmv"><strong>💖 Support LearnAI</strong></a>
</p>
