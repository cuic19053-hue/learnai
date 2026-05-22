import type { Metadata } from "next";
import Link from "next/link";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Help — LearnAI",
  description:
    "Common questions answered. How to start, how to sign in, how to support the project, how to delete your data.",
};

const FAQ: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "How do I start learning?",
    a: (
      <>
        Go to <Link href="/">learnai.app</Link>, pick the journey that matches your age and goal,
        and start. No sign-up, no card, no app to install. You&apos;ll be inside your first lesson
        in under a minute.
      </>
    ),
  },
  {
    q: "Is it really free? What's the catch?",
    a: (
      <>
        Yes, and there is no catch — see the <Link href="/legal/terms">Terms</Link> for the 1-year
        commitment in writing. The hosted service runs on free-tier cloud and is funded by sponsors
        and donations. The core stays free even when optional paid services arrive later. The
        codebase is open under Apache 2.0 as the guarantee.
      </>
    ),
  },
  {
    q: "Do I need to sign in?",
    a: (
      <>
        No. LearnAI is guest-first — your XP, streaks, and progress live on your device. Sign in{" "}
        <em>only</em> when you want to sync across devices. You can sign in with Google or with
        email (magic-link or password).
      </>
    ),
  },
  {
    q: "Is it safe for kids?",
    a: (
      <>
        Yes. The Little Learner world (ages 3–6) and Explorer world (7–11) run with the strictest
        safety profile: subject allow-list, approved-content-only mode, blocked external links, and
        PII pseudonymisation. Parents manage everything from <Link href="/parent">/parent</Link> —
        multi-child profiles, session limits, quiet hours, daily summary emails.
      </>
    ),
  },
  {
    q: "Does the AI train on my data?",
    a: (
      <>
        No. We don&apos;t train models on your sessions, and the configured AI provider chain
        (OllaBridge by default; optionally OpenAI / Anthropic / xAI / Ollama) is bound by each
        provider&apos;s own data policy when it processes your prompt. See{" "}
        <Link href="/legal/privacy">Privacy</Link> for the full breakdown.
      </>
    ),
  },
  {
    q: "Can I export my progress?",
    a: (
      <>
        Yes. The <Link href="/parent">parent dashboard</Link> has a one-click JSON export. For a
        signed-in account, email{" "}
        <a href="mailto:privacy@learnai.example">privacy@learnai.example</a> and we&apos;ll send
        your data within 30 days.
      </>
    ),
  },
  {
    q: "How do I delete my data?",
    a: (
      <>
        In guest mode: clearing your browser data deletes everything. Signed in: email{" "}
        <a href="mailto:privacy@learnai.example">privacy@learnai.example</a> and every record we
        hold will be removed within 30 days.
      </>
    ),
  },
  {
    q: "I'm a teacher / school / org — can I use this?",
    a: (
      <>
        Yes. The license (Apache 2.0) explicitly permits commercial and institutional use. Reach out
        at <a href="mailto:ai@learnai.example">ai@learnai.example</a> for deployment support, custom
        integrations, or named-program sponsorship.
      </>
    ),
  },
  {
    q: "How can I support the project?",
    a: (
      <>
        Sponsor on{" "}
        <a href="https://github.com/sponsors/ruslanmv" target="_blank" rel="noreferrer noopener">
          GitHub Sponsors
        </a>
        , star the repo, translate a learning world, propose a lesson, or report a bug. Every
        contribution helps — financial or otherwise. See the{" "}
        <a
          href="https://github.com/ruslanmv/learnai#support-the-project--become-a-sponsor"
          target="_blank"
          rel="noreferrer noopener"
        >
          Support the project
        </a>{" "}
        section in the README for the full list.
      </>
    ),
  },
  {
    q: "I found a bug. Where do I report it?",
    a: (
      <>
        Open an issue at{" "}
        <a
          href="https://github.com/ruslanmv/learnai/issues"
          target="_blank"
          rel="noreferrer noopener"
        >
          github.com/ruslanmv/learnai/issues
        </a>
        . Screenshots and the URL are super helpful. For security issues, please see{" "}
        <a
          href="https://github.com/ruslanmv/learnai/blob/main/SECURITY.md"
          target="_blank"
          rel="noreferrer noopener"
        >
          SECURITY.md
        </a>{" "}
        for responsible disclosure.
      </>
    ),
  },
  {
    q: "Can I self-host LearnAI?",
    a: (
      <>
        Yes — the codebase is open. See{" "}
        <a
          href="https://github.com/ruslanmv/learnai/blob/main/docs/DEPLOYMENT-FREE-TIER.md"
          target="_blank"
          rel="noreferrer noopener"
        >
          docs/DEPLOYMENT-FREE-TIER.md
        </a>{" "}
        for three production-ready stacks that all cost $0/month. That said, our recommendation is
        to use the hosted version at <Link href="/">learnai.app</Link>; self-hosting is best for
        schools, regulated environments, or hackers who want full control.
      </>
    ),
  },
  {
    q: "I have a question that's not here.",
    a: (
      <>
        Email <a href="mailto:contact@learnai.example">contact@learnai.example</a> and we&apos;ll
        get back to you. For technical questions, GitHub Discussions is faster.
      </>
    ),
  },
];

export default function HelpPage() {
  return (
    <LegalShell
      eyebrow="Help"
      title="Help & frequently asked questions"
      subtitle="Twelve common questions, plain answers. If yours isn't here, write to us."
      active="help"
    >
      <p>
        Use the questions below to find what you need. Everything links to the right place in the
        product or docs.
      </p>

      {FAQ.map((item, i) => (
        <section key={i}>
          <h2>{item.q}</h2>
          <p>{item.a}</p>
        </section>
      ))}

      <h2>Still stuck?</h2>
      <p>
        Drop us a line at <a href="mailto:contact@learnai.example">contact@learnai.example</a> or
        open a thread on{" "}
        <a
          href="https://github.com/ruslanmv/learnai/discussions"
          target="_blank"
          rel="noreferrer noopener"
        >
          GitHub Discussions
        </a>
        . We read every message.
      </p>
    </LegalShell>
  );
}
