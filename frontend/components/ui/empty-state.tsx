"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  secondaryAction?: {
    label: string;
    onClick?: () => void;
    href?: string;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  const ActionWrapper = ({ children, href, onClick }: { children: React.ReactNode; href?: string; onClick?: () => void }) => {
    if (href) {
      return (
        <a
          href={href}
          onClick={onClick}
          className="inline-flex items-center justify-center"
        >
          {children}
        </a>
      );
    }
    return (
      <button onClick={onClick} className="inline-flex items-center justify-center">
        {children}
      </button>
    );
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 rounded-xl",
        className
      )}
    >
      <div className="mb-4 p-4 rounded-2xl bg-blue-50 text-blue-600">
        {icon}
      </div>

      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>

      <div className="flex items-center gap-3">
        {action && (
          <ActionWrapper href={action.href} onClick={action.onClick}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              {action.label}
            </span>
          </ActionWrapper>
        )}
        {secondaryAction && (
          <ActionWrapper href={secondaryAction.href} onClick={secondaryAction.onClick}>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors">
              {secondaryAction.label}
            </span>
          </ActionWrapper>
        )}
      </div>
    </div>
  );
}
