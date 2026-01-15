import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { STATUS_PRESETS_MAP } from "@/lib/constants";
import { rateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

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
  // Rate limit by IP
  const clientId = getClientIdentifier(request);
  const rateLimitResult = rateLimit(`og:${clientId}`, RATE_LIMITS.ogImage);
  if (!rateLimitResult.success) {
    return new Response("Too many requests", { status: 429 });
  }

  const { username } = await params;

  const user = await db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });

  // Return 404 for non-existent users or unlisted profiles
  if (!user || user.visibility === "unlisted") {
    return new Response("User not found", { status: 404 });
  }

  const status =
    user.statusText || (user.statusPreset ? STATUS_PRESETS_MAP[user.statusPreset] : null);
  const color = LEVEL_COLORS[user.batteryLevel - 1];
  const levelLabel = LEVEL_LABELS[user.batteryLevel - 1];

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
        }}
      >
        {/* Battery SVG */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            marginBottom: 40,
          }}
        >
          <svg width="120" height="200" viewBox="0 0 120 200">
            {/* Battery cap */}
            <rect x="50" y="0" width="20" height="8" rx="3" fill="#e5e5e5" />
            {/* Battery body */}
            <rect
              x="4"
              y="10"
              width="112"
              height="186"
              rx="8"
              fill="white"
              stroke="#e5e5e5"
              strokeWidth="2"
            />
            {/* Segments */}
            {[0, 1, 2, 3, 4].map((i) => {
              const segmentIndex = 4 - i;
              const isFilled = user.batteryLevel >= 5 - i;
              const y = 14 + segmentIndex * 35;
              return (
                <rect
                  key={i}
                  x="10"
                  y={y}
                  width="100"
                  height="31"
                  rx="4"
                  fill={isFilled ? color : "#e5e5e5"}
                  opacity={isFilled ? 1 : 0.2}
                />
              );
            })}
          </svg>
        </div>

        {/* Username */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "#2d2d2d",
            marginBottom: 8,
          }}
        >
          @{user.username}
        </div>

        {/* Level */}
        <div
          style={{
            fontSize: 24,
            color: "#6b6b6b",
            marginBottom: status ? 8 : 0,
          }}
        >
          {levelLabel}
        </div>

        {/* Status */}
        {status && (
          <div
            style={{
              fontSize: 20,
              color: "#2d2d2d",
              marginTop: 8,
            }}
          >
            &ldquo;{status}&rdquo;
          </div>
        )}

        {/* Branding */}
        <div
          style={{
            position: "absolute",
            bottom: 30,
            fontSize: 16,
            color: "#6b6b6b",
          }}
        >
          socialbattery.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );

  // Cache OG images for 1 hour
  response.headers.set(
    "Cache-Control",
    "public, s-maxage=3600, stale-while-revalidate=7200"
  );

  return response;
}
