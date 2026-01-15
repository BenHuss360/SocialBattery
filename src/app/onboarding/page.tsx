import { Metadata } from "next";
import { OnboardingClient } from "./OnboardingClient";

export const metadata: Metadata = {
  title: "Choose Username - Social Battery",
  description: "Choose your username to get started with Social Battery",
  robots: {
    index: false,
    follow: false,
  },
};

export default function OnboardingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <OnboardingClient />
    </main>
  );
}
