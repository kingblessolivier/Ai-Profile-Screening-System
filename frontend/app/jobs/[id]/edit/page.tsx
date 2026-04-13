"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchJob, updateJob } from "@/store/jobsSlice";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { JobRequirement } from "@/types";

const EMPTY_FORM = {
  title: "",
  description: "",
  department: "",
  location: "",
  type: "Full-time" as const,
  experienceLevel: "Mid-level" as const,
  requirements: [] as JobRequirement[],
  niceToHave: [] as string[],
  responsibilities: [] as string[],
};

export default function EditJobPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const jobId = useMemo(() => params?.id || "", [params]);
  const { current } = useSelector((state: RootState) => state.jobs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
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
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/jobs" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Job</h1>
          <p className="text-slate-500 mt-0.5">Update the role requirements for AI screening</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Backend Engineer"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
              <input
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Engineering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Location *</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Kigali, Rwanda / Remote"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Employment Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as typeof form.type })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Experience Level</label>
              <select
                value={form.experienceLevel}
                onChange={(e) => setForm({ ...form, experienceLevel: e.target.value as typeof form.experienceLevel })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Junior</option>
                <option>Mid-level</option>
                <option>Senior</option>
                <option>Lead</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Description *</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe the role, responsibilities, and ideal candidate..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Required Skills</h2>
          <div className="flex gap-2 flex-wrap">
            <input
              value={newReq.skill}
              onChange={(e) => setNewReq({ ...newReq, skill: e.target.value })}
              className="flex-1 min-w-[140px] px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400"
              placeholder="Skill (e.g. Node.js)"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addRequirement())}
            />
            <select
              value={newReq.level}
              onChange={(e) => setNewReq({ ...newReq, level: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white"
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
              className="w-24 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400"
              placeholder="Yrs"
            />
            <label className="flex items-center gap-2 text-sm text-slate-600 px-2">
              <input
                type="checkbox"
                checked={newReq.required}
                onChange={(e) => setNewReq({ ...newReq, required: e.target.checked })}
              />
              Required
            </label>
            <button
              type="button"
              onClick={addRequirement}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.requirements.map((r, i) => (
              <span
                key={`${r.skill}-${i}`}
                className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded-full ${r.required ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Nice to Have</label>
            <div className="flex gap-2">
              <input
                value={newNice}
                onChange={(e) => setNewNice(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400"
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
              <button
                type="button"
                onClick={() => {
                  if (newNice) {
                    setForm((f) => ({ ...f, niceToHave: [...f.niceToHave, newNice] }));
                    setNewNice("");
                  }
                }}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.niceToHave.map((n, i) => (
                <span key={`${n}-${i}`} className="flex items-center gap-1.5 text-xs px-3 py-1 bg-amber-100 text-amber-700 rounded-full">
                  {n}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, niceToHave: f.niceToHave.filter((_, j) => j !== i) }))}>
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <h2 className="font-semibold text-slate-800">Responsibilities</h2>
          <div className="flex gap-2">
            <input
              value={newResp}
              onChange={(e) => setNewResp(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400"
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
            <button
              type="button"
              onClick={() => {
                if (newResp) {
                  setForm((f) => ({ ...f, responsibilities: [...f.responsibilities, newResp] }));
                  setNewResp("");
                }
              }}
              className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-sm"
            >
              Add
            </button>
          </div>
          <ul className="space-y-2">
            {form.responsibilities.map((r, i) => (
              <li key={`${r}-${i}`} className="flex items-center gap-2 text-sm text-slate-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="flex-1">{r}</span>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, responsibilities: f.responsibilities.filter((_, j) => j !== i) }))}
                  className="text-slate-400 hover:text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
          <Link href="/jobs" className="px-6 py-3 border border-slate-300 hover:bg-slate-50 rounded-xl font-medium text-slate-700 transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
