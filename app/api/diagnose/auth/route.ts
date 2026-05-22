import { handler, ok } from "@/lib/api";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET /api/diagnose/auth
 *
 * One-stop readiness check for Google OAuth sign-in. Surfaces every
 * piece of state that has to line up for the OAuth handshake to
 * complete successfully:
 *
 *   - effectiveOrigin / authorisedRedirectUris  → Google Cloud Console
 *   - NEXTAUTH_URL vs request host              → cookie scope
 *   - googleConfigured                          → env vars present
 *   - database.schemaReady                      → PrismaAdapter can
 *                                                  read/write Account
 *
 * The last one was the recurring P2021 case: NextAuth derives the user
 * fine, then PrismaAdapter tries to look up `Account` and crashes
 * because production migrations were never applied. Surfacing it here
 * means one URL tells the operator everything they need to fix.
 *
 * Lives outside /api/auth/* on purpose — anything matching /api/auth/<x>
 * is otherwise caught by NextAuth's [...nextauth] handler.
 *
 * Safe to expose — surfaces only public config that the OAuth handshake
 * already broadcasts in the browser URL bar during sign-in.
 */
export const GET = handler(async (req: Request) => {
  const requestUrl = new URL(req.url);
  const derivedOrigin = `${requestUrl.protocol}//${requestUrl.host}`;
  const configuredOrigin = env.nextAuthUrl ?? null;
  const effectiveOrigin = configuredOrigin ?? derivedOrigin;

  const database = await probeDatabase();
  const readyForOAuth =
    !!env.googleClientId &&
    !!env.googleClientSecret &&
    !!configuredOrigin &&
    configuredOrigin === derivedOrigin &&
    database.schemaReady;

  return ok({
    readyForOAuth,
    effectiveOrigin,
    googleCloudConsole: {
      authorizedJavaScriptOrigins: [effectiveOrigin],
      authorizedRedirectUris: [`${effectiveOrigin}/api/auth/callback/google`],
    },
    env: {
      NEXTAUTH_URL: configuredOrigin,
      derivedFromRequest: derivedOrigin,
      mismatch: configuredOrigin !== null && configuredOrigin !== derivedOrigin,
    },
    providers: {
      googleConfigured: !!env.googleClientId && !!env.googleClientSecret,
      googleClientId: env.googleClientId ?? null,
    },
    database,
    nextActions: buildNextActions({
      mismatch: configuredOrigin !== null && configuredOrigin !== derivedOrigin,
      schemaReady: database.schemaReady,
      googleConfigured: !!env.googleClientId && !!env.googleClientSecret,
      effectiveOrigin,
      derivedOrigin,
    }),
  });
});

type DatabaseProbe = {
  reachable: boolean;
  schemaReady: boolean;
  /** Brief, single-line description of the failure (if any). */
  error?: string;
  /** Copy-paste command that fixes the most likely cause. */
  remediation?: string;
};

async function probeDatabase(): Promise<DatabaseProbe> {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    return {
      reachable: false,
      schemaReady: false,
      error: err instanceof Error ? err.message.split("\n")[0] : String(err),
      remediation:
        "Check DATABASE_URL in Vercel Production env. If the Neon password was rotated, paste the current pooled connection string and redeploy.",
    };
  }
  try {
    await prisma.user.count();
    return { reachable: true, schemaReady: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isMissing = msg.includes("does not exist") || msg.includes("P2021");
    return {
      reachable: true,
      schemaReady: false,
      error: msg.split("\n")[0],
      remediation: isMissing
        ? "Run `npx prisma migrate deploy` against the production DATABASE_URL — the schema has never been applied to this database."
        : "Unexpected Prisma error. Inspect the schema vs prisma/migrations/.",
    };
  }
}

function buildNextActions(input: {
  mismatch: boolean;
  schemaReady: boolean;
  googleConfigured: boolean;
  effectiveOrigin: string;
  derivedOrigin: string;
}): string[] {
  const actions: string[] = [];
  if (!input.googleConfigured) {
    actions.push(
      "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel Production env, then redeploy."
    );
  }
  if (input.mismatch) {
    actions.push(
      `NEXTAUTH_URL (${input.effectiveOrigin}) and the host serving this request (${input.derivedOrigin}) disagree. Pick one canonical host and align Vercel domain redirects, NEXTAUTH_URL, and the Google OAuth client.`
    );
  }
  if (!input.schemaReady) {
    actions.push(
      "Apply Prisma migrations to the production database: `export DATABASE_URL=...; npx prisma migrate deploy`."
    );
  }
  if (actions.length === 0) {
    actions.push(
      `All checks pass. Paste this into Google Cloud Console → OAuth client → Authorized redirect URIs: ${input.effectiveOrigin}/api/auth/callback/google`
    );
  }
  return actions;
}
