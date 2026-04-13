"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { fetchJobs } from "@/store/jobsSlice";
import { fetchCandidates } from "@/store/candidatesSlice";
import { runScreening } from "@/store/screeningSlice";
import { Zap, Loader2, AlertCircle, CheckCircle, Users, Briefcase } from "lucide-react";

export default function ScreeningPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: jobs } = useSelector((s: RootState) => s.jobs);
  const { items: candidates, total } = useSelector((s: RootState) => s.candidates);
  const { loading, error } = useSelector((s: RootState) => s.screening);

  const [jobId, setJobId] = useState(searchParams.get("jobId") || "");
  const [shortlistSize, setShortlistSize] = useState(10);

  useEffect(() => {
    dispatch(fetchJobs());
    dispatch(fetchCandidates());
  }, [dispatch]);

  const selectedJob = jobs.find((j) => j._id === jobId);

  const handleRun = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return;
    const result = await dispatch(runScreening({ jobId, shortlistSize }));
    if (runScreening.fulfilled.match(result)) {
      router.push(`/results/${result.payload._id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">AI Screening</h1>
        <p className="text-slate-500 mt-1">Let Gemini AI rank and explain candidate matches</p>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{jobs.length}</p>
            <p className="text-xs text-slate-500">Jobs available</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-xl font-bold text-slate-900">{total}</p>
            <p className="text-xs text-slate-500">Candidates in pool</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Screening failed</p>
            <p className="text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleRun} className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Select Job *</label>
            {jobs.length === 0 ? (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                No jobs found. <a href="/jobs/new" className="font-medium underline">Post a job first</a>.
              </div>
            ) : (
              <select required value={jobId} onChange={(e) => setJobId(e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">— Select a job opening —</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>{j.title} · {j.experienceLevel} · {j.location}</option>
                ))}
              </select>
            )}
          </div>

          {selectedJob && (
            <div className="p-4 bg-slate-50 rounded-lg text-sm space-y-2">
              <p className="font-medium text-slate-700">{selectedJob.title}</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.requirements.slice(0, 6).map((r) => (
                  <span key={r.skill} className={`text-xs px-2 py-0.5 rounded-full ${r.required ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"}`}>
                    {r.skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Shortlist size — top <span className="text-blue-600 font-semibold">{shortlistSize}</span> candidates
            </label>
            <input type="range" min="5" max="20" step="5" value={shortlistSize} onChange={(e) => setShortlistSize(Number(e.target.value))}
              className="w-full accent-blue-600" />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>Top 5</span><span>Top 10</span><span>Top 15</span><span>Top 20</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Candidate Pool</label>
            <div className="p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
              All <strong className="text-slate-800">{total}</strong> candidates in the database will be screened.
              {total === 0 && (
                <span className="text-amber-600 ml-1">
                  No candidates yet — <a href="/candidates/upload" className="underline font-medium">import some first</a>.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* AI explanation */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600" /> How AI Screening Works
          </h3>
          <ol className="space-y-2 text-sm text-slate-600">
            {[
              "Deterministic engine pre-scores all candidates (skills 40%, experience 25%, projects 15%, education 10%, availability 10%)",
              "Top candidates sent to Gemini 2.0 Flash for deep qualitative analysis",
              "Gemini returns ranked shortlist with strengths, gaps, interview questions, and skill gap analysis",
              "Results stored and presented for recruiter review — humans make the final decision",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <button
          type="submit"
          disabled={loading || !jobId || total === 0}
          className="w-full py-4 bg-violet-600 hover:bg-violet-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI is screening candidates... (this may take 30–60 seconds)
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Run AI Screening
            </>
          )}
        </button>
      </form>
    </div>
  );
}
