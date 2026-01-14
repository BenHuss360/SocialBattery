"use client";

import { useState, useMemo } from "react";
import { Battery } from "@/components/Battery";
import { signIn } from "next-auth/react";
import { STATUS_PRESETS } from "@/lib/constants";

// Show a subset of presets for the demo
const DEMO_PRESETS = [
  "recharging",
  "need_space",
  "open_to_plans",
  "down_to_hang",
  "just_vibing",
  "feeling_social",
];

export default function HomePage() {
  const [demoLevel, setDemoLevel] = useState(3);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const demoPresets = useMemo(
    () => STATUS_PRESETS.filter((p) => DEMO_PRESETS.includes(p.value)),
    []
  );

  const currentStatusLabel = demoStatus
    ? STATUS_PRESETS.find((p) => p.value === demoStatus)?.label
    : null;

  const handleGetStarted = () => {
    setShowAuth(true);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      window.location.href = `/check-email?email=${encodeURIComponent(email)}`;
    } catch {
      setError("Failed to send magic link. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          {/* Interactive Demo Battery */}
          <div className="mb-4">
            <Battery
              level={demoLevel}
              onChange={setDemoLevel}
              interactive
              size="lg"
            />
          </div>

          {/* Demo Status Display */}
          {currentStatusLabel && (
            <p className="text-lg text-foreground mb-4">
              &ldquo;{currentStatusLabel}&rdquo;
            </p>
          )}

          {/* Demo Status Presets */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {demoPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() =>
                  setDemoStatus(demoStatus === preset.value ? null : preset.value)
                }
                className={`px-4 py-2.5 rounded-full text-sm transition-colors ${
                  demoStatus === preset.value
                    ? "bg-accent text-white"
                    : "bg-card border border-border hover:border-accent active:scale-95"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Preview URL */}
          <p className="text-sm text-muted mb-6">
            socialbattery.app/<span className="text-foreground">yourname</span>
          </p>

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
                Try it above! Tap the battery and status presets to see how it works.
              </p>
            </>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6">
              <p className="text-sm text-muted mb-4">
                Enter your email to get started
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                  />
                </div>
                {error && (
                  <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-6 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Sending link...
                    </span>
                  ) : (
                    "Get magic link"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAuth(false)}
                  className="w-full py-2 text-sm text-muted hover:text-foreground transition-colors"
                >
                  Back
                </button>
              </form>
            </div>
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
