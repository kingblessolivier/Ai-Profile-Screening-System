"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchResult } from "@/store/screeningSlice";
import api from "@/lib/api";
import {
  ArrowLeft, Trophy, Users, Clock, CheckCircle, XCircle, MessageSquare,
  TrendingUp, ChevronDown, ChevronUp, Zap, Target, AlertCircle, Loader2,
  Download, Brain, Sparkles,
} from "lucide-react";
import { CandidateScore } from "@/types";

const RECO_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  "Strongly Recommended": { color: "#059669", bg: "#ecfdf5", border: "#a7f3d0", label: "Strongly Rec." },
  Recommended:            { color: "#2563eb", bg: "#eff6ff", border: "#bfdbfe", label: "Recommended" },
  Consider:               { color: "#d97706", bg: "#fffbeb", border: "#fde68a", label: "Consider" },
  "Not Recommended":      { color: "#94a3b8", bg: "#f8fafc", border: "#e2e8f0", label: "Not Rec." },
};

function scoreColor(s: number) {
  return s >= 80 ? "#059669" : s >= 60 ? "#2563eb" : s >= 40 ? "#d97706" : "#ef4444";
}
function scoreBg(s: number) {
  return s >= 80 ? { bg: "#ecfdf5", text: "#059669" }
       : s >= 60 ? { bg: "#eff6ff", text: "#2563eb" }
       : s >= 40 ? { bg: "#fffbeb", text: "#d97706" }
       : { bg: "#fef2f2", text: "#ef4444" };
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1.5">
        <span style={{ color: "var(--text-secondary)" }}>{label}</span>
        <span className="font-bold" style={{ color: scoreColor(value) }}>{value}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-inset)" }}>
        <div
          className="h-full rounded-full score-bar-fill"
          style={{ width: `${value}%`, background: scoreColor(value) }}
        />
      </div>
    </div>
  );
}

