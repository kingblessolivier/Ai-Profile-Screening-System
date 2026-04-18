"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { StepIndicator } from "@/components/layout";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchCandidates } from "@/store/candidatesSlice";
import { runScreening, fetchResult } from "@/store/screeningSlice";
import { CandidateScore, ScreeningResult } from "@/types";
import {
  AlertCircle, Brain, Briefcase, CheckCircle, ChevronDown,
  ExternalLink, Loader2, MapPin, RotateCcw, Sparkles,
  Terminal, Zap,
} from "lucide-react";

// ─── Model definitions ────────────────────────────────────────────────────────

const AI_MODELS = [
  {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    tag: "Recommended",
    tagColor: "#059669",
    tagBg: "rgba(5,150,105,0.1)",
    desc: "Fast · Deep thinking enabled",
    thinking: true,
  },
  {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    tag: "Most Powerful",
    tagColor: "#7c3aed",
    tagBg: "rgba(124,58,237,0.1)",
    desc: "Best reasoning · Slower",
    thinking: true,
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    tag: "Fastest",
    tagColor: "#d97706",
    tagBg: "rgba(217,119,6,0.1)",
    desc: "No thinking tokens · Quickest",
    thinking: false,
  },
];

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Pre-scoring",   detail: "Skills · Experience · Projects · Education" },
  { id: 2, label: "Sending to AI", detail: "Top matches forwarded to Gemini" },
  { id: 3, label: "Deep reasoning", detail: "Gemini thinking through each candidate" },
  { id: 4, label: "Shortlist ready", detail: "Results structured and stored" },
];

type Phase = "configure" | "processing" | "complete";

// ─── Blinking cursor ──────────────────────────────────────────────────────────

function Cursor() {
  return (
    <span className="inline-block align-middle"
      style={{ width: 7, height: 14, background: "#60a5fa", borderRadius: 1, marginLeft: 2, animation: "blink-cursor 1s step-end infinite" }} />
  );
}

// ─── Recommendation badge ─────────────────────────────────────────────────────

function RecBadge({ rec }: { rec: CandidateScore["recommendation"] }) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    "Strongly Recommended": { bg: "rgba(5,150,105,0.12)", color: "#059669", label: "Strong fit" },
    "Recommended":          { bg: "rgba(37,99,235,0.12)",  color: "#2563eb", label: "Good fit"  },
    "Consider":             { bg: "rgba(217,119,6,0.12)",  color: "#d97706", label: "Consider"  },
    "Not Recommended":      { bg: "rgba(239,68,68,0.12)",  color: "#ef4444", label: "Not a fit" },
  };
  const s = map[rec] ?? map["Consider"];
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

// ─── Score bar ────────────────────────────────────────────────────────────────

