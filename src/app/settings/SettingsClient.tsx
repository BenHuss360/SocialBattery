"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";
import { Toast } from "@/components/Toast";

interface SettingsClientProps {
  initialVisibility: "public" | "unlisted";
}

export function SettingsClient({
  initialVisibility,
}: SettingsClientProps) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();

  const saveSettings = useCallback(
    async (updates: {
      visibility?: string;
      themePreference?: string;
    }) => {
      setIsSaving(true);
      setError(null);
      try {
        const res = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (!res.ok) {
          throw new Error("Failed to save settings");
        }
        setLastSaved(new Date());
      } catch {
        setError("Failed to save. Please try again.");
      } finally {
        setIsSaving(false);
      }
    },
    []
  );

  const handleVisibilityChange = (newVisibility: "public" | "unlisted") => {
    setVisibility(newVisibility);
    saveSettings({ visibility: newVisibility });
  };

  const handleThemeChange = (newTheme: "system" | "light" | "dark") => {
    setTheme(newTheme);
    saveSettings({ themePreference: newTheme });
  };

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">Settings</h1>
          <Link
            href="/dashboard"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Back to dashboard
          </Link>
        </div>

        {/* Visibility Section */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">Profile Visibility</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer p-3 -mx-3 rounded-lg hover:bg-background transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "public"}
                onChange={() => handleVisibilityChange("public")}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <div className="font-medium">Public</div>
                <div className="text-sm text-muted">
                  Anyone can find your profile
                </div>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 -mx-3 rounded-lg hover:bg-background transition-colors">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "unlisted"}
                onChange={() => handleVisibilityChange("unlisted")}
                className="w-5 h-5 accent-accent"
              />
              <div>
                <div className="font-medium">Unlisted</div>
                <div className="text-sm text-muted">
                  Only accessible via direct link
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Theme Section */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">Theme</h2>
          <div className="flex gap-2">
            {(["system", "light", "dark"] as const).map((option) => (
              <button
                key={option}
                onClick={() => handleThemeChange(option)}
                className={`flex-1 py-3 px-4 rounded-lg text-sm capitalize transition-colors ${
                  theme === option
                    ? "bg-accent text-white"
                    : "bg-background border border-border hover:border-accent active:scale-95"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Save indicator */}
        <div className="text-center text-sm text-muted">
          {isSaving ? (
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
              Saving...
            </span>
          ) : lastSaved ? (
            `Saved ${lastSaved.toLocaleTimeString()}`
          ) : (
            "Changes save automatically"
          )}
        </div>
      </div>

      {/* Error toast */}
      {error && (
        <Toast
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
    </main>
  );
}
