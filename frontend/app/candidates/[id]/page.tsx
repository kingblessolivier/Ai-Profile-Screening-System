"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { Candidate } from "@/types";
import {
  ArrowLeft, Briefcase, Calendar, CheckCircle, ExternalLink, Globe, Mail, MapPin,
  Sparkles, User, Users, Award, FolderKanban, AlertTriangle, Building2,
} from "lucide-react";

const AVAIL_STYLE: Record<string, { bg: string; text: string; dot: string }> = {
  "Available": { bg: "#ecfdf5", text: "#059669", dot: "#10b981" },
  "Open to Opportunities": { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b" },
  "Not Available": { bg: "#f8fafc", text: "#94a3b8", dot: "#94a3b8" },
};

export default function CandidateDetailsPage() {
  const params = useParams<{ id: string }>();
  const candidateId = useMemo(() => params?.id || "", [params]);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candidateId) return;

    let active = true;
    setLoading(true);
    setError(null);

    api.get(`/candidates/${candidateId}`)
      .then(({ data }) => {
        if (active) setCandidate(data as Candidate);
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.response?.data?.message || err.message || "Failed to load candidate");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [candidateId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="card p-10 text-center">
          <div className="skeleton h-5 w-48 mx-auto mb-3" />
          <div className="skeleton h-4 w-72 mx-auto mb-2" />
          <div className="skeleton h-4 w-96 mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-8 text-center">
          <p className="font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Candidate not found</p>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>{error || "This candidate could not be loaded."}</p>
          <Link href="/candidates" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white" style={{ background: "var(--accent)" }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Candidates
          </Link>
        </div>
      </div>
    );
  }

  const availStyle = AVAIL_STYLE[candidate.availability.status] || AVAIL_STYLE["Not Available"];
  const fullName = `${candidate.firstName} ${candidate.lastName}`;

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div className="flex items-start gap-3">
          <Link href="/candidates" className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors mt-1">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#059669" }}>
              Candidate Profile
            </p>
            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
              {fullName}
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Full profile, experience, and screening context.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {candidate.socialLinks?.github && (
            <a
              href={candidate.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
            >
              <ExternalLink className="w-4 h-4" />
              GitHub
            </a>
          )}
          <a
            href={`mailto:${candidate.email}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
          >
            <Mail className="w-4 h-4" />
            Email Candidate
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                {candidate.source || "platform"}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: availStyle.bg, color: availStyle.text }}>
                {candidate.availability.status}
              </span>
              {candidate.potentialDuplicate && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--warning-light)", color: "var(--warning)" }}>
                  Possible duplicate
                </span>
              )}
            </div>

            <h2 className="text-lg font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
              Headline & Summary
            </h2>
            <p className="text-sm leading-6 mb-4" style={{ color: "var(--text-secondary)" }}>
              {candidate.headline}
            </p>
            {candidate.bio && (
              <div className="p-4 rounded-xl" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
                <p className="text-sm leading-6" style={{ color: "var(--text-secondary)" }}>
                  {candidate.bio}
                </p>
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Skills
              </h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                {candidate.skills.length} total
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <span key={skill.name} className="text-xs px-3 py-1 rounded-full" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  {skill.name}
                  <span className="ml-1 opacity-70">· {skill.level}</span>
                </span>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Experience
              </h2>
              <span className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                {candidate.experience.length} roles
              </span>
            </div>
            <div className="space-y-4">
              {candidate.experience.map((item, index) => (
                <div key={`${item.company}-${index}`} className="p-4 rounded-xl" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <h3 className="font-semibold" style={{ color: "var(--text-primary)" }}>{item.role}</h3>
                          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.company}</p>
                        </div>
                        <p className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}>
                          {item.startDate} - {item.isCurrent ? "Present" : item.endDate}
                        </p>
                      </div>
                      <p className="text-sm mt-3 leading-6" style={{ color: "var(--text-secondary)" }}>
                        {item.description}
                      </p>
                      {item.technologies?.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.technologies.map((tech) => (
                            <span key={tech} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}>
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {candidate.experience.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No experience entries available.</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Education
              </h2>
              <div className="space-y-3">
                {candidate.education.map((item, index) => (
                  <div key={`${item.institution}-${index}`} className="p-3 rounded-xl" style={{ background: "var(--surface-inset)" }}>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{item.degree}</p>
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>{item.institution}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{item.fieldOfStudy}</p>
                  </div>
                ))}
                {candidate.education.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No education records found.</p>}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                Projects
              </h2>
              <div className="space-y-3">
                {candidate.projects.map((item, index) => (
                  <div key={`${item.name}-${index}`} className="p-3 rounded-xl" style={{ background: "var(--surface-inset)" }}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <p className="font-medium" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                      <p className="text-xs px-2 py-1 rounded-full" style={{ background: "var(--surface)", color: "var(--text-muted)" }}>
                        {item.startDate} - {item.endDate}
                      </p>
                    </div>
                    <p className="text-sm mt-2 leading-6" style={{ color: "var(--text-secondary)" }}>{item.description}</p>
                  </div>
                ))}
                {candidate.projects.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No projects listed.</p>}
              </div>
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
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{fullName}</p>
                  <p style={{ color: "var(--text-muted)" }}>Candidate</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium break-all" style={{ color: "var(--text-primary)" }}>{candidate.email}</p>
                  <p style={{ color: "var(--text-muted)" }}>Email</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{candidate.location}</p>
                  <p style={{ color: "var(--text-muted)" }}>Location</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: availStyle.bg, color: availStyle.text }}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>{candidate.availability.status}</p>
                  <p style={{ color: "var(--text-muted)" }}>{candidate.availability.type}</p>
                </div>
              </div>
              {candidate.jobIds?.length ? (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium" style={{ color: "var(--text-primary)" }}>{candidate.jobIds.length} linked job{candidate.jobIds.length !== 1 ? "s" : ""}</p>
                    <p style={{ color: "var(--text-muted)" }}>Assigned roles</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                Links
              </h2>
              <Globe className="w-4 h-4" style={{ color: "var(--ai)" }} />
            </div>
            <div className="space-y-3 text-sm">
              {candidate.socialLinks?.linkedin && (
                <a href={candidate.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl transition-colors" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  LinkedIn
                </a>
              )}
              {candidate.socialLinks?.github && (
                <a href={candidate.socialLinks.github} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl transition-colors" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  GitHub
                </a>
              )}
              {candidate.socialLinks?.portfolio && (
                <a href={candidate.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="block p-3 rounded-xl transition-colors" style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                  Portfolio
                </a>
              )}
              {!candidate.socialLinks?.linkedin && !candidate.socialLinks?.github && !candidate.socialLinks?.portfolio && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>No social links available.</p>
              )}
            </div>
          </div>

          {candidate.potentialDuplicate && (
            <div className="card p-5" style={{ background: "var(--warning-light)", borderColor: "var(--warning-border)" }}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--warning)" }}>Possible duplicate profile</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                    This candidate was flagged as a potential duplicate during import.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
