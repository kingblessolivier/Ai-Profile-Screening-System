"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { StepIndicator } from "@/components/layout";
import { runScreening } from "@/store/screeningSlice";
import { enqueue } from "@/store/screeningQueueSlice";
import { startStream, getThinking, subscribeText } from "@/lib/screeningStream";
import { Job, CandidateScore, ScreeningResult } from "@/types";
import {
  AlertCircle, Brain, Briefcase, CheckCircle,
  ExternalLink, MapPin, Minus, Plus, RotateCcw,
  Minimize2, Sparkles, Terminal, X, Zap,
} from "lucide-react";

// ─── Portal wrapper — escapes ancestor stacking contexts ──────────────────────

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AI_MODELS = [
  { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", tag: "Recommended", tagColor: "#059669", tagBg: "rgba(5,150,105,0.1)", desc: "Fast · Deep thinking enabled",   thinking: true  },
  { id: "gemini-2.5-pro",   name: "Gemini 2.5 Pro",   tag: "Most Powerful", tagColor: "#7c3aed", tagBg: "rgba(124,58,237,0.1)", desc: "Best reasoning · Slower",       thinking: true  },
  { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", tag: "Fastest",       tagColor: "#d97706", tagBg: "rgba(217,119,6,0.1)",  desc: "No thinking tokens · Quickest", thinking: false },
];

const STEPS = [
  { id: 1, label: "Pre-scoring",    detail: "Skills · Experience · Education"        },
  { id: 2, label: "Sending to AI",  detail: "Top matches → Gemini"                   },
  { id: 3, label: "Deep reasoning", detail: "Gemini thinking through candidates"      },
  { id: 4, label: "Shortlist ready",detail: "Results structured and stored"           },
];

type Phase = "configure" | "processing" | "complete";

// ─── Micro components ─────────────────────────────────────────────────────────

function Cursor() {
  return (
    <span className="inline-block align-middle"
      style={{ width: 7, height: 14, background: "#60a5fa", borderRadius: 1, marginLeft: 2, animation: "blink-cursor 1s step-end infinite" }} />
  );
}

function RecBadge({ rec }: { rec: CandidateScore["recommendation"] }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    "Strongly Recommended": { bg: "rgba(5,150,105,0.14)",  color: "#059669", label: "Strong fit" },
    "Recommended":          { bg: "rgba(37,99,235,0.14)",   color: "#2563eb", label: "Good fit"   },
    "Consider":             { bg: "rgba(217,119,6,0.14)",   color: "#d97706", label: "Consider"   },
    "Not Recommended":      { bg: "rgba(239,68,68,0.14)",   color: "#ef4444", label: "Not a fit"  },
  };
  const s = map[rec] ?? map["Consider"];
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function ScoreBar({ value }: { value: number }) {
  const color = value >= 80 ? "#059669" : value >= 60 ? "#2563eb" : value >= 40 ? "#d97706" : "#ef4444";
  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 5, background: "rgba(255,255,255,0.07)" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 9999, transition: "width 0.8s ease" }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color, minWidth: "2rem", textAlign: "right" }}>{value}</span>
    </div>
  );
}

