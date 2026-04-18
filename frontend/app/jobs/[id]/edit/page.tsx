"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJob, updateJob } from "@/store/jobsSlice";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Job } from "@/types";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";

type JobForm = {
  title: Job["title"];
  description: Job["description"];
  department: string;
  location: Job["location"];
  type: Job["type"];
  experienceLevel: Job["experienceLevel"];
  requirements: Job["requirements"];
  niceToHave: string[];
  responsibilities: Job["responsibilities"];
};

const EMPTY_FORM: JobForm = {
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

export default function EditJobPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => params?.id || "", [params]);
  const { current } = useSelector((state: RootState) => state.jobs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<JobForm>(EMPTY_FORM);
  const [newReq, setNewReq] = useState({ skill: "", level: "", yearsRequired: "", required: true });
  const [newNice, setNewNice] = useState("");
  const [newResp, setNewResp] = useState("");

  useEffect(() => {
    if (!jobId) return;

    let active = true;
    setLoading(true);

    dispatch(fetchJob(jobId))
      .unwrap()
      .then((job) => {
        if (!active) return;
        setForm({
          title: job.title,
          description: job.description,
          department: job.department || "",
          location: job.location,
          type: job.type,
          experienceLevel: job.experienceLevel,
          requirements: job.requirements || [],
          niceToHave: job.niceToHave || [],
          responsibilities: job.responsibilities || [],
        });
      })
      .catch(() => {
        if (!active) return;
        setForm(EMPTY_FORM);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [dispatch, jobId]);

  useEffect(() => {
    if (!current || current._id !== jobId || loading) return;
    setForm({
      title: current.title,
      description: current.description,
      department: current.department || "",
      location: current.location,
      type: current.type,
      experienceLevel: current.experienceLevel,
      requirements: current.requirements || [],
      niceToHave: current.niceToHave || [],
      responsibilities: current.responsibilities || [],
    });
  }, [current, jobId, loading]);

  const addRequirement = () => {
    if (!newReq.skill) return;
    setForm((f) => ({
      ...f,
      requirements: [
        ...f.requirements,
        {
          skill: newReq.skill,
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
    if (!jobId) return;

    setSaving(true);
    try {
      await dispatch(updateJob({ id: jobId, payload: form })).unwrap();
      router.push("/jobs");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card p-10 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3" style={{ color: "var(--accent)" }} />
          <p className="font-medium" style={{ color: "var(--text-primary)" }}>Loading job...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <PageHeader
        backHref="/jobs"
        eyebrow="Recruitment"
        title="Edit Job"
        subtitle="Update the role requirements for AI screening"
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <FieldLabel required>Job Title</FieldLabel>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="e.g., Senior Backend Engineer"
              />
            </div>
            <div>
              <FieldLabel>Department</FieldLabel>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="Engineering"
              />
            </div>
            <div>
              <FieldLabel required>Location</FieldLabel>
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="Kigali, Rwanda / Remote"
              />
            </div>
            <div>
              <FieldLabel>Employment Type</FieldLabel>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <FieldLabel>Experience Level</FieldLabel>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value as typeof form.experienceLevel })}
                className={fieldClassName}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              >
                <option>Junior</option>
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <FieldLabel required>Job Description</FieldLabel>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={`${fieldClassName} resize-none`}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="Describe the role, responsibilities, and ideal candidate..."
              />
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Required Skills</h2>
          <div className="flex gap-2 flex-wrap">
            <input
              value={newReq.skill}
              onChange={(e) => setNewReq({ ...newReq, skill: e.target.value })}
              className={`flex-1 min-w-[140px] ${fieldClassName}`}
              style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              placeholder="Skill (e.g. Node.js)"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
            />
            <select
              value={newReq.level}
              onChange={(e) => setNewReq({ ...newReq, level: e.target.value })}
              className={fieldClassName}
              style={{ width: "auto", background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            >
              <option value="">Any Level</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
              <option>Expert</option>
            </select>
            <input
              type="number"
              min="0"
              value={newReq.yearsRequired}
              onChange={(e) => setNewReq({ ...newReq, yearsRequired: e.target.value })}
              className={`w-24 ${fieldClassName}`}
              style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              placeholder="Yrs"
            />
            <label className="flex items-center gap-2 text-sm px-2" style={{ color: "var(--text-secondary)" }}>
              <input
                type="checkbox"
                checked={newReq.required}
                onChange={(e) => setNewReq({ ...newReq, required: e.target.checked })}
              />
              Required
            </label>
            <Button type="button" onClick={addRequirement}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.requirements.map((r, i) => (
              <span
                key={`${r.skill}-${i}`}
                className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full"
                style={r.required ? { background: "var(--accent-light)", color: "var(--accent)" } : { background: "var(--surface-inset)", color: "var(--text-secondary)" }}
              >
                {r.skill}
                {r.level ? ` · ${r.level}` : ""}
                {r.yearsRequired ? ` · ${r.yearsRequired}yr` : ""}
                {!r.required && " (nice)"}
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, j) => j !== i) }))}
                >
                  <Trash2 className="w-3 h-3 opacity-60 hover:opacity-100" />
                </button>
              </span>
            ))}
          </div>

          <div>
            <FieldLabel>Nice to Have</FieldLabel>
            <div className="flex gap-2">
              <input
                value={newNice}
                onChange={(e) => setNewNice(e.target.value)}
                className={`flex-1 ${fieldClassName}`}
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
                placeholder="e.g. GraphQL, Rust..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newNice) {
                      setForm((f) => ({ ...f, niceToHave: [...f.niceToHave, newNice] }));
                      setNewNice("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (newNice) {
                    setForm((f) => ({ ...f, niceToHave: [...f.niceToHave, newNice] }));
                    setNewNice("");
                  }
                }}
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.niceToHave.map((n, i) => (
                <span key={`${n}-${i}`} className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full" style={{ background: "#fffbeb", color: "#d97706" }}>
                  {n}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, niceToHave: f.niceToHave.filter((_, j) => j !== i) }))}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card p-6 space-y-4">
          <h2 className="font-semibold" style={{ color: "var(--text-primary)" }}>Responsibilities</h2>
          <div className="flex gap-2">
            <input
              value={newResp}
              onChange={(e) => setNewResp(e.target.value)}
              className={`flex-1 ${fieldClassName}`}
              style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
              placeholder="e.g. Design and implement REST APIs..."
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (newResp) {
                    setForm((f) => ({ ...f, responsibilities: [...f.responsibilities, newResp] }));
                    setNewResp("");
                  }
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (newResp) {
                  setForm((f) => ({ ...f, responsibilities: [...f.responsibilities, newResp] }));
                  setNewResp("");
                }
              }}
            >
              Add
            </Button>
          </div>
          <ul className="space-y-2">
            {form.responsibilities.map((r, i) => (
              <li key={`${r}-${i}`} className="flex items-center gap-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "var(--accent)" }} />
                <span className="flex-1">{r}</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, responsibilities: f.responsibilities.filter((_, j) => j !== i) }))}
                  style={{ color: "var(--text-muted)" }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={saving} className="flex-1" loading={saving}>
            Save Changes
          </Button>
          <Button type="button" asChild variant="outline">
            <Link href="/jobs">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
