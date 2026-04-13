"use client";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { createCandidate } from "@/store/candidatesSlice";
import { fetchJobs } from "@/store/jobsSlice";
import { JobRequirement } from "@/types";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { useEffect } from "react";

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

export default function NewCandidatePage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { items: jobs } = useSelector((s: RootState) => s.jobs);
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState<"platform" | "csv" | "pdf">("platform");
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

  const jobOptions = useMemo(() => jobs.filter((job) => job._id), [jobs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(createCandidate({
        firstName,
        lastName,
        email,
        headline,
        bio,
        location,
        skills: skills.filter((skill) => skill.name.trim()).map((skill) => ({
          name: skill.name.trim(),
          level: skill.level,
          yearsOfExperience: Number(skill.yearsOfExperience) || 0,
        })),
        languages: languages.filter((language) => language.name.trim()).map((language) => ({
          name: language.name.trim(),
          proficiency: language.proficiency,
        })),
        experience: experience.filter((entry) => entry.company.trim() && entry.role.trim()).map((entry) => ({
          company: entry.company.trim(),
          role: entry.role.trim(),
          startDate: entry.startDate,
          endDate: entry.isCurrent ? "Present" : entry.endDate,
          description: entry.description,
          technologies: entry.technologies.split(/[,;|]/).map((item) => item.trim()).filter(Boolean),
          isCurrent: entry.isCurrent,
        })),
        education: education.filter((entry) => entry.institution.trim() && entry.degree.trim()).map((entry) => ({
          institution: entry.institution.trim(),
          degree: entry.degree.trim(),
          fieldOfStudy: entry.fieldOfStudy.trim(),
          startYear: Number(entry.startYear) || 0,
          endYear: Number(entry.endYear) || 0,
        })),
        certifications: certifications.filter((entry) => entry.name.trim()).map((entry) => ({
          name: entry.name.trim(),
          issuer: entry.issuer.trim(),
          issueDate: entry.issueDate,
        })),
        projects: projects.filter((entry) => entry.name.trim()).map((entry) => ({
          name: entry.name.trim(),
          description: entry.description,
          technologies: entry.technologies.split(/[,;|]/).map((item) => item.trim()).filter(Boolean),
          role: entry.role,
          link: entry.link || undefined,
          startDate: entry.startDate,
          endDate: entry.endDate,
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
        source,
        jobIds: jobId ? [jobId] : [],
      })).unwrap();

      router.push("/candidates");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/candidates" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add Candidate</h1>
          <p className="text-slate-500 mt-0.5">Create a structured talent profile that matches the Umurava schema</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Basic Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[{ label: "First Name", value: firstName, set: setFirstName }, { label: "Last Name", value: lastName, set: setLastName }, { label: "Email", value: email, set: setEmail }, { label: "Headline", value: headline, set: setHeadline }].map((field) => (
              <div key={field.label}>
                <label className="block text-sm font-medium text-slate-700 mb-1">{field.label} *</label>
                <input required value={field.value} onChange={(e) => field.set(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input required value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
              <select value={source} onChange={(e) => setSource(e.target.value as typeof source)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="platform">Platform</option>
                <option value="csv">CSV</option>
                <option value="pdf">PDF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Job</label>
              <select value={jobId} onChange={(e) => setJobId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
                <option value="">Global pool</option>
                {jobOptions.map((job) => (
                  <option key={job._id} value={job._id}>{job.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <FieldArraySection title="Skills" items={skills} setItems={setSkills} blankItem={blankSkill()} render={(item, index, update, remove) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Skill" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <select value={item.level} onChange={(e) => update({ ...item, level: e.target.value as SkillForm["level"] })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
            </select>
            <input type="number" min="0" value={item.yearsOfExperience} onChange={(e) => update({ ...item, yearsOfExperience: e.target.value })} placeholder="Years" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <button type="button" onClick={remove} className="px-3 py-2 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        )} />

        <FieldArraySection title="Languages" items={languages} setItems={setLanguages} blankItem={blankLanguage()} render={(item, index, update, remove) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Language" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <select value={item.proficiency} onChange={(e) => update({ ...item, proficiency: e.target.value as LanguageForm["proficiency"] })} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="Basic">Basic</option>
              <option value="Conversational">Conversational</option>
              <option value="Fluent">Fluent</option>
              <option value="Native">Native</option>
            </select>
            <button type="button" onClick={remove} className="px-3 py-2 text-slate-500 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
          </div>
        )} />

        <FieldArraySection title="Experience" items={experience} setItems={setExperience} blankItem={blankExperience()} render={(item, index, update, remove) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-slate-200 rounded-lg p-4">
            <input value={item.company} onChange={(e) => update({ ...item, company: e.target.value })} placeholder="Company" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} placeholder="Role" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.startDate} onChange={(e) => update({ ...item, startDate: e.target.value })} placeholder="Start YYYY-MM" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.isCurrent ? "Present" : item.endDate} onChange={(e) => update({ ...item, endDate: e.target.value })} placeholder="End YYYY-MM / Present" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <textarea value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} placeholder="Description" rows={2} className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.technologies} onChange={(e) => update({ ...item, technologies: e.target.value })} placeholder="Technologies comma-separated" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={item.isCurrent} onChange={(e) => update({ ...item, isCurrent: e.target.checked })} /> Current role
            </label>
            <button type="button" onClick={remove} className="text-sm text-red-500 justify-self-start">Remove</button>
          </div>
        )} />

        <FieldArraySection title="Education" items={education} setItems={setEducation} blankItem={blankEducation()} render={(item, index, update, remove) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-slate-200 rounded-lg p-4">
            <input value={item.institution} onChange={(e) => update({ ...item, institution: e.target.value })} placeholder="Institution" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.degree} onChange={(e) => update({ ...item, degree: e.target.value })} placeholder="Degree" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.fieldOfStudy} onChange={(e) => update({ ...item, fieldOfStudy: e.target.value })} placeholder="Field of study" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <div className="grid grid-cols-2 gap-3">
              <input value={item.startYear} onChange={(e) => update({ ...item, startYear: e.target.value })} placeholder="Start year" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input value={item.endYear} onChange={(e) => update({ ...item, endYear: e.target.value })} placeholder="End year" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
            <button type="button" onClick={remove} className="text-sm text-red-500 justify-self-start">Remove</button>
          </div>
        )} />

        <FieldArraySection title="Certifications" items={certifications} setItems={setCertifications} blankItem={blankCertification()} render={(item, index, update, remove) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 border border-slate-200 rounded-lg p-4">
            <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Certification name" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.issuer} onChange={(e) => update({ ...item, issuer: e.target.value })} placeholder="Issuer" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.issueDate} onChange={(e) => update({ ...item, issueDate: e.target.value })} placeholder="Issue YYYY-MM" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <button type="button" onClick={remove} className="text-sm text-red-500 justify-self-start">Remove</button>
          </div>
        )} />

        <FieldArraySection title="Projects" items={projects} setItems={setProjects} blankItem={blankProject()} render={(item, index, update, remove) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 border border-slate-200 rounded-lg p-4">
            <input value={item.name} onChange={(e) => update({ ...item, name: e.target.value })} placeholder="Project name" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.role} onChange={(e) => update({ ...item, role: e.target.value })} placeholder="Role" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <textarea value={item.description} onChange={(e) => update({ ...item, description: e.target.value })} placeholder="Description" rows={2} className="md:col-span-2 px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.technologies} onChange={(e) => update({ ...item, technologies: e.target.value })} placeholder="Technologies comma-separated" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.link} onChange={(e) => update({ ...item, link: e.target.value })} placeholder="Link (optional)" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.startDate} onChange={(e) => update({ ...item, startDate: e.target.value })} placeholder="Start YYYY-MM" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <input value={item.endDate} onChange={(e) => update({ ...item, endDate: e.target.value })} placeholder="End YYYY-MM" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <button type="button" onClick={remove} className="text-sm text-red-500 justify-self-start">Remove</button>
          </div>
        )} />

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Availability & Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select value={availabilityStatus} onChange={(e) => setAvailabilityStatus(e.target.value as typeof availabilityStatus)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="Available">Available</option>
              <option value="Open to Opportunities">Open to Opportunities</option>
              <option value="Not Available">Not Available</option>
            </select>
            <select value={availabilityType} onChange={(e) => setAvailabilityType(e.target.value as typeof availabilityType)} className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white">
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
            </select>
            <input value={availabilityStartDate} onChange={(e) => setAvailabilityStartDate(e.target.value)} placeholder="Available from (optional)" className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            <div />
            {[{ label: "LinkedIn", value: linkedin, set: setLinkedin }, { label: "GitHub", value: github, set: setGithub }, { label: "Portfolio", value: portfolio, set: setPortfolio }, { label: "Twitter", value: twitter, set: setTwitter }].map((field) => (
              <input key={field.label} value={field.value} onChange={(e) => field.set(e.target.value)} placeholder={field.label} className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link href="/candidates" className="px-5 py-3 border border-slate-300 rounded-xl font-medium text-slate-700">Cancel</Link>
          <button type="submit" disabled={loading} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium flex items-center gap-2">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Candidate
          </button>
        </div>
      </form>
    </div>
  );
}

function FieldArraySection<T extends Record<string, unknown>>({
  title,
  items,
  setItems,
  blankItem,
  render,
}: {
  title: string;
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  blankItem: T;
  render: (item: T, index: number, update: (next: T) => void, remove: () => void) => React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-800">{title}</h2>
        <button type="button" onClick={() => setItems((prev) => [...prev, blankItem])} className="inline-flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg">
          <Plus className="w-4 h-4" /> Add {title}
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, index) => render(
          item,
          index,
          (next) => setItems((prev) => prev.map((current, currentIndex) => (currentIndex === index ? next : current))),
          () => setItems((prev) => prev.filter((_, currentIndex) => currentIndex !== index))
        ))}
      </div>
    </div>
  );
}