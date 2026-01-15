"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Settings error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-sm text-center">
        <div className="text-6xl mb-4">:(</div>
        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
        <p className="text-muted mb-6">
          We couldn&apos;t load your settings. Please try again.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
