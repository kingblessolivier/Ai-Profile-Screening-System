"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs, deleteJob } from "@/store/jobsSlice";
import { toggleJobModal } from "@/store/uiSlice";
import api from "@/lib/api";
import {
  AddJobModal, UploadCandidatesModal, ScreeningModal, EditJobModal,
  ViewJobModal, ViewCandidateModal, AddCandidateModal,
} from "@/components/modals";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  Plus, Upload, Zap, Edit2, Trash2, MapPin, Briefcase,
  Clock, Search, ChevronRight, Users, X,
  ChevronLeft, Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Color maps ───────────────────────────────────────────────────────────────

const LEVEL_COLOR: Record<string, { bg: string; text: string; dot: string }> = {
  Junior:      { bg: "#ecfdf5", text: "#059669", dot: "#10b981" },
  "Mid-level": { bg: "#eff6ff", text: "#2563eb", dot: "#3b82f6" },
  Senior:      { bg: "#e0e7ff", text: "#4f46e5", dot: "#6366f1" },
  Lead:        { bg: "#fef3c7", text: "#b45309", dot: "#f59e0b" },
};

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  "Full-time": { bg: "#f0fdf4", text: "#16a34a" },
  "Part-time": { bg: "#fefce8", text: "#ca8a04" },
  Contract:    { bg: "#fdf4ff", text: "#a21caf" },
};

const SOURCE_COLOR: Record<string, { bg: string; text: string; label: string }> = {
  platform: { bg: "#eff6ff", text: "#2563eb", label: "Manual" },
  csv:      { bg: "#fffbeb", text: "#d97706", label: "CSV"    },
  pdf:      { bg: "#f0f9ff", text: "#0284c7", label: "PDF"    },
};

const AVAIL_CONFIG: Record<string, { dot: string; label: string }> = {
  "Available":             { dot: "#10b981", label: "Available"     },
  "Open to Opportunities": { dot: "#f59e0b", label: "Open"          },
  "Not Available":         { dot: "#94a3b8", label: "Not Available" },
};

interface Candidate {
  _id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email: string;
  headline?: string;
  bio?: string;
  location?: string;
  skills?: Array<{ name: string; level: string; yearsOfExperience?: number }>;
  languages?: Array<{ name: string; proficiency: string }>;
  experience?: Array<{
    company: string; role: string; startDate: string; endDate?: string;
    isCurrent?: boolean; description?: string; technologies?: string[];
  }>;
  education?: Array<{
    institution: string; degree: string; fieldOfStudy?: string;
    startYear?: number; endYear?: number;
  }>;
  certifications?: Array<{ name: string; issuer: string; issueDate?: string }>;
  projects?: Array<{
    name: string; description?: string; technologies?: string[];
    role?: string; link?: string;
  }>;
  availability?: { status: string; type?: string };
  socialLinks?: { linkedin?: string; github?: string; portfolio?: string };
  source?: string;
  potentialDuplicate?: boolean;
  screeningScore?: number;
  matchPercentage?: number;
  createdAt?: string;
}

