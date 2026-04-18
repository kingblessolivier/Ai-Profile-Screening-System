"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJob } from "@/store/jobsSlice";
import { fetchCandidates, deleteCandidate } from "@/store/candidatesSlice";
import api from "@/lib/api";
import {
  ArrowLeft, Briefcase, Calendar, Edit2, MapPin, Sparkles, Zap,
  Upload, Plus, Users, FileText, Trash2, ExternalLink, Eye,
  CheckCircle, AlertTriangle, Search, Loader2, Database,
} from "lucide-react";

// ─── Style maps ───────────────────────────────────────────────────────────────

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  Junior:      { bg: "#ecfdf5", text: "#059669" },
  "Mid-level": { bg: "#eff6ff", text: "#2563eb" },
  Senior:      { bg: "#eff6ff", text: "#1d4ed8" },
  Lead:        { bg: "#fffbeb", text: "#d97706" },
};
const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  "Full-time": { bg: "#f0fdf4", text: "#16a34a" },
  "Part-time": { bg: "#fefce8", text: "#ca8a04" },
  Contract:    { bg: "#fdf4ff", text: "#a21caf" },
};
const SOURCE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  platform: { bg: "#eff6ff", text: "#2563eb", label: "Manual" },
  csv:      { bg: "#fffbeb", text: "#d97706", label: "CSV" },
  pdf:      { bg: "#f0f9ff", text: "#0284c7", label: "PDF" },
};
const AVAIL_COLOR: Record<string, string> = {
  "Available":             "#059669",
  "Open to Opportunities": "#d97706",
  "Not Available":         "#94a3b8",
};

// ─── Candidate mini-card ──────────────────────────────────────────────────────

