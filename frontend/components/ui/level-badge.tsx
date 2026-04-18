"use client";

import * as React from "react";
import { cn, getLevelStyle, getTypeStyle, getRecommendationStyle } from "@/lib/utils";

interface LevelBadgeProps {
  level: string;
  className?: string;
}

export function LevelBadge({ level, className }: LevelBadgeProps) {
  const style = getLevelStyle(level);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
        className
      )}
      style={{ background: style.bg, color: style.text }}
    >
      {level}
    </span>
  );
}

interface TypeBadgeProps {
  type: string;
  className?: string;
}

export function TypeBadge({ type, className }: TypeBadgeProps) {
  const style = getTypeStyle(type);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
        className
      )}
      style={{ background: style.bg, color: style.text }}
    >
      {type}
    </span>
  );
}

interface RecommendationBadgeProps {
  recommendation: string;
  className?: string;
  size?: "sm" | "md";
}

export function RecommendationBadge({
  recommendation,
  className,
  size = "sm",
}: RecommendationBadgeProps) {
  const style = getRecommendationStyle(recommendation);
  const sizeClasses = size === "sm"
    ? "px-2 py-0.5 text-[11px]"
    : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-semibold border",
        sizeClasses,
        className
      )}
      style={{ background: style.bg, color: style.text, borderColor: style.bg }}
    >
      {style.label}
    </span>
  );
}

interface StatusBadgeProps {
  status: "pending" | "running" | "completed" | "failed";
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const styles = {
    pending: { bg: "#f0f9ff", text: "#0284c7", label: "Pending" },
    running: { bg: "#eff6ff", text: "#2563eb", label: "Running" },
    completed: { bg: "#ecfdf5", text: "#059669", label: "Completed" },
    failed: { bg: "#fef2f2", text: "#dc2626", label: "Failed" },
  };

  const style = styles[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold",
        className
      )}
      style={{ background: style.bg, color: style.text }}
    >
      {status === "running" && (
        <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
      )}
      {style.label}
    </span>
  );
}

interface SourceBadgeProps {
  source: "platform" | "csv" | "pdf";
  className?: string;
}

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const styles = {
    platform: { bg: "#eff6ff", text: "#2563eb", label: "Manual" },
    csv: { bg: "#fffbeb", text: "#d97706", label: "CSV" },
    pdf: { bg: "#f0f9ff", text: "#0284c7", label: "PDF" },
  };

  const style = styles[source];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium",
        className
      )}
      style={{ background: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}
