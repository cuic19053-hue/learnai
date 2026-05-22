import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Health Check Endpoint
 *
 * This endpoint provides information about the application's health status.
 * It checks:
 * - Basic API responsiveness
 * - Database connectivity
 * - Environment configuration
 *
 * Use this for:
 * - Uptime monitoring services
 * - Load balancer health checks
 * - Status page integrations
 * - CI/CD pipeline verification
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DbState = "up" | "missing-tables" | "down";

interface HealthCheckResponse {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  checks: {
    database: {
      status: DbState;
      responseTime?: number;
      error?: string;
      /** Set when the connection succeeds but `prisma migrate deploy` hasn't been run. */
      remediation?: string;
    };
    api: {
      status: "up";
      responseTime: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheckResponse["checks"] = {
    database: { status: "down" },
    api: { status: "up", responseTime: 0 },
  };

  // Two-stage probe — distinguishes the three cases that all look like
  // "the database is broken" from the outside:
  //   1. up                 — connection works AND the schema is applied
  //   2. missing-tables     — connection works BUT migrations weren't run
  //                           (this is the P2021 case that breaks OAuth)
  //   3. down               — can't reach Neon at all (DATABASE_URL stale,
  //                           Neon paused free-tier project, network)
  try {
    const dbStartTime = Date.now();
    await prisma.$queryRaw`SELECT 1`;

    // Connection is alive — now check the schema is actually deployed.
    // count() on User is cheap (uses the PK index) and surfaces P2021
    // immediately if the migration was never applied to this database.
    try {
      await prisma.user.count();
      checks.database = {
        status: "up",
        responseTime: Date.now() - dbStartTime,
      };
    } catch (schemaErr) {
      const msg = schemaErr instanceof Error ? schemaErr.message : String(schemaErr);
      const isMissingTable = msg.includes("does not exist") || msg.includes("P2021");
      checks.database = {
        status: isMissingTable ? "missing-tables" : "down",
        responseTime: Date.now() - dbStartTime,
        error: msg,
        remediation: isMissingTable
          ? "Run `npx prisma migrate deploy` against the production DATABASE_URL."
          : undefined,
      };
    }
  } catch (error) {
    checks.database = {
      status: "down",
      error: error instanceof Error ? error.message : "Database connection failed",
    };
  }

  // Calculate API response time
  checks.api.responseTime = Date.now() - startTime;

  // healthy: everything works. degraded: app is up but DB layer is
  // wrong (sign-in / persisted data won't work). Either way we still
  // return 503 so uptime probes flag the page.
  const status: HealthCheckResponse["status"] =
    checks.database.status === "up" ? "healthy" : "degraded";

  const response: HealthCheckResponse = {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.npm_package_version || "1.0.0",
    checks,
  };

  const httpStatus = status === "healthy" ? 200 : 503;

  return NextResponse.json(response, {
    status: httpStatus,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
