"use client";

import { useState, useCallback, useMemo } from "react";
import { Battery } from "@/components/Battery";
import { signOut } from "next-auth/react";
import { STATUS_PRESETS } from "@/lib/constants";

function shuffleArray<T>(array: readonly T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

interface DashboardClientProps {
  initialBatteryLevel: number;
  initialStatusText: string | null;
  initialStatusPreset: string | null;
  username: string;
}

export function DashboardClient({
  initialBatteryLevel,
  initialStatusText,
  initialStatusPreset,
  username,
}: DashboardClientProps) {
  const [batteryLevel, setBatteryLevel] = useState(initialBatteryLevel);
  const [statusPreset, setStatusPreset] = useState<string | null>(
    initialStatusPreset
  );
  const [customStatus, setCustomStatus] = useState(initialStatusText || "");
  const [useCustom, setUseCustom] = useState(
    initialStatusText !== null && initialStatusPreset === null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [copied, setCopied] = useState(false);

  // Randomize preset order on mount
  const shuffledPresets = useMemo(() => shuffleArray(STATUS_PRESETS), []);

  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}`;

  const saveChanges = useCallback(
    async (updates: {
      batteryLevel?: number;
      statusText?: string | null;
      statusPreset?: string | null;
    }) => {
      setIsSaving(true);
      try {
        await fetch("/api/battery", {
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

  const handleBatteryChange = (level: number) => {
    setBatteryLevel(level);
    saveChanges({ batteryLevel: level });
  };

  const handlePresetSelect = (preset: string) => {
    setStatusPreset(preset);
    setUseCustom(false);
    saveChanges({ statusPreset: preset, statusText: null });
  };

  const handleCustomStatusChange = (text: string) => {
    if (text.length > 30) return;
    setCustomStatus(text);
  };

  const handleCustomStatusBlur = () => {
    if (customStatus.trim()) {
      setUseCustom(true);
      setStatusPreset(null);
      saveChanges({ statusText: customStatus.trim(), statusPreset: null });
    }
  };

  const handleClearStatus = () => {
    setStatusPreset(null);
    setCustomStatus("");
    setUseCustom(false);
    saveChanges({ statusText: null, statusPreset: null });
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentStatus = useCustom
    ? customStatus
    : STATUS_PRESETS.find((p) => p.value === statusPreset)?.label || null;

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-xl font-bold">Your Battery</h1>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Battery Display */}
        <div className="flex justify-center mb-8">
          <Battery
            level={batteryLevel}
            onChange={handleBatteryChange}
            interactive
            size="lg"
          />
        </div>

        {/* Status Section */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">Status</h2>

          {/* Preset buttons */}
          <div className="flex flex-wrap gap-2 mb-4">
            {shuffledPresets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetSelect(preset.value)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  statusPreset === preset.value && !useCustom
                    ? "bg-accent text-white"
                    : "bg-background border border-border hover:border-accent"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom status input */}
          <div className="relative">
            <input
              type="text"
              value={customStatus}
              onChange={(e) => handleCustomStatusChange(e.target.value)}
              onBlur={handleCustomStatusBlur}
              placeholder="Or type a custom status..."
              className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent transition-all text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">
              {customStatus.length}/30
            </span>
          </div>

          {/* Current status display */}
          {currentStatus && (
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted">
                Current: <span className="text-foreground">{currentStatus}</span>
              </span>
              <button
                onClick={handleClearStatus}
                className="text-xs text-muted hover:text-foreground"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Share Section */}
        <div className="bg-card rounded-xl border border-border p-6 mb-6">
          <h2 className="font-semibold mb-4">Share your battery</h2>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="text"
              value={profileUrl}
              readOnly
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <a
            href={`/api/sticker/${username}?format=square`}
            download={`${username}-battery.png`}
            className="block w-full py-2 text-center border border-border rounded-lg text-sm hover:bg-background transition-colors"
          >
            Download sticker (square)
          </a>
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
