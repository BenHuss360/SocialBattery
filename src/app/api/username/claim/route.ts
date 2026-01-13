import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const username = body.username?.toLowerCase();

  // Validate username
  if (!username || username.length < 3 || username.length > 20) {
    return NextResponse.json({ error: "Invalid username length" }, { status: 400 });
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return NextResponse.json({ error: "Invalid characters" }, { status: 400 });
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
    return NextResponse.json({ error: "Reserved username" }, { status: 400 });
  }

  try {
    // Check availability again (race condition protection)
    const existing = await db
      .select({ username: users.username })
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ error: "Username taken" }, { status: 409 });
    }

    // Update user's username
    await db
      .update(users)
      .set({ username, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true, username });
  } catch {
    return NextResponse.json(
      { error: "Failed to claim username" },
      { status: 500 }
    );
  }
}
