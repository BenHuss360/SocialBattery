"use client";

import { useState } from "react";

interface ProfileActionsProps {
  username: string;
}

export function ProfileActions({ username }: ProfileActionsProps) {
  const [copied, setCopied] = useState(false);

  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${username}`
      : `https://socialbattery.app/${username}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Social Battery`,
          url: profileUrl,
        });
      } catch {
        // User cancelled or error - fall back to copy
        handleCopy();
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mt-8">
      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-sm hover:border-accent transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {copied ? "Copied!" : "Share this profile"}
      </button>

      <a
        href="/"
        className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
      >
        Share your battery too
      </a>
    </div>
  );
}
