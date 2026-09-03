import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Privacy — LearnAI",
  description:
    "How LearnAI handles your data. Guest-first, local-by-default, no ads, no tracking, no sale of learner data.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Privacy"
      title="Privacy policy"
      subtitle="Effective 22 May 2026 · plain language, no dark patterns"
      active="privacy"
    >
      <p>
        <strong>The short version.</strong> LearnAI is guest-first by design. You can use the entire
        product without an account, without an email, and without a card. When you do sign in, we
        collect the minimum needed to sync your progress across devices. We do not run ads, we do
        not sell data, and we do not train AI models on your child&apos;s answers.
      </p>

      <h2>1. What we collect</h2>

      <h3>1.1 Guest mode (no sign-in)</h3>
      <p>
        Your progress, XP, streaks, parent settings, and project drafts live in{" "}
        <strong>your browser&apos;s localStorage and a cookie</strong> on the device you&apos;re
        using. We do not see them. Closing the tab keeps them. Clearing your browser data deletes
        them.
      </p>

      <h3>1.2 Signed-in mode</h3>
      <p>If you sign in (Google, email magic link, or email + password), we store on our server:</p>
      <ul>
        <li>your email address</li>
        <li>your name (only if you provide it)</li>
        <li>your learner stage (Kids / GRADE_7 / GRADE_8 / GRADE_9 / Professional / Senior)</li>
        <li>your lesson progress, XP, streaks, and completed projects</li>
        <li>session tokens so you stay signed in</li>
      </ul>
      <p>
        That&apos;s it. We do not store device fingerprints, advertising identifiers, or third-party
        tracking cookies.
      </p>

      <h3>1.3 AI-tutor interactions</h3>
      <p>
        When you ask the AI tutor a question, your prompt is forwarded to the AI provider currently
        configured for your instance (by default the bundled{" "}
        <a
          href="https://huggingface.co/spaces/ruslanmv/ollabridge"
          target="_blank"
          rel="noreferrer noopener"
        >
          OllaBridge
        </a>{" "}
        bridge running on Hugging Face Spaces, or any provider an administrator has added — OpenAI,
        Anthropic, xAI Grok, or self-hosted Ollama). The provider&apos;s own privacy policy applies
        to what they do with your prompt after we send it. We do not keep a server-side copy of
        individual chat turns beyond the live session.
      </p>

      <h2>2. Children&apos;s privacy (COPPA &amp; equivalents)</h2>
      <p>
        The Little Learner world (ages 3–6) and GRADE_7 world (ages 7–11) are governed by stricter
        rules:
      </p>
      <ul>
        <li>
          A child profile is created and managed by a parent or guardian in the <code>/parent</code>{" "}
          dashboard. The child never enters an email address.
        </li>
        <li>Parent-controlled allow-lists determine which subjects the child can see.</li>
        <li>
          We do not collect the child&apos;s name beyond a first-name nickname, and that name lives
          locally unless the parent signs in to sync across devices.
        </li>
        <li>Child sessions are not used to train any AI model.</li>
      </ul>

      <h2>3. What we do not do</h2>
      <ul>
        <li>We do not sell or share learner data with advertisers.</li>
        <li>
          We do not run third-party trackers, pixels, or analytics scripts that profile users.
        </li>
        <li>We do not train models on the content of your sessions.</li>
        <li>We do not require an email address or phone number to start learning.</li>
      </ul>

      <h2>4. Wikipedia-sourced content</h2>
      <p>
        The WikiTest feature reuses Wikipedia article text under{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer noopener"
        >
          CC BY-SA 4.0
        </a>{" "}
        with attribution preserved on every generated test. We send a<code>User-Agent</code> header
        identifying LearnAI so Wikipedia can rate-limit us politely.
      </p>

      <h2>5. Cookies</h2>
      <p>We use a small number of strictly-necessary cookies:</p>
      <ul>
        <li>
          <code>learnai_progress_v1</code> — your guest-mode progress state. Local to your device.
        </li>
        <li>
          <code>next-auth.session-token</code> — only set when you sign in. Lets you stay signed in
          across page loads.
        </li>
        <li>
          <code>guestMode</code> — a flag remembering that you chose to continue without an account.
        </li>
      </ul>
      <p>We do not set advertising or analytics cookies.</p>

      <h2>6. Your rights</h2>
      <p>You can:</p>
      <ul>
        <li>
          <strong>Use everything as a guest</strong> — nothing leaves your device.
        </li>
        <li>
          <strong>Export your data</strong> — the parent dashboard has a one-click JSON export.
        </li>
        <li>
          <strong>Delete your account — instantly, from inside the app.</strong> Open Account
          settings and choose &quot;Delete account&quot;. Everything we store about you (progress,
          attempts, sessions, OAuth links) is removed on the spot — there is no soft-delete window
          and no manual ticket to file. The hosted service keeps no shadow copy.
        </li>
        <li>
          <strong>Get human help</strong> — if anything looks wrong, write to{" "}
          <a href="mailto:contact@ruslanmv.com">contact@ruslanmv.com</a>.
        </li>
        <li>
          <strong>Inspect the source</strong> — every line of how we handle data is public at{" "}
          <a href="https://github.com/ruslanmv/learnai" target="_blank" rel="noreferrer noopener">
            github.com/ruslanmv/learnai
          </a>
          .
        </li>
      </ul>

      <h2>7. Sub-processors</h2>
      <p>The hosted LearnAI service runs on:</p>
      <ul>
        <li>
          <strong>Vercel</strong> — application hosting + CDN.
        </li>
        <li>
          <strong>Neon</strong> (or a comparable Postgres host) — encrypted user database.
        </li>
        <li>
          <strong>Hugging Face Spaces</strong> — the bundled OllaBridge AI inference bridge.
        </li>
        <li>
          <strong>Google</strong> — only if you choose &quot;Continue with Google&quot; for sign-in.
        </li>
        <li>
          <strong>Resend</strong> (or equivalent SMTP) — only for transactional sign-in emails when
          you choose magic-link authentication.
        </li>
      </ul>
      <p>
        Self-hosters can run LearnAI against a different set of providers (or no provider beyond a
        local Ollama install) — see{" "}
        <a
          href="https://github.com/ruslanmv/learnai/blob/main/docs/DEPLOYMENT-FREE-TIER.md"
          target="_blank"
          rel="noreferrer noopener"
        >
          DEPLOYMENT-FREE-TIER.md
        </a>
        .
      </p>

      <h2>8. Changes to this policy</h2>
      <p>
        We&apos;ll post a new effective date at the top of this page and announce material changes
        in the changelog. We will never silently weaken these protections.
      </p>

      <h2>9. Contact</h2>
      <p>
        Privacy questions, COPPA escalations, or general questions:{" "}
        <a href="mailto:contact@ruslanmv.com">contact@ruslanmv.com</a>. Account deletion does not
        need an email — it&apos;s a one-click action in your account settings. For security reports,
        see{" "}
        <a
          href="https://github.com/ruslanmv/learnai/blob/main/SECURITY.md"
          target="_blank"
          rel="noreferrer noopener"
        >
          SECURITY.md
        </a>
        .
      </p>
    </LegalShell>
  );
}
