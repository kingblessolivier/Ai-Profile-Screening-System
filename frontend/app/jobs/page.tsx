"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs, deleteJob } from "@/store/jobsSlice";
import { Plus, Briefcase, MapPin, Clock, Trash2, Edit2, Zap } from "lucide-react";

export default function JobsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: jobs, loading } = useSelector((s: RootState) => s.jobs);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const levelColor: Record<string, string> = {
    Junior: "bg-emerald-100 text-emerald-700",
    "Mid-level": "bg-blue-100 text-blue-700",
    Senior: "bg-violet-100 text-violet-700",
    Lead: "bg-amber-100 text-amber-700",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Jobs</h1>
          <p className="text-slate-500 mt-1">{jobs.length} job{jobs.length !== 1 ? "s" : ""} posted</p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Post Job
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">No jobs yet.</p>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm"
          >
            <Plus className="w-4 h-4" /> Post your first job
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <h2 className="font-semibold text-slate-900">{job.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor[job.experienceLevel] || "bg-slate-100 text-slate-600"}`}>
                      {job.experienceLevel}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{job.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    {job.department && <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.department}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{new Date(job.createdAt!).toLocaleDateString()}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.requirements.slice(0, 5).map((r) => (
                      <span key={r.skill} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                        {r.skill}
                      </span>
                    ))}
                    {job.requirements.length > 5 && (
                      <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full">
                        +{job.requirements.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/screening?jobId=${job._id}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Screen
                  </Link>
                  <Link
                    href={`/jobs/${job._id}/edit`}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => dispatch(deleteJob(job._id))}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-slate-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
