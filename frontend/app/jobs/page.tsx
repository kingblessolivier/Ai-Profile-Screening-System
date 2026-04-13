"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs, deleteJob } from "@/store/jobsSlice";
import { Plus, Briefcase, MapPin, Clock, Trash2, Edit2, Zap, Search, Eye } from "lucide-react";

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  Junior:     { bg: "#ecfdf5", text: "#059669" },
  "Mid-level":{ bg: "#eff6ff", text: "#2563eb" },
  Senior:     { bg: "#eff6ff", text: "#1d4ed8" },
  Lead:       { bg: "#fffbeb", text: "#d97706" },
};

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  "Full-time": { bg: "#f0fdf4", text: "#16a34a" },
  "Part-time": { bg: "#fefce8", text: "#ca8a04" },
  Contract:    { bg: "#fdf4ff", text: "#a21caf" },
};

export default function JobsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: jobs, loading } = useSelector((s: RootState) => s.jobs);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const filtered = jobs.filter((j) => {
    const matchSearch =
      !search ||
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase());
    const matchLevel = !levelFilter || j.experienceLevel === levelFilter;
    return matchSearch && matchLevel;
  });

  const levels = Array.from(new Set(jobs.map((j) => j.experienceLevel)));

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
            Recruitment
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
          >
            Jobs
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {jobs.length} opening{jobs.length !== 1 ? "s" : ""} posted
          </p>
        </div>
        <Link
          href="/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}
          onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(37,99,235,0.4)")}
          onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
        >
          <Plus className="w-4 h-4" />
          Post Job
        </Link>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, locations…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {/* Level filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {["", ...levels].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                levelFilter === lvl
                  ? { background: "var(--accent)", color: "#fff" }
                  : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
              }
            >
              {lvl || "All Levels"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5">
              <div className="skeleton h-5 w-1/3 mb-3" />
              <div className="skeleton h-4 w-1/2 mb-2" />
              <div className="flex gap-2">
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card py-20 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "var(--accent-light)" }}
          >
            <Briefcase className="w-7 h-7" style={{ color: "var(--accent)" }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {search || levelFilter ? "No jobs match your filters" : "No jobs yet"}
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            {search || levelFilter ? "Try adjusting your search" : "Post your first job opening to get started"}
          </p>
          {!search && !levelFilter && (
            <Link
              href="/jobs/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: "var(--accent)" }}
            >
              <Plus className="w-4 h-4" /> Post your first job
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((job) => {
            const lvlStyle = LEVEL_STYLE[job.experienceLevel] || { bg: "#f8fafc", text: "#64748b" };
            const typeStyle = TYPE_STYLE[job.type] || { bg: "#f8fafc", text: "#64748b" };

            return (
              <div
                key={job._id}
                className="card card-hover p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    {/* Title + badges */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>
                        {job.title}
                      </h2>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: lvlStyle.bg, color: lvlStyle.text }}
                      >
                        {job.experienceLevel}
                      </span>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: typeStyle.bg, color: typeStyle.text }}
                      >
                        {job.type}
                      </span>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs mb-3" style={{ color: "var(--text-muted)" }}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {job.location}
                      </span>
                      {job.department && (
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {job.department}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(job.createdAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {job.requirements.slice(0, 6).map((r) => (
                        <span
                          key={r.skill}
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={
                            r.required
                              ? { background: "var(--accent-light)", color: "var(--accent)" }
                              : { background: "var(--surface-inset)", color: "var(--text-secondary)" }
                          }
                        >
                          {r.skill}
                          {r.required && <span className="ml-0.5 opacity-60">*</span>}
                        </span>
                      ))}
                      {job.requirements.length > 6 && (
                        <span
                          className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}
                        >
                          +{job.requirements.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <Link
                      href={`/screening?jobId=${job._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all"
                      style={{ background: "var(--ai)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(2,132,199,0.35)")}
                      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                    >
                      <Zap className="w-3 h-3" />
                      Screen
                    </Link>
                    <Link
                      href={`/jobs/${job._id}`}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-inset)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                      aria-label={`View ${job.title}`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href={`/jobs/${job._id}/edit`}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-inset)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => dispatch(deleteJob(job._id))}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error-light)"; e.currentTarget.style.color = "var(--error)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
