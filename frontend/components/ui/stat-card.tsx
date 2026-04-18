"use client";

import * as React from "react";
import { cn, formatDate } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  sub?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  href?: string;
  className?: string;
  color?: "blue" | "green" | "amber" | "purple" | "slate";
}

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", icon: "text-blue-600" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", icon: "text-emerald-600" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", icon: "text-amber-600" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", icon: "text-violet-600" },
  slate: { bg: "bg-slate-100", text: "text-slate-700", icon: "text-slate-600" },
};

export function StatCard({
  label,
  value,
  icon,
  sub,
  trend,
  trendValue,
  href,
  className,
  color = "blue",
}: StatCardProps) {
  const colors = COLOR_MAP[color];
  const content = (
    <>
      <div
        className={cn(
          "w-10 h-10 rounded-xl flex items-center justify-center mb-3",
          colors.bg
        )}
      >
        <span className={colors.icon}>{icon}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn("text-2xl font-bold tracking-tight", colors.text)}>
          {value}
        </span>
        {trend && trendValue && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-emerald-600",
              trend === "down" && "text-red-600",
              trend === "neutral" && "text-slate-500"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trend === "neutral" && "→"} {trendValue}
          </span>
        )}
      </div>

      <p className="text-sm text-slate-500 mt-0.5">{label}</p>

      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </>
  );

  const cardClassName = cn(
    "card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200",
    href && "cursor-pointer",
    className
  );

  if (href) {
    return (
      <a href={href} className={cardClassName}>
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
