# Development guide

The README is the project's public-facing pitch. This file is for
contributors and self-hosters — architecture, layout, env vars, and
the deploy paths in one place.

## Quick start

```bash
git clone https://github.com/ruslanmv/learnai.git
cd learnai
npm install
npm run dev
```

Open <http://localhost:3000>. LearnAI runs in guest mode by default —
no env vars, no database, no API keys required to render every learner
page and try the lesson player against the bundled OllaBridge AI bridge.

## Architecture

```
LearnAI
├── Web app            Next.js 15 (App Router) + TypeScript + Tailwind
├── Design system      Plus Jakarta Sans + Geist Mono · brand gradient
│                      · 6 journey accents · 6 Loop colors · .la-* tokens
├── Engines            Profile · Curriculum · Tutor · Assessment · Safety
├── Persistence        Prisma + PostgreSQL (optional)
├── Auth               NextAuth (optional, guest-first by default)
├── AI                 OllaBridge (bundled · free) · OpenAI · Anthropic · xAI · Ollama
└── Agents             Model Context Protocol (MCP) + A2A
```

## Routes shipped

```
/                                   homepage with stage cards
/onboarding                         5-step wizard
/learn                              stage-aware router → /learn/<world>
/learn/{kids,explorer,builder,scholar,adult,senior}   six learning worlds
/learn/lesson/[stage]               lesson player
/learn/wiki                         WikiTest hub
/learn/wiki/[testId]                test detail · train · quiz · report
/learn/projects                     projects hub with demo gallery
/learn/projects/new?world=…         project wizard
/learn/projects/[id]                AI-generated lesson workspace
/learn/certifications               vendor cert prep
/learn/languages                    7 languages, CEFR A1 → B2
/teachers                           AI teacher persona gallery
/parent                             parent dashboard
/progress                           learner progress
/admin                              full admin console (Overview / Learners /
                                    Loops / Worlds / AI Providers / Personas /
                                    Safety / Billing / Audit)
```

## Project layout

```
app/                        # Next.js App Router routes
components/
├── design/                 # Mark · PersonaAvatar · ImgSlot · icons
├── learn/                  # Journey · Mission · Lesson player · Shells
├── wiki/                   # WikiTest train · quiz · report views
├── projects/               # Project wizard + workspace + variants
├── parent/                 # Parent dashboard
└── admin/                  # Sidebar · KPIs · 8 admin pages
lib/
├── learn/                  # stages · journeys · loop · teachers · tutor · worlds
├── progress/               # XP + streak + cross-tab sync engine
├── ai/                     # multi-provider fallback chain · OllaBridge default
├── wiki/                   # client · extract · prompts · generate · cache
├── projects/               # wizard config · store · 5 demos · static fallbacks
└── parent/                 # per-child prefs (localStorage)
prisma/                     # Schema (optional persistence)
docs/                       # VISION, ROADMAP, deployment guides
personas/                   # AI teacher persona definitions
```

## Required environment variables

The bundled OllaBridge serves AI without any key, so a fresh deploy
needs just **five** secrets to run the full product:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | Neon, Supabase, or any Postgres — pooled connection string |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | The public URL of your deploy |
| `GOOGLE_CLIENT_ID` | Google Cloud Console → OAuth 2.0 client |
| `GOOGLE_CLIENT_SECRET` | Same OAuth client |

Optional upgrades — paid AI providers that light up automatically when
present:

| Variable | What it enables |
|---|---|
| `XAI_API_KEY` | xAI Grok ($25 free credits for new accounts) |
| `OPENAI_API_KEY` | OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic Claude |
| `OLLABRIDGE_TOKEN` | Premium OllaBridge tier via device pairing |

See [`/.env.example`](../.env.example) for the full annotated template.

## CI / CD

Two GitHub workflows ship with the repo:

- **`.github/workflows/ci.yml`** — runs on PRs and non-main pushes.
  Lint + type-check + build. No secrets needed (uses dummy env).
- **`.github/workflows/deploy-production.yml`** — runs on push to
  `main`. Applies Prisma migrations to Neon via `DATABASE_URL`, then
  rebuilds with real env to catch production-only issues before Vercel
  picks up the deploy.

## Deploy paths

- [`DEPLOYMENT-VERCEL.md`](./DEPLOYMENT-VERCEL.md) — Vercel + Neon +
  Google OAuth step-by-step
- [`DEPLOYMENT-FREE-TIER.md`](./DEPLOYMENT-FREE-TIER.md) — three
  full-stack $0/month designs (pragmatic, Supabase all-in-one,
  Cloudflare-everything)

## Live AI smoke test

After a fresh deploy, hit `/api/ai/ping` to confirm the provider chain
is reachable:

```bash
curl https://YOUR-APP.vercel.app/api/ai/ping
# → { "ok": true, "reachable": true, "latencyMs": 780, "sample": "Pong!" }
```

If `reachable: false`, open `/admin/providers` to inspect the chain.
