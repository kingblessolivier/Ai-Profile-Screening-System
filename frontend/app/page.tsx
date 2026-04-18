"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchCandidates } from "@/store/candidatesSlice";
import { fetchResults } from "@/store/screeningSlice";
import { EmptyState, QuickActionCard, StatCard } from "@/components/ui";
import {
  Briefcase,
  Users,
  BarChart3,
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Brain,
  Sparkles,
  ChevronRight,
  Plus,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

function PipelineRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-slate-500">{label}</p>
      </div>
      <p className="text-lg font-bold text-slate-900">{value}</p>
    </div>
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

  const completedResults = results.filter(
    (r) => r.status === "completed" || !r.status
  );
  const avgTopScore = completedResults.length
    ? Math.round(
        completedResults.reduce(
          (a, r) => a + (r.shortlist[0]?.matchScore ?? 0),
          0
        ) / completedResults.length
      )
    : 0;

  const inProgress = results.filter(
    (r) => r.status === "pending" || r.status === "running"
  ).length;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-blue-400 mb-2">
                Command Center
              </p>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-2">
                Overview of your recruitment pipeline
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Brain className="w-3.5 h-3.5" />
              AI screening ready
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid - Redesigned with consistent spacing and styling */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-blue-50">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">Active Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{jobs.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-50">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">Candidates</p>
              <p className="text-2xl font-bold text-slate-900">{totalCandidates}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-purple-50">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">Screenings</p>
              <p className="text-2xl font-bold text-slate-900">{results.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white border border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-amber-50">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-500 font-medium">Avg Match</p>
              <p className="text-2xl font-bold text-slate-900">{avgTopScore}%</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <p className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Quick Actions
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/jobs/new"
            className="rounded-lg bg-white border border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-blue-50">
                <Briefcase className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Create Job</p>
                <p className="text-xs text-slate-600">Post a new opening</p>
              </div>
            </div>
          </Link>

          <Link
            href="/candidates/upload"
            className="rounded-lg bg-white border border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-green-50">
                <Upload className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Import Candidates</p>
                <p className="text-xs text-slate-600">CSV or PDF batch</p>
              </div>
            </div>
          </Link>

          <Link
            href="/screening"
            className="rounded-lg bg-white border border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-50">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Run Screening</p>
                <p className="text-xs text-slate-600">AI-powered ranking</p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Today's Priorities - NEW */}
      {jobs.length > 0 && (
        <section className="space-y-3">
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Today's Priorities
          </p>
          
          <div className="space-y-2">
            {/* Priority Item 1: Jobs needing more candidates */}
            {jobs.length < totalCandidates / Math.max(jobs.length, 1) && jobs.length > 0 && (
              <div className="rounded-lg bg-white border border-l-4 border-l-blue-600 border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                      <p className="font-semibold text-slate-900">Build candidate pool</p>
                    </div>
                    <p className="text-sm text-slate-600 ml-8">Import more candidates for better matching and diversity</p>
                  </div>
                  <Link
                    href="/candidates/upload"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 whitespace-nowrap"
                  >
                    Upload
                  </Link>
                </div>
              </div>
            )}

            {/* Priority Item 2: Jobs ready to screen */}
            {totalCandidates > 0 && completedResults.length < jobs.length && (
              <div className="rounded-lg bg-white border border-l-4 border-l-emerald-600 border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold">2</span>
                      <p className="font-semibold text-slate-900">Ready to screen candidates</p>
                    </div>
                    <p className="text-sm text-slate-600 ml-8">You have jobs with candidate pools ready for AI ranking</p>
                  </div>
                  <Link
                    href="/screening"
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 whitespace-nowrap"
                  >
                    Screen
                  </Link>
                </div>
              </div>
            )}

            {/* Priority Item 3: Screenings in progress */}
            {inProgress > 0 && (
              <div className="rounded-lg bg-white border border-l-4 border-l-amber-600 border-slate-200 shadow-sm p-5 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-600 text-xs font-bold">3</span>
                      <p className="font-semibold text-slate-900">Screening in progress</p>
                    </div>
                    <p className="text-sm text-slate-600 ml-8">{inProgress} screening(s) running — check results soon</p>
                  </div>
                  <Link
                    href="/results"
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 whitespace-nowrap"
                  >
                    View
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Recent Screenings + Pipeline */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Screenings */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-semibold text-slate-900 text-lg">Recent Screenings</h2>
              <Link
                href="/results"
                className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded px-2 py-1"
              >
                View all
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {results.length === 0 ? (
              <div className="px-5 py-6">
                <EmptyState
                  icon={<Sparkles className="w-7 h-7" />}
                  title="No screenings yet"
                  description="Run your first AI screening to see ranked results here"
                  action={{ label: "Start Screening", href: "/screening" }}
                />
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {results.slice(0, 6).map((r) => {
                  const topScore = r.shortlist[0]?.matchScore ?? 0;
                  const statusIcon =
                    r.status === "completed" || !r.status
                      ? { icon: "✓", bg: "bg-emerald-50", text: "text-emerald-600", label: "Complete" }
                      : r.status === "failed"
                      ? { icon: "✗", bg: "bg-red-50", text: "text-red-600", label: "Failed" }
                      : { icon: "▶", bg: "bg-blue-50", text: "text-blue-600", label: "Running" };

                  return (
                    <Link
                      key={r._id}
                      href={`/results/${r._id}`}
                      className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors border-l-4 border-transparent hover:border-l-blue-600 focus-visible:outline-none focus-visible:ring-inset focus-visible:ring-2 focus-visible:ring-blue-500"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-slate-900 truncate">
                            {r.jobTitle}
                          </span>
                          {r.status && (
                            <span
                              className={cn(
                                "text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1",
                                statusIcon.bg,
                                statusIcon.text
                              )}
                            >
                              {statusIcon.icon} {statusIcon.label}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {r.totalApplicants} screened
                          </span>
                          <span>Top {r.shortlistSize}</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(r.screeningDate).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric" }
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-4">
                        <span className="text-lg font-bold text-slate-900">
                          {topScore}%
                        </span>
                        <p className="text-xs text-slate-400">top match</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-5">Pipeline Status</h2>
          <div className="space-y-4">
            <PipelineRow label="Active Jobs" value={jobs.length} icon={Briefcase} />
            <PipelineRow label="Candidates" value={totalCandidates} icon={Users} />
            <PipelineRow
              label="Completed Runs"
              value={completedResults.length}
              icon={Briefcase}
            />
            <PipelineRow
              label="In Progress"
              value={inProgress}
              icon={Clock}
            />
          </div>

          {/* Quick Post CTA */}
          <Link
            href="/jobs/new"
            className="mt-6 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
          >
            <Plus className="w-4 h-4" />
            Post a new job
          </Link>
        </div>
      </section>
    </div>
  );
}
