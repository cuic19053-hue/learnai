# Free-tier production deployment — three stacks

**TL;DR — PostgreSQL alone is *not* enough.** Vercel covers the
Next.js frontend and serverless API routes. Everything else LearnAI
needs at production scale lives outside Vercel: a database, an LLM
inference layer, object storage, a transactional email provider, a
durable key-value cache, and (optionally) background jobs and a
vector store. This doc maps each subsystem to a free-tier vendor and
shows three full-stack deployment shapes you can pick from.

---

## What LearnAI needs beyond Vercel

| Subsystem | What it does | Today | What it needs in prod |
|---|---|---|---|
| **Database** | User accounts, projects, lessons, audit log, parent prefs, AI provider config | localStorage + in-memory | PostgreSQL (or D1 if Cloudflare) + Prisma |
| **LLM inference** | Every `jsonChat` / `chat` call — WikiTest, project lessons, tutor rail, interview routes | OllaBridge bundled default | A hosted LLM that LearnAI's provider chain can reach |
| **Auth** | Sign-in, sessions, OAuth | NextAuth in guest mode | NextAuth + a session table + Google OAuth |
| **Object storage** | Uploaded PDFs, photos of worksheets, voice clips, generated PDF reports | none | S3-compatible bucket |
| **Email** | Magic-link sign-in, parent end-of-session summaries, billing alerts | none | Transactional email API |
| **KV / cache** | Lesson cache, WikiTest cache, AI provider config, rate-limit buckets, tutor session memory | process-local Maps (lost on cold start) | Redis-shaped KV |
| **Background jobs** | SRS reminder emails, weekly parent digests, audit-log snapshots, long WikiTest generations | none | Queue + worker |
| **Voice (future)** | STT for Feynman explain-back, TTS for read-aloud | Web Speech API (browser) | Whisper + a TTS endpoint |
| **Vector DB (future)** | RAG over uploaded PDFs, persona long-term memory | none | pgvector or hosted vector DB |
| **Error tracking** | Catch + diagnose runtime failures | console.log | Sentry / similar |

**The four that matter for *first production deploy* are: DB · LLM ·
email · KV.** The others can wait until features that need them ship.

---

## Stack 1 — The pragmatic stack (recommended for first deploy)

**One sentence:** keep what already works (Vercel + OllaBridge), add the
four production essentials with the smallest possible vendor count.

```
                 ┌────────────────────┐
                 │   Vercel Hobby     │  Next.js · API routes · CDN
                 │     (free)         │
                 └─────────┬──────────┘
                           │
       ┌───────────────────┼───────────────────────────────┐
       │                   │                                │
       ▼                   ▼                                ▼
┌─────────────┐   ┌───────────────────┐         ┌───────────────────────┐
│  Neon       │   │  Hugging Face     │         │  Upstash Redis        │
│  Postgres   │   │   Spaces          │         │  (free tier)          │
│  (3 GB free)│   │  OllaBridge       │         │  AI cache · rate-     │
└─────────────┘   │  bridge (free)    │         │  limit · tutor memory │
                  └───────────────────┘         └───────────────────────┘
       │                   │                                │
       ▼                   ▼                                ▼
┌─────────────┐   ┌───────────────────┐         ┌───────────────────────┐
│ Vercel Blob │   │   Resend          │         │   xAI Grok            │
│ uploads     │   │  email (free      │         │  $25 free credit      │
│ 5 GB free   │   │   100/day)        │         │  (fallback to free    │
└─────────────┘   └───────────────────┘         │   OllaBridge)         │
                                                └───────────────────────┘
```

**Wire-up:**

