import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Battery } from "@/components/Battery";
import { STATUS_PRESETS_MAP } from "@/lib/constants";
import { ProfileActions } from "./ProfileClient";

// ISR: Revalidate profile pages every 60 seconds
export const revalidate = 60;

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUser(username: string) {
  return db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });
}

// Pre-generate static pages for recent users (ISR will handle the rest)
export async function generateStaticParams() {
  try {
    const recentUsers = await db.query.users.findMany({
      orderBy: [desc(users.updatedAt)],
      limit: 100,
      columns: { username: true },
    });

    return recentUsers
      .filter((user) => user.username)
      .map((user) => ({ username: user.username! }));
  } catch {
    // Return empty array if database is unavailable (e.g., in CI)
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    return {
      title: "User not found",
      robots: { index: false, follow: false },
    };
  }

  const status = user.statusText || (user.statusPreset ? STATUS_PRESETS_MAP[user.statusPreset] : null);
  const levelLabels = ["Empty", "Low", "Half", "High", "Full"];
  const levelLabel = levelLabels[user.batteryLevel - 1];
  const description = status
    ? `${levelLabel} - ${status}`
    : `Social battery: ${levelLabel}`;

  // Don't index unlisted profiles
  const shouldIndex = user.visibility === "public";

  return {
    title: `${user.username}'s Social Battery`,
    description,
    alternates: {
      canonical: `/${user.username}`,
    },
    robots: shouldIndex
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      title: `${user.username}'s Social Battery`,
      description,
      type: "profile",
      images: [`/api/og/${user.username}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.username}'s Social Battery`,
      description,
      images: [`/api/og/${user.username}`],
    },
  };
}

function getFreshnessState(updatedAt: Date): {
  state: "fresh" | "aging" | "stale";
  label: string;
} {
  const now = new Date();
  const diffMs = now.getTime() - updatedAt.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  if (diffHours < 24) {
    return { state: "fresh", label: getTimeAgo(updatedAt) };
  } else if (diffHours < 48) {
    return { state: "aging", label: getTimeAgo(updatedAt) };
  } else {
    return { state: "stale", label: getTimeAgo(updatedAt) };
  }
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await getUser(username);

  // If user doesn't exist, return 404
  if (!user) {
    notFound();
  }

  // Unlisted profiles are still accessible via direct URL,
  // they just won't appear in public listings

  const status =
    user.statusText ||
    (user.statusPreset ? STATUS_PRESETS_MAP[user.statusPreset] : null);
  const freshness = getFreshnessState(user.updatedAt);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {/* Username */}
        <h1 className="text-xl font-bold mb-6">@{user.username}</h1>

        {/* Stale warning banner */}
        {freshness.state === "stale" && (
          <div className="mb-4 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-sm">
            This status may be outdated
          </div>
        )}

        {/* Battery */}
        <div className="flex justify-center mb-4">
          <Battery level={user.batteryLevel} size="lg" />
        </div>

        {/* Status */}
        {status && (
          <p className="text-lg text-foreground mb-4">&ldquo;{status}&rdquo;</p>
        )}

        {/* Freshness indicator */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm ${
            freshness.state === "fresh"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : freshness.state === "aging"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              freshness.state === "fresh"
                ? "bg-green-500"
                : freshness.state === "aging"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
          Updated {freshness.label}
        </div>

        {/* Share and CTA */}
        <ProfileActions username={user.username!} />
      </div>
    </main>
  );
}
