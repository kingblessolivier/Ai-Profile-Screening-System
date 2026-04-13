"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchCandidates } from "@/store/candidatesSlice";
import { fetchResults } from "@/store/screeningSlice";
import { Briefcase, Users, BarChart3, Zap, TrendingUp, Clock } from "lucide-react";

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

  const stats = [
    { label: "Total Jobs", value: jobs.length, icon: Briefcase, color: "bg-blue-500", href: "/jobs" },
    { label: "Candidates", value: totalCandidates, icon: Users, color: "bg-emerald-500", href: "/candidates" },
    { label: "Screenings Run", value: results.length, icon: BarChart3, color: "bg-violet-500", href: "/results" },
    {
      label: "Avg Shortlist",
      value: results.length
        ? Math.round(results.reduce((a, r) => a + r.shortlistSize, 0) / results.length)
        : 0,
      icon: TrendingUp,
      color: "bg-amber-500",
      href: "/results",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">AI-powered recruitment screening — Umurava Hackathon</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className={`w-11 h-11 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{value}</p>
              <p className="text-sm text-slate-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Link
          href="/jobs/new"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl p-5 flex items-center gap-3 transition-colors"
        >
          <Briefcase className="w-5 h-5" />
          <div>
            <p className="font-semibold">Post a Job</p>
            <p className="text-sm text-blue-100">Create a new job opening</p>
          </div>
        </Link>
        <Link
          href="/candidates/upload"
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl p-5 flex items-center gap-3 transition-colors"
        >
          <Users className="w-5 h-5" />
          <div>
            <p className="font-semibold">Import Candidates</p>
            <p className="text-sm text-emerald-100">PDF, CSV or seed demo data</p>
          </div>
        </Link>
        <Link
          href="/screening"
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl p-5 flex items-center gap-3 transition-colors"
        >
          <Zap className="w-5 h-5" />
          <div>
            <p className="font-semibold">Run AI Screening</p>
            <p className="text-sm text-violet-100">Rank candidates with Gemini</p>
          </div>
        </Link>
      </div>

      {/* Recent results */}
      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">Recent Screenings</h2>
          <Link href="/results" className="text-sm text-blue-600 hover:underline">View all</Link>
        </div>
        {results.length === 0 ? (
          <div className="px-5 py-10 text-center text-slate-400">
            <Zap className="w-8 h-8 mx-auto mb-3 opacity-40" />
            <p>No screenings yet. Run your first AI screening!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {results.slice(0, 5).map((r) => (
              <Link
                key={r._id}
                href={`/results/${r._id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-medium text-slate-800">{r.jobTitle}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-500">{r.totalApplicants} candidates</span>
                    <span className="text-xs text-slate-400">→</span>
                    <span className="text-xs text-emerald-600 font-medium">Top {r.shortlistSize} shortlisted</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">
                    {r.shortlist[0]?.matchScore ?? 0}% top match
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                    <Clock className="w-3 h-3" />
                    {new Date(r.screeningDate).toLocaleDateString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
