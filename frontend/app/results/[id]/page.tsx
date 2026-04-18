"use client";

import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchResult } from "@/store/screeningSlice";
import api from "@/lib/api";
import {
  ArrowLeft, Trophy, Users, Clock, CheckCircle, XCircle, MessageSquare,
  TrendingUp, ChevronDown, ChevronUp, AlertCircle, Loader2,
  Download, Brain, Sparkles, Eye, EyeOff, Target, Terminal,
  Cpu, Hash, Copy, Check,
} from "lucide-react";
import { CandidateScore } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const RECO_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  "Strongly Recommended": { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", label: "Strongly Rec." },
  Recommended:            { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "Recommended"  },
  Consider:               { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "Consider"     },
  "Not Recommended":      { color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", label: "Not Rec."     },
};

function scoreColor(s: number) {
  return s >= 80 ? "#059669" : s >= 60 ? "#2563eb" : s >= 40 ? "#d97706" : "#ef4444";
}
function scoreBg(s: number) {
  return s >= 80 ? { bg: "#ecfdf5", text: "#059669" }
       : s >= 60 ? { bg: "#eff6ff", text: "#2563eb" }
       : s >= 40 ? { bg: "#fffbeb", text: "#d97706" }
       :           { bg: "#fef2f2", text: "#ef4444"  };
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="font-bold" style={{ color: scoreColor(value) }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-inset)" }}>
        <div className="h-full rounded-full score-bar-fill" style={{ width: `${value}%`, background: scoreColor(value) }} />
      </div>
    </div>
  );
}

function decisionConfidenceLabel(score: number) {
  if (score >= 85) return "High";
  if (score >= 70) return "Medium";
  return "Low";
}

// ─── Candidate card ───────────────────────────────────────────────────────────

