import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  // Rate limit by IP (public endpoint)
  const clientId = getClientIdentifier(request);
  const rateLimitResult = rateLimit(
    `username-check:${clientId}`,
    RATE_LIMITS.usernameCheck
  );
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { available: false, error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
          ),
        },
      }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get("username")?.toLowerCase();

  if (!username || username.length < 3 || username.length > 20) {
    return NextResponse.json({ available: false, error: "Invalid username" });
  }

  // Check if username matches pattern
  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ available: false, error: "Invalid characters" });
  }

  // Reserved usernames
  const reserved = [
    "admin",
    "api",
    "dashboard",
    "login",
    "logout",
    "settings",
    "onboarding",
    "check-email",
    "profile",
    "help",
    "about",
    "terms",
    "privacy",
  ];

  if (reserved.includes(username)) {
    return NextResponse.json({ available: false, error: "Reserved username" });
  }

  try {
    const existing = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return NextResponse.json({ available: existing.length === 0 });
  } catch {
    return NextResponse.json(
      { available: false, error: "Database error" },
      { status: 500 }
    );
  }
}
