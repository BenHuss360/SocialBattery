"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/components/ThemeProvider";

interface SettingsClientProps {
  initialVisibility: "public" | "unlisted";
  initialThemePreference: "system" | "light" | "dark";
}

export function SettingsClient({
  initialVisibility,
  initialThemePreference,
}: SettingsClientProps) {
  const [visibility, setVisibility] = useState(initialVisibility);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { theme, setTheme } = useTheme();

  const saveSettings = useCallback(
    async (updates: {
      visibility?: string;
      themePreference?: string;
    }) => {
      setIsSaving(true);
      try {
        await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save:", error);
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
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "public"}
                onChange={() => handleVisibilityChange("public")}
                className="mt-1 accent-accent"
              />
              <div>
                <div className="font-medium">Public</div>
                <div className="text-sm text-muted">
                  Anyone can find your profile
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                checked={visibility === "unlisted"}
                onChange={() => handleVisibilityChange("unlisted")}
                className="mt-1 accent-accent"
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
                className={`flex-1 py-2 px-3 rounded-lg text-sm capitalize transition-colors ${
                  theme === option
                    ? "bg-accent text-white"
                    : "bg-background border border-border hover:border-accent"
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
            "Saving..."
          ) : lastSaved ? (
            `Saved ${lastSaved.toLocaleTimeString()}`
          ) : (
            "Changes save automatically"
          )}
        </div>
      </div>
    </main>
  );
}
