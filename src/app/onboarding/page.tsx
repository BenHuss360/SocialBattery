"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Battery } from "@/components/Battery";

export default function OnboardingPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Debounced username availability check
  useEffect(() => {
    if (username.length < 3) {
      setIsAvailable(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsChecking(true);
      try {
        const res = await fetch(
          `/api/username/check?username=${encodeURIComponent(username)}`
        );
        const data = await res.json();
        setIsAvailable(data.available);
      } catch {
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAvailable) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/username/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to claim username");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidUsername = /^[a-z0-9_]{3,20}$/.test(username);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Battery level={5} size="lg" showLabel={false} />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">
          Choose your username
        </h1>
        <p className="text-muted text-center mb-8">
          This will be your public profile URL
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-2">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                socialbattery.app/
              </span>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                }
                placeholder="yourname"
                maxLength={20}
                className="w-full pl-[155px] pr-10 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-all"
              />
              {username.length >= 3 && (
                <span
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium"
                  aria-live="polite"
                >
                  {isChecking ? (
                    <span className="text-muted flex items-center gap-1">
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
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
                    </span>
                  ) : isAvailable ? (
                    <span className="text-green-600 dark:text-green-400">
                      Available
                    </span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">
                      Taken
                    </span>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-muted mt-2">
              3-20 characters, lowercase letters, numbers, and underscores only
            </p>
          </div>

          {!isValidUsername && username.length > 0 && (
            <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
              Username must be 3-20 characters
            </p>
          )}

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={!isAvailable || isSubmitting || !isValidUsername}
            className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Claiming..." : "Claim username"}
          </button>
        </form>
      </div>
    </main>
  );
}
