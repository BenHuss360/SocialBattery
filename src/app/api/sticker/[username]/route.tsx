import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "edge";

const STATUS_PRESETS: Record<string, string> = {
  recharging: "Recharging",
  need_space: "Need space",
  open_to_plans: "Open to plans",
  text_only: "Text only please",
  down_to_hang: "Down to hang",
};

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
    user.statusText || (user.statusPreset ? STATUS_PRESETS[user.statusPreset] : null);
  const color = LEVEL_COLORS[user.batteryLevel - 1];
  const levelLabel = LEVEL_LABELS[user.batteryLevel - 1];

  // Dimensions based on format
  const isStory = format === "story";
  const width = isStory ? 540 : 540;
  const height = isStory ? 960 : 540;
  const batteryScale = isStory ? 1.2 : 1;

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
        {/* Battery SVG */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 24,
            transform: `scale(${batteryScale})`,
          }}
        >
          <svg width="100" height="160" viewBox="0 0 100 160">
            {/* Battery cap */}
            <rect x="40" y="0" width="20" height="8" rx="3" fill="#e5e5e5" />
            {/* Battery body */}
            <rect
              x="4"
              y="10"
              width="92"
              height="146"
              rx="8"
              fill="white"
              stroke="#e5e5e5"
              strokeWidth="2"
            />
            {/* Segments */}
            {[0, 1, 2, 3, 4].map((i) => {
              const segmentIndex = 4 - i;
              const isFilled = user.batteryLevel >= 5 - i;
              const y = 14 + segmentIndex * 27;
              return (
                <rect
                  key={i}
                  x="10"
                  y={y}
                  width="80"
                  height="23"
                  rx="4"
                  fill={isFilled ? color : "#e5e5e5"}
                  opacity={isFilled ? 1 : 0.2}
                />
              );
            })}
            {/* Face - eyes */}
            <ellipse
              cx="38"
              cy="85"
              rx="6"
              ry={user.batteryLevel <= 2 ? 2 : user.batteryLevel === 3 ? 4 : 5}
              fill="#2d2d2d"
              opacity="0.7"
            />
            <ellipse
              cx="62"
              cy="85"
              rx="6"
              ry={user.batteryLevel <= 2 ? 2 : user.batteryLevel === 3 ? 4 : 5}
              fill="#2d2d2d"
              opacity="0.7"
            />
            {/* Mouth */}
            <path
              d={`M 40 100 Q 50 ${
                user.batteryLevel === 1
                  ? 95
                  : user.batteryLevel === 2
                  ? 98
                  : user.batteryLevel === 3
                  ? 100
                  : user.batteryLevel === 4
                  ? 105
                  : 108
              } 60 100`}
              fill="none"
              stroke="#2d2d2d"
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        </div>

        {/* Level label */}
        <div
          style={{
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
              fontSize: 18,
              color: "#2d2d2d",
              marginBottom: 16,
              textAlign: "center",
              maxWidth: "80%",
            }}
          >
            {status}
          </div>
        )}

        {/* URL watermark */}
        <div
          style={{
            fontSize: 14,
            color: "#6b6b6b",
            marginTop: "auto",
          }}
        >
          socialbattery.app/{user.username}
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
