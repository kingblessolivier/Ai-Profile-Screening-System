"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SkillTagProps {
  name: string;
  level?: string;
  years?: number;
  required?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function SkillTag({
  name,
  level,
  years,
  required,
  className,
  size = "sm",
}: SkillTagProps) {
  const baseClasses = size === "sm"
    ? "px-2 py-0.5 text-[11px]"
    : "px-2.5 py-1 text-xs";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full font-medium",
        required
          ? "bg-blue-50 text-blue-700 border border-blue-200"
          : "bg-slate-100 text-slate-600",
        baseClasses,
        className
      )}
      title={level ? `${name} - ${level}${years ? ` (${years} years)` : ""}` : undefined}
    >
      {name}
      {required && <span className="opacity-60">*</span>}
    </span>
  );
}

interface SkillTagListProps {
  skills: Array<{
    name: string;
    level?: string;
    yearsOfExperience?: number;
    required?: boolean;
  }>;
  maxVisible?: number;
  className?: string;
}

export function SkillTagList({ skills, maxVisible = 5, className }: SkillTagListProps) {
  const visible = skills.slice(0, maxVisible);
  const remaining = skills.length - maxVisible;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {visible.map((skill) => (
        <SkillTag
          key={skill.name}
          name={skill.name}
          level={skill.level}
          years={skill.yearsOfExperience}
          required={skill.required}
        />
      ))}
      {remaining > 0 && (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-500">
          +{remaining} more
        </span>
      )}
    </div>
  );
}
