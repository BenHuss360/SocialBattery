import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsClient } from "./SettingsClient";

export const metadata: Metadata = {
  title: "Settings - Social Battery",
  description: "Manage your Social Battery settings",
  robots: {
    index: false,
    follow: false,
  },
};

// Force dynamic rendering - user settings must always be fresh
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <SettingsClient
      initialVisibility={user.visibility}
    />
  );
}