function ResultCard({ item, resultId }: { item: CandidateScore; resultId: string }) {
  const isTop     = item.rank === 1;
  const rankColor = item.rank === 1 ? "#f59e0b" : item.rank === 2 ? "#94a3b8" : item.rank === 3 ? "#cd7f32" : "rgba(255,255,255,0.25)";
  return (
    <div className="rounded-xl p-3 transition-all"
      style={{
        background: isTop ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${isTop ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.07)"}`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = isTop ? "rgba(245,158,11,0.09)" : "rgba(255,255,255,0.055)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isTop ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)"; }}
    >
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
          style={{ background: "rgba(0,0,0,0.35)", color: rankColor, border: `1.5px solid ${rankColor}`, minWidth: 28 }}>
          {item.rank}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-bold text-xs text-white truncate">{item.candidateName}</p>
            <RecBadge rec={item.recommendation} />
          </div>
          <ScoreBar value={item.matchScore} />
          {item.strengths.length > 0 && (
            <p className="text-xs mt-1 line-clamp-1" style={{ color: "rgba(255,255,255,0.35)" }}>
              {item.strengths.slice(0, 2).join(" · ")}
            </p>
          )}
        </div>
        <Link href={`/results/${resultId}#c-${item.candidateId}`}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.2)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#60a5fa"; e.currentTarget.style.background = "rgba(96,165,250,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "transparent"; }}>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Shortlist number stepper ─────────────────────────────────────────────────

function ShortlistStepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const clamp = (n: number) => Math.min(50, Math.max(1, n));
  return (
    <div>
      <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted,#94a3b8)" }}>
        Shortlist size
      </p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(clamp(value - 1))} disabled={value <= 1}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background: "var(--surface-inset,#f8fafc)", border: "1px solid var(--border,#e2e8f0)", color: "var(--text-primary,#0f172a)" }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "var(--accent-border,#bfdbfe)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border,#e2e8f0)"; }}>
          <Minus className="w-3.5 h-3.5" />
        </button>
        <input type="number" min={1} max={50} value={value}
          onChange={(e) => { const n = parseInt(e.target.value, 10); if (!isNaN(n)) onChange(clamp(n)); }}
          className="flex-1 text-center font-black text-lg rounded-xl focus:outline-none"
          style={{
            background: "var(--accent-light,#eff6ff)", border: "1.5px solid var(--accent-border,#bfdbfe)",
            color: "var(--accent,#2563eb)", height: 44, appearance: "textfield" as React.CSSProperties["appearance"],
          }}
        />
        <button type="button" onClick={() => onChange(clamp(value + 1))} disabled={value >= 50}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-30"
          style={{ background: "var(--surface-inset,#f8fafc)", border: "1px solid var(--border,#e2e8f0)", color: "var(--text-primary,#0f172a)" }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.borderColor = "var(--accent-border,#bfdbfe)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border,#e2e8f0)"; }}>
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-xs mt-2 text-center" style={{ color: "var(--text-muted,#94a3b8)" }}>
        Top {value} candidate{value !== 1 ? "s" : ""} will be ranked
      </p>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ScreeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  candTotal: number;
}

