"use client";

import { useState } from "react";
import { Battery } from "@/components/Battery";
import { signIn } from "next-auth/react";

export default function HomePage() {
  const [demoLevel, setDemoLevel] = useState(3);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const handleGetStarted = () => {
    setShowAuth(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });
      window.location.href = "/check-email";
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Interactive Demo Battery */}
          <div className="mb-8">
            <Battery
              level={demoLevel}
              onChange={setDemoLevel}
              interactive
              size="lg"
            />
          </div>

          <h1 className="text-3xl font-bold mb-4">Social Battery</h1>
          <p className="text-muted text-lg mb-8">
            Let friends know your social energy level. No awkward explanations
            needed.
          </p>

          {!showAuth ? (
            <>
              <button
                onClick={handleGetStarted}
                className="w-full py-3 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors mb-4"
              >
                Claim your battery
              </button>
              <p className="text-sm text-muted">
                Try it above! Tap the battery segments to change the level.
              </p>
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? "Sending link..." : "Get magic link"}
              </button>
              <button
                type="button"
                onClick={() => setShowAuth(false)}
                className="w-full py-2 text-sm text-muted hover:text-foreground transition-colors"
              >
                Back
              </button>
            </form>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-card">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">How it works</h2>

          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold mb-1">Set your level</h3>
                <p className="text-muted">
                  Tap to set your current social energy - from empty to fully
                  charged.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold mb-1">Add a status</h3>
                <p className="text-muted">
                  Choose a quick preset or write your own short message.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="font-semibold mb-1">Share your battery</h3>
                <p className="text-muted">
                  Get a personal link or download a sticker to share anywhere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center text-sm text-muted">
        <p>Social Battery - Share your social energy</p>
      </footer>
    </main>
  );
}
