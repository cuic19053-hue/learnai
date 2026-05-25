# LearnAI · Admin & OllaBridge setup

Quick ops guide for getting an admin session and wiring the AI
providers (OllaBridge Cloud as the default).

---

## 1 · How to log in as admin

The app uses NextAuth with two providers (`lib/auth.ts`):

| Provider     | Trigger                                                        |
| ------------ | -------------------------------------------------------------- |
| Google OAuth | Set `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`                |
| Email + pw   | Set `DATABASE_URL` and create a `User` row with role `"ADMIN"` |

### Steps

1. Open `/login` (or any `/admin/*` URL — the layout redirects
   unauthenticated visitors there automatically).
2. Sign in with Google or email/password.
3. If your `User.role` is `ADMIN`, the admin pages render. Otherwise
   the layout bounces back to `/login?returnTo=/admin`.

### Creating the first admin (email/password)

```sql
-- After running `prisma db push` so the User table exists
INSERT INTO "User" (id, email, name, role, "password")
VALUES (
  gen_random_uuid(),
  'admin@yourdomain.com',
  'Admin',
  'ADMIN',
  -- bcrypt hash of your password; use:
  --   node -e "console.log(require('bcryptjs').hashSync('YOUR_PW', 12))"
  '$2a$12$...'
);
```

### Dev bypass

When running locally without a database, set `ADMIN_GATE_DISABLED=1`
to skip the role check on the admin layout. Never set this in
production — it leaves `/admin` open to anyone.

---

## 2 · How to wire OllaBridge Cloud

### Option A — environment variables (recommended for production)

```bash
# .env (or your deploy provider's secret store)
OLLABRIDGE_URL=https://ruslanmv-ollabridge.hf.space      # or api.ollabridge.com
OLLABRIDGE_API_KEY=ob_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
OLLABRIDGE_DEFAULT_MODEL=free-fast                       # or free-best, qwen2.5:1.5b
```

The shared client at `lib/ollabridge/client.ts` picks these up
automatically. `OLLABRIDGE_API_KEY` is sent as `Authorization:
Bearer ob_...` on every request; it never reaches the browser.

### Option B — admin UI (`/admin/providers`)

Sign in as admin, open **AI providers**, click the OllaBridge card.
The panel exposes:

- Base URL (defaults to the env var)
- Bearer token (masked after save; idempotent rotation)
- "Test connection" button → calls `/v1/chat/completions` with a
  "Say OK" payload and renders latency + model count
- Device-pairing flow for the alternative auth-mode

### How to mint the key

1. Log into the OllaBridge Cloud admin at
   `https://ruslanmv-ollabridge.hf.space/admin/login`.
2. Open the **API Keys** tab → **Create**, name it `learnai production`.
3. **Copy the plaintext immediately** — it's shown once.
4. Paste it into `OLLABRIDGE_API_KEY` or the admin UI.

---

## 3 · Acceptance checklist

- [ ] `/admin` redirects to `/login` when not authenticated
- [ ] `/admin` redirects to `/login?returnTo=/admin` when signed in
      as non-admin
- [ ] `OLLABRIDGE_API_KEY` set in the deployment environment
- [ ] `/admin/providers` shows OllaBridge as the bundled default
- [ ] Test connection in the admin UI returns ≥ 1 model under 5 s
- [ ] First chat from `/learn/*` produces a response in < 5 s on the
      healthy path
- [ ] 401 from OllaBridge surfaces a clear "key revoked or invalid"
      message to the admin (no retry on the fallback host)
- [ ] Network tab shows zero `ob_...` strings client-side

---

## 4 · Client behaviour notes (matches the integration brief)

The `lib/ollabridge/client.ts` already implements:

| Brief rule                                  | Where                       |
| ------------------------------------------- | --------------------------- |
| Timeout ≥ 30 s (configured to 45 s)         | `DEFAULT_CONFIG.timeoutMs`  |
| No retry on 401 / 402                       | `callJson` deterministic-fail branch |
| Bearer auth header                          | `withHeaders`               |
| Key precedence: apiKey ⟶ deviceToken        | `withHeaders`               |
| Default model alias `free-fast`             | `DEFAULT_CONFIG.defaultModel` |
| Cold-start detection (`waking: true`)       | `OllabridgeError`           |
| Fallback host on 502 / 503 / 504            | `callJson` retry branch     |
| `maskKey()` helper for safe logs            | exported                    |

When you need to call OllaBridge from a new route, just import the
existing `chat()` function — no SDK setup needed:

```ts
import { chat } from "@/lib/ollabridge/client";
const res = await chat({
  messages: [{ role: "user", content: "Say OK" }],
  max_tokens: 5,
});
console.log(res.choices[0]?.message.content);
```
