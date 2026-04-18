"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TwoColumnLayoutProps {
  main: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
  sidebarPosition?: "right" | "left";
  sidebarWidth?: "sm" | "md" | "lg";
  gap?: "sm" | "md" | "lg";
}

const WIDTH_MAP = {
  sm: "lg:w-72 xl:w-80",
  md: "lg:w-80 xl:w-96",
  lg: "lg:w-96 xl:w-[28rem]",
};

const GAP_MAP = {
  sm: "gap-4",
  md: "gap-6",
  lg: "gap-8",
};

export function TwoColumnLayout({
  main,
  sidebar,
  className,
  sidebarPosition = "right",
  sidebarWidth = "md",
  gap = "md",
}: TwoColumnLayoutProps) {
  const sidebarClass = WIDTH_MAP[sidebarWidth];
  const gapClass = GAP_MAP[gap];

  const mainContent = (
    <div className="flex-1 min-w-0">{main}</div>
  );

  const sidebarContent = (
    <div className={cn("space-y-5", sidebarClass)}>{sidebar}</div>
  );

  return (
    <div className={cn("flex flex-col lg:flex-row", gapClass, className)}>
      {sidebarPosition === "left" && (
        <>
          {sidebarContent}
          {mainContent}
        </>
      )}
      {sidebarPosition === "right" && (
        <>
          {mainContent}
          {sidebarContent}
        </>
      )}
    </div>
  );
}
