import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { rateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit by user ID
  const rateLimitResult = await rateLimit(
    `settings:${session.user.id}`,
    RATE_LIMITS.settings
  );
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests" },
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

  const body = await request.json();
  const { visibility, themePreference } = body;

  // Validate visibility
  const validVisibilities = ["public", "unlisted"];
  if (visibility !== undefined && !validVisibilities.includes(visibility)) {
    return NextResponse.json({ error: "Invalid visibility" }, { status: 400 });
  }

  // Validate theme preference
  const validThemes = ["system", "light", "dark"];
  if (themePreference !== undefined && !validThemes.includes(themePreference)) {
    return NextResponse.json({ error: "Invalid theme preference" }, { status: 400 });
  }

  try {
    const updateData: Record<string, unknown> = {};

    if (visibility !== undefined) {
      updateData.visibility = visibility;
    }
    if (themePreference !== undefined) {
      updateData.themePreference = themePreference;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
