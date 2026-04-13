"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchCandidates } from "@/store/candidatesSlice";
import { fetchResults } from "@/store/screeningSlice";
import {
  Briefcase, Users, BarChart3, Zap, TrendingUp, Clock,
  ArrowRight, CheckCircle2, Hourglass, Brain,
} from "lucide-react";

function StatCard({
  label, value, icon: Icon, accent, href, sub,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: string;
  href: string;
  sub?: string;
}) {
  return (
    <Link
      href={href}
      className="card card-hover block p-5 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: accent + "18" }}
        >
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        <ArrowRight
          className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: accent }}
        />
      </div>
      <p className="text-2xl font-bold mb-0.5" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
        {value}
      </p>
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p>}
    </Link>
  );
}

function QuickAction({
  href, icon: Icon, title, subtitle, gradient,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className="card card-hover relative overflow-hidden p-5 flex items-center gap-4 group"
    >
      {/* Background accent */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: gradient, opacity: 0 }}
      />
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 relative"
        style={{ background: gradient }}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="relative">
        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{title}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{subtitle}</p>
      </div>
      <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-60 transition-all translate-x-0 group-hover:translate-x-1" style={{ color: "var(--text-secondary)" }} />
    </Link>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: jobs } = useSelector((s: RootState) => s.jobs);
  const { total: totalCandidates } = useSelector((s: RootState) => s.candidates);
  const { results } = useSelector((s: RootState) => s.screening);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchCandidates());
    dispatch(fetchResults());
  }, [dispatch]);

  const completedResults = results.filter((r) => r.status === "completed" || !r.status);
  const avgTopScore = completedResults.length
    ? Math.round(completedResults.reduce((a, r) => a + (r.shortlist[0]?.matchScore ?? 0), 0) / completedResults.length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
            Command Center
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
          >
            Dashboard
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Overview of your recruitment pipeline
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{ background: "var(--ai-light)", border: "1px solid var(--ai-border)", color: "var(--ai)" }}>
          <Brain className="w-3 h-3" />
          AI screening ready
        </div>
      </div>

      {/* ── Stats Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Jobs Posted"        value={jobs.length}        icon={Briefcase}    accent="#2563eb" href="/jobs"      sub="Active openings" />
        <StatCard label="Candidate Pool"     value={totalCandidates}    icon={Users}        accent="#059669" href="/candidates" sub="Profiles imported" />
        <StatCard label="Screenings Run"     value={results.length}     icon={BarChart3}    accent="#0284c7" href="/results"   sub={`${completedResults.length} completed`} />
        <StatCard label="Avg Top Match"      value={`${avgTopScore}%`}  icon={TrendingUp}   accent="#d97706" href="/results"   sub="Across all runs" />
      </div>

      {/* ── Quick Actions ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
          Quick Actions
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickAction
            href="/jobs/new"
            icon={Briefcase}
            title="Post a Job"
            subtitle="Create a new opening"
            gradient="linear-gradient(135deg, #2563eb, #1d4ed8)"
          />
          <QuickAction
            href="/candidates/upload"
            icon={Users}
            title="Import Candidates"
            subtitle="PDF resumes or CSV batch"
            gradient="linear-gradient(135deg, #059669, #047857)"
          />
          <QuickAction
            href="/screening"
            icon={Zap}
            title="Run AI Screening"
            subtitle="Rank candidates with explainable scoring"
            gradient="linear-gradient(135deg, #0284c7, #0369a1)"
          />
        </div>
      </div>

      {/* ── Bottom grid: Recent screenings + pipeline status ─────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent screenings — takes 2/3 */}
        <div className="lg:col-span-2 card">
          <div
            className="px-5 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
              Recent Screenings
            </h2>
            <Link
              href="/results"
              className="text-xs font-medium flex items-center gap-1 transition-colors"
              style={{ color: "var(--accent)" }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="px-5 py-14 text-center">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "var(--ai-light)" }}
              >
                <Zap className="w-6 h-6" style={{ color: "var(--ai)" }} />
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                No screenings yet
              </p>
              <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                Run your first AI screening to see ranked results here
              </p>
              <Link
                href="/screening"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: "var(--ai)" }}
              >
                <Zap className="w-3.5 h-3.5" /> Start Screening
              </Link>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: "var(--border)" }}>
              {results.slice(0, 6).map((r) => {
                const topScore = r.shortlist[0]?.matchScore ?? 0;
                const scoreColor = topScore >= 80 ? "#059669" : topScore >= 60 ? "#2563eb" : "#d97706";
                const statusColor =
                  r.status === "completed" || !r.status
                    ? { bg: "var(--success-light)", text: "#059669" }
                    : r.status === "failed"
                    ? { bg: "var(--error-light)", text: "var(--error)" }
                    : { bg: "var(--ai-light)", text: "var(--ai)" };

                return (
                  <Link
                    key={r._id}
                    href={`/results/${r._id}`}
                    className="flex items-center justify-between px-5 py-3.5 transition-colors group"
                    style={{ "--hover-bg": "var(--surface-inset)" } as React.CSSProperties}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-inset)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                          {r.jobTitle}
                        </span>
                        {r.status && (
                          <span
                            className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{ background: statusColor.bg, color: statusColor.text }}
                          >
                            {r.status}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {r.totalApplicants} screened
                        </span>
                        <span>→ Top {r.shortlistSize}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(r.screeningDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-lg font-bold" style={{ color: scoreColor }}>
                        {topScore}%
                      </span>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>top match</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Pipeline status — 1/3 */}
        <div className="card p-5">
          <h2 className="font-semibold text-sm mb-4" style={{ color: "var(--text-primary)" }}>
            Pipeline Status
          </h2>

          <div className="space-y-4">
            {[
              { label: "Active Jobs", value: jobs.length, icon: Briefcase, color: "#2563eb" },
              { label: "Candidates", value: totalCandidates, icon: Users, color: "#059669" },
              {
                label: "Completed Runs",
                value: completedResults.length,
                icon: CheckCircle2,
                color: "#059669",
              },
              {
                label: "In Progress",
                value: results.filter((r) => r.status === "pending" || r.status === "running").length,
                icon: Hourglass,
                color: "#7c3aed",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: color + "15" }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color }} />
                </div>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</p>
                </div>
                <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          <div
            className="mt-5 pt-4 rounded-xl p-3"
            style={{ background: "var(--ai-light)", border: "1px solid var(--ai-border)" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-3.5 h-3.5" style={{ color: "var(--ai)" }} />
              <p className="text-xs font-semibold" style={{ color: "var(--ai)" }}>AI Screening</p>
            </div>
            <p className="text-xs" style={{ color: "#6d4fc0" }}>
              Post a job and import candidates to begin screening.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
