"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs, deleteJob } from "@/store/jobsSlice";
import { PageHeader } from "@/components/layout";
import { Button, EmptyState, FilterBar, SearchInput } from "@/components/ui";
import {
  Users, Upload, Plus, Zap, MapPin, Briefcase,
  Clock, Edit2, Trash2, ChevronRight, Search,
  FileText, Database, Eye,
} from "lucide-react";

const LEVEL_COLOR: Record<string, { bg: string; text: string }> = {
  Junior:      { bg: "#ecfdf5", text: "#059669" },
  "Mid-level": { bg: "#eff6ff", text: "#2563eb" },
  Senior:      { bg: "#eff6ff", text: "#1d4ed8" },
  Lead:        { bg: "#fffbeb", text: "#d97706" },
};
const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  "Full-time": { bg: "#f0fdf4", text: "#16a34a" },
  "Part-time": { bg: "#fefce8", text: "#ca8a04" },
  Contract:    { bg: "#fdf4ff", text: "#a21caf" },
};

export default function CandidatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: jobs, loading } = useSelector((s: RootState) => s.jobs);
  const [search, setSearch] = useState("");

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  const filtered = jobs.filter((j) =>
    !search ||
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    j.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <PageHeader
        eyebrow="Recruitment"
        title="Candidates"
        subtitle="Candidates are organized by job — select a job to manage its applicant pool"
        actions={
          <Button asChild>
            <Link href="/jobs/new">
              <Plus className="w-4 h-4" />
              Post New Job
            </Link>
          </Button>
        }
      />

      {/* ── How it works banner (shown when no jobs) ───────────────────────── */}
      {!loading && jobs.length === 0 && (
        <div className="card p-2 mb-6">
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="Start by posting a job"
            description="Each job has its own applicant pool. Post a job first, then add candidates and run AI screening."
            action={{ label: "Post a Job", href: "/jobs/new" }}
          />
        </div>
      )}

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      {jobs.length > 0 && (
        <FilterBar className="mb-6">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs..."
            icon={<Search className="w-3.5 h-3.5" />}
            className="w-full max-w-sm"
          />
        </FilterBar>
      )}

      {/* ── Job cards ──────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6">
              <div className="skeleton h-5 w-1/3 mb-3" />
              <div className="skeleton h-4 w-1/2 mb-4" />
              <div className="flex gap-2">
                <div className="skeleton h-8 w-32 rounded-lg" />
                <div className="skeleton h-8 w-32 rounded-lg" />
                <div className="skeleton h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((job) => {
            const lvl  = LEVEL_COLOR[job.experienceLevel] || { bg: "#f8fafc", text: "#64748b" };
            const type = TYPE_COLOR[job.type]             || { bg: "#f8fafc", text: "#64748b" };

            return (
              <div key={job._id} className="card overflow-hidden">

                {/* ── Job header ─────────────────────────────────────────── */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title + badges */}
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h2 className="font-bold text-base" style={{ color: "var(--text-primary)" }}>
                          {job.title}
                        </h2>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: lvl.bg, color: lvl.text }}>
                          {job.experienceLevel}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: type.bg, color: type.text }}>
                          {job.type}
                        </span>
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                        {job.department && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{job.department}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(job.createdAt!).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>

                    {/* Top-right controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Link href={`/jobs/${job._id}/edit`}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--surface-inset)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => dispatch(deleteJob(job._id))}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error-light)"; e.currentTarget.style.color = "var(--error)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Skill tags */}
                  {job.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {job.requirements.slice(0, 7).map((r) => (
                        <span key={r.skill} className="text-xs px-2 py-0.5 rounded-full"
                          style={r.required
                            ? { background: "var(--accent-light)", color: "var(--accent)" }
                            : { background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                          {r.skill}{r.required && <span className="opacity-50 ml-0.5">*</span>}
                        </span>
                      ))}
                      {job.requirements.length > 7 && (
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}>
                          +{job.requirements.length - 7} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ── Action bar ─────────────────────────────────────────── */}
                <div
                  className="px-5 py-3 flex items-center gap-2 flex-wrap"
                  style={{ background: "var(--surface-inset)", borderTop: "1px solid var(--border)" }}
                >
                  {/* Upload PDFs */}
                  <Link
                    href={`/candidates/upload?jobId=${job._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-light)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--surface)"; }}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Upload Resumes
                  </Link>

                  {/* Add manually */}
                  <Link
                    href={`/candidates/new?jobId=${job._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#a7f3d0"; e.currentTarget.style.color = "#059669"; e.currentTarget.style.background = "#ecfdf5"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--surface)"; }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Manually
                  </Link>

                  {/* Seed demo */}
                  <Link
                    href={`/candidates/upload?jobId=${job._id}#demo`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; e.currentTarget.style.background = "var(--accent-light)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--surface)"; }}
                  >
                    <Database className="w-3.5 h-3.5" />
                    Demo Data
                  </Link>

                  <div className="flex-1" />

                  {/* View candidates */}
                  <Link
                    href={`/jobs/${job._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "var(--surface)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Candidates
                    <ChevronRight className="w-3 h-3" />
                  </Link>

                  {/* Screen */}
                  <Link
                    href={`/screening?jobId=${job._id}`}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-white transition-all"
                    style={{ background: "var(--ai)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(2,132,199,0.35)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Screen Now
                  </Link>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && jobs.length > 0 && (
            <div className="card py-8">
              <EmptyState
                icon={<Search className="w-7 h-7" />}
                title={`No jobs match "${search}"`}
                description="Try a different search term"
              />
            </div>
          )}
        </div>
      )}

      {/* ── Footer tip ─────────────────────────────────────────────────────── */}
      {!loading && jobs.length > 0 && (
        <div className="mt-6 p-4 rounded-xl text-sm flex items-center gap-3"
          style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <Users className="w-4 h-4 flex-shrink-0" style={{ color: "var(--accent)" }} />
          <span>
            Each job has its own applicant pool. Upload resumes or add candidates manually, then run AI screening.
            <Link href="/jobs/new" className="ml-1 font-semibold" style={{ color: "var(--accent)" }}>Post another job →</Link>
          </span>
        </div>
      )}
    </div>
  );
}
