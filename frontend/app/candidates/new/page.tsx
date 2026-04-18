"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AppDispatch } from "@/store";
import { createCandidate } from "@/store/candidatesSlice";
import { fetchJobs } from "@/store/jobsSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ArrowLeft, Plus, Trash2, Loader2, Briefcase, MapPin } from "lucide-react";

type SkillForm = { name: string; level: "Beginner" | "Intermediate" | "Advanced" | "Expert"; yearsOfExperience: string };
type LanguageForm = { name: string; proficiency: "Basic" | "Conversational" | "Fluent" | "Native" };
type ExperienceForm = { company: string; role: string; startDate: string; endDate: string; description: string; technologies: string; isCurrent: boolean };
type EducationForm = { institution: string; degree: string; fieldOfStudy: string; startYear: string; endYear: string };
type CertificationForm = { name: string; issuer: string; issueDate: string };
type ProjectForm = { name: string; description: string; technologies: string; role: string; link: string; startDate: string; endDate: string };

const blankSkill = (): SkillForm => ({ name: "", level: "Intermediate", yearsOfExperience: "1" });
const blankLanguage = (): LanguageForm => ({ name: "", proficiency: "Conversational" });
const blankExperience = (): ExperienceForm => ({ company: "", role: "", startDate: "", endDate: "", description: "", technologies: "", isCurrent: false });
const blankEducation = (): EducationForm => ({ institution: "", degree: "", fieldOfStudy: "", startYear: "", endYear: "" });
const blankCertification = (): CertificationForm => ({ name: "", issuer: "", issueDate: "" });
const blankProject = (): ProjectForm => ({ name: "", description: "", technologies: "", role: "", link: "", startDate: "", endDate: "" });

