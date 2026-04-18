"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs, deleteJob } from "@/store/jobsSlice";
import { EmptyState, FilterBar, FilterChip, SearchInput } from "@/components/ui";
import { Plus, Briefcase, MapPin, Clock, Trash2, Edit2, Zap, Search, Eye, LayoutList, LayoutGrid } from "lucide-react";

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
  const [view, setView] = useState<"list" | "cards">("cards");

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  useEffect(() => {
    const saved = localStorage.getItem("jobs:view:mode");
    if (saved === "list" || saved === "cards") setView(saved);
  }, []);

  const handleViewChange = (mode: "list" | "cards") => {
    setView(mode);
    localStorage.setItem("jobs:view:mode", mode);
  };

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
    <div className="max-w-6xl mx-auto animate-slide-up pb-8">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white mb-6">
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-sky-100 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-16 w-52 h-52 bg-cyan-50 rounded-full blur-2xl" />
        <div className="relative p-6 md:p-8 flex items-end justify-between gap-4 flex-wrap">
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
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => handleViewChange("cards")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  view === "cards" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Cards
              </button>
              <button
                type="button"
                onClick={() => handleViewChange("list")}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                List
              </button>
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
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <FilterBar className="mb-6 items-center justify-between">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search jobs, locations..."
          icon={<Search className="w-3.5 h-3.5" />}
          className="flex-1 min-w-[200px] max-w-xs"
        />

        <div className="flex items-center gap-2 flex-wrap justify-end">
          {["", ...levels].map((lvl) => (
            <FilterChip
              key={lvl}
              label={lvl || "All Levels"}
              active={levelFilter === lvl}
              onClick={() => setLevelFilter(lvl)}
              className="text-xs"
            />
          ))}
        </div>
      </FilterBar>

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
        <div className="card py-8">
          <EmptyState
            icon={<Briefcase className="w-7 h-7" />}
            title={search || levelFilter ? "No jobs match your filters" : "No jobs yet"}
            description={search || levelFilter ? "Try adjusting your search" : "Post your first job opening to get started"}
            action={!search && !levelFilter ? { label: "Post your first job", href: "/jobs/new" } : undefined}
          />
        </div>
      ) : (
        <div className={view === "cards" ? "grid sm:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
          {filtered.map((job) => {
            const lvlStyle = LEVEL_STYLE[job.experienceLevel] || { bg: "#f8fafc", text: "#64748b" };
            const typeStyle = TYPE_STYLE[job.type] || { bg: "#f8fafc", text: "#64748b" };

            return (
              <div
                key={job._id}
                className={`card card-hover p-5 ${view === "cards" ? "h-full" : ""}`}
              >
                <div className={`flex gap-4 ${view === "cards" ? "flex-col" : "items-start justify-between"}`}>
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
                    <div className="flex items-center gap-4 text-xs mb-3 flex-wrap" style={{ color: "var(--text-muted)" }}>
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
                  <div className={`flex items-center gap-1.5 flex-shrink-0 ${view === "cards" ? "pt-2 border-t border-slate-100" : ""}`}>
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
