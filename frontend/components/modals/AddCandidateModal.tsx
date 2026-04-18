"use client";

import { useState } from "react";
import { BaseModal } from "./BaseModal";
import { Loader, Plus, Trash2, X } from "lucide-react";
import api from "@/lib/api";

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  onAdded: (candidate: any) => void;
}

type Tab = "basic" | "skills" | "experience" | "education" | "projects" | "social";

const TABS: { id: Tab; label: string }[] = [
  { id: "basic",      label: "Basic"       },
  { id: "skills",     label: "Skills"      },
  { id: "experience", label: "Experience"  },
  { id: "education",  label: "Education"   },
  { id: "projects",   label: "Projects"    },
  { id: "social",     label: "Social"      },
];

const INPUT = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white";
const LABEL = "block text-xs font-semibold text-slate-600 mb-1";
const SECTION = "space-y-4";
const ADD_BTN = "inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1";
const CARD = "rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50 relative";

function tags(raw: string): string[] {
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function AddCandidateModal({ isOpen, onClose, jobId, onAdded }: AddCandidateModalProps) {
  const [tab, setTab] = useState<Tab>("basic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Basic
  const [basic, setBasic] = useState({
    firstName: "", lastName: "", email: "", headline: "",
    bio: "", location: "",
    availStatus: "Available" as "Available" | "Open to Opportunities" | "Not Available",
    availType: "Full-time" as "Full-time" | "Part-time" | "Contract",
    availStartDate: "",
  });

  // ── Skills
  const [skills, setSkills] = useState<{ name: string; level: string; years: string }[]>([]);

  // ── Languages
  const [languages, setLanguages] = useState<{ name: string; proficiency: string }[]>([]);

  // ── Experience
  const [experiences, setExperiences] = useState<{
    company: string; role: string; startDate: string; endDate: string;
    isCurrent: boolean; description: string; technologies: string;
  }[]>([]);

  // ── Education
  const [educations, setEducations] = useState<{
    institution: string; degree: string; fieldOfStudy: string;
    startYear: string; endYear: string;
  }[]>([]);

  // ── Certifications
  const [certs, setCerts] = useState<{ name: string; issuer: string; issueDate: string }[]>([]);

  // ── Projects
  const [projects, setProjects] = useState<{
    name: string; description: string; technologies: string;
    role: string; link: string;
  }[]>([]);

  // ── Social
  const [social, setSocial] = useState({ linkedin: "", github: "", portfolio: "", twitter: "" });

  const reset = () => {
    setTab("basic");
    setBasic({ firstName: "", lastName: "", email: "", headline: "", bio: "", location: "", availStatus: "Available", availType: "Full-time", availStartDate: "" });
    setSkills([]); setLanguages([]); setExperiences([]);
    setEducations([]); setCerts([]); setProjects([]);
    setSocial({ linkedin: "", github: "", portfolio: "", twitter: "" });
    setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async () => {
    if (!basic.firstName.trim() || !basic.lastName.trim() || !basic.email.trim()) {
      setTab("basic");
      setError("First name, last name, and email are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/candidates", {
        firstName: basic.firstName.trim(),
        lastName:  basic.lastName.trim(),
        email:     basic.email.trim(),
        headline:  basic.headline.trim(),
        bio:       basic.bio.trim() || undefined,
        location:  basic.location.trim(),
        availability: {
          status:    basic.availStatus,
          type:      basic.availType,
          startDate: basic.availStartDate || undefined,
        },
        skills: skills.map((s) => ({
          name: s.name.trim(),
          level: s.level,
          yearsOfExperience: Number(s.years) || 0,
        })).filter((s) => s.name),
        languages: languages.map((l) => ({ name: l.name.trim(), proficiency: l.proficiency })).filter((l) => l.name),
        experience: experiences.map((e) => ({
          company: e.company.trim(), role: e.role.trim(),
          startDate: e.startDate, endDate: e.isCurrent ? "" : e.endDate,
          isCurrent: e.isCurrent,
          description: e.description.trim(),
          technologies: tags(e.technologies),
        })).filter((e) => e.company && e.role),
        education: educations.map((e) => ({
          institution: e.institution.trim(), degree: e.degree.trim(),
          fieldOfStudy: e.fieldOfStudy.trim(),
          startYear: Number(e.startYear) || 0,
          endYear: Number(e.endYear) || 0,
        })).filter((e) => e.institution && e.degree),
        certifications: certs.map((c) => ({
          name: c.name.trim(), issuer: c.issuer.trim(), issueDate: c.issueDate,
        })).filter((c) => c.name),
        projects: projects.map((p) => ({
          name: p.name.trim(), description: p.description.trim(),
          technologies: tags(p.technologies),
          role: p.role.trim(), link: p.link.trim() || undefined,
          startDate: "", endDate: "",
        })).filter((p) => p.name),
        socialLinks: {
          linkedin:  social.linkedin.trim()  || undefined,
          github:    social.github.trim()    || undefined,
          portfolio: social.portfolio.trim() || undefined,
          twitter:   social.twitter.trim()   || undefined,
        },
        source: "platform",
        jobIds: [jobId],
      });
      onAdded(data);
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to add candidate.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Candidate"
      description="Manually add a candidate to this job"
      size="xl"
      footer={
        <>
          {error && <p className="flex-1 text-xs text-red-600">{error}</p>}
          <button onClick={handleClose} disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-60">
            {loading && <Loader className="w-4 h-4 animate-spin" />}
            {loading ? "Adding…" : "Add Candidate"}
          </button>
        </>
      }
    >
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-100 mb-5 -mt-1 overflow-x-auto">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
              tab === t.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BASIC ── */}
      {tab === "basic" && (
        <div className={SECTION}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>First Name *</label>
              <input className={INPUT} placeholder="Alice" value={basic.firstName}
                onChange={(e) => setBasic((b) => ({ ...b, firstName: e.target.value }))} />
            </div>
            <div>
              <label className={LABEL}>Last Name *</label>
              <input className={INPUT} placeholder="Smith" value={basic.lastName}
                onChange={(e) => setBasic((b) => ({ ...b, lastName: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className={LABEL}>Email *</label>
            <input type="email" className={INPUT} placeholder="alice@example.com" value={basic.email}
              onChange={(e) => setBasic((b) => ({ ...b, email: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Headline *</label>
            <input className={INPUT} placeholder='e.g. "Backend Engineer – Node.js & AI Systems"' value={basic.headline}
              onChange={(e) => setBasic((b) => ({ ...b, headline: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Bio</label>
            <textarea className={INPUT} rows={3} placeholder="Detailed professional biography…" value={basic.bio}
              onChange={(e) => setBasic((b) => ({ ...b, bio: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Location *</label>
            <input className={INPUT} placeholder="Kigali, Rwanda" value={basic.location}
              onChange={(e) => setBasic((b) => ({ ...b, location: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={LABEL}>Availability Status</label>
              <select className={INPUT} value={basic.availStatus}
                onChange={(e) => setBasic((b) => ({ ...b, availStatus: e.target.value as any }))}>
                <option>Available</option>
                <option>Open to Opportunities</option>
                <option>Not Available</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Availability Type</label>
              <select className={INPUT} value={basic.availType}
                onChange={(e) => setBasic((b) => ({ ...b, availType: e.target.value as any }))}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Available From</label>
              <input type="date" className={INPUT} value={basic.availStartDate}
                onChange={(e) => setBasic((b) => ({ ...b, availStartDate: e.target.value }))} />
            </div>
          </div>
        </div>
      )}

      {/* ── SKILLS ── */}
      {tab === "skills" && (
        <div className={SECTION}>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">Skills</p>
            {skills.map((s, i) => (
              <div key={i} className={CARD}>
                <button onClick={() => setSkills((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className={LABEL}>Skill Name</label>
                    <input className={INPUT} placeholder="React" value={s.name}
                      onChange={(e) => setSkills((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  </div>
                  <div>
                    <label className={LABEL}>Level</label>
                    <select className={INPUT} value={s.level}
                      onChange={(e) => setSkills((p) => p.map((x, j) => j === i ? { ...x, level: e.target.value } : x))}>
                      <option>Beginner</option><option>Intermediate</option>
                      <option>Advanced</option><option>Expert</option>
                    </select>
                  </div>
                  <div>
                    <label className={LABEL}>Years</label>
                    <input type="number" min={0} className={INPUT} placeholder="3" value={s.years}
                      onChange={(e) => setSkills((p) => p.map((x, j) => j === i ? { ...x, years: e.target.value } : x))} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setSkills((p) => [...p, { name: "", level: "Intermediate", years: "" }])} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">Languages</p>
            {languages.map((l, i) => (
              <div key={i} className={CARD}>
                <button onClick={() => setLanguages((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Language</label>
                    <input className={INPUT} placeholder="English" value={l.name}
                      onChange={(e) => setLanguages((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} />
                  </div>
                  <div>
                    <label className={LABEL}>Proficiency</label>
                    <select className={INPUT} value={l.proficiency}
                      onChange={(e) => setLanguages((p) => p.map((x, j) => j === i ? { ...x, proficiency: e.target.value } : x))}>
                      <option>Basic</option><option>Conversational</option>
                      <option>Fluent</option><option>Native</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setLanguages((p) => [...p, { name: "", proficiency: "Fluent" }])} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" /> Add Language
            </button>
          </div>
        </div>
      )}

      {/* ── EXPERIENCE ── */}
      {tab === "experience" && (
        <div className={SECTION}>
          {experiences.map((e, i) => (
            <div key={i} className={CARD}>
              <button onClick={() => setExperiences((p) => p.filter((_, j) => j !== i))}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL}>Company</label>
                  <input className={INPUT} placeholder="Acme Corp" value={e.company}
                    onChange={(ev) => setExperiences((p) => p.map((x, j) => j === i ? { ...x, company: ev.target.value } : x))} />
                </div>
                <div>
                  <label className={LABEL}>Role</label>
                  <input className={INPUT} placeholder="Senior Engineer" value={e.role}
                    onChange={(ev) => setExperiences((p) => p.map((x, j) => j === i ? { ...x, role: ev.target.value } : x))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL}>Start Date</label>
                  <input type="month" className={INPUT} value={e.startDate}
                    onChange={(ev) => setExperiences((p) => p.map((x, j) => j === i ? { ...x, startDate: ev.target.value } : x))} />
                </div>
                <div>
                  <label className={LABEL}>End Date</label>
                  <input type="month" className={INPUT} value={e.endDate} disabled={e.isCurrent}
                    onChange={(ev) => setExperiences((p) => p.map((x, j) => j === i ? { ...x, endDate: ev.target.value } : x))} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input type="checkbox" checked={e.isCurrent}
                  onChange={(ev) => setExperiences((p) => p.map((x, j) => j === i ? { ...x, isCurrent: ev.target.checked } : x))} />
                Currently working here
              </label>
              <div>
                <label className={LABEL}>Description</label>
                <textarea className={INPUT} rows={2} placeholder="What you did…" value={e.description}
                  onChange={(ev) => setExperiences((p) => p.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))} />
              </div>
              <div>
                <label className={LABEL}>Technologies (comma-separated)</label>
                <input className={INPUT} placeholder="React, Node.js, PostgreSQL" value={e.technologies}
                  onChange={(ev) => setExperiences((p) => p.map((x, j) => j === i ? { ...x, technologies: ev.target.value } : x))} />
              </div>
            </div>
          ))}
          <button onClick={() => setExperiences((p) => [...p, { company: "", role: "", startDate: "", endDate: "", isCurrent: false, description: "", technologies: "" }])} className={ADD_BTN}>
            <Plus className="w-3.5 h-3.5" /> Add Experience
          </button>
        </div>
      )}

      {/* ── EDUCATION ── */}
      {tab === "education" && (
        <div className={SECTION}>
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">Education</p>
            {educations.map((e, i) => (
              <div key={i} className={CARD}>
                <button onClick={() => setEducations((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                <div>
                  <label className={LABEL}>Institution</label>
                  <input className={INPUT} placeholder="University of Rwanda" value={e.institution}
                    onChange={(ev) => setEducations((p) => p.map((x, j) => j === i ? { ...x, institution: ev.target.value } : x))} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Degree</label>
                    <input className={INPUT} placeholder="Bachelor of Science" value={e.degree}
                      onChange={(ev) => setEducations((p) => p.map((x, j) => j === i ? { ...x, degree: ev.target.value } : x))} />
                  </div>
                  <div>
                    <label className={LABEL}>Field of Study</label>
                    <input className={INPUT} placeholder="Computer Science" value={e.fieldOfStudy}
                      onChange={(ev) => setEducations((p) => p.map((x, j) => j === i ? { ...x, fieldOfStudy: ev.target.value } : x))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Start Year</label>
                    <input type="number" className={INPUT} placeholder="2018" value={e.startYear}
                      onChange={(ev) => setEducations((p) => p.map((x, j) => j === i ? { ...x, startYear: ev.target.value } : x))} />
                  </div>
                  <div>
                    <label className={LABEL}>End Year</label>
                    <input type="number" className={INPUT} placeholder="2022" value={e.endYear}
                      onChange={(ev) => setEducations((p) => p.map((x, j) => j === i ? { ...x, endYear: ev.target.value } : x))} />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setEducations((p) => [...p, { institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" }])} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" /> Add Education
            </button>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">Certifications</p>
            {certs.map((c, i) => (
              <div key={i} className={CARD}>
                <button onClick={() => setCerts((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Certification Name</label>
                    <input className={INPUT} placeholder="AWS Solutions Architect" value={c.name}
                      onChange={(ev) => setCerts((p) => p.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))} />
                  </div>
                  <div>
                    <label className={LABEL}>Issuer</label>
                    <input className={INPUT} placeholder="Amazon Web Services" value={c.issuer}
                      onChange={(ev) => setCerts((p) => p.map((x, j) => j === i ? { ...x, issuer: ev.target.value } : x))} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Issue Date</label>
                  <input type="month" className={INPUT} value={c.issueDate}
                    onChange={(ev) => setCerts((p) => p.map((x, j) => j === i ? { ...x, issueDate: ev.target.value } : x))} />
                </div>
              </div>
            ))}
            <button onClick={() => setCerts((p) => [...p, { name: "", issuer: "", issueDate: "" }])} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" /> Add Certification
            </button>
          </div>
        </div>
      )}

      {/* ── PROJECTS ── */}
      {tab === "projects" && (
        <div className={SECTION}>
          {projects.map((p, i) => (
            <div key={i} className={CARD}>
              <button onClick={() => setProjects((prev) => prev.filter((_, j) => j !== i))}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL}>Project Name</label>
                  <input className={INPUT} placeholder="TalentAI" value={p.name}
                    onChange={(ev) => setProjects((prev) => prev.map((x, j) => j === i ? { ...x, name: ev.target.value } : x))} />
                </div>
                <div>
                  <label className={LABEL}>Your Role</label>
                  <input className={INPUT} placeholder="Lead Developer" value={p.role}
                    onChange={(ev) => setProjects((prev) => prev.map((x, j) => j === i ? { ...x, role: ev.target.value } : x))} />
                </div>
              </div>
              <div>
                <label className={LABEL}>Description</label>
                <textarea className={INPUT} rows={2} placeholder="What the project does…" value={p.description}
                  onChange={(ev) => setProjects((prev) => prev.map((x, j) => j === i ? { ...x, description: ev.target.value } : x))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={LABEL}>Technologies (comma-separated)</label>
                  <input className={INPUT} placeholder="React, TypeScript, MongoDB" value={p.technologies}
                    onChange={(ev) => setProjects((prev) => prev.map((x, j) => j === i ? { ...x, technologies: ev.target.value } : x))} />
                </div>
                <div>
                  <label className={LABEL}>Link (optional)</label>
                  <input className={INPUT} placeholder="https://github.com/…" value={p.link}
                    onChange={(ev) => setProjects((prev) => prev.map((x, j) => j === i ? { ...x, link: ev.target.value } : x))} />
                </div>
              </div>
            </div>
          ))}
          <button onClick={() => setProjects((p) => [...p, { name: "", description: "", technologies: "", role: "", link: "" }])} className={ADD_BTN}>
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        </div>
      )}

      {/* ── SOCIAL ── */}
      {tab === "social" && (
        <div className={SECTION}>
          <div>
            <label className={LABEL}>LinkedIn</label>
            <input className={INPUT} placeholder="https://linkedin.com/in/username" value={social.linkedin}
              onChange={(e) => setSocial((s) => ({ ...s, linkedin: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>GitHub</label>
            <input className={INPUT} placeholder="https://github.com/username" value={social.github}
              onChange={(e) => setSocial((s) => ({ ...s, github: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Portfolio</label>
            <input className={INPUT} placeholder="https://myportfolio.com" value={social.portfolio}
              onChange={(e) => setSocial((s) => ({ ...s, portfolio: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Twitter / X</label>
            <input className={INPUT} placeholder="https://twitter.com/username" value={social.twitter}
              onChange={(e) => setSocial((s) => ({ ...s, twitter: e.target.value }))} />
          </div>
        </div>
      )}
    </BaseModal>
  );
}
