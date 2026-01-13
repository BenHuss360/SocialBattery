"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Battery } from "@/components/Battery";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
        // Redirect to check-email page
        window.location.href = "/check-email";
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
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
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending link..." : "Continue with Email"}
          </button>
        </form>

        <p className="text-sm text-muted text-center mt-6">
          We&apos;ll send you a magic link to sign in. No password needed.
        </p>
      </div>
    </main>
  );
}