export function ScreeningModal({ isOpen, onClose, job, candTotal }: ScreeningModalProps) {
  const dispatch         = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((s: RootState) => s.screening);
  const queueItem        = useSelector((s: RootState) =>
    s.screeningQueue.items.find((i) => i.jobId === job?._id)
  );
  const screeningResults = useSelector((s: RootState) => s.screening.results);

  const [phase,        setPhase]       = useState<Phase>("configure");
  const [screeningId,  setScreeningId] = useState<string | null>(null);
  const [shortlist,    setShortlist]   = useState(10);
  const [model,        setModel]       = useState("gemini-2.5-flash");
  const [thinkingText, setThinking]    = useState("");
  const [result,       setResult]      = useState<ScreeningResult | null>(null);
  const [submitError,  setSubmitError] = useState<string | null>(null);
  const [tick,         setTick]        = useState(0);

  const streamRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens fresh
  useEffect(() => {
    if (!isOpen || !job) return;
    // If there's already an active screening for this job, resume it
    const active = queueItem;
    if (active?.status === "processing") {
      setScreeningId(active.id);
      setThinking(getThinking(active.id));
      setPhase("processing");
    } else {
      setPhase("configure");
      setScreeningId(null);
      setThinking("");
      setResult(null);
      setSubmitError(null);
    }
  }, [isOpen, job?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Subscribe to live thinking text
  useEffect(() => {
    if (!screeningId || phase !== "processing") return;
    const unsub = subscribeText(screeningId, (text) => setThinking(text));
    return unsub;
  }, [screeningId, phase]);

  // React to queue item status changes (background completion)
  useEffect(() => {
    if (!queueItem || !screeningId) return;
    if (queueItem.status === "complete" && queueItem.resultId && phase === "processing") {
      const found = screeningResults.find((r) => r._id === queueItem.resultId);
      if (found) { setResult(found); setPhase("complete"); }
    } else if (queueItem.status === "failed" && phase === "processing") {
      setSubmitError(queueItem.error ?? "Screening failed.");
      setPhase("configure");
    }
  }, [queueItem?.status, screeningResults]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tick for derived step indicator
  useEffect(() => {
    if (phase !== "processing") return;
    const t = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  // Auto-scroll terminal
  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [thinkingText]);

  // Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && phase !== "processing") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, onClose]);

  const handleRun = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!job || candTotal === 0 || loading) return;
    setSubmitError(null);
    setThinking("");
    setResult(null);
    const action = await dispatch(runScreening({ jobId: job._id, shortlistSize: shortlist, model }));
    if (runScreening.fulfilled.match(action)) {
      const id = action.payload._id;
      setScreeningId(id);
      dispatch(enqueue({ id, jobId: job._id, jobTitle: job.title, status: "processing" }));
      startStream(id);
      setPhase("processing");
    } else {
      setSubmitError((action.payload as string) || "Screening failed. Try again.");
    }
  };

  const handleReset = () => {
    setPhase("configure");
    setThinking("");
    setResult(null);
    setScreeningId(null);
    setSubmitError(null);
  };

  const activeStep = useMemo(() => {
    if (phase === "complete") return 4;
    if (phase !== "processing" || !queueItem) return 0;
    const elapsed = (Date.now() - queueItem.startedAt) / 1000;
    return elapsed < 4 ? 1 : elapsed < 12 ? 2 : 3;
  }, [phase, queueItem, tick]);

  const tokens     = Math.round(thinkingText.length / 4);
  const elapsed    = queueItem ? Math.floor((Date.now() - queueItem.startedAt) / 1000) : 0;
  const elapsedFmt = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const canRun     = !loading && !!job && candTotal > 0;
  const activeModel = AI_MODELS.find((m) => m.id === model);

  if (!isOpen || !job) return null;

  // ── Configure ────────────────────────────────────────────────────────────

  if (phase === "configure") {
    return (
      <Portal>
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <div
            className="relative w-full max-w-xl flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: "var(--surface,#fff)",
              border: "1px solid var(--border,#e2e8f0)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
              maxHeight: "88vh",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ borderBottom: "1px solid var(--border,#e2e8f0)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--ai-light,rgba(139,92,246,0.1))", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <Brain className="w-4 h-4" style={{ color: "var(--ai,#7c3aed)" }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: "var(--text-primary,#0f172a)" }}>AI Screening</h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted,#94a3b8)" }}>
                    Configure and run with Gemini
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl transition-colors"
                style={{ color: "var(--text-muted,#94a3b8)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-inset,#f8fafc)"; e.currentTarget.style.color = "var(--text-primary,#0f172a)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted,#94a3b8)"; }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Job summary */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl"
                style={{ background: "var(--surface-inset,#f8fafc)", border: "1px solid var(--border,#e2e8f0)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--accent-light,#eff6ff)" }}>
                  <Briefcase className="w-4 h-4" style={{ color: "var(--accent,#2563eb)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate" style={{ color: "var(--text-primary,#0f172a)" }}>{job.title}</p>
                  <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "var(--text-muted,#94a3b8)" }}>
                    <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span>{job.experienceLevel}</span>
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black" style={{ color: "var(--text-primary,#0f172a)" }}>{candTotal}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted,#94a3b8)" }}>candidates</p>
                </div>
              </div>

              {/* Skills */}
              {job.requirements.length > 0 && (
                <div className="flex flex-wrap gap-1.5 -mt-1">
                  {job.requirements.slice(0, 8).map((r) => (
                    <span key={r.skill} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={r.required
                        ? { background: "var(--accent-light,#eff6ff)", color: "var(--accent,#2563eb)" }
                        : { background: "var(--surface-inset,#f8fafc)", border: "1px solid var(--border,#e2e8f0)", color: "var(--text-muted,#94a3b8)" }}>
                      {r.skill}{r.required && <span className="opacity-40 ml-0.5">*</span>}
                    </span>
                  ))}
                </div>
              )}

              {/* Warnings / errors */}
              {candTotal === 0 && (
                <div className="p-3 rounded-xl flex items-center gap-2 text-xs"
                  style={{ background: "rgba(217,119,6,0.07)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706" }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  No candidates in this pool. Upload resumes first.
                </div>
              )}
              {(submitError || error) && (
                <div className="p-3 rounded-xl flex items-start gap-2 text-xs"
                  style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {submitError || error}
                </div>
              )}

              <form onSubmit={handleRun} className="space-y-4">
                {/* Two-column: shortlist + model */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl"
                    style={{ background: "var(--surface-inset,#f8fafc)", border: "1px solid var(--border,#e2e8f0)" }}>
                    <ShortlistStepper value={shortlist} onChange={setShortlist} />
                  </div>
                  <div className="p-4 rounded-xl"
                    style={{ background: "var(--surface-inset,#f8fafc)", border: "1px solid var(--border,#e2e8f0)" }}>
                    <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted,#94a3b8)" }}>
                      AI Model
                    </p>
                    <div className="space-y-1.5">
                      {AI_MODELS.map((m) => {
                        const active = model === m.id;
                        return (
                          <button key={m.id} type="button" onClick={() => setModel(m.id)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all"
                            style={active
                              ? { background: "var(--accent-light,#eff6ff)", border: "1.5px solid var(--accent-border,#bfdbfe)" }
                              : { background: "transparent", border: "1px solid transparent" }}
                            onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(0,0,0,0.03)"; }}
                            onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                            <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                              style={{ borderColor: active ? "var(--accent,#2563eb)" : "var(--border,#e2e8f0)" }}>
                              {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--accent,#2563eb)" }} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold truncate"
                                style={{ color: active ? "var(--accent,#2563eb)" : "var(--text-primary,#0f172a)" }}>
                                {m.name}
                              </p>
                              <span className="text-xs rounded-full px-1.5"
                                style={{ background: m.tagBg, color: m.tagColor, fontSize: 9, fontWeight: 700 }}>
                                {m.tag}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Launch */}
                <button type="submit" disabled={!canRun}
                  className="w-full py-3.5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 text-white transition-all"
                  style={canRun
                    ? { background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)", boxShadow: "0 4px 20px rgba(79,70,229,0.35)" }
                    : { background: "var(--surface-inset,#f8fafc)", color: "var(--text-muted,#94a3b8)", cursor: "not-allowed", border: "1px solid var(--border,#e2e8f0)" }}
                  onMouseEnter={(e) => { if (canRun) e.currentTarget.style.boxShadow = "0 8px 32px rgba(79,70,229,0.5)"; }}
                  onMouseLeave={(e) => { if (canRun) e.currentTarget.style.boxShadow = "0 4px 20px rgba(79,70,229,0.35)"; }}
                >
                  <Sparkles className="w-4 h-4" />
                  {candTotal === 0
                    ? "No candidates in this pool"
                    : `Screen ${candTotal} candidate${candTotal !== 1 ? "s" : ""} with AI`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Portal>
    );
  }

  // ── Processing / Complete ─────────────────────────────────────────────────

  return (
    <Portal>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}
      >
        <div
          className="relative w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(175deg,#060d19 0%,#0a1628 60%,#0d1f3c 100%)",
            border: `1px solid ${phase === "processing" ? "rgba(59,130,246,0.25)" : "rgba(5,150,105,0.3)"}`,
            boxShadow: phase === "processing"
              ? "0 0 0 1px rgba(59,130,246,0.15), 0 24px 64px rgba(59,130,246,0.2)"
              : "0 0 0 1px rgba(5,150,105,0.2), 0 24px 64px rgba(5,150,105,0.15)",
            height: "min(88vh,720px)",
          }}
        >
          {/* Mac titlebar */}
          <div className="flex items-center gap-0 px-4 py-3 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.25)" }}>
            <div className="flex items-center gap-1.5 mr-4">
              <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
            </div>
            <Terminal className="w-3.5 h-3.5 mr-2 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="text-xs font-mono flex-1 truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
              {model}{activeModel?.thinking ? " · deep-think" : ""} · {job.title}
            </span>
            <div className="flex items-center gap-2.5 ml-2">
              <span className="text-xs font-mono tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
                ~{tokens.toLocaleString()} tok
              </span>
              {phase === "processing" && (
                <span className="text-xs font-mono tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {elapsedFmt}
                </span>
              )}
              {phase === "processing" ? (
                <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#60a5fa", animation: "blink-cursor 1s ease infinite" }} />
                  LIVE
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                  style={{ background: "rgba(5,150,105,0.12)", color: "#34d399", border: "1px solid rgba(5,150,105,0.2)" }}>
                  <CheckCircle className="w-3 h-3" /> DONE
                </span>
              )}
              {/* Minimize during processing, close when done */}
              {phase === "processing" ? (
                <button onClick={onClose}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-all"
                  style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}
                  title="Minimize — screening continues in background"
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.color = "#60a5fa"; e.currentTarget.style.borderColor = "rgba(96,165,250,0.3)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                  <Minimize2 className="w-3 h-3" />
                  <span className="hidden sm:inline font-mono text-xs">minimize</span>
                </button>
              ) : (
                <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.3)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "transparent"; }}>
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Step strip */}
          <div className="flex-shrink-0 bg-black/20" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <StepIndicator steps={STEPS} currentStep={activeStep} status={phase === "complete" ? "complete" : "active"} />
          </div>

          {/* Thinking header */}
          <div className="flex items-center gap-2.5 px-4 py-2.5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(59,130,246,0.08)", background: "rgba(0,0,0,0.15)" }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.25)",
                animation: phase === "processing" ? "ai-pulse-ring 2s ease-out infinite" : "none",
              }}>
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">
                {phase === "processing" ? "Gemini is reasoning…" : "Reasoning complete"}
              </p>
              <p className="text-xs mt-0.5 font-mono" style={{ color: "rgba(96,165,250,0.7)" }}>
                {phase === "processing" ? "live thought tokens" : `${tokens.toLocaleString()} tokens logged`}
              </p>
            </div>
            {phase === "processing" && (
              <span className="ml-auto text-xs px-2 py-1 rounded-lg font-mono"
                style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.3)" }}>
                {elapsedFmt}
              </span>
            )}
          </div>

          {/* Thinking text */}
          <div ref={streamRef}
            className="font-mono text-xs leading-relaxed overflow-y-auto"
            style={{
              flex: phase === "complete" ? "0 0 160px" : "1 1 0",
              minHeight: 120,
              padding: "14px 16px",
              color: "#93c5fd",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              lineHeight: 1.8,
              background: phase === "complete" ? "rgba(0,0,0,0.15)" : "transparent",
              borderBottom: phase === "complete" ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}>
            {thinkingText
              ? <>{thinkingText}{phase === "processing" && <Cursor />}</>
              : <span style={{ color: "rgba(255,255,255,0.12)" }}>
                  {phase === "processing" ? "Waiting for Gemini to begin…" : "No thought log captured."}
                </span>
            }
          </div>

          {/* Processing footer */}
          {phase === "processing" && (
            <div className="flex-shrink-0 px-5 py-2.5 text-center"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>
                <Zap className="w-3 h-3 inline mr-1" style={{ color: "var(--ai,#8b5cf6)" }} />
                Gemini is reading every candidate — minimize to continue browsing
              </p>
            </div>
          )}

          {/* Results panel */}
          {phase === "complete" && result && (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
              {/* Results header */}
              <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
                style={{ background: "rgba(5,150,105,0.08)", borderBottom: "1px solid rgba(5,150,105,0.15)" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.3)" }}>
                  <CheckCircle className="w-4 h-4" style={{ color: "#34d399" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">
                    {result.totalApplicants} candidates analyzed
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {result.shortlist.length} shortlisted
                    {result.processingTimeMs ? ` · ${(result.processingTimeMs / 1000).toFixed(1)}s` : ""}
                    {" · "}{result.aiModel}
                  </p>
                </div>
                <Link href={`/results/${result._id}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all flex-shrink-0"
                  style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 2px 8px rgba(5,150,105,0.25)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(5,150,105,0.45)")}
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(5,150,105,0.25)")}>
                  Full Report <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {result.shortlist.map((item) => (
                  <ResultCard key={item.candidateId} item={item} resultId={result._id} />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-3 px-5 py-3 flex-shrink-0"
                style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                <button onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.45)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>
                  <RotateCcw className="w-3.5 h-3.5" /> Re-screen
                </button>
                <Link href="/results" className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.28)" }}
                  onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                  onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.28)")}>
                  All history →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
