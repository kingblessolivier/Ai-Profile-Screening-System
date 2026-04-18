"use client";

import { BaseModal } from "./BaseModal";
import {
  MapPin, Mail, Briefcase, GraduationCap, Code2, Award,
  Globe, ExternalLink, Calendar, CheckCircle2,
  AlertTriangle, Clock,
} from "lucide-react";

const SKILL_LEVEL_COLOR: Record<string, { bg: string; text: string }> = {
  Beginner:     { bg: "#f8fafc", text: "#64748b" },
  Intermediate: { bg: "#eff6ff", text: "#2563eb" },
  Advanced:     { bg: "#e0e7ff", text: "#4f46e5" },
  Expert:       { bg: "#fdf4ff", text: "#a21caf" },
};

const AVAIL_CONFIG: Record<string, { bg: string; text: string; dot: string }> = {
  "Available":             { bg: "#f0fdf4", text: "#16a34a", dot: "#10b981" },
  "Open to Opportunities": { bg: "#fffbeb", text: "#b45309", dot: "#f59e0b" },
  "Not Available":         { bg: "#f8fafc", text: "#64748b", dot: "#94a3b8" },
};

const SCORE_COLOR = (s: number) =>
  s >= 80 ? "#059669" : s >= 60 ? "#2563eb" : s >= 40 ? "#d97706" : "#ef4444";

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

interface ViewCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: Candidate | null;
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-1.5">
        {icon} {title}
      </h4>
      {children}
    </div>
  );
}

export function ViewCandidateModal({ isOpen, onClose, candidate }: ViewCandidateModalProps) {
  if (!candidate) return null;

  const fullName = candidate.firstName && candidate.lastName
    ? `${candidate.firstName} ${candidate.lastName}`
    : (candidate.name ?? candidate.email);
  const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const avail    = AVAIL_CONFIG[candidate.availability?.status ?? ""] ?? AVAIL_CONFIG["Not Available"];
  const score    = candidate.screeningScore;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Candidate Profile" size="xl">
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-start gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg,#dbeafe,#e0f2fe)", color: "#1d4ed8" }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="text-lg font-bold text-slate-900">{fullName}</h3>
              {candidate.potentialDuplicate && (
                <span className="flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Possible duplicate
                </span>
              )}
            </div>
            {candidate.headline && (
              <p className="text-sm text-slate-600 mb-1.5">{candidate.headline}</p>
            )}
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              <a href={`mailto:${candidate.email}`}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                <Mail className="w-3 h-3" /> {candidate.email}
              </a>
              {candidate.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {candidate.location}
                </span>
              )}
            </div>
          </div>

          {/* Score badge */}
          {score !== undefined && (
            <div className="flex-shrink-0 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-bold"
                style={{ background: `${SCORE_COLOR(score)}15`, color: SCORE_COLOR(score) }}
              >
                <span className="text-xl leading-none">{score}</span>
                <span className="text-xs font-normal opacity-70">score</span>
              </div>
            </div>
          )}
        </div>

        {/* Availability + social */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: avail.bg, color: avail.text }}>
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: avail.dot }} />
            {candidate.availability?.status ?? "Unknown"}
            {candidate.availability?.type && ` · ${candidate.availability.type}`}
          </span>
          {candidate.socialLinks?.linkedin && (
            <a href={candidate.socialLinks.linkedin} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
              <Globe className="w-3.5 h-3.5" /> LinkedIn
            </a>
          )}
          {candidate.socialLinks?.github && (
            <a href={candidate.socialLinks.github} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-slate-600 hover:underline">
              <Globe className="w-3.5 h-3.5" /> GitHub
            </a>
          )}
          {candidate.socialLinks?.portfolio && (
            <a href={candidate.socialLinks.portfolio} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:underline">
              <Globe className="w-3.5 h-3.5" /> Portfolio
            </a>
          )}
        </div>

        {candidate.bio && (
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
            {candidate.bio}
          </p>
        )}

        <hr className="border-slate-100" />

        {/* Skills */}
        {candidate.skills && candidate.skills.length > 0 && (
          <Section title="Skills" icon={<Code2 className="w-4 h-4 text-blue-500" />}>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((s) => {
                const c = SKILL_LEVEL_COLOR[s.level] ?? SKILL_LEVEL_COLOR.Intermediate;
                return (
                  <div key={s.name}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: c.bg, color: c.text }}>
                    <span>{s.name}</span>
                    <span className="opacity-50">·</span>
                    <span className="opacity-70">{s.level}</span>
                    {s.yearsOfExperience !== undefined && s.yearsOfExperience > 0 && (
                      <span className="opacity-50">{s.yearsOfExperience}y</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* Experience */}
        {candidate.experience && candidate.experience.length > 0 && (
          <Section title="Experience" icon={<Briefcase className="w-4 h-4 text-emerald-500" />}>
            <div className="space-y-4">
              {candidate.experience.map((exp, i) => (
                <div key={i} className="relative pl-4 border-l-2 border-slate-100">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-300" />
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{exp.role}</p>
                      <p className="text-xs text-slate-500">{exp.company}</p>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="w-3 h-3" />
                      {exp.startDate}
                      {" – "}
                      {exp.isCurrent ? "Present" : (exp.endDate ?? "")}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{exp.description}</p>
                  )}
                  {exp.technologies && exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {exp.technologies.map((t) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-500">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Education */}
        {candidate.education && candidate.education.length > 0 && (
          <Section title="Education" icon={<GraduationCap className="w-4 h-4 text-indigo-500" />}>
            <div className="space-y-3">
              {candidate.education.map((edu, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {edu.degree}{edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                    </p>
                    <p className="text-xs text-slate-500">{edu.institution}</p>
                  </div>
                  {(edu.startYear || edu.endYear) && (
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {edu.startYear ?? ""}–{edu.endYear ?? ""}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certifications */}
        {candidate.certifications && candidate.certifications.length > 0 && (
          <Section title="Certifications" icon={<Award className="w-4 h-4 text-amber-500" />}>
            <div className="space-y-2">
              {candidate.certifications.map((cert, i) => (
                <div key={i} className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{cert.name}</p>
                    <p className="text-xs text-slate-500">{cert.issuer}</p>
                  </div>
                  {cert.issueDate && (
                    <span className="text-xs text-slate-400 flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3" /> {cert.issueDate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {candidate.projects && candidate.projects.length > 0 && (
          <Section title="Projects" icon={<CheckCircle2 className="w-4 h-4 text-purple-500" />}>
            <div className="space-y-4">
              {candidate.projects.map((proj, i) => (
                <div key={i} className="rounded-xl border border-slate-100 px-4 py-3 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-800">{proj.name}</p>
                    {proj.link && (
                      <a href={proj.link} target="_blank" rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-600 flex-shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-xs text-slate-500 leading-relaxed mb-2">{proj.description}</p>
                  )}
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.map((t) => (
                        <span key={t} className="text-xs px-1.5 py-0.5 rounded font-medium bg-white border border-slate-200 text-slate-500">{t}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Languages */}
        {candidate.languages && candidate.languages.length > 0 && (
          <Section title="Languages" icon={<Globe className="w-4 h-4 text-teal-500" />}>
            <div className="flex flex-wrap gap-2">
              {candidate.languages.map((l) => (
                <span key={l.name}
                  className="text-xs px-2.5 py-1 rounded-lg font-medium bg-teal-50 text-teal-700">
                  {l.name} <span className="opacity-60">· {l.proficiency}</span>
                </span>
              ))}
            </div>
          </Section>
        )}

      </div>
    </BaseModal>
  );
}
