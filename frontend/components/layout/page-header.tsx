"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  badge?: {
    label: string;
    icon?: React.ReactNode;
  };
  actions?: React.ReactNode;
  backHref?: string;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  badge,
  actions,
  backHref,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {backHref && (
            <a
              href={backHref}
              className="mt-1 p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
          )}

          <div>
            {eyebrow && (
              <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-1">
                {eyebrow}
              </p>
            )}

            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{title}</h1>

            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {badge.icon}
              {badge.label}
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}
