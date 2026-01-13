import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    Resend({
      from: "Social Battery <noreply@socialbattery.app>",
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/check-email",
    newUser: "/onboarding",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Fetch additional user data
        const dbUser = await db.query.users.findFirst({
          where: (users, { eq }) => eq(users.id, user.id),
        });
        if (dbUser) {
          session.user.username = dbUser.username;
          session.user.batteryLevel = dbUser.batteryLevel;
        }
      }
      return session;
    },
  },
});

// Extend the session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      username?: string | null;
      batteryLevel?: number;
    };
  }
}
