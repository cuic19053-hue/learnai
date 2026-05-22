# Deploy LearnAI to Vercel free with Google sign-in

End-to-end walkthrough for running a fully functional LearnAI instance
on Vercel's free tier, including Google OAuth and persistent user
profiles. Everything below stays inside free quotas at a small scale.

> **TL;DR**
> 1. Fork → import to Vercel.
> 2. Create a free Neon Postgres database, copy the pooled connection
>    string.
> 3. Create a Google OAuth client, copy client id + secret.
> 4. Set six env vars on Vercel.
> 5. Deploy. Sign-in with Google works.

---

## What you get on Vercel free

| Capability | Tier | Notes |
|---|---|---|
| Hosting Next.js 15 App Router | Hobby (free) | Unlimited deploys, 100 GB-hours of compute, 100 GB bandwidth |
| Edge / Serverless functions | Hobby | Used by every `app/api/*` route in this repo |
| Custom domain | Hobby | Free with your own DNS |
| Build cache | Hobby | Speeds incremental deploys |
| Environment variables | Hobby | Encrypted at rest, per-environment overrides |

What's **not** included and needs an external free service:
- **Database** → Neon (recommended) or Vercel Postgres (also free tier).
- **Image storage** → only needed if Track B image generation is wired
  up; not required for sign-in.
- **AI provider** → OllaBridge default already runs on Hugging Face
  Spaces (free).

---

## Step 1 — Free Postgres on Neon