/* ── Shared input / section styles ───────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  background: "var(--surface-inset)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  borderRadius: "0.625rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 tracking-wide" style={{ color: "var(--text-secondary)" }}>
        {label}{required && <span className="ml-0.5 opacity-60">*</span>}
      </label>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-6 space-y-4">
      <h2 className="font-bold text-sm tracking-wide uppercase" style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
        {title}
      </h2>
      {children}
    </div>
  );
}

function NewCandidatePageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("jobId") ?? "";

  const { items: jobs } = useSelector((s: RootState) => s.jobs);
  const [loading, setLoading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<"Available" | "Open to Opportunities" | "Not Available">("Available");
  const [availabilityType, setAvailabilityType] = useState<"Full-time" | "Part-time" | "Contract">("Full-time");
  const [availabilityStartDate, setAvailabilityStartDate] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [twitter, setTwitter] = useState("");
  const [skills, setSkills] = useState<SkillForm[]>([blankSkill()]);
  const [languages, setLanguages] = useState<LanguageForm[]>([blankLanguage()]);
  const [experience, setExperience] = useState<ExperienceForm[]>([blankExperience()]);
  const [education, setEducation] = useState<EducationForm[]>([blankEducation()]);
  const [certifications, setCertifications] = useState<CertificationForm[]>([]);
  const [projects, setProjects] = useState<ProjectForm[]>([]);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const job = useMemo(() => jobs.find((j) => j._id === urlJobId), [jobs, urlJobId]);
  const backHref = urlJobId ? `/jobs/${urlJobId}` : "/candidates";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlJobId) return;
    setLoading(true);
    try {
      await dispatch(createCandidate({
        firstName,
        lastName,
        email,
        headline,
        bio,
        location,
        skills: skills.filter((s) => s.name.trim()).map((s) => ({
          name: s.name.trim(),
          level: s.level,
          yearsOfExperience: Number(s.yearsOfExperience) || 0,
        })),
        languages: languages.filter((l) => l.name.trim()).map((l) => ({
          name: l.name.trim(),
          proficiency: l.proficiency,
        })),
        experience: experience.filter((e) => e.company.trim() && e.role.trim()).map((e) => ({
          company: e.company.trim(),
          role: e.role.trim(),
          startDate: e.startDate,
          endDate: e.isCurrent ? "Present" : e.endDate,
          description: e.description,
          technologies: e.technologies.split(/[,;|]/).map((t) => t.trim()).filter(Boolean),
          isCurrent: e.isCurrent,
        })),
        education: education.filter((e) => e.institution.trim() && e.degree.trim()).map((e) => ({
          institution: e.institution.trim(),
          degree: e.degree.trim(),
          fieldOfStudy: e.fieldOfStudy.trim(),
          startYear: Number(e.startYear) || 0,
          endYear: Number(e.endYear) || 0,
        })),
        certifications: certifications.filter((c) => c.name.trim()).map((c) => ({
          name: c.name.trim(),
          issuer: c.issuer.trim(),
          issueDate: c.issueDate,
        })),
        projects: projects.filter((p) => p.name.trim()).map((p) => ({
          name: p.name.trim(),
          description: p.description,
          technologies: p.technologies.split(/[,;|]/).map((t) => t.trim()).filter(Boolean),
          role: p.role,
          link: p.link || undefined,
          startDate: p.startDate,
          endDate: p.endDate,
        })),
        availability: {
          status: availabilityStatus,
          type: availabilityType,
          startDate: availabilityStartDate || undefined,
        },
        socialLinks: {
          linkedin: linkedin || undefined,
          github: github || undefined,
          portfolio: portfolio || undefined,
          twitter: twitter || undefined,
        },
        source: "platform",
        jobIds: [urlJobId],
      })).unwrap();

      router.push(backHref);
    } finally {
      setLoading(false);
    }
  };

  /* ── No jobId guard ─────────────────────────────────────────────────────── */
  if (!urlJobId) {
    return (
      <div className="max-w-4xl mx-auto animate-slide-up">
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            <Briefcase className="w-8 h-8" style={{ color: "var(--error, #ef4444)" }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            No job selected
          </h2>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Every candidate must belong to a specific job. Open a job and use "Add Manually" from there.
          </p>
          <Link href="/candidates"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)" }}>
            <ArrowLeft className="w-4 h-4" />
            Go to Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          href={backHref}
          className="p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-inset)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: "#059669" }}>
            Candidates
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
            Add Candidate
          </h1>
        </div>
      </div>

      {/* ── Job context banner ─────────────────────────────────────────────── */}
      <div className="card p-4 mb-6 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "#ecfdf5" }}>
          <Briefcase className="w-4 h-4" style={{ color: "#059669" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold tracking-widest uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
            Adding to job
          </p>
          <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
            {job ? job.title : "Loading…"}
          </p>
          {job && (
            <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--text-muted)" }}>
              <MapPin className="w-3 h-3" />{job.location}
            </p>
          )}
        </div>
        <Link href={backHref} className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
          View job →
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic Profile ─────────────────────────────────────────────────── */}
        <Section title="Basic Profile">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name" required>
              <input required value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Last Name" required>
              <input required value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Email" required>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </Field>
            <Field label="Headline" required>
              <input required value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="e.g. Senior Full-Stack Engineer" style={inputStyle} />
            </Field>
            <Field label="Location" required>
              <input required value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Kigali, Rwanda" style={inputStyle} />
            </Field>
          </div>
          <Field label="Bio / Summary">
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </Field>
        </Section>

        {/* ── Skills ───────────────────────────────────────────────────────── */}
        <FieldArraySection title="Skills" items={skills} setItems={setSkills} blankItem={blankSkill()}
          render={(item, index, update, remove) => (
            <div key={index} className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
              <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Skill name" style={inputStyle} />
              <select value={item.level} onChange={(e) => update({ ...item, level: e.target.value as SkillForm["level"] })}
                style={{ ...inputStyle, width: "auto" }}>
                <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
              </select>
              <input type="number" min="0" value={item.yearsOfExperience} onChange={(e) => update({ ...item, yearsOfExperience: e.target.value })}
                placeholder="Yrs" style={{ ...inputStyle, width: "4.5rem" }} />
              <RemoveBtn onClick={remove} />
            </div>
          )} />

        {/* ── Languages ────────────────────────────────────────────────────── */}
        <FieldArraySection title="Languages" items={languages} setItems={setLanguages} blankItem={blankLanguage()}
          render={(item, index, update, remove) => (
            <div key={index} className="grid grid-cols-[1fr_auto_auto] gap-2 items-center">
              <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Language" style={inputStyle} />
              <select value={item.proficiency} onChange={(e) => update({ ...item, proficiency: e.target.value as LanguageForm["proficiency"] })}
                style={{ ...inputStyle, width: "auto" }}>
                <option value="Basic">Basic</option>
                <option value="Conversational">Conversational</option>
                <option value="Fluent">Fluent</option>
                <option value="Native">Native</option>
              </select>
              <RemoveBtn onClick={remove} />
            </div>
          )} />

        {/* ── Experience ───────────────────────────────────────────────────── */}
        <FieldArraySection title="Experience" items={experience} setItems={setExperience} blankItem={blankExperience()}
          render={(item, index, update, remove) => (
            <div key={index} className="rounded-xl p-4 space-y-3" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={item.company} onChange={(e) => update({ ...item, company: e.target.value })} placeholder="Company" style={inputStyle} />
                <input value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} placeholder="Role / Title" style={inputStyle} />
                <input value={item.startDate} onChange={(e) => update({ ...item, startDate: e.target.value })} placeholder="Start YYYY-MM" style={inputStyle} />
                <input value={item.isCurrent ? "Present" : item.endDate} onChange={(e) => update({ ...item, endDate: e.target.value })} placeholder="End YYYY-MM" disabled={item.isCurrent} style={{ ...inputStyle, opacity: item.isCurrent ? 0.5 : 1 }} />
              </div>
              <textarea value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} placeholder="Description of responsibilities" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              <input value={item.technologies} onChange={(e) => update({ ...item, technologies: e.target.value })} placeholder="Technologies (comma-separated)" style={inputStyle} />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: "var(--text-secondary)" }}>
                  <input type="checkbox" checked={item.isCurrent} onChange={(e) => update({ ...item, isCurrent: e.target.checked })} className="rounded" />
                  Current role
                </label>
                <RemoveBtn onClick={remove} label="Remove" />
              </div>
            </div>
          )} />

        {/* ── Education ────────────────────────────────────────────────────── */}
        <FieldArraySection title="Education" items={education} setItems={setEducation} blankItem={blankEducation()}
          render={(item, index, update, remove) => (
            <div key={index} className="rounded-xl p-4 space-y-3" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={item.institution} onChange={(e) => update({ ...item, institution: e.target.value })} placeholder="Institution" style={inputStyle} />
                <input value={item.degree} onChange={(e) => update({ ...item, degree: e.target.value })} placeholder="Degree" style={inputStyle} />
                <input value={item.fieldOfStudy} onChange={(e) => update({ ...item, fieldOfStudy: e.target.value })} placeholder="Field of study" style={inputStyle} />
                <div className="grid grid-cols-2 gap-3">
                  <input value={item.startYear} onChange={(e) => update({ ...item, startYear: e.target.value })} placeholder="Start year" style={inputStyle} />
                  <input value={item.endYear} onChange={(e) => update({ ...item, endYear: e.target.value })} placeholder="End year" style={inputStyle} />
                </div>
              </div>
              <div className="flex justify-end">
                <RemoveBtn onClick={remove} label="Remove" />
              </div>
            </div>
          )} />

        {/* ── Certifications ───────────────────────────────────────────────── */}
        <FieldArraySection title="Certifications" items={certifications} setItems={setCertifications} blankItem={blankCertification()}
          render={(item, index, update, remove) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
              <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Certification name" style={inputStyle} />
              <input value={item.issuer} onChange={(e) => update({ ...item, issuer: e.target.value })} placeholder="Issuer" style={inputStyle} />
              <input value={item.issueDate} onChange={(e) => update({ ...item, issueDate: e.target.value })} placeholder="YYYY-MM" style={{ ...inputStyle, width: "7rem" }} />
              <RemoveBtn onClick={remove} />
            </div>
          )} />

        {/* ── Projects ─────────────────────────────────────────────────────── */}
        <FieldArraySection title="Projects" items={projects} setItems={setProjects} blankItem={blankProject()}
          render={(item, index, update, remove) => (
            <div key={index} className="rounded-xl p-4 space-y-3" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Project name" style={inputStyle} />
                <input value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} placeholder="Your role" style={inputStyle} />
              </div>
              <textarea value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} placeholder="Project description" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input value={item.technologies} onChange={(e) => update({ ...item, technologies: e.target.value })} placeholder="Technologies (comma-separated)" style={inputStyle} />
                <input value={item.link} onChange={(e) => update({ ...item, link: e.target.value })} placeholder="Link (optional)" style={inputStyle} />
                <input value={item.startDate} onChange={(e) => update({ ...item, startDate: e.target.value })} placeholder="Start YYYY-MM" style={inputStyle} />
                <input value={item.endDate} onChange={(e) => update({ ...item, endDate: e.target.value })} placeholder="End YYYY-MM" style={inputStyle} />
              </div>
              <div className="flex justify-end">
                <RemoveBtn onClick={remove} label="Remove" />
              </div>
            </div>
          )} />

        {/* ── Availability & Social ─────────────────────────────────────────── */}
        <Section title="Availability & Social Links">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Availability status">
              <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as typeof availabilityStatus)} style={inputStyle}>
                <option value="Available">Available</option>
                <option value="Open to Opportunities">Open to Opportunities</option>
                <option value="Not Available">Not Available</option>
              </select>
            </Field>
            <Field label="Work type">
              <select value={availabilityType} onChange={(e) => setAvailabilityType(e.target.value as typeof availabilityType)} style={inputStyle}>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </Field>
            <Field label="Available from">
              <input value={availabilityStartDate} onChange={(e) => setAvailabilityStartDate(e.target.value)} placeholder="YYYY-MM-DD (optional)" style={inputStyle} />
            </Field>
            <div />
            {[
              { label: "LinkedIn", value: linkedin, set: setLinkedin, placeholder: "linkedin.com/in/…" },
              { label: "GitHub", value: github, set: setGithub, placeholder: "github.com/…" },
              { label: "Portfolio", value: portfolio, set: setPortfolio, placeholder: "yoursite.com" },
              { label: "Twitter / X", value: twitter, set: setTwitter, placeholder: "@handle" },
            ].map((f) => (
              <Field key={f.label} label={f.label}>
                <input value={f.value} onChange={(e) => f.set(e.target.value)} placeholder={f.placeholder} style={inputStyle} />
              </Field>
            ))}
          </div>
        </Section>

        {/* ── Footer actions ───────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 py-2">
          <Link href={backHref}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ border: "1px solid var(--border)", color: "var(--text-secondary)", background: "var(--surface)" }}>
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.boxShadow = "0 4px 14px rgba(5,150,105,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Saving…" : "Save Candidate"}
          </button>
        </div>
      </form>
    </div>
  );
}

function RemoveBtn({ onClick, label }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick}
      className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-colors"
      style={{ color: "var(--text-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error-light, rgba(239,68,68,0.08))"; e.currentTarget.style.color = "var(--error, #ef4444)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}>
      <Trash2 className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function FieldArraySection<T extends Record<string, unknown>>({
  title, items, setItems, blankItem, render,
}: {
  title: string;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  blankItem: T;
  render: (item: T, index: number, update: (next: T) => void, remove: () => void) => React.ReactNode;
}) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-bold text-sm tracking-wide uppercase" style={{ color: "var(--text-muted)", letterSpacing: "0.08em" }}>
          {title}
        </h2>
        <button type="button"
          onClick={() => setItems((prev) => [...prev, blankItem])}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--accent-border)"; e.currentTarget.style.color = "var(--accent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}>
          <Plus className="w-3.5 h-3.5" />
          Add {title.replace(/s$/, "")}
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => render(
          item,
          index,
          (next) => setItems((prev) => prev.map((cur, i) => (i === index ? next : cur))),
          () => setItems((prev) => prev.filter((_, i) => i !== index))
        ))}
      </div>
    </div>
  );
}

export default function NewCandidatePage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto">
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      </div>
    }>
      <NewCandidatePageContent />
    </Suspense>
  );
}
