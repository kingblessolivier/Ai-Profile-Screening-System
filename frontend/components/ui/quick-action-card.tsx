"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface QuickActionCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  href: string;
  className?: string;
  color?: "blue" | "green" | "amber" | "purple";
}

const COLOR_MAP = {
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200", hoverBorder: "hover:border-blue-300" },
  green: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200", hoverBorder: "hover:border-emerald-300" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200", hoverBorder: "hover:border-amber-300" },
  purple: { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200", hoverBorder: "hover:border-violet-300" },
};

export function QuickActionCard({
  title,
  subtitle,
  icon,
  href,
  className,
  color = "blue",
}: QuickActionCardProps) {
  const colors = COLOR_MAP[color];

  return (
    <a
      href={href}
      className={cn(
        "group flex items-center gap-4 p-4 rounded-xl border bg-white transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md",
        colors.border,
        colors.hoverBorder,
        className
      )}
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", colors.bg, colors.text)}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-900">{title}</p>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>

      <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </a>
  );
}
