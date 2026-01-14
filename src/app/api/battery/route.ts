import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { STATUS_PRESETS } from "@/lib/constants";

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { batteryLevel, statusText, statusPreset } = body;

  // Validate battery level
  if (batteryLevel !== undefined) {
    if (typeof batteryLevel !== "number" || batteryLevel < 1 || batteryLevel > 5) {
      return NextResponse.json({ error: "Invalid battery level" }, { status: 400 });
    }
  }

  // Validate status text
  if (statusText !== undefined && statusText !== null) {
    if (typeof statusText !== "string" || statusText.length > 30) {
      return NextResponse.json({ error: "Status text too long" }, { status: 400 });
    }
  }

  // Validate status preset
  const validPresets = STATUS_PRESETS.map((p) => p.value);
  if (statusPreset !== undefined && statusPreset !== null && !validPresets.includes(statusPreset)) {
    return NextResponse.json({ error: "Invalid status preset" }, { status: 400 });
  }

  try {
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
      lastActiveAt: new Date(),
    };

    if (batteryLevel !== undefined) {
      updateData.batteryLevel = batteryLevel;
    }
    if (statusText !== undefined) {
      updateData.statusText = statusText || null;
    }
    if (statusPreset !== undefined) {
      updateData.statusPreset = statusPreset;
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update battery" },
      { status: 500 }
    );
  }
}