function ScoreBar({ value }: { value: number }) {
  const color = value >= 80 ? "#059669" : value >= 60 ? "#2563eb" : value >= 40 ? "#d97706" : "#ef4444";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 rounded-full overflow-hidden" style={{ height: 6, background: "rgba(255,255,255,0.07)" }}>
        <div style={{ width: `${value}%`, height: "100%", background: color, borderRadius: 9999, transition: "width 0.8s ease" }} />
      </div>
      <span className="text-xs font-bold tabular-nums" style={{ color, minWidth: "2.5rem", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

// ─── Result card ──────────────────────────────────────────────────────────────

function ResultCard({ item, resultId }: { item: CandidateScore; resultId: string }) {
  const isTop = item.rank === 1;
  const rankColor = item.rank === 1 ? "#f59e0b" : item.rank === 2 ? "#94a3b8" : item.rank === 3 ? "#cd7f32" : "rgba(255,255,255,0.25)";

  return (
    <div className="rounded-xl p-4 transition-all"
      style={{
        background: isTop ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${isTop ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.08)"}`,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = isTop ? "rgba(245,158,11,0.09)" : "rgba(255,255,255,0.055)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = isTop ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.03)"; }}
    >
      <div className="flex items-start gap-3">
        {/* Rank */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black"
          style={{ background: "rgba(0,0,0,0.3)", color: rankColor, border: `1.5px solid ${rankColor}`, minWidth: 32 }}>
          {item.rank}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-bold text-sm text-white truncate">{item.candidateName}</p>
            <RecBadge rec={item.recommendation} />
          </div>
          <ScoreBar value={item.matchScore} />
          {item.strengths.length > 0 && (
            <p className="text-xs mt-1.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
              {item.strengths.slice(0, 2).join(" · ")}
            </p>
          )}
        </div>

        {/* Link */}
        <Link href={`/results/${resultId}#c-${item.candidateId}`}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors"
          style={{ color: "rgba(255,255,255,0.25)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#60a5fa"; e.currentTarget.style.background = "rgba(96,165,250,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.25)"; e.currentTarget.style.background = "transparent"; }}>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

// ─── Main page content ────────────────────────────────────────────────────────

function ScreeningPageContent() {
  const dispatch     = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  const { items: jobs }    = useSelector((s: RootState) => s.jobs);
  const { total: candTotal } = useSelector((s: RootState) => s.candidates);
  const { loading, error } = useSelector((s: RootState) => s.screening);

  const [phase, setPhase]           = useState<Phase>("configure");
  const [jobId, setJobId]           = useState(searchParams.get("jobId") || "");
  const [shortlistSize, setShortlist] = useState(10);
  const [model, setModel]           = useState("gemini-2.5-flash");
  const [activeStep, setActiveStep] = useState(0);
  const [thinkingText, setThinking] = useState("");
  const [result, setResult]         = useState<ScreeningResult | null>(null);
  const [elapsed, setElapsed]       = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const sseRef      = useRef<EventSource | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef   = useRef<HTMLDivElement>(null);

  const selectedJob = jobs.find((j) => j._id === jobId);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  useEffect(() => {
    if (jobId) dispatch(fetchCandidates({ jobId }));
  }, [dispatch, jobId]);

  // Auto-advance step indicator during processing
  useEffect(() => {
    if (phase !== "processing") { setActiveStep(0); return; }
    setActiveStep(1);
    const t = [
      setTimeout(() => setActiveStep(2), 4000),
      setTimeout(() => setActiveStep(3), 12000),
    ];
    return () => t.forEach(clearTimeout);
  }, [phase]);

  // Auto-scroll terminal
  useEffect(() => {
    if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight;
  }, [thinkingText]);

  // Elapsed timer
  useEffect(() => {
    if (phase === "processing") {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((n) => n + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase]);

  const connectSSE = useCallback((id: string) => {
    const token   = typeof window !== "undefined" ? localStorage.getItem("talentai_token") : null;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const es      = new EventSource(`${apiBase}/screening/${id}/thinking-stream?token=${token ?? ""}`);
    sseRef.current = es;

    es.onmessage = async (e) => {
      try {
        const msg = JSON.parse(e.data) as { type: string; text?: string };
        if (msg.type === "chunk" && msg.text) {
          setThinking((prev) => prev + msg.text);
        } else if (msg.type === "done") {
          setActiveStep(4);
          es.close();
          // Fetch the full completed result
          const full = await dispatch(fetchResult(id)).unwrap();
          setResult(full);
          setPhase("complete");
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => es.close();
  }, [dispatch]);

  const handleRun = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!jobId || candTotal === 0) return;
    setSubmitError(null);
    setThinking("");
    setResult(null);
    setPhase("processing");

    const action = await dispatch(runScreening({ jobId, shortlistSize, model }));
    if (runScreening.fulfilled.match(action)) {
      const id = action.payload._id;
      connectSSE(id);
    } else {
      setSubmitError((action.payload as string) || "Screening failed. Try again.");
      setPhase("configure");
    }
  };

  const handleReset = () => {
    sseRef.current?.close();
    setPhase("configure");
    setThinking("");
    setResult(null);
    setActiveStep(0);
    setElapsed(0);
    setSubmitError(null);
  };

  const tokens    = Math.round(thinkingText.length / 4);
  const elapsedFmt = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const canRun     = !loading && !!jobId && candTotal > 0;

  // ── CONFIGURE phase ───────────────────────────────────────────────────────
  if (phase === "configure") {
    return (
      <div className="max-w-xl mx-auto animate-slide-up">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold tracking-widest uppercase"
            style={{ background: "var(--ai-light, rgba(139,92,246,0.12))", color: "var(--ai)", border: "1px solid rgba(139,92,246,0.2)" }}>
            <Brain className="w-3.5 h-3.5" />
            {AI_MODELS.find((m) => m.id === model)?.name ?? model}
            {AI_MODELS.find((m) => m.id === model)?.thinking && " · Thinking"}
          </div>
          <h1 className="text-4xl font-black mb-3 tracking-tight"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
            AI Screening
          </h1>
          <p className="text-base" style={{ color: "var(--text-secondary)" }}>
            Gemini reads every candidate and ranks them with transparent reasoning
          </p>
        </div>

        {/* Error */}
        {(submitError || error) && (
          <div className="mb-5 p-4 rounded-2xl flex items-start gap-3 text-sm"
            style={{ background: "var(--error-light)", border: "1px solid var(--error-border)", color: "var(--error)" }}>
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{submitError || error}</span>
          </div>
        )}

        <form onSubmit={handleRun} className="space-y-4">

          {/* ── Job selector ─────────────────────────────────────────────────── */}
          <div className="card p-5">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              Which role are we filling?
            </p>
            <div className="relative">
              <select
                required value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full px-4 py-3 pr-10 rounded-xl text-sm font-medium focus:outline-none appearance-none transition-all"
                style={{
                  background: jobId ? "var(--accent-light)" : "var(--surface-inset)",
                  border: `1px solid ${jobId ? "var(--accent-border)" : "var(--border)"}`,
                  color: jobId ? "var(--accent)" : "var(--text-secondary)",
                }}
                onFocus={(e) => { e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <option value="">— Choose a job opening —</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.title} · {j.experienceLevel} · {j.location}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "var(--text-muted)" }} />
            </div>

            {selectedJob && (
              <div className="mt-4 p-4 rounded-xl"
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--accent-light)" }}>
                    <Briefcase className="w-4 h-4" style={{ color: "var(--accent)" }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>{selectedJob.title}</p>
                    <p className="text-xs flex items-center gap-2 mt-0.5" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedJob.location}</span>
                      <span>{selectedJob.experienceLevel}</span>
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xl font-black" style={{ color: "var(--text-primary)" }}>{candTotal}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>candidates</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedJob.requirements.slice(0, 7).map((r) => (
                    <span key={r.skill} className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={r.required
                        ? { background: "var(--accent-light)", color: "var(--accent)" }
                        : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      {r.skill}{r.required && <span className="opacity-50 ml-0.5">*</span>}
                    </span>
                  ))}
                </div>
                {candTotal === 0 && (
                  <div className="mt-3 p-2.5 rounded-lg text-xs flex items-center gap-2"
                    style={{ background: "rgba(217,119,6,0.08)", border: "1px solid rgba(217,119,6,0.2)", color: "#d97706" }}>
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    No candidates in this pool.{" "}
                    <Link href={`/candidates/upload?jobId=${jobId}`} className="font-bold underline">Upload resumes →</Link>
                  </div>
                )}
              </div>
            )}

            {jobs.length === 0 && (
              <div className="mt-3 p-3 rounded-xl text-sm flex items-center gap-2"
                style={{ background: "var(--warning-light)", border: "1px solid var(--warning-border)", color: "var(--warning)" }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                No jobs found.{" "}
                <Link href="/jobs/new" className="font-semibold underline">Post a job first</Link>
              </div>
            )}
          </div>

          {/* ── Shortlist size ────────────────────────────────────────────────── */}
          <div className="card p-5">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              How many candidates to shortlist?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button key={n} type="button" onClick={() => setShortlist(n)}
                  className="py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={shortlistSize === n
                    ? { background: "linear-gradient(135deg, #0284c7, #2563eb)", color: "#fff", boxShadow: "0 4px 12px rgba(37,99,235,0.3)" }
                    : { background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
                  }
                  onMouseEnter={(e) => { if (shortlistSize !== n) { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; } }}
                  onMouseLeave={(e) => { if (shortlistSize !== n) { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; } }}
                >
                  Top {n}
                </button>
              ))}
            </div>
          </div>

          {/* ── Model picker ─────────────────────────────────────────────────── */}
          <div className="card p-5">
            <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              AI model
            </p>
            <div className="space-y-2">
              {AI_MODELS.map((m) => {
                const active = model === m.id;
                return (
                  <button key={m.id} type="button" onClick={() => setModel(m.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={active
                      ? { background: "var(--accent-light)", border: "1.5px solid var(--accent-border)", boxShadow: "0 0 0 3px rgba(37,99,235,0.08)" }
                      : { background: "var(--surface-inset)", border: "1px solid var(--border)" }
                    }>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: active ? "var(--accent)" : "var(--text-primary)" }}>
                          {m.name}
                        </span>
                        <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                          style={{ background: m.tagBg, color: m.tagColor }}>
                          {m.tag}
                        </span>
                        {m.thinking
                          ? <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "var(--ai-light, rgba(139,92,246,0.1))", color: "var(--ai)" }}>Thinking ON</span>
                          : <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: "var(--surface)", color: "var(--text-muted)", border: "1px solid var(--border)" }}>No thinking</span>
                        }
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{m.desc}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: active ? "var(--accent)" : "var(--border)" }}>
                      {active && <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)" }} />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Launch button ─────────────────────────────────────────────────── */}
          <button
            type="submit"
            disabled={!canRun}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-3 text-white transition-all"
            style={canRun
              ? { background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", boxShadow: "0 4px 20px rgba(37,99,235,0.2)" }
              : { background: "var(--surface-inset)", color: "var(--text-muted)", cursor: "not-allowed", border: "1px solid var(--border)" }
            }
            onMouseEnter={(e) => { if (canRun) e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.45)"; }}
            onMouseLeave={(e) => { if (canRun) e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.2)"; }}
          >
            <Sparkles className="w-5 h-5" />
            {!jobId ? "Select a job to continue" : candTotal === 0 ? "No candidates in this pool" : `Screen ${candTotal} candidate${candTotal !== 1 ? "s" : ""} with AI`}
          </button>
        </form>
      </div>
    );
  }

  // ── PROCESSING + COMPLETE phases ──────────────────────────────────────────
  return (
    <div className="animate-slide-up">

      {/* ── Dark full-canvas terminal ─────────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col"
        style={{
          background: "linear-gradient(175deg, #060d19 0%, #0a1628 50%, #0d1f3c 100%)",
          border: "1px solid rgba(59,130,246,0.2)",
          boxShadow: phase === "processing"
            ? "0 0 0 1px rgba(59,130,246,0.25), 0 16px 48px rgba(59,130,246,0.15)"
            : "0 0 0 1px rgba(5,150,105,0.25), 0 16px 48px rgba(5,150,105,0.1)",
          minHeight: "70vh",
        }}
      >
        {/* ── Mac titlebar ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 px-4 py-3 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          <div className="flex items-center gap-1.5 mr-4">
            <span className="w-3 h-3 rounded-full" style={{ background: "#ff5f56" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#febc2e" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#28c840" }} />
          </div>
          <Terminal className="w-3.5 h-3.5 mr-2 flex-shrink-0" style={{ color: "rgba(255,255,255,0.3)" }} />
          <span className="text-xs font-mono flex-1" style={{ color: "rgba(255,255,255,0.4)" }}>
            {model}{AI_MODELS.find((m) => m.id === model)?.thinking ? " · deep-think" : ""}{selectedJob ? ` · ${selectedJob.title}` : ""}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
              ~{tokens.toLocaleString()} tokens
            </span>
            {phase === "processing" && (
              <span className="text-xs font-mono tabular-nums" style={{ color: "rgba(255,255,255,0.3)" }}>
                {elapsedFmt}
              </span>
            )}
            {phase === "processing" ? (
              <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                style={{ background: "rgba(96,165,250,0.12)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ animation: "blink-cursor 1s ease infinite" }} />
                LIVE
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-mono px-2.5 py-1 rounded-full"
                style={{ background: "rgba(5,150,105,0.12)", color: "#34d399", border: "1px solid rgba(5,150,105,0.2)" }}>
                <CheckCircle className="w-3 h-3" />
                DONE
              </span>
            )}
          </div>
        </div>

        {/* ── Step strip ─────────────────────────────────────────────────────── */}
        <div
          className="flex-shrink-0 border-b border-white/5 bg-black/15"
        >
          <StepIndicator
            steps={STEPS}
            currentStep={activeStep}
            status={phase === "complete" ? "complete" : "active"}
          />
        </div>

        {/* ── Thinking stream ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
          <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
            style={{ borderBottom: "1px solid rgba(59,130,246,0.08)", background: "rgba(0,0,0,0.2)" }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.25)",
                  animation: phase === "processing" ? "ai-pulse-ring 2s ease-out infinite" : "none",
                }}>
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-none">
                  {phase === "processing" ? "Gemini is reasoning…" : "Reasoning complete"}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#60a5fa" }}>
                  {phase === "processing" ? "Streaming thought tokens live" : "Thought process logged"}
                </p>
              </div>
            </div>
          </div>

          <div ref={streamRef}
            className="flex-1 font-mono text-xs leading-relaxed overflow-y-auto"
            style={{ padding: "16px", color: "#93c5fd", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.8, minHeight: 200 }}>
            {thinkingText
              ? <>{thinkingText}{phase === "processing" && <Cursor />}</>
              : <span style={{ color: "rgba(255,255,255,0.15)" }}>
                  {phase === "processing" ? "Waiting for Gemini to begin reasoning…" : "No thought log captured."}
                </span>
            }
          </div>
        </div>

        {/* ── Results (complete phase only) ─────────────────────────────────── */}
        {phase === "complete" && result && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
            {/* Results header */}
            <div className="px-5 py-4 flex items-center gap-3"
              style={{ background: "rgba(5,150,105,0.08)", borderBottom: "1px solid rgba(5,150,105,0.15)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(5,150,105,0.2)", border: "1px solid rgba(5,150,105,0.3)" }}>
                <CheckCircle className="w-4 h-4" style={{ color: "#34d399" }} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">
                  Screening complete — {result.totalApplicants} candidates analyzed
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {result.shortlist.length} shortlisted · {result.processingTimeMs ? `${(result.processingTimeMs / 1000).toFixed(1)}s` : elapsedFmt} · {result.aiModel}
                </p>
              </div>
              <Link href={`/results/${result._id}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(5,150,105,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                View Full Report
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Candidate cards */}
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5" style={{ maxHeight: "40vh", overflowY: "auto" }}>
              {result.shortlist.map((item) => (
                <ResultCard key={item.candidateId} item={item} resultId={result._id} />
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 flex items-center gap-3"
              style={{ borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.8)"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}>
                <RotateCcw className="w-3.5 h-3.5" />
                Screen another job
              </button>
              <Link href="/results" className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}
                onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
                onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                All screening history →
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Processing note */}
      {phase === "processing" && (
        <p className="text-xs text-center mt-4" style={{ color: "var(--text-muted)" }}>
          <Zap className="w-3 h-3 inline mr-1" style={{ color: "var(--ai)" }} />
          Gemini is reading every candidate — do not close this tab
        </p>
      )}
    </div>
  );
}

export default function ScreeningPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto py-16 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-muted)" }} />
      </div>
    }>
      <ScreeningPageContent />
    </Suspense>
  );
}