type SortOption = "default" | "score_desc" | "score_asc" | "name_asc";

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Sk({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded", className)} />;
}

// ─── Left panel — clean job card (Data Explorer style) ───────────────────────

function JobCard({
  job, active, onClick, onView,
}: {
  job: { _id: string; title: string; location: string; experienceLevel: string; type: string };
  active: boolean;
  onClick: () => void;
  onView: (e: React.SyntheticEvent) => void;
}) {
  const lvl = LEVEL_COLOR[job.experienceLevel] ?? { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8" };
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick(e as any)}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-lg transition-all cursor-pointer group",
        active
          ? "bg-blue-50 border border-blue-200 shadow-sm"
          : "hover:bg-slate-50 border border-transparent hover:shadow-xs"
      )}
    >
      <div className="flex items-start gap-2 min-w-0">
        {/* Left accent dot */}
        <span
          className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
          style={{ background: active ? "#2563eb" : lvl.dot }}
        />
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className={cn(
            "text-sm font-semibold truncate leading-snug transition-colors",
            active ? "text-blue-900" : "text-slate-900"
          )}>
            {job.title}
          </p>
          
          {/* Location */}
          <p className="text-xs text-slate-500 mt-1 truncate">
            {job.location || "Remote"}
          </p>
          
          {/* Badges */}
          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded font-medium transition-colors"
              style={{ background: lvl.bg, color: lvl.text }}>
              {job.experienceLevel}
            </span>
            <span className="text-xs px-2 py-0.5 rounded font-medium transition-colors"
              style={{ background: TYPE_COLOR[job.type]?.bg ?? "#f8fafc", color: TYPE_COLOR[job.type]?.text ?? "#64748b" }}>
              {job.type}
            </span>
          </div>
        </div>

        {/* View icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView(e as any);
          }}
          className="p-1 rounded-md flex-shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          title="View job details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Right panel — clean candidate row (Data Explorer style) ────────────────

function CandidateRow({
  candidate, onDelete, onView,
}: {
  candidate: Candidate;
  onDelete: () => void;
  onView: () => void;
}) {
  const fullName = candidate.firstName && candidate.lastName
    ? `${candidate.firstName} ${candidate.lastName}`
    : (candidate.name ?? candidate.email ?? "Unknown");
  const initials = (fullName || "U").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const src      = SOURCE_COLOR[candidate.source ?? "platform"] ?? SOURCE_COLOR.platform;
  const availKey = candidate.availability?.status ?? "";
  const avail    = AVAIL_CONFIG[availKey] ?? { dot: "#94a3b8", label: availKey || "Unknown" };
  const score    = candidate.screeningScore;

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-blue-50/50 transition-all group border-b border-slate-100 last:border-0">
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-sm"
        style={{ background: "linear-gradient(135deg, #dbeafe, #e0f2fe)", color: "#1d4ed8" }}
      >
        {initials}
      </div>

      {/* Name + Meta */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="text-sm font-semibold text-slate-900 truncate">{fullName}</p>
          <span className="text-xs px-1.5 py-0 rounded font-medium flex-shrink-0 transition-colors"
            style={{ background: src.bg, color: src.text }}>
            {src.label}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{candidate.headline || candidate.email}</p>
      </div>

      {/* Score */}
      {score !== undefined && (
        <div className="hidden sm:block flex-shrink-0">
          <ScoreRing score={score} size="sm" showLabel animate />
        </div>
      )}

      {/* Availability dot + label */}
      <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0 text-xs">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: avail.dot }} />
        <span className="text-slate-600 font-medium">{avail.label}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={onView}
          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
          title="View">
          <Eye className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all"
          title="Delete">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Skeletons ────────────────────────────────────────────────────────────────

function JobListSkeleton() {
  return (
    <div className="space-y-1 px-2 pt-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="px-3 py-3">
          <div className="flex gap-2.5">
            <Sk className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" />
            <div className="flex-1">
              <Sk className="h-4 w-3/4 mb-1.5" />
              <Sk className="h-3 w-1/2 mb-2" />
              <div className="flex gap-1">
                <Sk className="h-4 w-14 rounded-md" />
                <Sk className="h-4 w-14 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CandidateListSkeleton() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex items-center gap-3 px-5 py-3 border-b border-slate-100">
          <Sk className="w-9 h-9 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <Sk className="h-4 w-40 mb-1.5" />
            <Sk className="h-3 w-56 mb-1.5" />
            <Sk className="h-3 w-40" />
          </div>
          <Sk className="w-10 h-10 rounded-full hidden sm:block flex-shrink-0" />
          <Sk className="h-3 w-20 rounded-full hidden sm:block" />
        </div>
      ))}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PER_PAGE = 20;