function CandidateCard({ c, filter }: { c: CandidateScore; filter: string }) {
  const [open, setOpen] = useState(false);
  const cfg   = RECO_CONFIG[c.recommendation] || RECO_CONFIG["Consider"];
  const badge = scoreBg(c.matchScore);

  if (filter !== "all") {
    if (filter === "top"    && c.matchScore < 75)              return null;
    if (filter === "medium" && (c.matchScore >= 75 || c.matchScore < 50)) return null;
    if (filter === "low"    && c.matchScore >= 50)             return null;
  }

  return (
    <div
      className="card overflow-hidden transition-all"
      style={{ borderColor: open ? cfg.border : "var(--border)" }}
    >
      {/* ── Row (always visible) ──────────────────────────────────────────── */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left transition-colors"
        style={{ background: open ? cfg.bg + "80" : "transparent" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = "var(--surface-inset)"; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = "transparent"; }}
      >
        {/* Rank */}
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "var(--ink)", color: "#fff" }}
        >
          {c.rank}
        </div>

        {/* Name + tag */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
              {c.candidateName}
            </span>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
            >
              {cfg.label}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{c.email}</p>
        </div>

        {/* Score badge */}
        <div
          className="text-xl font-bold px-3 py-1.5 rounded-xl flex-shrink-0"
          style={{ background: badge.bg, color: badge.text }}
        >
          {c.matchScore}%
        </div>

        {/* Confidence chip */}
        <div
          className="text-xs px-2 py-1 rounded-lg flex-shrink-0 hidden sm:block"
          style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}
        >
          {c.confidence}% conf.
        </div>

        <div className="flex-shrink-0" style={{ color: "var(--text-muted)" }}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* ── Expanded detail ───────────────────────────────────────────────── */}
      {open && (
        <div
          className="px-5 pb-6 pt-4 space-y-5"
          style={{ borderTop: `1px solid ${cfg.border}`, background: cfg.bg + "40" }}
        >
          {/* Score breakdown */}
          {c.breakdown && (
            <div>
              <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
                Score Breakdown
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ScoreBar label="Skills Match (40%)"   value={c.breakdown.skillsScore} />
                <ScoreBar label="Experience (25%)"     value={c.breakdown.experienceScore} />
                <ScoreBar label="Projects (15%)"       value={c.breakdown.projectsScore} />
                <ScoreBar label="Education (10%)"      value={c.breakdown.educationScore} />
                <ScoreBar label="Availability (10%)"   value={c.breakdown.availabilityScore} />
              </div>
            </div>
          )}

          {/* AI Summary */}
          {c.summary && (
            <div
              className="p-4 rounded-xl"
              style={{ background: "var(--ai-light)", border: "1px solid var(--ai-border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-3.5 h-3.5" style={{ color: "var(--ai)" }} />
                <p className="text-xs font-bold" style={{ color: "var(--ai)" }}>AI Summary</p>
              </div>
              <p className="text-sm" style={{ color: "var(--text-primary)" }}>{c.summary}</p>
            </div>
          )}

          {/* Confidence + Evidence */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div
              className="p-3 rounded-xl text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
                Confidence
              </p>
              <p className="text-2xl font-bold" style={{ color: scoreColor(c.confidence) }}>
                {c.confidence}%
              </p>
            </div>
            <div
              className="sm:col-span-2 p-3 rounded-xl"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Evidence
              </p>
              <ul className="space-y-1.5">
                {c.evidence.map((item, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "var(--accent)" }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Strengths + Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: "var(--success)" }}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Strengths
              </p>
              <ul className="space-y-1.5">
                {c.strengths.map((s, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "var(--success)" }}
                    />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: "#ef4444" }}
              >
                <XCircle className="w-3.5 h-3.5" />
                Gaps / Risks
              </p>
              <ul className="space-y-1.5">
                {c.gaps.map((g, i) => (
                  <li key={i} className="text-sm flex items-start gap-2" style={{ color: "var(--text-secondary)" }}>
                    <span
                      className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: "#ef4444" }}
                    />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skill gap analysis */}
          {c.skillGapAnalysis && (
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: "var(--text-muted)" }}
              >
                <Target className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                Skill Gap Analysis
              </p>
              <div className="flex flex-wrap gap-2">
                {c.skillGapAnalysis.matched.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#ecfdf5", color: "#059669" }}>
                    ✓ {s}
                  </span>
                ))}
                {c.skillGapAnalysis.missing.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: "#fef2f2", color: "#ef4444" }}>
                    ✗ {s}
                  </span>
                ))}
                {c.skillGapAnalysis.bonus.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}>
                    + {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Interview Questions */}
          {c.interviewQuestions?.length > 0 && (
            <div>
              <p
                className="text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5"
                style={{ color: "var(--ai)" }}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Suggested Interview Questions
              </p>
              <ol className="space-y-2">
                {c.interviewQuestions.map((q, i) => (
                  <li key={i} className="text-sm flex items-start gap-2.5" style={{ color: "var(--text-secondary)" }}>
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: "var(--ai-light)", color: "var(--ai)" }}
                    >
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

export default function ResultDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { current: result, loading } = useSelector((s: RootState) => s.screening);
  const [filter, setFilter] = useState("all");
  const [exporting, setExporting] = useState(false);

  const isFallback  = result?.aiModel === "deterministic-fallback";
  const isPending   = result?.status === "pending" || result?.status === "running";
  const isFailed    = result?.status === "failed";

  useEffect(() => {
    if (id) dispatch(fetchResult(id));
  }, [id, dispatch]);

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
    return (
      <div className="text-center py-32" style={{ color: "var(--text-muted)" }}>
        Result not found.
      </div>
    );

  const stronglyRec = result.shortlist.filter((c) => c.recommendation === "Strongly Recommended").length;
  const avgScore    = Math.round(result.shortlist.reduce((a, c) => a + c.matchScore, 0) / (result.shortlist.length || 1));

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4 mb-6">
        <Link
          href="/results"
          className="p-2 rounded-lg transition-colors flex-shrink-0 mt-1"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-inset)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--ai)" }}>
            Decision Workspace
          </p>
          <h1
            className="text-2xl font-bold truncate mb-1"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
          >
            {result.jobTitle}
          </h1>
          <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />{result.totalApplicants} screened
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-3 h-3" style={{ color: "#d97706" }} />
              Top {result.shortlistSize}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(result.screeningDate).toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" style={{ color: "var(--ai)" }} />
              {result.aiModel}
            </span>
          </div>
        </div>

        {/* Export button */}
        <button
          onClick={handleExportPdf}
          disabled={exporting || isPending || isFailed}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-all"
          style={
            exporting || isPending || isFailed
              ? { background: "#e2e8f0", color: "#94a3b8", cursor: "not-allowed" }
              : { background: "var(--ink)" }
          }
          onMouseEnter={(e) => {
            if (!exporting && !isPending && !isFailed)
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <Download className="w-4 h-4" />
          {exporting ? "Generating…" : "Export PDF"}
        </button>
      </div>

      {/* ── Status banners ─────────────────────────────────────────────────── */}
      {isFallback && (
        <div
          className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm"
          style={{ background: "var(--warning-light)", border: "1px solid var(--warning-border)", color: "var(--warning)" }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Deterministic fallback scoring</p>
            <p className="text-xs mt-0.5 opacity-80">
              Gemini quota exhausted. This result used rule-based scoring without AI qualitative analysis.
            </p>
          </div>
        </div>
      )}

      {isPending && (
        <div
          className="mb-5 p-4 rounded-xl ai-panel flex items-start gap-3"
        >
          <Loader2 className="w-5 h-5 flex-shrink-0 mt-0.5 animate-spin" style={{ color: "var(--ai)" }} />
          <div className="flex-1">
            <p className="font-semibold text-sm" style={{ color: "#0c4a6e" }}>Screening in progress</p>
            <p className="text-xs mt-0.5" style={{ color: "#0369a1" }}>
              Gemini is ranking candidates in the background.
            </p>
            <div
              className="mt-3 h-2 rounded-full overflow-hidden"
              style={{ background: "rgba(2,132,199,0.15)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${result?.progress ?? 20}%`, background: "var(--ai)" }}
              />
            </div>
            <p className="text-xs mt-1" style={{ color: "var(--ai)" }}>
              {result?.progress ?? 20}% complete
            </p>
          </div>
        </div>
      )}

      {isFailed && (
        <div
          className="mb-5 p-4 rounded-xl flex items-start gap-3 text-sm"
          style={{ background: "var(--error-light)", border: "1px solid var(--error-border)", color: "var(--error)" }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Screening failed</p>
            <p className="text-xs mt-0.5 opacity-80">
              {result.errorMessage || "The background screening job failed. Try running it again."}
            </p>
          </div>
        </div>
      )}

      {/* ── Summary stats ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Top Score",    value: `${result.shortlist[0]?.matchScore ?? 0}%`, icon: Trophy,     color: "#d97706" },
          { label: "Avg Score",    value: `${avgScore}%`,                             icon: TrendingUp, color: "var(--accent)" },
          { label: "Strongly Rec", value: stronglyRec,                                icon: CheckCircle, color: "var(--success)" },
          { label: "Processing",   value: `${(result.processingTimeMs / 1000).toFixed(1)}s`, icon: Clock, color: "var(--ai)" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 text-center">
            <Icon className="w-4 h-4 mx-auto mb-2" style={{ color }} />
            <p
              className="text-xl font-bold"
              style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
            >
              {value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{label}</p>
          </div>
        ))}
      </div>

      {/* ── Pool Insights ──────────────────────────────────────────────────── */}
      {result.poolInsights && (
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-4 h-4" style={{ color: "var(--ai)" }} />
            <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Pool Insights
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Top Skills in Pool
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.poolInsights.topSkills.slice(0, 6).map((s) => (
                  <span
                    key={s.skill}
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                  >
                    {s.skill} ({s.count})
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Missing Critical Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.poolInsights.missingCriticalSkills.length === 0 ? (
                  <span className="text-xs font-medium" style={{ color: "var(--success)" }}>
                    ✓ All critical skills covered
                  </span>
                ) : (
                  result.poolInsights.missingCriticalSkills.map((s) => (
                    <span
                      key={s}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: "var(--error-light)", color: "var(--error)" }}
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-muted)" }}>
                Pool Stats
              </p>
              <p className="text-sm mb-1" style={{ color: "var(--text-secondary)" }}>
                Avg experience:{" "}
                <strong style={{ color: "var(--text-primary)" }}>
                  {result.poolInsights.avgExperienceYears}yr
                </strong>
              </p>
              {result.poolInsights.availabilityBreakdown.map((a) => (
                <p key={a.status} className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {a.status}: {a.count}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Filter tabs ────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: "all",    label: "All Candidates" },
          { key: "top",    label: "Top (75%+)" },
          { key: "medium", label: "Medium (50–74%)" },
          { key: "low",    label: "Low (<50%)" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={
              filter === key
                ? { background: "var(--ink)", color: "#fff" }
                : {
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text-secondary)",
                  }
            }
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Candidate cards ────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {result.shortlist.map((c) => (
          <CandidateCard key={c.candidateId} c={c} filter={filter} />
        ))}
      </div>
    </div>
  );
}
