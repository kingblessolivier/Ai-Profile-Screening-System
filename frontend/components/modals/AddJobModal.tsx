"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { createJob } from "@/store/jobsSlice";
import { BaseModal } from "./BaseModal";
import { Loader, Plus, X } from "lucide-react";

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => Promise<void>;
}

const INPUT = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition bg-white";
const LABEL = "block text-xs font-semibold text-slate-600 mb-1";
const CARD  = "rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50/50 relative";
const ADD_BTN = "inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1";

type Tab = "basic" | "requirements" | "responsibilities" | "salary";

const TABS: { id: Tab; label: string }[] = [
  { id: "basic",           label: "Basic"           },
  { id: "requirements",    label: "Requirements"    },
  { id: "responsibilities",label: "Responsibilities"},
  { id: "salary",          label: "Salary"          },
];

const EMPTY_BASIC = {
  title: "", description: "", location: "", department: "",
  experienceLevel: "Mid-level", type: "Full-time",
};

export function AddJobModal({ isOpen, onClose }: AddJobModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [tab,     setTab]     = useState<Tab>("basic");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const [basic, setBasic] = useState(EMPTY_BASIC);

  const [requirements, setRequirements] = useState<{
    skill: string; level: string; yearsRequired: string; required: boolean;
  }[]>([]);

  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [niceInput,  setNiceInput]  = useState("");

  const [responsibilities, setResponsibilities] = useState<string[]>([""]);

  const [salary, setSalary] = useState({ min: "", max: "", currency: "USD" });

  const reset = () => {
    setTab("basic"); setBasic(EMPTY_BASIC);
    setRequirements([]); setNiceToHave([]); setNiceInput("");
    setResponsibilities([""]); setSalary({ min: "", max: "", currency: "USD" });
    setError("");
  };

  const handleClose = () => { reset(); onClose(); };

  const addNiceToHave = () => {
    const v = niceInput.trim();
    if (v && !niceToHave.includes(v)) setNiceToHave((p) => [...p, v]);
    setNiceInput("");
  };

  const handleSubmit = async () => {
    if (!basic.title.trim() || !basic.description.trim()) {
      setTab("basic");
      setError("Title and description are required.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await dispatch(createJob({
        title:           basic.title.trim(),
        description:     basic.description.trim(),
        location:        basic.location.trim(),
        department:      basic.department.trim() || undefined,
        experienceLevel: basic.experienceLevel as any,
        type:            basic.type as any,
        requirements: requirements
          .filter((r) => r.skill.trim())
          .map((r) => ({
            skill: r.skill.trim(),
            level: r.level || undefined,
            yearsRequired: Number(r.yearsRequired) || undefined,
            required: r.required,
          })),
        niceToHave,
        responsibilities: responsibilities.filter((r) => r.trim()),
        salaryRange: salary.min && salary.max
          ? { min: Number(salary.min), max: Number(salary.max), currency: salary.currency }
          : undefined,
      })).unwrap();
      reset();
      onClose();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create job.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Post New Job"
      description="Create a new job posting"
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
            {loading ? "Creating…" : "Create Job"}
          </button>
        </>
      }
    >
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-100 mb-5 -mt-1">
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
        <div className="space-y-4">
          <div>
            <label className={LABEL}>Job Title *</label>
            <input className={INPUT} placeholder="e.g., Senior React Developer" value={basic.title}
              onChange={(e) => setBasic((b) => ({ ...b, title: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Description *</label>
            <textarea className={INPUT} rows={4} placeholder="Job description and overview…" value={basic.description}
              onChange={(e) => setBasic((b) => ({ ...b, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Location</label>
              <input className={INPUT} placeholder="e.g., Kigali, Rwanda" value={basic.location}
                onChange={(e) => setBasic((b) => ({ ...b, location: e.target.value }))} />
            </div>
            <div>
              <label className={LABEL}>Department</label>
              <input className={INPUT} placeholder="e.g., Engineering" value={basic.department}
                onChange={(e) => setBasic((b) => ({ ...b, department: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Experience Level</label>
              <select className={INPUT} value={basic.experienceLevel}
                onChange={(e) => setBasic((b) => ({ ...b, experienceLevel: e.target.value }))}>
                <option>Junior</option><option>Mid-level</option>
                <option>Senior</option><option>Lead</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Job Type</label>
              <select className={INPUT} value={basic.type}
                onChange={(e) => setBasic((b) => ({ ...b, type: e.target.value }))}>
                <option>Full-time</option><option>Part-time</option><option>Contract</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── REQUIREMENTS ── */}
      {tab === "requirements" && (
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">Required & Optional Skills</p>
            {requirements.map((r, i) => (
              <div key={i} className={CARD}>
                <button onClick={() => setRequirements((p) => p.filter((_, j) => j !== i))}
                  className="absolute top-3 right-3 text-slate-400 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Skill</label>
                    <input className={INPUT} placeholder="e.g., React" value={r.skill}
                      onChange={(e) => setRequirements((p) => p.map((x, j) => j === i ? { ...x, skill: e.target.value } : x))} />
                  </div>
                  <div>
                    <label className={LABEL}>Level</label>
                    <select className={INPUT} value={r.level}
                      onChange={(e) => setRequirements((p) => p.map((x, j) => j === i ? { ...x, level: e.target.value } : x))}>
                      <option value="">Any</option>
                      <option>Beginner</option><option>Intermediate</option>
                      <option>Advanced</option><option>Expert</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 items-end">
                  <div>
                    <label className={LABEL}>Years Required</label>
                    <input type="number" min={0} className={INPUT} placeholder="e.g., 3" value={r.yearsRequired}
                      onChange={(e) => setRequirements((p) => p.map((x, j) => j === i ? { ...x, yearsRequired: e.target.value } : x))} />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer pb-2">
                    <input type="checkbox" checked={r.required}
                      onChange={(e) => setRequirements((p) => p.map((x, j) => j === i ? { ...x, required: e.target.checked } : x))} />
                    Required skill
                  </label>
                </div>
              </div>
            ))}
            <button onClick={() => setRequirements((p) => [...p, { skill: "", level: "", yearsRequired: "", required: true }])} className={ADD_BTN}>
              <Plus className="w-3.5 h-3.5" /> Add Skill Requirement
            </button>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700">Nice to Have</p>
            <div className="flex gap-2">
              <input className={INPUT} placeholder="e.g., GraphQL — press Enter to add"
                value={niceInput} onChange={(e) => setNiceInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNiceToHave(); } }} />
              <button onClick={addNiceToHave}
                className="px-3 py-2 rounded-lg text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex-shrink-0">
                Add
              </button>
            </div>
            {niceToHave.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                {niceToHave.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {s}
                    <button onClick={() => setNiceToHave((p) => p.filter((x) => x !== s))}
                      className="hover:text-red-500 ml-0.5"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── RESPONSIBILITIES ── */}
      {tab === "responsibilities" && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-700 mb-2">Key Responsibilities</p>
          {responsibilities.map((r, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-xs text-slate-400 mt-2.5 w-5 flex-shrink-0">{i + 1}.</span>
              <input className={`${INPUT} flex-1`} placeholder="e.g., Build and maintain REST APIs…" value={r}
                onChange={(e) => setResponsibilities((p) => p.map((x, j) => j === i ? e.target.value : x))} />
              <button onClick={() => setResponsibilities((p) => p.filter((_, j) => j !== i))}
                className="mt-2 text-slate-400 hover:text-red-500 flex-shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          <button onClick={() => setResponsibilities((p) => [...p, ""])} className={ADD_BTN}>
            <Plus className="w-3.5 h-3.5" /> Add Responsibility
          </button>
        </div>
      )}

      {/* ── SALARY ── */}
      {tab === "salary" && (
        <div className="space-y-4">
          <p className="text-xs text-slate-500">Leave blank if you prefer not to disclose salary.</p>
          <div>
            <label className={LABEL}>Currency</label>
            <select className={INPUT} value={salary.currency}
              onChange={(e) => setSalary((s) => ({ ...s, currency: e.target.value }))}>
              <option>USD</option><option>EUR</option><option>GBP</option>
              <option>RWF</option><option>KES</option><option>NGN</option>
              <option>ZAR</option><option>GHS</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={LABEL}>Minimum Salary</label>
              <input type="number" min={0} className={INPUT} placeholder="e.g., 80000" value={salary.min}
                onChange={(e) => setSalary((s) => ({ ...s, min: e.target.value }))} />
            </div>
            <div>
              <label className={LABEL}>Maximum Salary</label>
              <input type="number" min={0} className={INPUT} placeholder="e.g., 120000" value={salary.max}
                onChange={(e) => setSalary((s) => ({ ...s, max: e.target.value }))} />
            </div>
          </div>
          {salary.min && salary.max && (
            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
              Range: {salary.currency} {Number(salary.min).toLocaleString()} – {Number(salary.max).toLocaleString()} / year
            </p>
          )}
        </div>
      )}
    </BaseModal>
  );
}
