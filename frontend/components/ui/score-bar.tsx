"use client";

import { cn, getScoreColor } from "@/lib/utils";

interface ScoreBarProps {
  label: string;
  value: number;
  className?: string;
  animate?: boolean;
  size?: "sm" | "md";
  showPercentage?: boolean;
}

export function ScoreBar({
  label,
  value,
  className,
  animate = true,
  size = "md",
  showPercentage = true,
}: ScoreBarProps) {
  const { text: color } = getScoreColor(value);
  const height = size === "sm" ? "h-1.5" : "h-2";

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm text-slate-600">{label}</span>
        {showPercentage && (
          <span className="text-sm font-semibold tabular-nums" style={{ color }}>
            {value}%
          </span>
        )}
      </div>
      <div className={cn("w-full rounded-full bg-slate-100 overflow-hidden", height)}>
        <div
          className={cn(
            "h-full rounded-full",
            animate && "transition-all duration-700 ease-out"
          )}
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
