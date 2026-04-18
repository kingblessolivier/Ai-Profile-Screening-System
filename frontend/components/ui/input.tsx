"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, helper, icon, iconRight, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="w-full">
        {label && (
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            type={inputType}
            className={cn(
              "flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900",
              "placeholder:text-slate-400",
              "focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-150",
              icon && "pl-10",
              (iconRight || isPassword) && "pr-10",
              error && "border-red-300 focus:border-red-500 focus:ring-red-500/10",
              className
            )}
            ref={ref}
            {...props}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {iconRight && !isPassword && (
              <span className="text-slate-400">{iconRight}</span>
            )}
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {(error || helper) && (
          <p
            className={cn(
              "mt-1.5 text-xs",
              error ? "text-red-600" : "text-slate-500"
            )}
          >
            {error || helper}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