export default function JobsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: jobs, loading: jobsLoading } = useSelector((s: RootState) => s.jobs);
  const modals = useSelector((s: RootState) => s.ui.jobModals);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobSearch,     setJobSearch]     = useState("");
  const [candSearch,    setCandSearch]    = useState("");
  const [candidates,    setCandidates]    = useState<Candidate[]>([]);
  const [candLoading,   setCandLoading]   = useState(false);
  const [page,          setPage]          = useState(1);
  const [mobileView,    setMobileView]    = useState<"list" | "detail">("list");
  const [sortBy,        setSortBy]        = useState<SortOption>("default");

  // Local modal state — no Redux needed for view-only panels
  const [viewJobOpen,  setViewJobOpen]  = useState(false);
  const [viewCandOpen, setViewCandOpen] = useState(false);
  const [addCandOpen,  setAddCandOpen]  = useState(false);
  const [activeCand,   setActiveCand]   = useState<Candidate | null>(null);

  useEffect(() => { dispatch(fetchJobs()); }, [dispatch]);

  useEffect(() => {
    if (jobs.length > 0 && !selectedJobId) setSelectedJobId(jobs[0]._id);
  }, [jobs, selectedJobId]);

  const loadCandidates = (jobId: string) => {
    setCandLoading(true);
    api.get("/candidates", { params: { jobId } })
      .then((r) => setCandidates(r.data?.candidates || []))
      .catch(() => setCandidates([]))
      .finally(() => setCandLoading(false));
  };

  useEffect(() => {
    if (!selectedJobId) return;
    setPage(1);
    setCandSearch("");
    setSortBy("default");
    loadCandidates(selectedJobId);
  }, [selectedJobId]);

  const selectedJob = jobs.find((j) => j._id === selectedJobId) ?? null;
  const lvl  = selectedJob ? (LEVEL_COLOR[selectedJob.experienceLevel] ?? { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8" }) : null;
  const type = selectedJob ? (TYPE_COLOR[selectedJob.type]             ?? { bg: "#f8fafc", text: "#64748b" }) : null;

  const filteredJobs = jobs.filter((j) =>
    !jobSearch ||
    j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
    j.location.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const filtered = candidates.filter((c) => {
    if (!candSearch) return true;
    const q    = candSearch.toLowerCase();
    const name = `${c.firstName ?? ""} ${c.lastName ?? ""} ${c.name ?? ""}`.toLowerCase();
    return (
      name.includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.headline?.toLowerCase().includes(q) ||
      c.skills?.some((s) => s.name.toLowerCase().includes(q))
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "score_desc") return (b.screeningScore ?? -1)  - (a.screeningScore ?? -1);
    if (sortBy === "score_asc")  return (a.screeningScore ?? 999) - (b.screeningScore ?? 999);
    if (sortBy === "name_asc") {
      const na = ((`${a.firstName ?? ""} ${a.lastName ?? ""}`.trim()) || (a.name ?? ""));
      const nb = ((`${b.firstName ?? ""} ${b.lastName ?? ""}`.trim()) || (b.name ?? ""));
      return na.localeCompare(nb);
    }
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const toggle = (modal: keyof typeof modals) => dispatch(toggleJobModal(modal));

  const selectJob = (id: string) => {
    setSelectedJobId(id);
    setMobileView("detail");
  };

  return (
    <div className="-m-3 sm:-m-5 lg:-m-6 flex overflow-hidden bg-slate-50"
      style={{ height: "calc(100vh - 56px)" }}>

      {/* ══════════════ LEFT PANEL ══════════════ */}
      <aside className={cn(
        "flex flex-col bg-white border-r border-slate-200 flex-shrink-0 w-full md:w-64 lg:w-72",
        mobileView === "detail" ? "hidden md:flex" : "flex"
      )}>
        <div className="px-3 pt-4 pb-3 border-b border-slate-200 flex-shrink-0 bg-gradient-to-b from-white to-slate-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-base font-bold text-slate-900">Jobs</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {jobs.length} open position{jobs.length !== 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={() => toggle("addJob")}
              className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              title="Post a new job"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            <input
              type="text" placeholder="Search jobs…" value={jobSearch}
              onChange={(e) => setJobSearch(e.target.value)}
              className="w-full pl-8 pr-7 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
            />
            {jobSearch && (
              <button onClick={() => setJobSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-1.5">
          {jobsLoading ? (
            <JobListSkeleton />
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center px-3">
              <Briefcase className="w-5 h-5 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-medium text-slate-500">
                {jobSearch ? `No jobs match` : "No jobs yet"}
              </p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  active={job._id === selectedJobId}
                  onClick={() => selectJob(job._id)}
                  onView={(e) => {
                    e.stopPropagation();
                    setSelectedJobId(job._id);
                    setViewJobOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* ══════════════ RIGHT PANEL ══════════════ */}
      <main className={cn(
        "flex-1 flex flex-col overflow-hidden min-w-0",
        mobileView === "list" ? "hidden md:flex" : "flex"
      )}>
        <div className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white border-b border-slate-200 flex-shrink-0">
          <button onClick={() => setMobileView("list")}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
            <ChevronLeft className="w-4 h-4" /> All Jobs
          </button>
        </div>

        {!selectedJob ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-5">
              <Briefcase className="w-7 h-7 text-blue-300" />
            </div>
            <p className="text-base font-bold text-slate-800 mb-1">Select a job</p>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed">
              Pick a role from the left panel to view and manage its candidate pool
            </p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* ── Job header ──────────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 px-6 py-4 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 flex-wrap mb-2.5">
                    <h2 className="text-xl font-bold text-slate-900">{selectedJob.title}</h2>
                    {lvl && (
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 shadow-sm"
                        style={{ background: lvl.bg, color: lvl.text }}>
                        {selectedJob.experienceLevel}
                      </span>
                    )}
                    {type && (
                      <span className="text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 shadow-sm"
                        style={{ background: type.bg, color: type.text }}>
                        {selectedJob.type}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600 flex-wrap mb-3">
                    {selectedJob.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" /> {selectedJob.location}
                      </span>
                    )}
                    {selectedJob.department && (
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {selectedJob.department}
                      </span>
                    )}
                    {selectedJob.createdAt && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        Posted {new Date(selectedJob.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                    )}
                  </div>

                  {selectedJob.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedJob.requirements.slice(0, 8).map((r) => (
                        <span key={r.skill} className="text-xs px-2 py-1 rounded-lg font-medium shadow-xs"
                          style={r.required
                            ? { background: "#eff6ff", color: "#2563eb", boxShadow: "0 1px 2px rgba(37, 99, 235, 0.1)" }
                            : { background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0" }}>
                          {r.skill}
                        </span>
                      ))}
                      {selectedJob.requirements.length > 8 && (
                        <span className="text-xs px-2 py-1 rounded-lg text-slate-500 font-medium bg-slate-50 border border-slate-200">
                          +{selectedJob.requirements.length - 8}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setViewJobOpen(true)}
                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                    title="View full details">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => toggle("editJob")}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-100 transition-all"
                    title="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => { dispatch(deleteJob(selectedJob._id)); setSelectedJobId(null); }}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-100 transition-all"
                    title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Candidate toolbar ────────────────────────────────────── */}
            <div className="bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-3 flex-wrap flex-shrink-0">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100">
                <Users className="w-4 h-4 text-slate-600" />
                <span className="font-semibold text-slate-900 text-xs">
                  {candLoading ? "—" : sorted.length}
                </span>
              </div>

              <div className="h-5 w-px bg-slate-200" />

              <div className="relative flex-1 min-w-0 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text" placeholder="Search candidates…" value={candSearch}
                  onChange={(e) => { setCandSearch(e.target.value); setPage(1); }}
                  className="w-full pl-9 pr-7 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
                />
                {candSearch && (
                  <button onClick={() => { setCandSearch(""); setPage(1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggle("uploadCandidates")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                  <Upload className="w-3.5 h-3.5" /> Upload
                </button>
                <button onClick={() => setAddCandOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-sm">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              <button onClick={() => toggle("screening")}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg flex-shrink-0">
                <Zap className="w-3.5 h-3.5" /> Screen Now
              </button>
            </div>

            {/* ── Candidate list ──────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto bg-white">
              {candLoading ? (
                <CandidateListSkeleton />
              ) : paginated.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  {candSearch ? (
                    <>
                      <Search className="w-8 h-8 text-slate-200 mb-3" />
                      <p className="text-sm font-semibold text-slate-600">
                        No candidates match &ldquo;{candSearch}&rdquo;
                      </p>
                      <button onClick={() => setCandSearch("")}
                        className="text-xs text-blue-600 font-semibold mt-2 hover:text-blue-700">
                        Clear search
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                        <Users className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 mb-1">No candidates yet</p>
                      <p className="text-xs text-slate-400 mb-5 max-w-xs leading-relaxed">
                        Upload resumes or add candidates manually to start screening
                      </p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => toggle("uploadCandidates")}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                          <Upload className="w-3.5 h-3.5" /> Upload Resumes
                        </button>
                        <button onClick={() => setAddCandOpen(true)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Add Manually
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                paginated.map((c) => (
                  <CandidateRow
                    key={c._id ?? c.email}
                    candidate={c}
                    onView={() => { setActiveCand(c); setViewCandOpen(true); }}
                    onDelete={() => setCandidates((prev) => prev.filter((x) => x._id !== c._id))}
                  />
                ))
              )}
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="bg-gradient-to-r from-white to-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between flex-shrink-0">
                <p className="text-xs text-slate-600">
                  Page <span className="font-semibold text-slate-900">{page}</span> of{" "}
                  <span className="font-semibold text-slate-900">{totalPages}</span>
                  <span className="text-slate-500 ml-2">· {sorted.length} total</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {/* ── Standard modals ─────────────────────────────────────────── */}
      <AddJobModal
        isOpen={modals.addJob}
        onClose={() => toggle("addJob")}
        onSubmit={async () => {}}
      />

      {selectedJob && (
        <>
          <UploadCandidatesModal
            isOpen={modals.uploadCandidates}
            onClose={() => toggle("uploadCandidates")}
            jobId={selectedJob._id}
            jobTitle={selectedJob.title}
            onSuccess={() => loadCandidates(selectedJob._id)}
          />
          <ScreeningModal
            isOpen={modals.screening}
            onClose={() => toggle("screening")}
            job={selectedJob}
            candTotal={candidates.length}
          />
          <EditJobModal
            isOpen={modals.editJob}
            onClose={() => toggle("editJob")}
            job={selectedJob}
            onSubmit={async () => {}}
          />
        </>
      )}

      {/* ── New view / add modals ────────────────────────────────────── */}
      <ViewJobModal
        isOpen={viewJobOpen}
        onClose={() => setViewJobOpen(false)}
        job={selectedJob}
        candidateCount={candidates.length}
        onEdit={() => toggle("editJob")}
      />

      <ViewCandidateModal
        isOpen={viewCandOpen}
        onClose={() => { setViewCandOpen(false); setActiveCand(null); }}
        candidate={activeCand}
      />

      {selectedJob && (
        <AddCandidateModal
          isOpen={addCandOpen}
          onClose={() => setAddCandOpen(false)}
          jobId={selectedJob._id}
          onAdded={(newCand) => setCandidates((prev) => [newCand, ...prev])}
        />
      )}
    </div>
  );
}
