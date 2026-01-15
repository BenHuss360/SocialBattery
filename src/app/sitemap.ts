import { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://socialbattery.app";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];

  // Get public user profiles (exclude unlisted)
  try {
    const publicUsers = await db.query.users.findMany({
      where: eq(users.visibility, "public"),
      orderBy: [desc(users.updatedAt)],
      limit: 1000,
      columns: { username: true, updatedAt: true },
    });

    const userPages: MetadataRoute.Sitemap = publicUsers
      .filter((user) => user.username)
      .map((user) => ({
        url: `${baseUrl}/${user.username}`,
        lastModified: user.updatedAt,
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    return [...staticPages, ...userPages];
  } catch {
    // Return only static pages if database is unavailable (e.g., in CI)
    return staticPages;
  }
}
