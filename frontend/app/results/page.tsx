"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchResults } from "@/store/screeningSlice";
import { PageHeader } from "@/components/layout";
import { EmptyState, StatCard } from "@/components/ui";
import {
  BarChart3, Clock, Users, Trophy, ChevronRight,
  CheckCircle2, Hourglass, Gauge, Zap, Brain,
} from "lucide-react";

function ScoreRing({ score }: { score: number }) {
  const color = score >= 80 ? "#059669" : score >= 60 ? "#2563eb" : "#d97706";
  return (
    <div className="text-right">
      <p className="text-2xl font-bold leading-none" style={{ color, fontFamily: "var(--font-display, system-ui)" }}>
        {score}%
      </p>
      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>top match</p>
    </div>
  );
}

export default function ResultsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { results, loading } = useSelector((s: RootState) => s.screening);

  useEffect(() => { dispatch(fetchResults()); }, [dispatch]);

  const completedRuns  = results.filter((r) => r.status === "completed" || !r.status).length;
  const pendingRuns    = results.filter((r) => r.status === "pending" || r.status === "running").length;
  const avgTopScore    = results.length
    ? Math.round(results.reduce((s, r) => s + (r.shortlist[0]?.matchScore ?? 0), 0) / results.length)
    : 0;
  const avgProcessing  = results.length
    ? (results.reduce((s, r) => s + r.processingTimeMs, 0) / results.length / 1000).toFixed(1)
    : "0.0";

  const RECO_STYLE: Record<string, { bg: string; text: string }> = {
    "Strongly Recommended": { bg: "#ecfdf5", text: "#059669" },
    Recommended:            { bg: "#eff6ff", text: "#2563eb" },
    Consider:               { bg: "#fffbeb", text: "#d97706" },
    "Not Recommended":      { bg: "#f8fafc", text: "#94a3b8" },
  };

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <PageHeader
        eyebrow="AI Engine"
        title="Screening Results"
        subtitle={`${results.length} screening run${results.length !== 1 ? "s" : ""}${results.length > 0 ? ` · avg ${avgProcessing}s processing` : ""}`}
      />

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Runs"
          value={results.length}
          icon={<BarChart3 className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          label="Completed"
          value={completedRuns}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          label="In Progress"
          value={pendingRuns}
          icon={<Hourglass className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Avg Top Score"
          value={`${avgTopScore}%`}
          icon={<Gauge className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* ── List ───────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-5 w-1/3 mb-3" />
              <div className="skeleton h-4 w-1/2 mb-3" />
              <div className="flex gap-2">
                {[1, 2, 3].map((j) => <div key={j} className="skeleton h-5 w-20 rounded-full" />)}
              </div>
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="card py-8">
          <EmptyState
            icon={<Brain className="w-7 h-7" />}
            title="No screenings yet"
            description="Run your first AI screening to generate ranked shortlists with evidence"
            action={{ label: "Run First Screening", href: "/screening" }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => {
            const topScore = r.shortlist[0]?.matchScore ?? 0;
            const statusStyle =
              r.status === "completed" || !r.status
                ? { bg: "var(--success-light)", text: "#059669" }
                : r.status === "failed"
                ? { bg: "var(--error-light)", text: "var(--error)" }
                : { bg: "var(--ai-light)", text: "var(--ai)" };

            return (
              <Link
                key={r._id}
                href={`/results/${r._id}`}
                className="card card-hover block p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                      <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {r.jobTitle}
                      </h2>
                      {r.status && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ background: statusStyle.bg, color: statusStyle.text }}
                        >
                          {r.status}
                        </span>
                      )}
                      <span
                        className="text-xs flex items-center gap-1"
                        style={{ color: "var(--text-muted)" }}
                      >
                        <Clock className="w-3 h-3" />
                        {new Date(r.screeningDate).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Meta pills */}
                    <div className="flex items-center gap-4 text-xs mb-4" style={{ color: "var(--text-secondary)" }}>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {r.totalApplicants} screened
                      </span>
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3 h-3" style={{ color: "#d97706" }} />
                        Top {r.shortlistSize}
                      </span>
                      <span style={{ color: "var(--text-muted)" }}>
                        {(r.processingTimeMs / 1000).toFixed(1)}s · {r.aiModel}
                      </span>
                    </div>

                    {/* Top 3 preview */}
                    <div className="flex flex-wrap gap-2">
                      {r.shortlist.slice(0, 3).map((c) => {
                        const rec = RECO_STYLE[c.recommendation] || { bg: "#f8fafc", text: "#94a3b8" };
                        return (
                          <div
                            key={c.candidateId}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                            style={{ background: "var(--surface-inset)" }}
                          >
                            <span
                              className="w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold"
                              style={{ background: "var(--ink)", color: "#fff", fontSize: "9px" }}
                            >
                              {c.rank}
                            </span>
                            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
                              {c.candidateName.split(" ")[0]}
                            </span>
                            <span className="font-bold" style={{ color: "#2563eb" }}>
                              {c.matchScore}%
                            </span>
                            <span
                              className="px-1.5 py-0.5 rounded-full font-medium"
                              style={{ background: rec.bg, color: rec.text }}
                            >
                              {c.recommendation.split(" ")[0]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <ScoreRing score={topScore} />
                    <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
