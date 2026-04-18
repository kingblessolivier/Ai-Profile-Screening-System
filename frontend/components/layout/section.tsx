"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface SectionProps {
  title?: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
  };
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  dark?: boolean;
}

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
  contentClassName,
  dark = false,
}: SectionProps) {
  return (
    <section className={cn("mb-8", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && (
            <a
              href={action.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              {action.label}
              <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>
      )}

      <div
        className={cn(
          "rounded-xl",
          dark && "bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
