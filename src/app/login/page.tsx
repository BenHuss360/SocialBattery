"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Battery } from "@/components/Battery";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Pre-fill email from query param (e.g., from check-email resend)
  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("resend", {
        email,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError("Something went wrong. Please try again.");
      } else {
        // Redirect to check-email page with email param
        window.location.href = `/check-email?email=${encodeURIComponent(email)}`;
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      {/* Logo/Battery */}
      <div className="flex justify-center mb-8">
        <Battery level={4} size="lg" showLabel={false} />
      </div>

      <h1 className="text-2xl font-bold text-center mb-2">
        Welcome to Social Battery
      </h1>
      <p className="text-muted text-center mb-8">
        Sign in to set and share your social energy level
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>

        {error && (
          <p
            className="text-red-600 dark:text-red-400 text-sm text-center"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            "Continue with Email"
          )}
        </button>
      </form>

      <p className="text-sm text-muted text-center mt-6">
        We&apos;ll send you a magic link to sign in. No password needed.
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <Suspense
        fallback={
          <div className="w-full max-w-sm">
            <div className="flex justify-center mb-8">
              <Battery level={4} size="lg" showLabel={false} />
            </div>
            <h1 className="text-2xl font-bold text-center mb-2">
              Welcome to Social Battery
            </h1>
            <p className="text-muted text-center mb-8">
              Sign in to set and share your social energy level
            </p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </main>
  );
}
