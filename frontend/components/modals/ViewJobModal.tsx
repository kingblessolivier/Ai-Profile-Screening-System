"use client";

import { BaseModal } from "./BaseModal";
import {
  MapPin, Briefcase, Clock, DollarSign, Users, CheckCircle2, Circle,
  Star, ListChecks,
} from "lucide-react";

const LEVEL_COLOR: Record<string, { bg: string; text: string }> = {
  Junior:      { bg: "#ecfdf5", text: "#059669" },
  "Mid-level": { bg: "#eff6ff", text: "#2563eb" },
  Senior:      { bg: "#e0e7ff", text: "#4f46e5" },
  Lead:        { bg: "#fef3c7", text: "#b45309" },
};

const TYPE_COLOR: Record<string, { bg: string; text: string }> = {
  "Full-time": { bg: "#f0fdf4", text: "#16a34a" },
  "Part-time": { bg: "#fefce8", text: "#ca8a04" },
  Contract:    { bg: "#fdf4ff", text: "#a21caf" },
};

interface JobRequirement { skill: string; level?: string; yearsRequired?: number; required: boolean; }

interface Job {
  _id: string;
  title: string;
  description: string;
  department?: string;
  location: string;
  type: string;
  experienceLevel: string;
  requirements: JobRequirement[];
  niceToHave?: string[];
  responsibilities: string[];
  salaryRange?: { min: number; max: number; currency: string };
  createdAt?: string;
}

interface ViewJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  candidateCount?: number;
  onEdit?: () => void;
}

export function ViewJobModal({ isOpen, onClose, job, candidateCount, onEdit }: ViewJobModalProps) {
  if (!job) return null;

  const lvl  = LEVEL_COLOR[job.experienceLevel] ?? { bg: "#f8fafc", text: "#64748b" };
  const type = TYPE_COLOR[job.type]             ?? { bg: "#f8fafc", text: "#64748b" };

  const required   = job.requirements.filter((r) => r.required);
  const niceToHave = [
    ...job.requirements.filter((r) => !r.required).map((r) => r.skill),
    ...(job.niceToHave ?? []),
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Job Details"
      size="lg"
      footer={
        onEdit ? (
          <button
            onClick={() => { onClose(); onEdit(); }}
            className="px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Edit Job
          </button>
        ) : undefined
      }
    >
      <div className="space-y-6">

        {/* Title + badges */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap mb-2">
            <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
              style={{ background: lvl.bg, color: lvl.text }}>
              {job.experienceLevel}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0"
              style={{ background: type.bg, color: type.text }}>
              {job.type}
            </span>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}
            </span>
            {job.department && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {job.department}
              </span>
            )}
            {job.salaryRange?.min != null && job.salaryRange?.max != null && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                {job.salaryRange.currency} {job.salaryRange.min.toLocaleString()} – {job.salaryRange.max.toLocaleString()}
              </span>
            )}
            {job.createdAt && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Posted {new Date(job.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            )}
            {candidateCount !== undefined && (
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-400" /> {candidateCount} candidate{candidateCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Description */}
        {job.description && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Description</h4>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{job.description}</p>
          </div>
        )}

        {/* Required skills */}
        {required.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-500" /> Required Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {required.map((r) => (
                <div key={r.skill}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: "#eff6ff", color: "#2563eb" }}>
                  <span>{r.skill}</span>
                  {r.level && <span className="opacity-60">· {r.level}</span>}
                  {r.yearsRequired && <span className="opacity-60">· {r.yearsRequired}y</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nice to have */}
        {niceToHave.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-400" /> Nice to Have
            </h4>
            <div className="flex flex-wrap gap-2">
              {niceToHave.map((skill) => (
                <span key={skill}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border"
                  style={{ background: "#fefce8", color: "#92400e", borderColor: "#fde68a" }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
              <ListChecks className="w-4 h-4 text-emerald-500" /> Responsibilities
            </h4>
            <ul className="space-y-2">
              {job.responsibilities.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Circle className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0 mt-2" style={{ fill: "#94a3b8" }} />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </BaseModal>
  );
}
