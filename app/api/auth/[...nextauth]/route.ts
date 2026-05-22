import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

const isAuthConfigured = !!process.env.NEXTAUTH_SECRET;
const nextAuthHandler = NextAuth(authOptions);

function guestFallback(req: Request) {
  const url = new URL(req.url);
  const pathname = url.pathname;

  // Browser-facing pages — when NextAuth wants to navigate the user to its
  // error/signin/signout screens, redirect them home instead of showing a
  // raw 503 JSON blob. These are reached by clicking a link, not by SDK.
  if (
    req.method === "GET" &&
    (pathname.endsWith("/error") || pathname.endsWith("/signin") || pathname.endsWith("/signout"))
  ) {
    const home = new URL("/", url);
    return NextResponse.redirect(home, { status: 303 });
  }

  if (req.method === "GET" && pathname.endsWith("/session")) {
    // NextAuth's client (`useSession`) expects an object — `null` makes it
    // throw "Cannot convert undefined or null to object". Use `{}` to mean
    // "no active session".
    return NextResponse.json({});
  }
  if (req.method === "POST" && pathname.endsWith("/_log")) {
    return NextResponse.json({});
  }
  if (req.method === "GET" && pathname.endsWith("/csrf")) {
    return NextResponse.json({ csrfToken: "guest" });
  }
  if (req.method === "GET" && pathname.endsWith("/providers")) {
    return NextResponse.json({});
  }
  return NextResponse.json(
    { error: "Authentication is not configured. Continue as a guest." },
    { status: 503 }
  );
}

async function safeHandler(req: Request, ctx: any) {
  if (!isAuthConfigured) return guestFallback(req);
  try {
    return await nextAuthHandler(req, ctx);
  } catch (err) {
    console.error("[next-auth] handler failed, degrading to guest:", err);
    return guestFallback(req);
  }
}

export { safeHandler as GET, safeHandler as POST };
