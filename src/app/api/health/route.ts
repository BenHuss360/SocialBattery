import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const runtime = "edge";

export async function GET() {
  const startTime = Date.now();

  try {
    // Check database connectivity
    await db.execute(sql`SELECT 1`);
    const dbLatency = Date.now() - startTime;

    return NextResponse.json(
      {
        status: "healthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "up",
            latency: `${dbLatency}ms`,
          },
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: "down",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }
}
