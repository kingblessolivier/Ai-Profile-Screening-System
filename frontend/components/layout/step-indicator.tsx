"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Loader2 } from "lucide-react";

interface Step {
  id: number;
  label: string;
  detail: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  status: "pending" | "active" | "complete";
}

export function StepIndicator({ steps, currentStep, status }: StepIndicatorProps) {
  return (
    <div className="flex items-stretch">
      {steps.map((step, index) => {
        const isDone = status === "complete" || currentStep > step.id;
        const isActive = currentStep === step.id && status === "active";
        const isPending = currentStep < step.id;

        return (
          <div
            key={step.id}
            className={cn(
              "flex-1 flex items-start gap-3 px-4 py-4",
              index < steps.length - 1 && "border-r border-white/5"
            )}
          >
            <div
              className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5",
                isDone && "bg-emerald-500 text-white",
                isActive && "bg-blue-500 text-white shadow-[0_0_0_3px_rgba(59,130,246,0.3)]",
                isPending && "bg-white/5 text-white/30 border border-white/10"
              )}
            >
              {isDone ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : isActive ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                step.id
              )}
            </div>

            <div className="min-w-0">
              <p
                className={cn(
                  "text-xs font-semibold leading-tight flex items-center gap-1",
                  isDone && "text-emerald-400",
                  isActive && "text-white",
                  isPending && "text-white/30"
                )}
              >
                {step.label}
                {isActive && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </>
                )}
              </p>
              <p className="text-[10px] text-white/20 mt-0.5 hidden sm:block">
                {step.detail}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
