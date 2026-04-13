"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchResult } from "@/store/screeningSlice";
import {
  ArrowLeft, Trophy, Users, Clock, CheckCircle, XCircle, MessageSquare,
  TrendingUp, ChevronDown, ChevronUp, Zap, Target,
} from "lucide-react";
import { CandidateScore } from "@/types";

const RECO_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  "Strongly Recommended": { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
  Recommended: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
  Consider: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  "Not Recommended": { color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200" },
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-blue-500" : s >= 40 ? "bg-amber-500" : "bg-red-400";

const SCORE_BADGE = (s: number) =>
  s >= 80 ? "bg-emerald-100 text-emerald-700" : s >= 60 ? "bg-blue-100 text-blue-700" : s >= 40 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-600">{label}</span>
        <span className="font-semibold text-slate-800">{value}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${SCORE_COLOR(value)} transition-all`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function CandidateCard({ c, filter }: { c: CandidateScore; filter: string }) {
  const [open, setOpen] = useState(false);
  const cfg = RECO_CONFIG[c.recommendation] || RECO_CONFIG["Consider"];

  if (filter !== "all") {
    if (filter === "top" && c.matchScore < 75) return null;
    if (filter === "medium" && (c.matchScore >= 75 || c.matchScore < 50)) return null;
    if (filter === "low" && c.matchScore >= 50) return null;
  }

  return (
    <div className={`rounded-xl border ${cfg.border} ${open ? cfg.bg : "bg-white"} overflow-hidden transition-colors`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 p-5 text-left hover:bg-opacity-60 transition-colors"
      >
        {/* Rank badge */}
        <div className="w-9 h-9 rounded-full bg-slate-900 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
          {c.rank}
        </div>

        {/* Name + recommendation */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-semibold text-slate-900">{c.candidateName}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.color} ${cfg.bg}`}>
              {c.recommendation}
            </span>
          </div>
          <p className="text-xs text-slate-500 truncate">{c.email}</p>
        </div>

        {/* Score */}
        <div className="text-right flex-shrink-0">
          <div className={`text-xl font-bold px-3 py-1 rounded-lg ${SCORE_BADGE(c.matchScore)}`}>
            {c.matchScore}%
          </div>
        </div>

        <div className="text-slate-400 flex-shrink-0">
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-5">
          {/* Score breakdown */}
          {c.breakdown && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Score Breakdown</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ScoreBar label="Skills Match (40%)" value={c.breakdown.skillsScore} />
                <ScoreBar label="Experience (25%)" value={c.breakdown.experienceScore} />
                <ScoreBar label="Projects (15%)" value={c.breakdown.projectsScore} />
                <ScoreBar label="Education (10%)" value={c.breakdown.educationScore} />
                <ScoreBar label="Availability (10%)" value={c.breakdown.availabilityScore} />
              </div>
            </div>
          )}

          {/* Summary */}
          {c.summary && (
            <div className="p-4 bg-white rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600">{c.summary}</p>
            </div>
          )}

          {/* Strengths + Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Strengths
              </p>
              <ul className="space-y-1.5">
                {c.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5 text-red-400" /> Gaps / Risks
              </p>
              <ul className="space-y-1.5">
                {c.gaps.map((g, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0 mt-1.5" />
                    {g}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Skill gap analysis */}
          {c.skillGapAnalysis && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-blue-500" /> Skill Gap Analysis
              </p>
              <div className="flex flex-wrap gap-2">
                {c.skillGapAnalysis.matched.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">✓ {s}</span>
                ))}
                {c.skillGapAnalysis.missing.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">✗ {s}</span>
                ))}
                {c.skillGapAnalysis.bonus.map((s) => (
                  <span key={s} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">+ {s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Interview questions */}
          {c.interviewQuestions?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-violet-500" /> Suggested Interview Questions
              </p>
              <ol className="space-y-2">
                {c.interviewQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
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

  useEffect(() => { if (id) dispatch(fetchResult(id)); }, [id, dispatch]);

  if (loading) return <div className="flex items-center justify-center py-20 text-slate-400">Loading results...</div>;
  if (!result) return <div className="text-center py-20 text-slate-400">Result not found.</div>;

  const stronglyRec = result.shortlist.filter((c) => c.recommendation === "Strongly Recommended").length;
  const avgScore = Math.round(result.shortlist.reduce((a, c) => a + c.matchScore, 0) / result.shortlist.length);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/results" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-slate-900 truncate">{result.jobTitle}</h1>
          <div className="flex items-center gap-3 text-sm text-slate-500 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{result.totalApplicants} screened</span>
            <span className="flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-amber-500" />Top {result.shortlistSize}</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(result.screeningDate).toLocaleString()}</span>
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-violet-500" />{result.aiModel}</span>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Top Score", value: `${result.shortlist[0]?.matchScore ?? 0}%`, icon: Trophy, color: "text-amber-600" },
          { label: "Avg Score", value: `${avgScore}%`, icon: TrendingUp, color: "text-blue-600" },
          { label: "Strongly Rec.", value: stronglyRec, icon: CheckCircle, color: "text-emerald-600" },
          { label: "Processing", value: `${(result.processingTimeMs / 1000).toFixed(1)}s`, icon: Clock, color: "text-violet-600" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-4 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-1 ${color}`} />
            <p className="text-xl font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Pool insights */}
      {result.poolInsights && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
          <h3 className="font-semibold text-slate-800 mb-4">Pool Insights</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Top Skills in Pool</p>
              <div className="flex flex-wrap gap-1.5">
                {result.poolInsights.topSkills.slice(0, 6).map((s) => (
                  <span key={s.skill} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">{s.skill} ({s.count})</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Missing Critical Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {result.poolInsights.missingCriticalSkills.length === 0
                  ? <span className="text-xs text-emerald-600">All critical skills covered</span>
                  : result.poolInsights.missingCriticalSkills.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 rounded-full">{s}</span>
                  ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Pool Stats</p>
              <p className="text-sm text-slate-600">Avg experience: <strong>{result.poolInsights.avgExperienceYears}yr</strong></p>
              {result.poolInsights.availabilityBreakdown.map((a) => (
                <p key={a.status} className="text-xs text-slate-500">{a.status}: {a.count}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {["all", "top", "medium", "low"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${filter === f ? "bg-slate-900 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>
            {f === "all" ? "All Candidates" : f === "top" ? "Top (75%+)" : f === "medium" ? "Medium (50–74%)" : "Low (<50%)"}
          </button>
        ))}
      </div>

      {/* Candidate cards */}
      <div className="space-y-3">
        {result.shortlist.map((c) => (
          <CandidateCard key={c.candidateId} c={c} filter={filter} />
        ))}
      </div>
    </div>
  );
}
