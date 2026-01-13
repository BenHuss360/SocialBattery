import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { DashboardClient } from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Fetch user data
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (!user) {
    redirect("/login");
  }

  // Redirect to onboarding if no username
  if (!user.username) {
    redirect("/onboarding");
  }

  return (
    <DashboardClient
      initialBatteryLevel={user.batteryLevel}
      initialStatusText={user.statusText}
      initialStatusPreset={user.statusPreset}
      username={user.username}
    />
  );
}
