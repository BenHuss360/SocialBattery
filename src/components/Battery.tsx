"use client";

import { useState, useCallback } from "react";

interface BatteryProps {
  level: number; // 1-5
  onChange?: (level: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const LEVEL_DESCRIPTIONS = [
  "Empty - Need solitude",
  "Low - Limited capacity",
  "Half - Selective socializing",
  "High - Open to plans",
  "Full - Bring on the people",
];

const LEVELS = [
  { value: 1, label: "Empty", color: "var(--battery-empty)" },
  { value: 2, label: "Low", color: "var(--battery-low)" },
  { value: 3, label: "Half", color: "var(--battery-half)" },
  { value: 4, label: "High", color: "var(--battery-high)" },
  { value: 5, label: "Full", color: "var(--battery-full)" },
];

const SIZES = {
  sm: { width: 60, height: 100, eyeSize: 6, mouthSize: 12 },
  md: { width: 80, height: 140, eyeSize: 8, mouthSize: 16 },
  lg: { width: 120, height: 200, eyeSize: 12, mouthSize: 24 },
};

export function Battery({
  level,
  onChange,
  interactive = false,
  size = "md",
  showLabel = true,
}: BatteryProps) {
  const [hoveredLevel, setHoveredLevel] = useState<number | null>(null);
  const displayLevel = hoveredLevel ?? level;
  const dimensions = SIZES[size];
  const currentLevelData = LEVELS[displayLevel - 1];

  // Calculate face expression based on level
  const getFaceExpression = (lvl: number) => {
    switch (lvl) {
      case 1: // Empty - exhausted, closed eyes
        return { eyeOpen: 0.1, mouthCurve: -0.3, eyebrowAngle: 10 };
      case 2: // Low - tired, half-lidded
        return { eyeOpen: 0.4, mouthCurve: -0.1, eyebrowAngle: 5 };
      case 3: // Half - neutral
        return { eyeOpen: 0.7, mouthCurve: 0, eyebrowAngle: 0 };
      case 4: // High - alert
        return { eyeOpen: 0.9, mouthCurve: 0.2, eyebrowAngle: -3 };
      case 5: // Full - energized
        return { eyeOpen: 1, mouthCurve: 0.4, eyebrowAngle: -5 };
      default:
        return { eyeOpen: 0.7, mouthCurve: 0, eyebrowAngle: 0 };
    }
  };

  const expression = getFaceExpression(displayLevel);
  const segmentHeight = (dimensions.height - 20) / 5;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, segmentLevel: number) => {
      if (!interactive || !onChange) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onChange(segmentLevel);
      } else if (e.key === "ArrowUp" && level < 5) {
        e.preventDefault();
        onChange(level + 1);
      } else if (e.key === "ArrowDown" && level > 1) {
        e.preventDefault();
        onChange(level - 1);
      }
    },
    [interactive, onChange, level]
  );

  return (
    <div
      className="flex flex-col items-center gap-3"
      role={interactive ? "radiogroup" : undefined}
      aria-label={interactive ? "Social battery level selector" : undefined}
    >
      <svg
        width={dimensions.width}
        height={dimensions.height}
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="drop-shadow-md"
        role="img"
        aria-label={`Social battery: ${currentLevelData.label} (${level} of 5) - ${LEVEL_DESCRIPTIONS[level - 1]}`}
      >
        {/* Battery cap */}
        <rect
          x={dimensions.width / 2 - 10}
          y={0}
          width={20}
          height={8}
          rx={3}
          fill="var(--border)"
        />

        {/* Battery body outline */}
        <rect
          x={4}
          y={10}
          width={dimensions.width - 8}
          height={dimensions.height - 14}
          rx={8}
          fill="var(--card)"
          stroke="var(--border)"
          strokeWidth={2}
        />

        {/* Battery segments */}
        {LEVELS.map((lvlData, index) => {
          const segmentIndex = 4 - index; // Reverse order (5 at top, 1 at bottom)
          const isFilled = displayLevel >= lvlData.value;
          const y = 14 + segmentIndex * segmentHeight;
          const isSelected = level === lvlData.value;

          return (
            <g
              key={lvlData.value}
              role={interactive ? "radio" : undefined}
              aria-checked={interactive ? isSelected : undefined}
              aria-label={interactive ? `${lvlData.label} (${lvlData.value} of 5)` : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={
                interactive && onChange
                  ? () => onChange(lvlData.value)
                  : undefined
              }
              onKeyDown={
                interactive
                  ? (e) => handleKeyDown(e, lvlData.value)
                  : undefined
              }
              onMouseEnter={interactive ? () => setHoveredLevel(lvlData.value) : undefined}
              onMouseLeave={interactive ? () => setHoveredLevel(null) : undefined}
              className={interactive ? "cursor-pointer focus:outline-none" : ""}
              style={{ outline: "none" }}
            >
              <rect
                x={10}
                y={y}
                width={dimensions.width - 20}
                height={segmentHeight - 4}
                rx={4}
                fill={isFilled ? currentLevelData.color : "var(--border)"}
                opacity={isFilled ? 1 : 0.2}
                className={interactive ? "transition-all duration-200" : ""}
              />
              {/* Focus ring for keyboard navigation */}
              {interactive && (
                <rect
                  x={8}
                  y={y - 2}
                  width={dimensions.width - 16}
                  height={segmentHeight}
                  rx={5}
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  opacity={0}
                  className="focus-ring"
                  style={{ opacity: 0 }}
                />
              )}
            </g>
          );
        })}

        {/* Face - positioned in the filled area */}
        <g
          transform={`translate(${dimensions.width / 2}, ${
            dimensions.height / 2 + 10
          })`}
        >
          {/* Left eye */}
          <ellipse
            cx={-dimensions.eyeSize * 1.5}
            cy={0}
            rx={dimensions.eyeSize * 0.8}
            ry={dimensions.eyeSize * expression.eyeOpen}
            fill="var(--foreground)"
            opacity={0.7}
          />
          {/* Right eye */}
          <ellipse
            cx={dimensions.eyeSize * 1.5}
            cy={0}
            rx={dimensions.eyeSize * 0.8}
            ry={dimensions.eyeSize * expression.eyeOpen}
            fill="var(--foreground)"
            opacity={0.7}
          />

          {/* Mouth */}
          <path
            d={`M ${-dimensions.mouthSize / 2} ${dimensions.eyeSize * 2} Q 0 ${
              dimensions.eyeSize * 2 + dimensions.mouthSize * expression.mouthCurve
            } ${dimensions.mouthSize / 2} ${dimensions.eyeSize * 2}`}
            fill="none"
            stroke="var(--foreground)"
            strokeWidth={2}
            strokeLinecap="round"
            opacity={0.7}
          />

          {/* Z's for empty state */}
          {displayLevel === 1 && (
            <text
              x={dimensions.eyeSize * 2.5}
              y={-dimensions.eyeSize}
              fontSize={dimensions.eyeSize}
              fill="var(--muted)"
              opacity={0.6}
            >
              zzz
            </text>
          )}
        </g>
      </svg>

      {showLabel && (
        <span className="text-sm font-medium text-muted" aria-live="polite">
          {currentLevelData.label}
        </span>
      )}
      {/* Screen reader announcement for level changes */}
      <span className="sr-only" aria-live="assertive" aria-atomic="true">
        {interactive && `Battery level: ${currentLevelData.label}`}
      </span>
    </div>
  );
}
