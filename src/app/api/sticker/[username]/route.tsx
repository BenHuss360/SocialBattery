import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { STATUS_PRESETS_MAP } from "@/lib/constants";

export const runtime = "edge";

const LEVEL_COLORS = [
  "#e8a4a4", // Empty
  "#e8c4a4", // Low
  "#e8dca4", // Half
  "#c4dca4", // High
  "#a4dcb4", // Full
];

const LEVEL_LABELS = ["Empty", "Low", "Half", "High", "Full"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "square";

  const user = await db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });

  if (!user) {
    return new Response("User not found", { status: 404 });
  }

  const status =
    user.statusText || (user.statusPreset ? STATUS_PRESETS_MAP[user.statusPreset] : null);
  const color = LEVEL_COLORS[user.batteryLevel - 1];
  const levelLabel = LEVEL_LABELS[user.batteryLevel - 1];

  // Format current timestamp
  const now = new Date();
  const timestamp = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  }) + ", " + now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).toLowerCase();

  // Dimensions based on format
  const isStory = format === "story";
  const width = isStory ? 540 : 540;
  const height = isStory ? 960 : 540;

  const response = new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#faf9f7",
          fontFamily: "system-ui, sans-serif",
          padding: 40,
        }}
      >
        {/* Battery using divs */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          {/* Battery cap */}
          <div
            style={{
              width: 30,
              height: 12,
              backgroundColor: "#e5e5e5",
              borderRadius: 4,
              marginBottom: 4,
            }}
          />
          {/* Battery body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              padding: 8,
              backgroundColor: "white",
              border: "3px solid #e5e5e5",
              borderRadius: 12,
            }}
          >
            {/* Segment 5 (top) */}
            <div
              style={{
                width: 80,
                height: 28,
                backgroundColor: user.batteryLevel >= 5 ? color : "#e5e5e5",
                opacity: user.batteryLevel >= 5 ? 1 : 0.3,
                borderRadius: 6,
              }}
            />
            {/* Segment 4 */}
            <div
              style={{
                width: 80,
                height: 28,
                backgroundColor: user.batteryLevel >= 4 ? color : "#e5e5e5",
                opacity: user.batteryLevel >= 4 ? 1 : 0.3,
                borderRadius: 6,
              }}
            />
            {/* Segment 3 */}
            <div
              style={{
                width: 80,
                height: 28,
                backgroundColor: user.batteryLevel >= 3 ? color : "#e5e5e5",
                opacity: user.batteryLevel >= 3 ? 1 : 0.3,
                borderRadius: 6,
              }}
            />
            {/* Segment 2 */}
            <div
              style={{
                width: 80,
                height: 28,
                backgroundColor: user.batteryLevel >= 2 ? color : "#e5e5e5",
                opacity: user.batteryLevel >= 2 ? 1 : 0.3,
                borderRadius: 6,
              }}
            />
            {/* Segment 1 (bottom) */}
            <div
              style={{
                width: 80,
                height: 28,
                backgroundColor: user.batteryLevel >= 1 ? color : "#e5e5e5",
                opacity: user.batteryLevel >= 1 ? 1 : 0.3,
                borderRadius: 6,
              }}
            />
          </div>
        </div>

        {/* Level label */}
        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 700,
            color: "#2d2d2d",
            marginBottom: 8,
          }}
        >
          {levelLabel}
        </div>

        {/* Status */}
        {status && (
          <div
            style={{
              display: "flex",
              fontSize: 18,
              color: "#2d2d2d",
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            {status}
          </div>
        )}

        {/* URL watermark and timestamp */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginTop: "auto",
            gap: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 14,
              color: "#6b6b6b",
            }}
          >
            socialbattery.app/{user.username}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 12,
              color: "#999999",
            }}
          >
            {timestamp}
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  );

  // Set headers for download
  response.headers.set(
    "Content-Disposition",
    `attachment; filename="${username}-battery-${format}.png"`
  );

  return response;
}
