"use client";

import * as React from "react";
import { cn, initials } from "@/lib/utils";

interface AvatarProps {
  name: string;
  image?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  gradient?: boolean;
}

const SIZE_CONFIG = {
  xs: { size: 24, fontSize: 10 },
  sm: { size: 32, fontSize: 12 },
  md: { size: 40, fontSize: 14 },
  lg: { size: 56, fontSize: 18 },
  xl: { size: 80, fontSize: 24 },
};

const GRADIENTS = [
  "from-blue-400 to-blue-600",
  "from-emerald-400 to-emerald-600",
  "from-violet-400 to-violet-600",
  "from-amber-400 to-amber-600",
  "from-rose-400 to-rose-600",
  "from-cyan-400 to-cyan-600",
];

export function Avatar({
  name,
  image,
  size = "md",
  className,
  gradient = true,
}: AvatarProps) {
  const config = SIZE_CONFIG[size];
  const text = initials(name);
  const gradientClass = gradient
    ? GRADIENTS[name.length % GRADIENTS.length]
    : "from-slate-300 to-slate-400";

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className={cn(
          "rounded-full object-cover",
          className
        )}
        style={{ width: config.size, height: config.size }}
      />
    );
  }

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center text-white font-semibold bg-gradient-to-br",
        gradientClass,
        className
      )}
      style={{
        width: config.size,
        height: config.size,
        fontSize: config.fontSize,
      }}
      title={name}
    >
      {text}
    </div>
  );
}
