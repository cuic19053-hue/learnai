/**
 * Next.js Middleware for Authentication and Route Protection
 *
 * This middleware runs before every request to protect routes that require authentication.
 * It checks the user's session and redirects unauthenticated users to the login page.
 *
 * @module middleware
 * @author Ruslan Magana (ruslanmv.com)
 * @license MIT
 */

import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected routes that require authentication
 * Note: /dashboard is now public (guest mode) - only actions like booking require auth
 */
const protectedRoutes = ["/classroom", "/bookings", "/profile"];

/**
 * Admin-only routes
 */
const adminRoutes = ["/admin"];

/**
 * Teacher-only routes
 */
const teacherRoutes = ["/teacher"];

/**
 * Middleware function to protect routes
 *
 * @see https://next-auth.js.org/configuration/nextjs#middleware
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const pathname = req.nextUrl.pathname;

    // When auth is not configured (preview / guest-only deployments) we
    // don't enforce role checks — without a working NextAuth there is no
    // token to inspect anyway, and this lets the admin design demo render.
    const authConfigured = !!process.env.NEXTAUTH_SECRET;

    // Check if user is accessing admin routes
    if (authConfigured && adminRoutes.some((route) => pathname.startsWith(route))) {
      if (token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    // Check if user is accessing teacher routes
    if (authConfigured && teacherRoutes.some((route) => pathname.startsWith(route))) {
      if (token?.role !== "TEACHER" && token?.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/unauthorized", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      /**
       * Determine if user is authorized to access the route
       */
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Allow access to public routes
        if (!protectedRoutes.some((route) => pathname.startsWith(route))) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
  }
);

/**
 * Configure which routes the middleware should run on.
 *
 * We deliberately list ONLY the protected surfaces. Everything else (the
 * homepage, /learn/*, /onboarding, /teachers, /parent, /progress, the
 * marketing pages) bypasses middleware entirely.
 *
 * Reason: `withAuth` from next-auth/middleware requires NEXTAUTH_SECRET
 * to decrypt session tokens. When the secret isn't configured (the public
 * guest-mode deployment), withAuth fails before our `authorized` callback
 * runs and 302-redirects everything to /login?error=Configuration. By
 * narrowing the matcher we keep middleware off the YouTube-style public
 * paths entirely.
 *
 * @see https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
 */
export const config = {
  matcher: [
    "/classroom/:path*",
    "/bookings/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/dashboard/:path*",
  ],
};
