import { handler, ok } from "@/lib/api";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/diagnose/auth
 *
 * Returns the exact OAuth redirect URI NextAuth will send to Google,
 * plus the JavaScript origin Google needs to match, plus everything an
 * admin needs to copy-paste into the Google Cloud Console OAuth client
 * to fix a `redirect_uri_mismatch` error.
 *
 * Lives outside /api/auth/* on purpose — anything matching /api/auth/<x>
 * is otherwise caught by NextAuth's [...nextauth] handler, which returns
 * "This action with HTTP GET is not supported by NextAuth.js" for any
 * <x> it doesn't recognise.
 *
 * Safe to expose — surfaces only public config that the OAuth handshake
 * already broadcasts in the browser URL bar during sign-in.
 */
export const GET = handler(async (req: Request) => {
  // Prefer the configured NEXTAUTH_URL (what NextAuth itself uses);
  // fall back to deriving the host from the inbound request so an
  // operator hitting /api/diagnose/auth still gets useful output even
  // when NEXTAUTH_URL is missing or stale.
  const requestUrl = new URL(req.url);
  const derivedOrigin = `${requestUrl.protocol}//${requestUrl.host}`;
  const configuredOrigin = env.nextAuthUrl ?? null;
  const effectiveOrigin = configuredOrigin ?? derivedOrigin;

  return ok({
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
    hint: "Paste the entry under authorizedRedirectUris into Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 Client → Authorized redirect URIs. Then wait 5 minutes for Google to propagate.",
  });
});
