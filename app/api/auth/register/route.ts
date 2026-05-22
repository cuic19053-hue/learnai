import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/register — credentials sign-up.
 *
 * Wrapped in try/catch so a missing-table error (Prisma P2021, the
 * symptom when migrations haven't been applied to Neon yet) returns
 * a clear 503 instead of crashing the second step of the wizard with
 * an opaque 500.
 */
export async function POST(req: Request) {
  let body: { name?: string; email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { name, email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "STUDENT",
        studentProfile: { create: {} },
      },
    });

    return NextResponse.json({ id: user.id, email: user.email });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // P2021: table does not exist in the current database. Happens when
      // production migrations haven't been applied yet — see the deploy
      // workflow / README troubleshooting section.
      if (err.code === "P2021") {
        return NextResponse.json(
          {
            error:
              "Account sign-up is temporarily unavailable — the database hasn't finished provisioning. Please try again in a minute.",
          },
          { status: 503 }
        );
      }
    }
    // eslint-disable-next-line no-console
    console.error("[register] unexpected error:", err);
    return NextResponse.json(
      { error: "Could not create the account. Try again." },
      { status: 500 }
    );
  }
}
