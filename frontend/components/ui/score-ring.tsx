"use client";

import * as React from "react";
import { cn, getScoreColor } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

const SIZE_CONFIG = {
  sm: { size: 40, strokeWidth: 3, fontSize: 11 },
  md: { size: 56, strokeWidth: 4, fontSize: 14 },
  lg: { size: 80, strokeWidth: 5, fontSize: 20 },
};

export function ScoreRing({
  score,
  size = "md",
  showLabel = true,
  animate = true,
  className,
}: ScoreRingProps) {
  const config = SIZE_CONFIG[size];
  const { text: color } = getScoreColor(score);
  const radius = (config.size - config.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: config.size, height: config.size }}
    >
      <svg
        width={config.size}
        height={config.size}
        className="-rotate-90"
      >
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={config.strokeWidth}
        />
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animate ? circumference : strokeDashoffset}
          style={{
            transition: animate ? "stroke-dashoffset 1s ease-out" : undefined,
          }}
          className={animate ? "animate-[score-fill_1s_ease-out_forwards]" : ""}
        />
      </svg>

      {showLabel && (
        <div
          className="absolute inset-0 flex items-center justify-center font-bold"
          style={{ color, fontSize: config.fontSize }}
        >
          {score}%
        </div>
      )}
    </div>
  );
}