| LearnAI subsystem | Service | Free tier | Env var(s) |
|---|---|---|---|
| Postgres | [Neon](https://neon.tech) | 3 GB · branching · always-on with autoscaling | `DATABASE_URL` |
| Primary LLM | [Hugging Face Spaces](https://huggingface.co/spaces/ruslanmv/ollabridge) (existing OllaBridge) | sleeps after idle, free 7 GB RAM | `OLLABRIDGE_URL` |
| Secondary LLM (better quality) | [xAI Grok](https://console.x.ai) | $25 promo credits (30 days) | `XAI_API_KEY` |
| KV / cache | [Upstash Redis](https://upstash.com) | 10k commands/day · 256 MB | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Object storage | [Vercel Blob](https://vercel.com/storage/blob) | 5 GB · 1 GB egress/month | `BLOB_READ_WRITE_TOKEN` |
| Email | [Resend](https://resend.com) | 100 emails/day · 3k/month | `RESEND_API_KEY`, `EMAIL_FROM` |
| OAuth | Google Cloud Console | unlimited | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| Error tracking (optional) | [Sentry](https://sentry.io) | 5k errors/month | `SENTRY_DSN` |

**Capacity at $0/month:**
- ~3,000 active learners (Neon row count + Vercel function-invocation limit)
- ~100 sign-in emails/day (Resend cap)
- Unlimited learners on the *bundled* OllaBridge — premium models capped at $25 of Grok credit

**Pain points to plan for:**
- HF Spaces cold-starts (~30 s wake-up) — already handled by our static-lesson fallback, but worth a banner if relied on
- Vercel function execution caps at 60 s on Hobby — fine for our 75 s lesson timeout? **No.** Bump generation to Edge or move long calls to a Cloudflare Worker on a custom domain
- Resend's 100/day cap is fine until you have ~500 DAU; switch to **Mailtrap (1k/day)** or **Postmark (100/day)** if you outgrow it

**Recommended for:** first production deploy, solo maintainer, ≤ 3k MAU.

---

## Stack 2 — The all-in-one stack (Supabase as the spine)

**One sentence:** swap Neon + Vercel Blob + part of NextAuth + (future)
pgvector for a single Supabase project, so most of the backend is one
vendor.

```
                 ┌────────────────────┐
                 │   Vercel Hobby     │  Next.js · API routes
                 │     (free)         │
                 └─────────┬──────────┘
                           │
                           ▼
                 ┌────────────────────┐
                 │     Supabase       │
                 │  (free tier)       │
                 │                    │
                 │  ▸ Postgres        │
                 │  ▸ Auth (replaces  │
                 │    NextAuth Google │
                 │    + email magic)  │
                 │  ▸ Storage         │
                 │  ▸ pgvector        │
                 │  ▸ Edge functions  │
                 │  ▸ Realtime        │
                 └─────────┬──────────┘
                           │
                           ▼
              ┌──────────────────────┐
              │  Hugging Face Spaces │  OllaBridge bridge
              │   + xAI Grok credit  │  + paid fallback
              └──────────────────────┘
```

**Wire-up:**

| LearnAI subsystem | Service | Free tier |
|---|---|---|
| Postgres + Storage + Auth + Vector + Edge functions | [Supabase](https://supabase.com) | 500 MB DB · 1 GB storage · 50k MAU · 2 GB egress · pgvector built-in |
| LLM primary | Hugging Face Spaces (OllaBridge) | free |
| LLM premium | xAI Grok | $25 credits |
| Email | Supabase Auth's built-in email (uses Inbucket in dev, your own SMTP in prod via Resend free tier) | 100 emails/hour from Supabase Auth in free tier |

**What you trade for the simplicity:**
- Auth changes from NextAuth to Supabase Auth (less control, simpler API)
- The 500 MB Postgres ceiling is the binding limit at ~5k learners
- Storage egress capped at 2 GB/month — watch lesson cover images

**Recommended for:** small team that values having one dashboard over
having the cheapest scaling curve. Best free-tier "ready to demo to a
sponsor" stack.

---

## Stack 3 — The Cloudflare stack (most generous limits, more work)

**One sentence:** move *everything* to Cloudflare so the production
ceiling matches the Cloudflare free tier — which is significantly
higher on every axis than Vercel + Neon, at the cost of a Prisma
migration from Postgres to D1 (SQLite-at-the-edge).

```
                 ┌────────────────────┐
                 │ Cloudflare Pages   │  Next.js (next-on-pages adapter)
                 │     (free)         │
                 └─────────┬──────────┘
                           │
       ┌───────────────────┼───────────────────────────────┐
       │                   │                                │
       ▼                   ▼                                ▼
┌─────────────┐   ┌───────────────────┐         ┌───────────────────────┐
│ Cloudflare  │   │   Cloudflare      │         │  Cloudflare R2        │
│   D1        │   │   Workers AI      │         │  object storage       │
│ (SQLite)    │   │  Llama-3 · Whisper│         │  10 GB free           │
│ 5 GB free   │   │  free tier        │         │  (no egress fee)      │
└─────────────┘   └───────────────────┘         └───────────────────────┘
       │                   │                                │
       ▼                   ▼                                ▼
┌─────────────┐   ┌───────────────────┐         ┌───────────────────────┐
│ Cloudflare  │   │   Workers KV      │         │ Cloudflare Email      │
│   Queues    │   │   (free, 100k     │         │  Workers (free)       │
│ 1M msg free │   │   reads/day)      │         │                       │
└─────────────┘   └───────────────────┘         └───────────────────────┘
```

**Wire-up:**

| LearnAI subsystem | Service | Free tier |
|---|---|---|
| Frontend + APIs | [Cloudflare Pages](https://pages.cloudflare.com) | unlimited bandwidth · 500 builds/month |
| DB | [Cloudflare D1](https://developers.cloudflare.com/d1) | 5 GB · 25 M reads/day · 100k writes/day |
| LLM primary | [Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai) | Llama-3-8b, Mistral-7b, Whisper-tiny on free tier (10k req/day) |
| LLM premium fallback | xAI Grok | $25 credits |
| KV / cache | Workers KV | 100k reads/day · 1k writes/day · 1 GB |
| Object storage | Cloudflare R2 | 10 GB · zero egress fees |
| Background jobs | Cloudflare Queues | 1 M messages/month |
| Email | Cloudflare Email Workers | free, requires your own domain |
| Vector DB (future) | Cloudflare Vectorize | 30 M dimensions free |

**Migration work the maintainer must do:**
1. Swap `prisma generate` datasource from `postgresql` to `sqlite` and adapt the schema (no `JSONB`, different ENUM handling)
2. Add the `@cloudflare/next-on-pages` adapter to the Next.js build
3. Add a new provider implementation in `lib/ai/providers.ts` for Workers AI (it's OpenAI-shape with an account-scoped base URL)
4. Replace `lib/ai/config-store.ts`'s `Map` with Workers KV calls — solves the cold-start persistence problem permanently
5. Rewrite long-running endpoints (lesson generation, WikiTest generate) as Worker invocations queued via Cloudflare Queues — no 60 s function cap

**Capacity at $0/month:**
- ~25k MAU before D1 row caps bite
- ~10k AI requests/day via Workers AI for free (then $0.011 / 1k tokens)
- Effectively unlimited bandwidth
- Cloudflare's CDN edge means lower P99 latency than Vercel + Neon for global users

**Recommended for:** when you outgrow Stack 1 or 2 and don't want to
pay $20+/month for Postgres. The migration is real work (~1 week for
someone who's done it before).

---

## Side-by-side comparison

| | Stack 1 (pragmatic) | Stack 2 (Supabase) | Stack 3 (Cloudflare) |
|---|---|---|---|
| Monthly cost at MVP scale | $0 | $0 | $0 |
| Number of vendors | 5–6 | 3 | 1 (Cloudflare) + 1 (HF) |
| DB free ceiling | Neon 3 GB | Supabase 500 MB | D1 5 GB |
| LLM free ceiling | OllaBridge (HF Space) | OllaBridge + Grok $25 | Workers AI 10k req/day + Grok $25 |
| Setup time | ~2 hours | ~1 hour | ~1 week (Prisma migration) |
| Vendor lock-in | low | medium (Supabase Auth) | high (D1 + Workers) |
| Edge cold-start latency | medium (Vercel + Neon) | medium (Supabase) | **lowest** (Cloudflare edge) |
| When it breaks first | 60s Vercel function cap | Supabase 500 MB DB | rarely — most generous tier |
| Best for | first deploy / solo maintainer | small team / one dashboard | scale > $20/mo on other stacks |

---

## What to do today

If you want **production-ready in one weekend** with what's already in
this repo:

1. Sign up for Neon, Vercel, Resend, Upstash, Hugging Face — all free,
   all no-card.
2. Set six env vars on Vercel (`DATABASE_URL`, `NEXTAUTH_SECRET`,
   `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID/SECRET`, `RESEND_API_KEY`).
3. Add three more for the optional upgrades (`OLLABRIDGE_URL`,
   `XAI_API_KEY`, `UPSTASH_REDIS_REST_URL/TOKEN`).
4. Run the Prisma migration (`prisma migrate deploy`) — see
   [`docs/DEPLOYMENT-VERCEL.md`](./DEPLOYMENT-VERCEL.md).
5. Pair the OllaBridge device from `/admin/providers` once.
6. Hit `/api/ai/ping` from the deployed URL to confirm the chain is
   live: `{ reachable: true, latencyMs: …, sample: "Pong!" }`.

That's it. Total budget: **$0/month**, total setup time: **~2 hours**,
total addressable audience on the free tier: **~3,000 active learners**.

When you outgrow that, the cheapest move is usually swapping Neon for
Supabase (Stack 2) before paying anyone. The Cloudflare migration
(Stack 3) is the move when you cross ~25k MAU — and by then,
sponsorship dollars should be flowing anyway.
