import { Metadata } from "next";
import { CheckEmailClient } from "./CheckEmailClient";

export const metadata: Metadata = {
  title: "Check Your Email - Social Battery",
  description: "Check your email for the magic link to sign in",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <CheckEmailClient />
    </main>
  );
}
