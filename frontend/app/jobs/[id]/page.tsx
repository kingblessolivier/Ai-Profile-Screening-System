"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJob } from "@/store/jobsSlice";
import { ArrowLeft, Briefcase, Calendar, Clock, Edit2, MapPin, Search, Sparkles, Zap } from "lucide-react";

const LEVEL_STYLE: Record<string, { bg: string; text: string }> = {
  Junior: { bg: "#ecfdf5", text: "#059669" },
  "Mid-level": { bg: "#eff6ff", text: "#2563eb" },
  Senior: { bg: "#eff6ff", text: "#1d4ed8" },
  Lead: { bg: "#fffbeb", text: "#d97706" },
};

const TYPE_STYLE: Record<string, { bg: string; text: string }> = {
  "Full-time": { bg: "#f0fdf4", text: "#16a34a" },
  "Part-time": { bg: "#fefce8", text: "#ca8a04" },
  Contract: { bg: "#fdf4ff", text: "#a21caf" },
};

export default function JobDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => params?.id || "", [params]);
  const { current } = useSelector((state: RootState) => state.jobs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;

    let active = true;
    setLoading(true);

    dispatch(fetchJob(jobId))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, jobId]);

  if (loading || !current || current._id !== jobId) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card p-10 text-center">
          <div className="skeleton h-5 w-40 mx-auto mb-3" />
          <div className="skeleton h-4 w-64 mx-auto mb-2" />
          <div className="skeleton h-4 w-96 mx-auto" />
        </div>
      </div>
    );
  }

  const job = current;
  const lvlStyle = LEVEL_STYLE[job.experienceLevel] || { bg: "#f8fafc", text: "#64748b" };
  const typeStyle = TYPE_STYLE[job.type] || { bg: "#f8fafc", text: "#64748b" };
  const salaryRange = job.salaryRange;
  const formatSalary = (amount?: number) => (typeof amount === "number" ? amount.toLocaleString() : null);

  return (
    <div className="max-w-5xl mx-auto animate-slide-up">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-start gap-3">
          <Link href="/jobs" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--accent)" }}>
              Job Details
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
              {job.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Full breakdown of the role, requirements, and screening context.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/screening?jobId=${job._id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "var(--ai)" }}
          >
            <Zap className="w-4 h-4" />
            Start Screening
          </Link>
          <Link
            href={`/jobs/${job._id}/edit`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            <Edit2 className="w-4 h-4" />
            Edit Job
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: lvlStyle.bg, color: lvlStyle.text }}>
                {job.experienceLevel}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: typeStyle.bg, color: typeStyle.text }}>
                {job.type}
              </span>
              {job.department && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  {job.department}
                </span>
              )}
            </div>

            <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Description
            </h2>
            <p className="text-sm leading-6 whitespace-pre-line" style={{ color: "var(--text-secondary)" }}>
              {job.description}
            </p>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Responsibilities
              </h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                {job.responsibilities.length} items
              </span>
            </div>
            <div className="space-y-3">
              {job.responsibilities.map((item, index) => (
                <div key={`${item}-${index}`} className="flex gap-3 p-3 rounded-xl" style={{ background: "var(--surface-inset)" }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0 mt-2" style={{ background: "var(--accent)" }} />
                  <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>{item}</p>
                </div>
              ))}
              {job.responsibilities.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No responsibilities were added for this role.</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Required Skills
              </h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                {job.requirements.filter((r) => r.required).length} required
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.requirements.map((req) => (
                <div key={`${req.skill}-${req.level || "any"}`} className="rounded-xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-medium" style={{ color: "var(--text-primary)" }}>{req.skill}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: req.required ? "var(--accent-light)" : "var(--surface-inset)", color: req.required ? "var(--accent)" : "var(--text-muted)" }}>
                      {req.required ? "Required" : "Nice to have"}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
                    {req.level && <span className="px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)" }}>{req.level}</span>}
                    {typeof req.yearsRequired === "number" && <span className="px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)" }}>{req.yearsRequired}+ yrs</span>}
                  </div>
                </div>
              ))}
              {job.requirements.length === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No skills added yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Overview
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{job.location}</p>
                  <p style={{ color: "var(--text-muted)" }}>Location</p>
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
                  <p style={{ color: "var(--text-muted)" }}>Posted</p>
                </div>
              </div>
              {salaryRange ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                      {salaryRange.currency || "Salary"} {formatSalary(salaryRange.min) && formatSalary(salaryRange.max)
                        ? `${formatSalary(salaryRange.min)} - ${formatSalary(salaryRange.max)}`
                        : formatSalary(salaryRange.min)
                          ? `from ${formatSalary(salaryRange.min)}`
                          : formatSalary(salaryRange.max)
                            ? `up to ${formatSalary(salaryRange.max)}`
                            : "not specified"}
                    </p>
                    <p style={{ color: "var(--text-muted)" }}>Salary range</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>Salary range not specified.</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Nice to Have
              </h2>
              <Sparkles className="w-4 h-4" style={{ color: "var(--ai)" }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {job.niceToHave?.map((item) => (
                <span key={item} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  {item}
                </span>
              ))}
              {(job.niceToHave?.length ?? 0) === 0 && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No bonus skills specified.</p>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link
                href={`/screening?jobId=${job._id}`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: "var(--ai)" }}
              >
                <Zap className="w-4 h-4" />
                Run Screening
              </Link>
              <Link
                href={`/jobs/${job._id}/edit`}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-colors"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
              >
                <Edit2 className="w-4 h-4" />
                Edit Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