function CandidateCard({ c, filter }: { c: CandidateScore; filter: string }) {
  const [open, setOpen] = useState(false);
  const cfg   = RECO_CONFIG[c.recommendation] || RECO_CONFIG["Consider"];
  const badge = scoreBg(c.matchScore);

  if (filter !== "all") {
    if (filter === "top"    && c.matchScore < 75)                         return null;
    if (filter === "medium" && (c.matchScore >= 75 || c.matchScore < 50)) return null;
    if (filter === "low"    && c.matchScore >= 50)                        return null;
  }

  return (
    <div id={`c-${c.candidateId}`} className="card overflow-hidden transition-all scroll-mt-24" style={{ borderColor: open ? cfg.border : "var(--border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors"
        style={{ background: open ? cfg.bg + "80" : "transparent" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "var(--surface-inset)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "var(--ink, #0d1117)", color: "#fff" }}>
          {c.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{c.candidateName}</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{c.email}</p>
        </div>
        <div className="text-xl font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: badge.bg, color: badge.text }}>
          {c.matchScore}%
        </div>
        <div className="text-xs px-2 py-1 rounded-lg flex-shrink-0 hidden sm:block"
          style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
          {c.confidence}% conf.
        </div>
        <div className="flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-6 pt-4 space-y-5"
          style={{ borderTop: `1px solid ${cfg.border}`, background: cfg.bg + "40" }}>
          {c.breakdown && (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Score Breakdown
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ScoreBar label="Skills Match (40%)"  value={c.breakdown.skillsScore} />
                <ScoreBar label="Experience (25%)"    value={c.breakdown.experienceScore} />
                <ScoreBar label="Projects (15%)"      value={c.breakdown.projectsScore} />
                <ScoreBar label="Education (10%)"     value={c.breakdown.educationScore} />
                <ScoreBar label="Availability (10%)"  value={c.breakdown.availabilityScore} />
              </div>
            </div>
          )}

          {c.summary && (
            <div className="p-4 rounded-xl"
              style={{ background: "var(--ai-light)", border: "1px solid var(--ai-border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5" style={{ color: "var(--ai)" }} />
                <p className="text-xs font-bold" style={{ color: "var(--ai)" }}>AI Summary</p>
              </div>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{c.summary}</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>Confidence</p>
              <p className="text-2xl font-bold" style={{ color: scoreColor(c.confidence) }}>{c.confidence}%</p>
            </div>
            <div className="sm:col-span-2 p-3 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Evidence</p>
              <ul className="space-y-1.5">
                {c.evidence.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--accent)" }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "var(--success)" }}>
                <CheckCircle className="w-3.5 h-3.5" />Strengths
              </p>
              <ul className="space-y-1.5">
                {c.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "var(--success)" }} />{s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "#ef4444" }}>
                <XCircle className="w-3.5 h-3.5" />Gaps / Risks
              </p>
              <ul className="space-y-1.5">
                {c.gaps.map((g, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#ef4444" }} />{g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {c.skillGapAnalysis && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "var(--text-muted)" }}>
                <Target className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />Skill Gap Analysis
              </p>
              <div className="flex flex-wrap gap-2">
                {c.skillGapAnalysis.matched.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#059669" }}>✓ {s}</span>
                ))}
                {c.skillGapAnalysis.missing.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#fef2f2", color: "#ef4444" }}>✗ {s}</span>
                ))}
                {c.skillGapAnalysis.bonus.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}>+ {s}</span>
                ))}
              </div>
            </div>
          )}

          {c.interviewQuestions?.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5" style={{ color: "var(--ai)" }}>
                <MessageSquare className="w-3.5 h-3.5" />Suggested Interview Questions
              </p>
              <ol className="space-y-2">
                {c.interviewQuestions.map((q, i) => (
                  <li key={i} className="text-sm flex items-start gap-2.5" style={{ color: "var(--text-secondary)" }}>
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: "var(--ai-light)", color: "var(--ai)" }}>
                      {i + 1}
                    </span>
                    {q}
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Live thinking terminal (during screening) ────────────────────────────────

function LiveThinkingPanel({ resultId }: { resultId: string }) {
  const [text, setText]   = useState("");
  const [done, setDone]   = useState(false);
  const [show, setShow]   = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef         = useRef<HTMLDivElement>(null);
  const sseRef            = useRef<EventSource | null>(null);

  useEffect(() => {
    const token   = typeof window !== "undefined" ? localStorage.getItem("talentai_token") : null;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const es      = new EventSource(`${apiBase}/screening/${resultId}/thinking-stream?token=${token ?? ""}`);
    sseRef.current = es;

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as { type: string; text?: string };
        if (msg.type === "chunk" && msg.text) {
          setText((prev) => prev + msg.text);
        } else if (msg.type === "done") {
          setDone(true);
          es.close();
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => { setDone(true); es.close(); };
    return () => es.close();
  }, [resultId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [text]);

  const tokens = Math.round(text.length / 4);
  const words  = text.split(/\s+/).filter(Boolean).length;

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  return (
    <div
      className="mb-6 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(175deg, #060d19 0%, #0a1628 60%, #0d1f3c 100%)",
        border: "1px solid rgba(59,130,246,0.25)",
        boxShadow: done ? "none" : "0 0 40px rgba(59,130,246,0.1), 0 0 0 1px rgba(59,130,246,0.15)",
        animation: done ? "none" : "thinking-glow 3s ease-in-out infinite",
      }}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-3 px-5 py-3.5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {/* Traffic light dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <Terminal className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
          <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
            gemini-2.5-flash · thought_tokens
          </span>
        </div>

        {/* Live badge */}
        {!done ? (
          <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
            style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.25)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block"
              style={{ animation: "blink-cursor 1s ease infinite" }} />
            LIVE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
            style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }}>
            <CheckCircle className="w-3 h-3" />
            COMPLETE
          </span>
        )}

        <button onClick={() => setShow((v) => !v)} className="transition-colors"
          style={{ color: "rgba(255,255,255,0.3)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Brain + label row */}
      <div className="flex items-center gap-3 px-5 py-3"
        style={{ background: "rgba(0,0,0,0.2)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: done ? "rgba(52,211,153,0.15)" : "rgba(59,130,246,0.2)",
            border: `1px solid ${done ? "rgba(52,211,153,0.3)" : "rgba(59,130,246,0.35)"}`,
            animation: done ? "none" : "ai-pulse-ring 2s ease-out infinite",
          }}>
          <Brain className="text-white" style={{ width: 18, height: 18 }} />
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm text-white">
            {done ? "Deep Think complete" : "Gemini is reasoning about your candidates…"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#60a5fa" }}>
            {done
              ? `Finished reasoning · ${words.toLocaleString()} words · ~${tokens.toLocaleString()} tokens`
              : "Streaming private thought tokens — watch Gemini reason in real time"}
          </p>
        </div>
        {text && (
          <button onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
            style={{
              background: copied ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
              color: copied ? "#34d399" : "rgba(255,255,255,0.5)",
              border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}>
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {/* Stats bar */}
      {text && (
        <div className="flex items-center gap-4 px-5 py-2"
          style={{ background: "rgba(0,0,0,0.3)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
          {[
            { icon: Hash,    label: `${text.length.toLocaleString()} chars` },
            { icon: Cpu,     label: `~${tokens.toLocaleString()} tokens` },
            { icon: Users,   label: `${words.toLocaleString()} words` },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className="w-3 h-3" style={{ color: "rgba(96,165,250,0.5)" }} />
              <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main thinking area */}
      {show && (
        <div
          ref={scrollRef}
          className="overflow-y-auto font-mono text-xs leading-relaxed"
          style={{
            maxHeight: 360,
            padding: "16px 20px",
            color: "#93c5fd",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            lineHeight: 1.8,
            background: "rgba(0,0,0,0.2)",
          }}
        >
          {text || (
            <span className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.2)" }}>
              <Loader2 className="w-3 h-3 animate-spin" />
              Waiting for Gemini to begin reasoning…
            </span>
          )}
          {!done && text && (
            <span className="inline-block align-middle"
              style={{
                width: 7, height: 14, background: "#60a5fa", borderRadius: 1, marginLeft: 2,
                animation: "blink-cursor 1s step-end infinite",
              }}
            />
          )}
        </div>
      )}

      {!show && text && (
        <div className="px-5 py-3 text-xs" style={{ color: "rgba(96,165,250,0.4)" }}>
          {text.length.toLocaleString()} chars of reasoning hidden · click eye to reveal
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-2.5 text-xs flex items-center gap-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "rgba(59,130,246,0.35)" }}>
        <Brain className="w-3 h-3" />
        These are Gemini&apos;s private thinking tokens — the model&apos;s reasoning before producing the final output.
      </div>
    </div>
  );
}

// ─── Stored thinking log (after completion) ───────────────────────────────────

function ThinkingLogSection({ thinkingLog }: { thinkingLog: string }) {
  const [open, setOpen]     = useState(false);
  const [show, setShow]     = useState(true);
  const [copied, setCopied] = useState(false);

  const tokens = Math.round(thinkingLog.length / 4);
  const words  = thinkingLog.split(/\s+/).filter(Boolean).length;
  const lines  = thinkingLog.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(thinkingLog).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  return (
    <div
      className="mb-6 rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(175deg, #060d19 0%, #0a1628 60%, #0d1f3c 100%)",
        border: "1px solid rgba(59,130,246,0.2)",
      }}
    >
      {/* Terminal header */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-3.5 text-left transition-all"
        style={{ borderBottom: open ? "1px solid rgba(255,255,255,0.06)" : "none" }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.08)")}
        onMouseLeave={(e) => (e.currentTarget.style.filter = "none")}
      >
        {/* Traffic dots */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
          <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="flex items-center gap-1.5 flex-1">
          <Terminal className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.35)" }} />
          <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
            gemini-2.5-flash · thought_tokens · archived
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
          style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
          <CheckCircle className="w-3 h-3" />DONE
        </span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
              : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />}
      </button>

      {open && (
        <>
          {/* Brain + meta row */}
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: "rgba(0,0,0,0.25)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(52,211,153,0.15)", border: "1px solid rgba(52,211,153,0.3)" }}>
              <Brain className="text-white" style={{ width: 18, height: 18 }} />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-white">Gemini&apos;s Deep Think — Reasoning Archive</p>
              <p className="text-xs mt-0.5" style={{ color: "#60a5fa" }}>
                Full thought process captured · Gemini 2.5 Flash
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShow((v) => !v)}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.08)" }}>
                {show ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {show ? "Hide" : "Show"}
              </button>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all"
                style={{
                  background: copied ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.06)",
                  color: copied ? "#34d399" : "rgba(255,255,255,0.5)",
                  border: `1px solid ${copied ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.1)"}`,
                }}>
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied" : "Copy all"}
              </button>
            </div>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-5 px-5 py-2"
            style={{ background: "rgba(0,0,0,0.35)", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            {[
              { icon: Hash,    label: `${thinkingLog.length.toLocaleString()} chars` },
              { icon: Cpu,     label: `~${tokens.toLocaleString()} tokens` },
              { icon: Users,   label: `${words.toLocaleString()} words` },
              { icon: Terminal,label: `${lines.length.toLocaleString()} lines` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <Icon className="w-3 h-3" style={{ color: "rgba(96,165,250,0.45)" }} />
                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Thinking text with line numbers */}
          {show && (
            <div className="overflow-y-auto" style={{ maxHeight: 440, background: "rgba(0,0,0,0.2)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.02)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td
                        className="text-right font-mono select-none"
                        style={{
                          fontSize: 10,
                          padding: "3px 14px 3px 16px",
                          color: "rgba(255,255,255,0.12)",
                          borderRight: "1px solid rgba(255,255,255,0.04)",
                          minWidth: 44,
                          verticalAlign: "top",
                          userSelect: "none",
                        }}
                      >
                        {i + 1}
                      </td>
                      <td
                        className="font-mono"
                        style={{
                          fontSize: 12,
                          padding: "3px 16px",
                          color: "#93c5fd",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          lineHeight: 1.75,
                          verticalAlign: "top",
                        }}
                      >
                        {line || " "}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-2.5 text-xs flex items-center gap-2"
            style={{ borderTop: "1px solid rgba(255,255,255,0.04)", color: "rgba(59,130,246,0.35)" }}>
            <Brain className="w-3 h-3" />
            These are Gemini&apos;s private thinking tokens — internal reasoning captured before producing final output.
          </div>
        </>
      )}

      {/* Collapsed summary */}
      {!open && (
        <div className="flex items-center gap-4 px-5 py-3">
          <Brain className="w-4 h-4 flex-shrink-0" style={{ color: "#60a5fa" }} />
          <p className="text-xs flex-1" style={{ color: "rgba(96,165,250,0.6)" }}>
            {words.toLocaleString()} words · ~{tokens.toLocaleString()} tokens of reasoning archived
          </p>
          <button onClick={() => setOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: "#60a5fa" }}>
            <Eye className="w-3.5 h-3.5" />View Deep Think
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ResultDetailPage() {
  const { id }   = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { current: result, loading } = useSelector((s: RootState) => s.screening);
  const [filter, setFilter]     = useState("all");
  const [exporting, setExporting] = useState(false);

  const isFallback = result?.aiModel === "deterministic-fallback";
  const isPending  = result?.status === "pending" || result?.status === "running";
  const isFailed   = result?.status === "failed";

  useEffect(() => { if (id) dispatch(fetchResult(id)); }, [id, dispatch]);

  // Poll every 2 s while running
  useEffect(() => {
    if (!id || !isPending) return;
    const t = window.setInterval(() => dispatch(fetchResult(id)), 2000);
    return () => window.clearInterval(t);
  }, [dispatch, id, isPending]);

  const handleExportPdf = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const { data } = await api.get(`/screening/${id}/report/pdf`, { responseType: "blob" });
      const url  = window.URL.createObjectURL(new Blob([data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${result!.jobTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-screening-report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  if (loading && !result)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    );

  if (!result)
    return <div className="text-center py-32" style={{ color: "var(--text-muted)" }}>Result not found.</div>;

  const stronglyRec = result.shortlist.filter((c) => c.recommendation === "Strongly Recommended").length;
  const avgScore    = Math.round(result.shortlist.reduce((a, c) => a + c.matchScore, 0) / (result.shortlist.length || 1));
  const topCandidate = result.shortlist[0];
  const decisionConfidence = decisionConfidenceLabel(topCandidate?.confidence ?? 0);
  const topThree = result.shortlist.slice(0, 3);
  const watchlist = result.shortlist
    .filter((c) => c.rank > 3 && c.confidence >= 70)
    .slice(0, 3);

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-6">
        <Link href="/results"
          className="p-2 rounded-lg transition-colors flex-shrink-0 mt-1"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-inset)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--ai)" }}>
            Decision Workspace
          </p>
          <h1 className="text-2xl font-bold truncate mb-1"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
            {result.jobTitle}
          </h1>
          <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{result.totalApplicants} screened</span>
            <span className="flex items-center gap-1"><Trophy className="w-3 h-3" style={{ color: "#d97706" }} />Top {result.shortlistSize}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(result.screeningDate).toLocaleString()}</span>
            <span className="flex items-center gap-1"><Sparkles className="w-3 h-3" style={{ color: "var(--ai)" }} />{result.aiModel}</span>
          </div>
        </div>
        <button
          onClick={handleExportPdf}
          disabled={exporting || isPending || isFailed}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
          style={exporting || isPending || isFailed
            ? { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" }
            : { background: "var(--ink, #0d1117)" }}
          onMouseEnter={(e) => { if (!exporting && !isPending && !isFailed) e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)"; }}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
          <Download className="w-4 h-4" />
          {exporting ? "Generating…" : "Export PDF"}
        </button>
      </div>

      {/* ── Status banners ─────────────────────────────────────────────────── */}
      {isFallback && (
        <div className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm"
          style={{ background: "var(--warning-light)", border: "1px solid var(--warning-border)", color: "var(--warning)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Deterministic fallback scoring</p>
            <p className="text-xs mt-0.5 opacity-80">Gemini quota exhausted — rule-based scoring was used instead.</p>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm"
          style={{ background: "var(--error-light)", border: "1px solid var(--error-border)", color: "var(--error)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Screening failed</p>
            <p className="text-xs mt-0.5 opacity-80">{result.errorMessage || "The screening job failed. Try running it again."}</p>
          </div>
        </div>
      )}

      {/* ── LIVE Gemini Deep Think (while running) ─────────────────────────── */}
      {isPending && id && (
        <>
          {/* Progress bar */}
          <div className="mb-5 p-4 rounded-xl flex items-center gap-4"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <Loader2 className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: "var(--ai)" }} />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Screening in progress</p>
                <span className="text-xs font-bold" style={{ color: "var(--ai)" }}>{result?.progress ?? 20}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-inset)" }}>
                <div className="h-full rounded-full transition-all score-bar-fill"
                  style={{ width: `${result?.progress ?? 20}%`, background: "var(--ai)" }} />
              </div>
            </div>
          </div>

          {/* Live thinking panel */}
          <LiveThinkingPanel resultId={id} />
        </>
      )}

      {/* ── Summary stats ──────────────────────────────────────────────────── */}
      {!isPending && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Top Score",    value: `${result.shortlist[0]?.matchScore ?? 0}%`, icon: Trophy,     color: "#d97706" },
            { label: "Avg Score",    value: `${avgScore}%`,                             icon: TrendingUp, color: "var(--accent)" },
            { label: "Strongly Rec", value: stronglyRec,                                icon: CheckCircle, color: "var(--success)" },
            { label: "Processing",   value: `${(result.processingTimeMs / 1000).toFixed(1)}s`, icon: Clock, color: "var(--ai)" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-4 text-center">
              <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} />
              <p className="text-xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
                {value}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Decision Snapshot ─────────────────────────────────────────────── */}
      {!isPending && !isFailed && result.shortlist.length > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--text-muted)" }}>
                Decision Snapshot
              </p>
              <h2 className="text-lg font-semibold mt-1" style={{ color: "var(--text-primary)" }}>
                Hiring confidence: {decisionConfidence}
              </h2>
              <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                Top recommendation: <strong>{topCandidate?.candidateName}</strong> at {topCandidate?.matchScore}% match with {topCandidate?.confidence}% confidence.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const first = topCandidate ? document.getElementById(`c-${topCandidate.candidateId}`) : null;
                first?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              Jump to top candidate
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl p-4" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Interview First
              </p>
              <ul className="space-y-2">
                {topThree.map((c) => (
                  <li key={c.candidateId} className="flex items-center justify-between gap-3 text-sm">
                    <Link href={`#c-${c.candidateId}`} className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {c.rank}. {c.candidateName}
                    </Link>
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: scoreBg(c.matchScore).bg, color: scoreBg(c.matchScore).text }}>
                      {c.matchScore}%
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl p-4" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: "var(--text-muted)" }}>
                Manual Review Watchlist
              </p>
              {watchlist.length > 0 ? (
                <ul className="space-y-2">
                  {watchlist.map((c) => (
                    <li key={c.candidateId} className="flex items-center justify-between gap-3 text-sm">
                      <Link href={`#c-${c.candidateId}`} className="font-medium" style={{ color: "var(--text-primary)" }}>
                        {c.rank}. {c.candidateName}
                      </Link>
                      <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {c.confidence}% confidence
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  No additional high-confidence candidates outside top 3.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Pool Insights ──────────────────────────────────────────────────── */}
      {result.poolInsights && !isPending && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4" style={{ color: "var(--ai)" }} />
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Pool Insights</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Top Skills in Pool</p>
              <div className="flex flex-wrap gap-1.5">
                {result.poolInsights.topSkills.slice(0, 6).map((s) => (
                  <span key={s.skill} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                    {s.skill} ({s.count})
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Missing Critical Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.poolInsights.missingCriticalSkills.length === 0 ? (
                  <span className="text-xs font-medium" style={{ color: "var(--success)" }}>✓ All critical skills covered</span>
                ) : result.poolInsights.missingCriticalSkills.map((s) => (
                  <span key={s} className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--error-light)", color: "var(--error)" }}>{s}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>Pool Stats</p>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                Avg experience: <strong style={{ color: "var(--text-primary)" }}>{result.poolInsights.avgExperienceYears}yr</strong>
              </p>
              {result.poolInsights.availabilityBreakdown.map((a) => (
                <p key={a.status} className="text-xs" style={{ color: "var(--text-muted)" }}>{a.status}: {a.count}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Gemini Deep Think Archive (after completion) ───────────────────── */}
      {result.thinkingLog && !isPending && (
        <ThinkingLogSection thinkingLog={result.thinkingLog} />
      )}

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      {!isPending && (
        <>
          <div className="flex gap-2 mb-4 flex-wrap">
            {[
              { key: "all",    label: "All Candidates" },
              { key: "top",    label: "Top (75%+)" },
              { key: "medium", label: "Medium (50–74%)" },
              { key: "low",    label: "Low (<50%)" },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={filter === key
                  ? { background: "var(--ink, #0d1117)", color: "#fff" }
                  : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {result.shortlist.map((c) => (
              <CandidateCard key={c.candidateId} c={c} filter={filter} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
