"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchCandidates } from "@/store/candidatesSlice";
import { runScreening } from "@/store/screeningSlice";
import {
  Zap, Loader2, AlertCircle, CheckCircle, Users, Briefcase,
  Brain, Sparkles, ChevronDown, ChevronUp, MapPin, ArrowRight,
} from "lucide-react";

const AI_STEPS = [
  {
    step: 1,
    title: "Pre-scoring candidates",
    desc: "Skills 40% · Experience 25% · Projects 15% · Education 10% · Availability 10%",
  },
  {
    step: 2,
    title: "Sending top matches to Gemini",
    desc: "Strongest candidates forwarded for deep qualitative analysis",
  },
  {
    step: 3,
    title: "Generating AI rankings",
    desc: "Gemini returns strengths, gaps, evidence & interview questions",
  },
  {
    step: 4,
    title: "Preparing your shortlist",
    desc: "Results structured and stored — ready for recruiter review",
  },
];

function StepRow({
  step, title, desc, state,
}: {
  step: number; title: string; desc: string; state: "done" | "active" | "pending";
}) {
  return (
    <div className="flex items-start gap-3">
      {/* Icon */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
          style={
            state === "done"
              ? { background: "#059669", color: "#fff" }
              : state === "active"
              ? { background: "#2563eb", color: "#fff", boxShadow: "0 0 0 4px rgba(37,99,235,0.18)" }
              : { background: "var(--surface-inset)", color: "var(--text-muted)", border: "1px solid var(--border)" }
          }
        >
          {state === "done" ? <CheckCircle className="w-3.5 h-3.5" /> : step}
        </div>
        {step < 4 && (
          <div
            className="w-px flex-1 mt-1"
            style={{
              height: "24px",
              background: state === "done" ? "#059669" : "var(--border)",
              opacity: state === "done" ? 0.6 : 0.4,
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <p
          className="text-sm font-semibold leading-tight"
          style={{
            color: state === "done"
              ? "#059669"
              : state === "active"
              ? "var(--text-primary)"
              : "var(--text-muted)",
          }}
        >
          {title}
          {state === "active" && (
            <span className="inline-flex items-center gap-0.5 ml-2 align-middle">
              <span className="w-1 h-1 rounded-full bg-blue-500 dot-1 inline-block" />
              <span className="w-1 h-1 rounded-full bg-blue-500 dot-2 inline-block" />
              <span className="w-1 h-1 rounded-full bg-blue-500 dot-3 inline-block" />
            </span>
          )}
        </p>
        <p className="text-xs mt-0.5" style={{ color: state === "pending" ? "var(--text-muted)" : "var(--text-secondary)" }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

function ScreeningPageContent() {
  const dispatch     = useDispatch<AppDispatch>();
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { items: jobs }             = useSelector((s: RootState) => s.jobs);
  const { total }                   = useSelector((s: RootState) => s.candidates);
  const { loading, error }          = useSelector((s: RootState) => s.screening);

  const [jobId, setJobId]               = useState(searchParams.get("jobId") || "");
  const [shortlistSize, setShortlistSize] = useState(10);
  const [activeStep, setActiveStep]     = useState(0);
  const [showThinking, setShowThinking] = useState(false);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchCandidates());
  }, [dispatch]);

  useEffect(() => {
    if (!loading) { setActiveStep(0); return; }
    setActiveStep(1);
    const timers = [
      setTimeout(() => setActiveStep(2), 4000),
      setTimeout(() => setActiveStep(3), 12000),
      setTimeout(() => setActiveStep(4), 22000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const selectedJob = jobs.find((j) => j._id === jobId);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    const result = await dispatch(runScreening({ jobId, shortlistSize }));
    if (runScreening.fulfilled.match(result)) {
      router.push(`/results/${result.payload._id}`);
    }
  };

  const canRun = !loading && !!jobId && total > 0;

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between mb-8 gap-6">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1"
            style={{ color: "var(--ai)" }}>
            AI Engine
          </p>
          <h1 className="text-3xl font-bold mb-1"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
            Run AI Screening
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Gemini 2.0 Flash ranks every candidate and generates evidence-backed shortlists
          </p>
        </div>

        {/* Live pool counter */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0">
          <div className="card px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--accent-light)" }}>
              <Briefcase className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ color: "var(--text-primary)" }}>
                {jobs.length}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Jobs</p>
            </div>
          </div>
          <div className="card px-4 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "var(--success-light)" }}>
              <Users className="w-3.5 h-3.5" style={{ color: "var(--success)" }} />
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ color: "var(--text-primary)" }}>
                {total}
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Candidates</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="mb-6 p-4 rounded-xl flex items-start gap-3 text-sm"
          style={{ background: "var(--error-light)", border: "1px solid var(--error-border)", color: "var(--error)" }}>
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Screening failed</p>
            <p className="mt-0.5 text-xs opacity-80">{error}</p>
          </div>
        </div>
      )}

      {/* ── Two-column layout ─────────────────────────────────────────────────── */}
      <form onSubmit={handleRun}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mb-5">

          {/* ── LEFT: Configuration (3/5) ──────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-4">

            {/* Job selector card */}
            <div className="card p-6">
              <p className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "var(--text-muted)" }}>
                Step 1 — Select Job
              </p>

              {jobs.length === 0 ? (
                <div className="p-4 rounded-xl text-sm flex items-start gap-3"
                  style={{ background: "var(--warning-light)", border: "1px solid var(--warning-border)", color: "var(--warning)" }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>No jobs found. <a href="/jobs/new" className="font-semibold underline">Post a job first</a></span>
                </div>
              ) : (
                <div className="relative">
                  <select
                    required
                    value={jobId}
                    onChange={(e) => setJobId(e.target.value)}
                    className="w-full px-4 py-3 pr-10 rounded-xl text-sm font-medium focus:outline-none transition-all appearance-none"
                    style={{
                      background: jobId ? "var(--accent-light)" : "var(--surface-inset)",
                      border: `1px solid ${jobId ? "var(--accent-border)" : "var(--border)"}`,
                      color: jobId ? "var(--accent)" : "var(--text-secondary)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = jobId ? "var(--accent-border)" : "var(--border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <option value="">— Choose a job opening —</option>
                    {jobs.map((j) => (
                      <option key={j._id} value={j._id}>
                        {j.title} · {j.experienceLevel} · {j.location}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                    style={{ color: "var(--text-muted)" }} />
                </div>
              )}

              {/* Selected job preview */}
              {selectedJob && (
                <div className="mt-4 p-4 rounded-xl space-y-3"
                  style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: "var(--accent-light)" }}>
                      <Briefcase className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                        {selectedJob.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />{selectedJob.location}
                        </span>
                        <span>{selectedJob.experienceLevel}</span>
                        <span>{selectedJob.type}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.requirements.slice(0, 8).map((r) => (
                      <span key={r.skill} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={
                          r.required
                            ? { background: "var(--accent-light)", color: "var(--accent)" }
                            : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }
                        }>
                        {r.skill}{r.required && <span className="opacity-50 ml-0.5">*</span>}
                      </span>
                    ))}
                    {selectedJob.requirements.length > 8 && (
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                        +{selectedJob.requirements.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Shortlist config card */}
            <div className="card p-6">
              <p className="text-xs font-bold tracking-widest uppercase mb-4"
                style={{ color: "var(--text-muted)" }}>
                Step 2 — Configure Shortlist
              </p>

              {/* Shortlist size */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                      Shortlist Size
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                      How many top candidates to return
                    </p>
                  </div>
                  <div className="px-4 py-1.5 rounded-xl font-bold text-sm text-white"
                    style={{ background: "linear-gradient(135deg, #0284c7, #2563eb)" }}>
                    Top {shortlistSize}
                  </div>
                </div>
                <input
                  type="range" min="5" max="20" step="5"
                  value={shortlistSize}
                  onChange={(e) => setShortlistSize(Number(e.target.value))}
                  className="w-full"
                  style={{ accentColor: "var(--accent)" }}
                />
                <div className="flex justify-between text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
                  {[5, 10, 15, 20].map((n) => (
                    <span key={n} className={shortlistSize === n ? "font-bold" : ""}
                      style={{ color: shortlistSize === n ? "var(--accent)" : "var(--text-muted)" }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Candidate pool */}
              <div className="flex items-center justify-between p-3 rounded-xl"
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    Candidate pool
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {total === 0 ? (
                    <a href="/candidates/upload" className="text-xs font-semibold underline"
                      style={{ color: "var(--warning)" }}>
                      Import candidates first
                    </a>
                  ) : (
                    <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
                      {total} candidate{total !== 1 ? "s" : ""} will be evaluated
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Context panel (2/5) ─────────────────────────────────── */}
          <div className="lg:col-span-2">
            {loading ? (
              /* ── AI Processing (replaces right panel during run) ── */
              <div className="card overflow-hidden h-full animate-fade-in">
                {/* Header strip */}
                <div className="px-5 pt-5 pb-4"
                  style={{ background: "linear-gradient(135deg, #0a1628, #0e2047)" }}>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center animate-ai-pulse"
                      style={{ background: "rgba(59,130,246,0.25)", border: "1px solid rgba(59,130,246,0.4)" }}>
                      <Brain className="w-4.5 h-4.5 text-white" style={{ width: "18px", height: "18px" }} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-white">Gemini is thinking</p>
                      <p className="text-xs" style={{ color: "#60a5fa" }}>30–60 seconds typical</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowThinking((v) => !v)}
                      className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)" }}
                    >
                      {showThinking ? "Hide" : "Show"} thinking
                      {showThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {showThinking ? (
                  /* Steps */
                  <div className="p-5">
                    {AI_STEPS.map((s) => (
                      <StepRow
                        key={s.step}
                        step={s.step}
                        title={s.title}
                        desc={s.desc}
                        state={
                          activeStep > s.step ? "done"
                          : activeStep === s.step ? "active"
                          : "pending"
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="p-4 rounded-xl" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center animate-ai-pulse"
                          style={{ background: "rgba(59,130,246,0.14)" }}>
                          <Brain className="w-4 h-4" style={{ color: "var(--ai)" }} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                            AI is ready to think out loud
                          </p>
                          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                            Click Show thinking while screening runs to see pre-scoring, Gemini analysis, and shortlist preparation.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* ── AI Info panel (collapsed by default) ── */
              <div className="card overflow-hidden h-full flex flex-col">
                <button
                  type="button"
                  onClick={() => setShowThinking((v) => !v)}
                  className="w-full px-5 pt-5 pb-4 flex-shrink-0 text-left"
                  style={{ background: "linear-gradient(135deg, #0a1628, #0e2047)" }}
                >
                  <div className="flex items-center gap-2.5 mb-1">
                    <Brain className="w-4 h-4 text-white opacity-90" />
                    <p className="font-bold text-sm text-white">See how AI thinks</p>
                    <span className="ml-auto inline-flex items-center gap-1 text-xs text-white/80">
                      {showThinking ? "Hide" : "Show"}
                      {showThinking ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "#60a5fa" }}>
                    Gemini 2.0 Flash · Deterministic pre-scoring
                  </p>
                </button>

                {showThinking && (
                  <>
                    <div className="p-5 flex-1">
                      {AI_STEPS.map((s) => (
                        <StepRow key={s.step} step={s.step} title={s.title} desc={s.desc} state="pending" />
                      ))}
                    </div>

                    <div className="px-5 pb-5 flex-shrink-0">
                      <div className="p-3 rounded-xl text-xs"
                        style={{ background: "var(--ai-light)", border: "1px solid var(--ai-border)", color: "var(--ai)" }}>
                        <strong>Human decision first.</strong> AI ranks and explains — you make the final call.
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Submit button ─────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={!canRun}
          className="w-full py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-3 text-white transition-all"
          style={
            !canRun
              ? { background: "var(--surface-inset)", color: "var(--text-muted)", cursor: "not-allowed", border: "1px solid var(--border)" }
              : { background: "linear-gradient(135deg, #0a1628 0%, #0e2047 40%, #2563eb 100%)" }
          }
          onMouseEnter={(e) => {
            if (canRun) e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,99,235,0.35)";
          }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Screening in progress — this may take 30–60 seconds
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Run AI Screening
              {canRun && <ArrowRight className="w-4 h-4 ml-1 opacity-70" />}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function ScreeningPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto py-16 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      }
    >
      <ScreeningPageContent />
    </Suspense>
  );
}
