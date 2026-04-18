"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch } from "@/store";
import { createJob } from "@/store/jobsSlice";
import { Plus, Trash2, Loader2, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { JobRequirement } from "@/types";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";

type JobForm = {
  title: string;
  description: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  experienceLevel: "Junior" | "Mid-level" | "Senior" | "Lead";
  requirements: JobRequirement[];
  niceToHave: string[];
  responsibilities: string[];
};

type StoredDraft = {
  form: JobForm;
  savedAt: string;
};

const DRAFT_KEY = "jobs:new:draft:v1";

const INITIAL_FORM: JobForm = {
  title: "",
  description: "",
  department: "",
  location: "",
  type: "Full-time",
  experienceLevel: "Mid-level",
  requirements: [],
  niceToHave: [],
  responsibilities: [],
};

const fieldClassName =
  "w-full rounded-xl px-3 py-2.5 text-sm transition-all focus:outline-none";

function FieldLabel({ children, required = false }: { children: string; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-xs font-semibold tracking-wide" style={{ color: "var(--text-secondary)" }}>
      {children}
      {required && <span className="ml-0.5 opacity-60">*</span>}
    </label>
  );
}

function formatSavedTime(value: string | null) {
  if (!value) return "Not saved yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Saved";
  return `Saved ${date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export default function NewJobPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string>("");

  const [form, setForm] = useState<JobForm>(INITIAL_FORM);

  const [newReq, setNewReq] = useState({ skill: "", level: "", yearsRequired: "", required: true });
  const [newNice, setNewNice] = useState("");
  const [newResp, setNewResp] = useState("");
  const hasContent = useMemo(() => {
    return Boolean(
      form.title.trim() ||
      form.description.trim() ||
      form.department.trim() ||
      form.location.trim() ||
      form.requirements.length ||
      form.niceToHave.length ||
      form.responsibilities.length
    );
  }, [form]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StoredDraft;
      if (!parsed?.form) return;
      setForm(parsed.form);
      setLastSavedAt(parsed.savedAt || null);
      setDraftLoaded(true);
      setSaveMessage("Recovered your draft. Continue where you left off.");
    } catch {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  useEffect(() => {
    if (!hasContent) {
      setLastSavedAt(null);
      return;
    }

    const timer = setTimeout(() => {
      const savedAt = new Date().toISOString();
      const payload: StoredDraft = { form, savedAt };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
      setLastSavedAt(savedAt);
    }, 800);

    return () => clearTimeout(timer);
  }, [form, hasContent]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(""), 3500);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const saveDraftNow = () => {
    if (!hasContent) {
      setSaveMessage("Nothing to save yet.");
      return;
    }
    const savedAt = new Date().toISOString();
    const payload: StoredDraft = { form, savedAt };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    setLastSavedAt(savedAt);
    setSaveMessage("Draft saved.");
  };

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setForm(INITIAL_FORM);
    setLastSavedAt(null);
    setDraftLoaded(false);
    setSaveMessage("Draft cleared.");
  };

  const addRequirement = () => {
    if (!newReq.skill.trim()) return;
    setForm((f) => ({
      ...f,
      requirements: [
        ...f.requirements,
        {
          skill: newReq.skill.trim(),
          level: newReq.level || undefined,
          yearsRequired: newReq.yearsRequired ? Number(newReq.yearsRequired) : undefined,
          required: newReq.required,
        },
      ],
    }));
    setNewReq({ skill: "", level: "", yearsRequired: "", required: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(createJob(form)).unwrap();
      localStorage.removeItem(DRAFT_KEY);
      router.push("/jobs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10 animate-slide-up">
      <PageHeader
        backHref="/jobs"
        eyebrow="Recruitment"
        title="Post a Job"
        subtitle="Define the role requirements for AI screening"
        actions={
          <Button type="button" variant="outline" onClick={saveDraftNow}>
            <Save className="w-4 h-4" />
            Save Draft
          </Button>
        }
      />

      <div className="mb-5 rounded-2xl border border-sky-200 bg-gradient-to-r from-sky-50 to-cyan-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-sky-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Interruption-safe posting
            </p>
            <p className="text-xs text-sky-700 mt-1">
              If you get called away, your draft saves automatically so you can continue later.
            </p>
            <p className="text-xs text-sky-800 mt-2">{formatSavedTime(lastSavedAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={clearDraft}
              variant="outline"
            >
              Clear Draft
            </Button>
          </div>
        </div>
        {(draftLoaded || saveMessage) && (
          <p className="mt-3 text-xs text-sky-800">{saveMessage || "Draft restored from local storage."}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FieldLabel required>Job Title</FieldLabel>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="e.g., Senior Backend Engineer" />
            </div>
            <div>
              <FieldLabel>Department</FieldLabel>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="Engineering" />
            </div>
            <div>
              <FieldLabel required>Location</FieldLabel>
              <input required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="Kigali, Rwanda / Remote" />
            </div>
            <div>
              <FieldLabel>Employment Type</FieldLabel>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <FieldLabel>Experience Level</FieldLabel>
              <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value as typeof form.experienceLevel })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
                <option>Junior</option>
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <FieldLabel required>Job Description</FieldLabel>
              <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${fieldClassName} resize-none`}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="Describe the role, responsibilities, and ideal candidate..." />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Required Skills</h2>
          <div className="flex gap-2 flex-wrap">
            <input value={newReq.skill} onChange={(e) => setNewReq({ ...newReq, skill: e.target.value })}
              className={`flex-1 min-w-[140px] ${fieldClassName}`}
              style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              placeholder="Skill (e.g. Node.js)" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())} />
            <select value={newReq.level} onChange={(e) => setNewReq({ ...newReq, level: e.target.value })}
              className={fieldClassName}
              style={{ width: "auto", background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}>
              <option value="">Any Level</option>
              <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option>
            </select>
            <input type="number" min="0" value={newReq.yearsRequired} onChange={(e) => setNewReq({ ...newReq, yearsRequired: e.target.value })}
              className={`w-24 ${fieldClassName}`}
              style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }} placeholder="Yrs" />
            <label className="flex items-center gap-2 text-sm px-2" style={{ color: "var(--text-secondary)" }}>
              <input type="checkbox" checked={newReq.required} onChange={(e) => setNewReq({ ...newReq, required: e.target.checked })} />
              Required
            </label>
            <Button type="button" onClick={addRequirement}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.requirements.map((r, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                style={r.required ? { background: "var(--accent-light)", color: "var(--accent)" } : { background: "var(--surface-inset)", color: "var(--text-secondary)" }}>
                {r.skill}{r.level ? ` · ${r.level}` : ""}{r.yearsRequired ? ` · ${r.yearsRequired}yr` : ""}{!r.required && " (nice)"}
                <button type="button" onClick={() => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, j) => j !== i) }))}>
                  <Trash2 className="w-3 h-3 opacity-60 hover:opacity-100" />
                </button>
              </span>
            ))}
          </div>

          {/* Nice to have */}
          <div>
            <FieldLabel>Nice to Have</FieldLabel>
            <div className="flex gap-2">
              <input value={newNice} onChange={(e) => setNewNice(e.target.value)}
                className={`flex-1 ${fieldClassName}`}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="e.g. GraphQL, Rust..." onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const value = newNice.trim(); if (value) { setForm((f) => ({ ...f, niceToHave: [...f.niceToHave, value] })); setNewNice(""); } } }} />
              <Button type="button" variant="outline" onClick={() => { const value = newNice.trim(); if (value) { setForm((f) => ({ ...f, niceToHave: [...f.niceToHave, value] })); setNewNice(""); } }}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.niceToHave.map((n, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: "#fffbeb", color: "#d97706" }}>
                  {n}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, niceToHave: f.niceToHave.filter((_, j) => j !== i) }))}><Trash2 className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Responsibilities */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Responsibilities</h2>
          <div className="flex gap-2">
            <input value={newResp} onChange={(e) => setNewResp(e.target.value)}
              className={`flex-1 ${fieldClassName}`}
              style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              placeholder="e.g. Design and implement REST APIs..."
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const value = newResp.trim(); if (value) { setForm((f) => ({ ...f, responsibilities: [...f.responsibilities, value] })); setNewResp(""); } } }} />
            <Button type="button" variant="outline" onClick={() => { const value = newResp.trim(); if (value) { setForm((f) => ({ ...f, responsibilities: [...f.responsibilities, value] })); setNewResp(""); } }}>
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {form.responsibilities.map((r, i) => (
              <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                <span className="flex-1">{r}</span>
                <button type="button" onClick={() => setForm((f) => ({ ...f, responsibilities: f.responsibilities.filter((_, j) => j !== i) }))} style={{ color: "var(--text-muted)" }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="flex-1" loading={loading}>
            Post Job
          </Button>
          <Button type="button" asChild variant="outline">
            <Link href="/jobs">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