[Neon](https://neon.tech) gives you a free always-on Postgres without a
credit card. Avoids the Vercel Postgres "sleeps after 5 minutes" gotcha.

1. Sign up → create a new project (any region).
2. Open **Connection Details** in the dashboard.
3. Tick **Pooled connection** (important — the unpooled URL doesn't work
   well with serverless).
4. Copy the connection string. It looks like:
   ```
   postgres://USER:PASSWORD@HOST-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require
   ```

> *Alternate:* in the Vercel dashboard, **Storage → Create → Postgres
> (Hobby)**. You'll get a `POSTGRES_PRISMA_URL`. Use that as your
> `DATABASE_URL` instead.

---

## Step 2 — Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create or pick a project.
3. **APIs & Services → OAuth consent screen** → External → fill in app
   name, support email, developer contact. You can leave it in *Testing*
   mode while you confirm the integration works; you'll only see your
   own Google account during sign-in until you submit for verification.
4. **Credentials → Create Credentials → OAuth client ID** → Web app.
5. **Authorised redirect URIs** — add one entry per deploy URL you'll
   use:
   ```
   https://<your-app>.vercel.app/api/auth/callback/google
   https://your-custom-domain.com/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
6. Copy **Client ID** and **Client secret**.

> The redirect URI is the single most common cause of sign-in failures.
> If Google returns "redirect_uri_mismatch", confirm that exactly the URL
> NextAuth is calling appears in this list — including the protocol and
> the `/api/auth/callback/google` suffix.

---

## Step 3 — Vercel environment variables

In the Vercel project → **Settings → Environment Variables**, add the
following for **Production** (also add to *Preview* if you want sign-in
on PR previews):

| Variable | Source | Required for sign-in? |
|---|---|---|
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` once, paste the output | **Yes** |
| `NEXTAUTH_URL` | The canonical URL Vercel deployed to, e.g. `https://learnai.vercel.app` | **Yes in production** |
| `DATABASE_URL` | The pooled Neon URL from step 1 | **Yes** |
| `GOOGLE_CLIENT_ID` | Step 2 | **Yes** |
| `GOOGLE_CLIENT_SECRET` | Step 2 | **Yes** |
| `OLLABRIDGE_URL` | Defaults to `https://ruslanmv-ollabridge.hf.space` — only set to override | No |
| `OLLABRIDGE_MODEL` | Defaults to `qwen2.5:1.5b` — set to a paired premium model if you have a token | No |
| `OLLABRIDGE_TOKEN` | OllaBridge device token if you've paired one | No |

Sanity check after entering them:
- `NEXTAUTH_URL` must **not** have a trailing slash.
- `DATABASE_URL` must use the *pooled* host (contains `-pooler`).
- `NEXTAUTH_SECRET` must be at least 32 characters of base64.

---

## Step 4 — Tell Prisma to migrate on deploy

The repo's `package.json` already runs `prisma generate` on install.
For the first deploy you also need a migration to create the auth
tables Neon doesn't yet have.

Option A — one-shot from your machine (recommended, simplest):

```bash
DATABASE_URL='postgres://…?sslmode=require' npx prisma migrate deploy
```

Run that once after creating the Neon database. It applies the schema
in `prisma/schema.prisma`. Subsequent schema changes follow the same
command.

Option B — auto-migrate on every Vercel build (riskier, can fail builds):

In Vercel project → **Settings → General → Build & Development
Settings → Build Command**, replace the default with:

```bash
prisma migrate deploy && next build
```

---

## Step 5 — Deploy

Push to your default branch. Vercel will:

1. Run `npm install` (triggers `prisma generate`).
2. Run `next build`.
3. Deploy.

Visit your URL. The header still shows **Start free** + a small
**Sign in** button. Open the modal — Google appears. Click → Google
consent screen → back to the app, signed in.

---

## How to verify it's working

Once deployed, open these in the browser:

| URL | Expected |
|---|---|
| `/` | Homepage renders, all six journey cards link to their stage page |
| `/api/auth/status` | `{"signInEnabled":true,"providers":{"google":true,"email":true}}` |
| `/api/auth/providers` | JSON listing Google as an available provider |
| `/api/auth/session` | `{}` if not signed in, `{user:{…},expires:"…"}` if signed in |
| `/api/auth/signin/google` | Redirects to Google consent |
| `/api/auth/error` | Redirects home (no JSON leak) |
| `/licenses` | Static asset attribution page |

If `/api/auth/status` still returns `signInEnabled: false`, your env
vars haven't propagated. Redeploy after saving them.

---

## Cost expectations

For a personal / community-scale deployment:

| Service | Free tier | Where you'd outgrow it |
|---|---|---|
| Vercel Hobby | 100 GB-hours compute, 100 GB bandwidth | High-traffic launches |
| Neon free | 0.5 GB storage, 191.9 compute hours / month | Thousands of users |
| Google OAuth | Free | Once you submit verification, no quota |
| OllaBridge `qwen2.5:1.5b` | Free, unauthenticated | Hugging Face Space rate limits — minor |

Realistically you can host LearnAI for **$0/month** while it grows to
the low thousands of monthly active users, then start paying when one
of the services pages you.

---

## Common errors and fixes

| Symptom | Cause | Fix |
|---|---|---|
| Modal shows "Sign-in is not enabled" | `NEXTAUTH_SECRET` missing | Set it in Vercel env vars, redeploy |
| Google returns `redirect_uri_mismatch` | Google credentials don't list this URL | Add the deploy URL's `/api/auth/callback/google` to the Google OAuth client |
| `NEXTAUTH_URL is undefined` error in logs | Var missing or has trailing slash | Set to the canonical https URL, no trailing slash |
| Prisma "table does not exist" on sign-in | Migration didn't run | Run `prisma migrate deploy` against `DATABASE_URL` once |
| `/api/auth/session` returns 500 | Most often: `NEXTAUTH_SECRET` not propagated | Confirm in Vercel env vars panel, redeploy |
| Sign-in works but no User row in DB | Prisma adapter not attached | Ensure `DATABASE_URL` is set; `lib/auth.ts` only attaches the adapter when present |

---

## What the code does for you

This repo already includes:

- **Resilient auth route** — `app/api/auth/[...nextauth]/route.ts`
  catches missing-secret and provider errors and falls back to guest
  responses, so a misconfigured deploy never breaks the homepage.
- **Status probe endpoint** — `GET /api/auth/status` reports which
  sign-in methods the deployment actually has.
- **Conditional `lib/auth.ts`** — Prisma adapter only attaches when
  `DATABASE_URL` is set; Google provider only registers when both
  `GOOGLE_CLIENT_*` vars are set; falls back to a placeholder secret
  if `NEXTAUTH_SECRET` is missing so module load never throws.
- **YouTube-style modal** — `components/SignInModal.tsx` hides Google +
  email buttons when the status probe says they aren't enabled, so users
  never see a broken state.

That means **the same code runs unchanged** in three deployment shapes:

1. **Local dev with no env** — guest-only, every page works.
2. **Preview / pseudo-prod with `NEXTAUTH_SECRET` only** — same as above.
3. **Full Vercel prod** — Google sign-in unlocks, user profiles persist
   in Neon.

---

## Next steps after first successful deploy

1. Go to **Google Cloud Console → OAuth consent screen → Publish app**
   so users beyond your test group can sign in.
2. Add a custom domain in Vercel and update `NEXTAUTH_URL` + the Google
   redirect URI list to include it.
3. (Optional) Wire OllaBridge with a paired premium model — see the
   `OLLABRIDGE_TOKEN` env var.
