import { notFound } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { Battery } from "@/components/Battery";

const STATUS_PRESETS: Record<string, string> = {
  recharging: "Recharging",
  need_space: "Need space",
  open_to_plans: "Open to plans",
  text_only: "Text only please",
  down_to_hang: "Down to hang",
};

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

async function getUser(username: string) {
  return db.query.users.findFirst({
    where: eq(users.username, username.toLowerCase()),
  });
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  const user = await getUser(username);

  if (!user) {
    return { title: "User not found" };
  }

  const status = user.statusText || (user.statusPreset ? STATUS_PRESETS[user.statusPreset] : null);
  const levelLabels = ["Empty", "Low", "Half", "High", "Full"];
  const levelLabel = levelLabels[user.batteryLevel - 1];

  return {
    title: `${user.username}'s Social Battery`,
    description: status
      ? `${levelLabel} - ${status}`
      : `Social battery: ${levelLabel}`,
    openGraph: {
      title: `${user.username}'s Social Battery`,
      description: status
        ? `${levelLabel} - ${status}`
        : `Social battery: ${levelLabel}`,
      images: [`/api/og/${user.username}`],
    },
    twitter: {
      card: "summary_large_image",
      title: `${user.username}'s Social Battery`,
      description: status
        ? `${levelLabel} - ${status}`
        : `Social battery: ${levelLabel}`,
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

  if (!user || user.visibility === "unlisted") {
    // For unlisted, we still show the profile if accessed directly
    // but don't include in any listings. Here we just check if user exists.
    const actualUser = await db.query.users.findFirst({
      where: eq(users.username, username.toLowerCase()),
    });
    if (!actualUser) {
      notFound();
    }
    // Continue with actualUser for unlisted profiles
  }

  const displayUser = user || (await getUser(username));
  if (!displayUser) {
    notFound();
  }

  const status =
    displayUser.statusText ||
    (displayUser.statusPreset ? STATUS_PRESETS[displayUser.statusPreset] : null);
  const freshness = getFreshnessState(displayUser.updatedAt);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        {/* Username */}
        <h1 className="text-xl font-bold mb-6">@{displayUser.username}</h1>

        {/* Battery */}
        <div
          className={`flex justify-center mb-4 ${
            freshness.state === "stale" ? "opacity-60" : ""
          } ${freshness.state === "aging" ? "opacity-80" : ""}`}
        >
          <Battery level={displayUser.batteryLevel} size="lg" />
        </div>

        {/* Status */}
        {status && (
          <p className="text-lg text-foreground mb-4">&ldquo;{status}&rdquo;</p>
        )}

        {/* Freshness indicator */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
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
          {freshness.state === "stale" && " (may be outdated)"}
        </div>

        {/* CTA */}
        <div className="mt-12">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
          >
            Get your own battery
          </a>
        </div>
      </div>
    </main>
  );
}
