import type { Metadata } from "next";
import LegalShell from "@/components/legal/LegalShell";

export const metadata: Metadata = {
  title: "Terms — LearnAI",
  description:
    "Plain-language terms of service for the hosted LearnAI product. Apache 2.0 source. No paywall.",
};

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Terms"
      title="Terms of service"
      subtitle="Effective 22 May 2026 · short, fair, and human-readable"
      active="terms"
    >
      <p>
        <strong>The short version.</strong> LearnAI is an open-source project. Its only purpose is
        to help people learn — children, students, professionals, seniors. It is free to use, the
        source is Apache 2.0, and there is no premium tier or paywall. These terms cover the hosted
        service; by using it you agree to them, and if you don&apos;t, please don&apos;t.
      </p>

      <h2>1. The service</h2>
      <p>
        LearnAI is an open-source AI teacher whose scope is to help people learn. Lessons, tests,
        and tutor replies exist to support learners of every age — not to sell anything, not to
        collect training data, not to lock features behind a tier. We host a free public version for
        anyone to use, and the same Apache 2.0 source is at{" "}
        <a href="https://github.com/ruslanmv/learnai" target="_blank" rel="noreferrer noopener">
          github.com/ruslanmv/learnai
        </a>{" "}
        so you can read, fork, or self-host it.
      </p>

      <h2>2. Accounts</h2>
      <p>
        No account is required to use LearnAI. If you choose to sign in (Google or email), you are
        responsible for keeping your sign-in credentials secure. We will never ask you for your
        password.
      </p>
      <p>
        Sign-up is open to anyone. Children under 13 may use the Little Learner world only through a
        parent-managed profile — see the Children&apos;s Privacy section in the{" "}
        <a href="/legal/privacy">Privacy policy</a>.
      </p>

      <h2>3. Free tier · our 1-year commitment</h2>
      <p>
        For at least the first year of public operation, LearnAI runs entirely on free-tier cloud
        services and is funded by sponsors and donations. There is no premium tier, no paywall, no
        &quot;upgrade for AI&quot; trick, and no advertising.
      </p>
      <p>
        When optional paid services are eventually added (for example voice-mode tutoring or
        classroom dashboards), the core lessons, worlds, and tutor rail will remain free. Sponsors
        who funded the first year will be credited in writing.
      </p>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>scrape, mass-generate lessons or tests beyond reasonable individual use;</li>
        <li>use the service to harass, defame, or harm anyone, including children;</li>
        <li>attempt to extract API keys, training data, or model weights from the service;</li>
        <li>misrepresent generated content as a human-authored authoritative source;</li>
        <li>circumvent the safety classifier, age gating, or content allow-list.</li>
      </ul>
      <p>
        We will rate-limit, block, or revoke access for clear violations. We try hard to keep this
        list short and obvious — if in doubt, ask at{" "}
        <a href="mailto:contact@ruslanmv.com">contact@ruslanmv.com</a>.
      </p>

      <h2>5. Content and citations</h2>
      <p>
        AI-generated lessons, tests, and tutor replies are produced by third-party language models.
        They are wrong sometimes. We do our best with citation integrity (every WikiTest question
        links to the source heading; every &quot;Why this?&quot; affordance cites the data behind
        it), but you should treat AI output as a thinking partner, not as an authoritative source.
      </p>
      <p>
        Wikipedia article text reused inside WikiTest is licensed under{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noreferrer noopener"
        >
          CC BY-SA 4.0
        </a>
        . Attribution is preserved on every page that displays it.
      </p>

      <h2>6. Sponsorship</h2>
      <p>
        Sponsors can fund LearnAI via{" "}
        <a href="https://github.com/sponsors/ruslanmv" target="_blank" rel="noreferrer noopener">
          GitHub Sponsors
        </a>{" "}
        or by direct partnership. Sponsorship buys recognition (name, logo, named partnership
        section) — it does not buy closed features, paywalled content, or influence over learner
        data.
      </p>

      <h2>7. Intellectual property</h2>
      <p>
        The source code is licensed under{" "}
        <a
          href="https://www.apache.org/licenses/LICENSE-2.0"
          target="_blank"
          rel="noreferrer noopener"
        >
          Apache 2.0
        </a>
        . You may fork, modify, host, and distribute it under those terms.
      </p>
      <p>
        Content you create on the platform (project drafts, attempted answers, free-text
        explanations) belongs to you. We don&apos;t claim ownership and we don&apos;t train models
        on it.
      </p>

      <h2>8. Service availability</h2>
      <p>
        LearnAI is provided <strong>as-is</strong>. We make no SLA guarantees during the year-1
        free-tier period. We will publish status updates and post-mortems in the GitHub repository
        when outages happen.
      </p>

      <h2>9. Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, LearnAI and its contributors are not
        liable for indirect, incidental, or consequential damages arising from use of the service.
        The service is provided without warranties of any kind, express or implied.
      </p>

      <h2>10. Changes</h2>
      <p>
        We&apos;ll update the effective date at the top of this page when these terms change.
        Material changes will be announced in the project changelog and on the homepage. Continued
        use after a material change constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions about these terms: <a href="mailto:contact@ruslanmv.com">contact@ruslanmv.com</a>.
        Privacy-specific matters: see <a href="/legal/privacy">Privacy policy</a>.
      </p>
    </LegalShell>
  );
}
