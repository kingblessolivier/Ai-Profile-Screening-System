"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Brain, CheckCircle, Terminal as TerminalIcon, Eye, EyeOff, Copy, Check } from "lucide-react";

interface TerminalPanelProps {
  title: string;
  subtitle?: string;
  status: "live" | "complete" | "idle";
  content?: string;
  tokens?: number;
  words?: number;
  lines?: number;
  children?: React.ReactNode;
  className?: string;
  onCopy?: () => void;
  collapsible?: boolean;
  maxHeight?: number;
}

export function TerminalPanel({
  title,
  subtitle,
  status,
  content,
  tokens,
  words,
  lines,
  children,
  className,
  onCopy,
  collapsible = false,
  maxHeight = 360,
}: TerminalPanelProps) {
  const [showContent, setShowContent] = React.useState(true);
  const [copied, setCopied] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current && content) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  const handleCopy = async () => {
    if (content && onCopy) {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden",
        "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800",
        "border border-blue-500/20",
        status === "live" && "shadow-[0_0_40px_rgba(59,130,246,0.1)]",
        className
      )}
    >
      {/* Terminal Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>

        <div className="flex items-center gap-2 flex-1">
          <TerminalIcon className="w-3.5 h-3.5 text-white/30" />
          <span className="text-xs text-white/40 font-mono">
            {title} {subtitle && `· ${subtitle}`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {status === "live" ? (
            <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              LIVE
            </span>
          ) : status === "complete" ? (
            <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle className="w-3 h-3" />
              DONE
            </span>
          ) : null}

          {onCopy && (
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}

          {collapsible && (
            <button
              onClick={() => setShowContent(!showContent)}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            >
              {showContent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Brain Status Row */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-white/5 bg-black/20">
        <div
          className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            "bg-blue-500/20 border border-blue-500/30",
            status === "live" && "animate-[ai-pulse-ring_2s_ease-out_infinite]"
          )}
        >
          <Brain className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1">
          <p className="text-sm font-semibold text-white">
            {status === "live" ? "Gemini is reasoning…" : "Reasoning complete"}
          </p>
          <p className="text-xs text-blue-400 mt-0.5">
            {status === "live"
              ? "Streaming thought tokens live"
              : "Full thought process captured"}
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      {(tokens || words || lines) && (
        <div className="flex items-center gap-4 px-5 py-2 border-b border-white/5 bg-black/20">
          {content && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-blue-400/60 font-mono">#</span>
              <span className="text-xs text-white/30 font-mono">
                {content.length.toLocaleString()} chars
              </span>
            </div>
          )}
          {tokens && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-blue-400/60 font-mono">⚡</span>
              <span className="text-xs text-white/30 font-mono">~{tokens.toLocaleString()} tokens</span>
            </div>
          )}
          {words && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-blue-400/60 font-mono">📝</span>
              <span className="text-xs text-white/30 font-mono">{words.toLocaleString()} words</span>
            </div>
          )}
          {lines && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-blue-400/60 font-mono">📄</span>
              <span className="text-xs text-white/30 font-mono">{lines.toLocaleString()} lines</span>
            </div>
          )}
        </div>
      )}

      {/* Content Area */}
      {showContent && (
        <div
          ref={scrollRef}
          className="overflow-y-auto p-4 font-mono text-sm leading-relaxed"
          style={{ maxHeight, color: "#93c5fd" }}
        >
          {content ? (
            <div className="whitespace-pre-wrap">{content}</div>
          ) : children ? (
            children
          ) : (
            <span className="text-white/20">Waiting for Gemini to begin reasoning…</span>
          )}

          {status === "live" && content && (
            <span
              className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-[blink-cursor_1s_step-end_infinite]"
              style={{ verticalAlign: "middle" }}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2 border-t border-white/5 text-xs text-blue-400/40 flex items-center gap-2">
        <Brain className="w-3 h-3" />
        These are Gemini&apos;s private thinking tokens — the model&apos;s reasoning before producing the final output.
      </div>
    </div>
  );
}
