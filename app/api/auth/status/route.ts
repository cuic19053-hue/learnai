import { NextResponse } from "next/server";
import { flags } from "@/lib/env";

export const dynamic = "force-dynamic";

/**
 * GET /api/auth/status
 *
 * Lightweight probe so the SignInModal can decide which sign-in methods
 * to surface. Returns a plain object — never throws, never leaks env.
 *
 * Shape:
 *   { signInEnabled: boolean, providers: { google: boolean, email: boolean } }
 */
export async function GET() {
  return NextResponse.json({
    signInEnabled: flags.authConfigured,
    providers: {
      google: flags.authConfigured && flags.googleConfigured,
      // Credentials provider depends on DATABASE_URL for user lookup.
      email: flags.authConfigured && flags.databaseConfigured,
    },
  });
}