function CandidateMiniCard({ c, onDelete }: {
  c: { _id: string; firstName: string; lastName: string; email: string; headline: string; location: string; skills: { name: string }[]; availability: { status: string }; experience: unknown[]; projects: unknown[]; source?: string; potentialDuplicate?: boolean; socialLinks?: { github?: string } };
  onDelete: (id: string) => void;
}) {
  const src   = SOURCE_STYLE[c.source || "platform"] || SOURCE_STYLE.platform;
  const avail = AVAIL_COLOR[c.availability.status] || "#94a3b8";

  return (
    <div className="card card-hover p-4 flex flex-col gap-3">
      {/* Top */}
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #dbeafe, #e0f2fe)", color: "#1d4ed8" }}>
          {c.firstName[0]}{c.lastName[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
            <span className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
              {c.firstName} {c.lastName}
            </span>
            <span className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: src.bg, color: src.text }}>
              {src.label}
            </span>
          </div>
          <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{c.headline}</p>
        </div>
        <button
          onClick={() => onDelete(c._id)}
          className="p-1.5 rounded-lg transition-colors flex-shrink-0"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error-light)"; e.currentTarget.style.color = "var(--error)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Duplicate warning */}
      {c.potentialDuplicate && (
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
          style={{ background: "var(--warning-light)", border: "1px solid var(--warning-border)", color: "var(--warning)" }}>
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />Possible duplicate
        </div>
      )}

      {/* Availability + location */}
      <div className="flex items-center gap-3 text-xs" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1 font-medium" style={{ color: avail }}>
          <CheckCircle className="w-3 h-3" />{c.availability.status}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3" />{c.location}
        </span>
      </div>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5">
        {c.skills.slice(0, 4).map((s) => (
          <span key={s.name} className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
            {s.name}
          </span>
        ))}
        {c.skills.length > 4 && (
          <span className="text-xs px-2 py-0.5 rounded-full"
            style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}>
            +{c.skills.length - 4}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 text-xs"
        style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}>
        <span>{c.experience.length} role{c.experience.length !== 1 ? "s" : ""} · {c.projects.length} project{c.projects.length !== 1 ? "s" : ""}</span>
        <div className="flex items-center gap-3">
          {c.socialLinks?.github && (
            <a href={c.socialLinks.github} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
              <ExternalLink className="w-3 h-3" />GitHub
            </a>
          )}
          <Link href={`/candidates/${c._id}`}
            className="flex items-center gap-1 transition-colors"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
            <Eye className="w-3 h-3" />View
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function JobDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params   = useParams<{ id: string }>();
  const jobId    = useMemo(() => params?.id || "", [params]);

  const { current }                          = useSelector((s: RootState) => s.jobs);
  const { items: candidates, loading: cLoading } = useSelector((s: RootState) => s.candidates);

  const [jobLoading, setJobLoading]   = useState(true);
  const [candSearch, setCandSearch]   = useState("");
  const [seedLoading, setSeedLoading] = useState(false);
  const [seedMsg, setSeedMsg]         = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleteMsg, setDeleteMsg]     = useState<{ type: "success" | "error"; text: string; id?: string } | null>(null);

  // Load job
  useEffect(() => {
    if (!jobId) return;
    let active = true;
    setJobLoading(true);
    dispatch(fetchJob(jobId)).finally(() => { if (active) setJobLoading(false); });
    return () => { active = false; };
  }, [dispatch, jobId]);

  // Load candidates for this job
  useEffect(() => {
    if (!jobId) return;
    dispatch(fetchCandidates({ jobId }));
  }, [dispatch, jobId]);

  const handleDeleteCandidate = async (id: string) => {
    try {
      await dispatch(deleteCandidate(id)).unwrap();
      setDeleteMsg({ type: "success", text: "Candidate deleted successfully", id });
      setTimeout(() => setDeleteMsg(null), 3000);
    } catch (err) {
      setDeleteMsg({ type: "error", text: String(err).includes("404") ? "Candidate not found" : "Failed to delete candidate" });
      setTimeout(() => setDeleteMsg(null), 4000);
    }
  };

  const filteredCandidates = candidates.filter((c) =>
    !candSearch ||
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(candSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(candSearch.toLowerCase()) ||
    c.skills.some((s) => s.name.toLowerCase().includes(candSearch.toLowerCase()))
  );

  const handleSeedDemo = async () => {
    setSeedLoading(true);
    setSeedMsg(null);
    try {
      const { DUMMY_CANDIDATES } = await import("@/lib/dummyData");
      const { data } = await api.post("/candidates/bulk", { candidates: DUMMY_CANDIDATES, jobId });
      setSeedMsg({ type: "success", text: `${data.total} demo candidates loaded for this job.` });
      dispatch(fetchCandidates({ jobId }));
    } catch {
      setSeedMsg({ type: "error", text: "Failed to load demo data." });
    } finally {
      setSeedLoading(false);
      setTimeout(() => setSeedMsg(null), 4000);
    }
  };

  if (jobLoading || !current || current._id !== jobId) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card p-10 text-center">
          <div className="skeleton h-6 w-48 mx-auto mb-3" />
          <div className="skeleton h-4 w-64 mx-auto mb-2" />
          <div className="skeleton h-4 w-96 mx-auto" />
        </div>
      </div>
    );
  }

  const job       = current;
  const lvlStyle  = LEVEL_STYLE[job.experienceLevel] || { bg: "#f8fafc", text: "#64748b" };
  const typeStyle = TYPE_STYLE[job.type]             || { bg: "#f8fafc", text: "#64748b" };
  const sal       = job.salaryRange;

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-start gap-3">
          <Link href="/candidates"
            className="p-2 rounded-lg transition-colors mt-1"
            style={{ color: "var(--text-muted)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-inset)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs font-bold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
              Job Details
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
              {job.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Manage candidates and run AI screening for this role
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/screening?jobId=${job._id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "var(--ai)" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(2,132,199,0.3)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
            <Zap className="w-4 h-4" />Start Screening
          </Link>
          <Link href={`/jobs/${job._id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
            <Edit2 className="w-4 h-4" />Edit Job
          </Link>
        </div>
      </div>

      {/* ── Job info grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-5">

          {/* Description */}
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: lvlStyle.bg, color: lvlStyle.text }}>{job.experienceLevel}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: typeStyle.bg, color: typeStyle.text }}>{job.type}</span>
              {job.department && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>{job.department}</span>}
            </div>
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Description</h2>
            <p className="text-sm leading-6 whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>{job.description}</p>
          </div>

          {/* Responsibilities */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Responsibilities</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>{job.responsibilities.length} items</span>
            </div>
            <div className="space-y-2">
              {job.responsibilities.map((item, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: "var(--surface-inset)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "var(--accent)" }} />
                  <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{item}</p>
                </div>
              ))}
              {job.responsibilities.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No responsibilities listed.</p>}
            </div>
          </div>

          {/* Required skills */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Required Skills</h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>{job.requirements.filter((r) => r.required).length} required</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.requirements.map((req) => (
                <div key={`${req.skill}-${req.level || "any"}`} className="rounded-xl border p-4"
                  style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-medium text-sm" style={{ color: "var(--text-primary)" }}>{req.skill}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: req.required ? "var(--accent-light)" : "var(--surface-inset)", color: req.required ? "var(--accent)" : "var(--text-muted)" }}>
                      {req.required ? "Required" : "Nice to have"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {req.level && <span className="px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)" }}>{req.level}</span>}
                    {typeof req.yearsRequired === "number" && <span className="px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)" }}>{req.yearsRequired}+ yrs</span>}
                  </div>
                </div>
              ))}
              {job.requirements.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No skills listed.</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">

          {/* Overview */}
          <div className="card p-5">
            <h2 className="text-base font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Overview</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{job.location}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Location</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Unknown"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>Posted</p>
                </div>
              </div>
              {sal && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {sal.currency} {sal.min && sal.max ? `${sal.min.toLocaleString()} – ${sal.max.toLocaleString()}` : sal.min?.toLocaleString() ?? sal.max?.toLocaleString() ?? "—"}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Salary range</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nice to have */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold" style={{ color: "var(--text-primary)" }}>Nice to Have</h2>
              <Sparkles className="w-4 h-4" style={{ color: "var(--ai)" }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {(job.niceToHave ?? []).map((item) => (
                <span key={item} className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>{item}</span>
              ))}
              {(job.niceToHave?.length ?? 0) === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>None specified.</p>}
            </div>
          </div>

          {/* Quick actions */}
          <div className="card p-5">
            <h2 className="text-base font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Quick Actions</h2>
            <div className="space-y-2">
              <Link href={`/screening?jobId=${job._id}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "var(--ai)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(2,132,199,0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <Zap className="w-4 h-4" />Run AI Screening
              </Link>
              <Link href={`/jobs/${job._id}/edit`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                <Edit2 className="w-4 h-4" />Edit Details
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Candidates Section ═════════════════════════════════════════════════ */}
      <div>
        {/* Section header */}
        <div
          className="flex items-center justify-between gap-4 px-6 py-4 rounded-t-2xl flex-wrap"
          style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)" }}>
              <Users className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Candidates for this Job</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {candidates.length} candidate{candidates.length !== 1 ? "s" : ""} in pool · AI screening uses this pool
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/candidates/upload?jobId=${job._id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
              <Upload className="w-3.5 h-3.5" />Upload Resumes
            </Link>
            <Link href={`/candidates/new?jobId=${job._id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
              <Plus className="w-3.5 h-3.5" />Add Manually
            </Link>
            <button onClick={handleSeedDemo} disabled={seedLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
              style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.12)" }}
              onMouseEnter={(e) => { if (!seedLoading) { e.currentTarget.style.background = "rgba(255,255,255,0.14)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}>
              {seedLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              Demo Data
            </button>
          </div>
        </div>

        {/* Seed message */}
        {seedMsg && (
          <div className="px-6 py-3 text-sm font-medium"
            style={{
              background: seedMsg.type === "success" ? "var(--success-light)" : "var(--error-light)",
              color: seedMsg.type === "success" ? "var(--success)" : "var(--error)",
              border: `1px solid ${seedMsg.type === "success" ? "var(--success-border)" : "var(--error-border)"}`,
              borderTop: "none",
            }}>
            {seedMsg.text}
          </div>
        )}

        {/* Delete message */}
        {deleteMsg && (
          <div className="fixed bottom-4 right-4 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2"
            style={{
              background: deleteMsg.type === "success" ? "var(--success)" : "var(--error)",
              color: "white",
            }}>
            {deleteMsg.type === "success" ? (
              <>
                <CheckCircle className="w-4 h-4" />
                {deleteMsg.text}
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                {deleteMsg.text}
              </>
            )}
          </div>
        )}

        {/* Search + content */}
        <div className="border border-t-0 rounded-b-2xl overflow-hidden"
          style={{ borderColor: "rgba(0,0,0,0.08)" }}>

          {candidates.length > 0 && (
            <div className="px-5 py-3" style={{ background: "var(--surface-inset)", borderBottom: "1px solid var(--border)" }}>
              <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: "var(--text-muted)" }} />
                <input
                  value={candSearch}
                  onChange={(e) => setCandSearch(e.target.value)}
                  placeholder="Search candidates…"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.1)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          )}

          <div className="p-5" style={{ background: "var(--canvas)" }}>
            {cLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card p-4">
                    <div className="flex gap-3 mb-3">
                      <div className="skeleton w-9 h-9 rounded-full" />
                      <div className="flex-1"><div className="skeleton h-4 w-2/3 mb-2" /><div className="skeleton h-3 w-1/2" /></div>
                    </div>
                    <div className="skeleton h-3 w-3/4 mb-2" />
                    <div className="flex gap-2"><div className="skeleton h-5 w-14 rounded-full" /><div className="skeleton h-5 w-14 rounded-full" /></div>
                  </div>
                ))}
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#ecfdf5" }}>
                  <FileText className="w-7 h-7" style={{ color: "#059669" }} />
                </div>
                <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  {candSearch ? "No candidates match your search" : "No candidates yet for this job"}
                </p>
                <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
                  {candSearch ? "Try clearing the search" : "Upload PDF resumes, add manually, or load demo data"}
                </p>
                {!candSearch && (
                  <div className="flex items-center justify-center gap-3 flex-wrap">
                    <Link href={`/candidates/upload?jobId=${job._id}`}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                      style={{ background: "var(--ai)" }}>
                      <Upload className="w-4 h-4" />Upload Resumes
                    </Link>
                    <Link href={`/candidates/new?jobId=${job._id}`}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                      <Plus className="w-4 h-4" />Add Manually
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredCandidates.map((c) => (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  <CandidateMiniCard key={c._id} c={c as any} onDelete={handleDeleteCandidate} />
                ))}
              </div>
            )}
          </div>

          {/* Screen CTA when candidates exist */}
          {candidates.length > 0 && (
            <div className="px-5 py-4 flex items-center justify-between gap-4 flex-wrap"
              style={{ background: "var(--surface)", borderTop: "1px solid var(--border)" }}>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                <strong style={{ color: "var(--text-primary)" }}>{candidates.length}</strong> candidate{candidates.length !== 1 ? "s" : ""} ready for AI screening
              </p>
              <Link href={`/screening?jobId=${job._id}`}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: "linear-gradient(135deg, #0a1628, #2563eb)" }}
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.35)")}
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                <Zap className="w-4 h-4" />
                Run AI Screening
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
