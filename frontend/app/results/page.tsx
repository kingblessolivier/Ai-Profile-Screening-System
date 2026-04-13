"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchResults } from "@/store/screeningSlice";
import { BarChart3, Clock, Users, Trophy, ChevronRight } from "lucide-react";

const RECO_COLORS: Record<string, string> = {
  "Strongly Recommended": "text-emerald-600 bg-emerald-50",
  Recommended: "text-blue-600 bg-blue-50",
  Consider: "text-amber-600 bg-amber-50",
  "Not Recommended": "text-slate-500 bg-slate-100",
};

export default function ResultsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { results, loading } = useSelector((s: RootState) => s.screening);

  useEffect(() => { dispatch(fetchResults()); }, [dispatch]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Screening Results</h1>
        <p className="text-slate-500 mt-1">{results.length} screening run{results.length !== 1 ? "s" : ""}</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">Loading results...</div>
      ) : results.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <BarChart3 className="w-10 h-10 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">No screening results yet.</p>
          <Link href="/screening" className="inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm">
            Run First Screening
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <Link
              key={r._id}
              href={`/results/${r._id}`}
              className="block bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h2 className="font-semibold text-slate-900">{r.jobTitle}</h2>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(r.screeningDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>

                  <div className="flex items-center gap-5 text-sm text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{r.totalApplicants} screened</span>
                    <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500" />Top {r.shortlistSize} shortlisted</span>
                    <span className="text-xs text-slate-400">{(r.processingTimeMs / 1000).toFixed(1)}s • {r.aiModel}</span>
                  </div>

                  {/* Top 3 candidates preview */}
                  <div className="flex gap-3 flex-wrap">
                    {r.shortlist.slice(0, 3).map((c) => (
                      <div key={c.candidateId} className="flex items-center gap-2 text-sm">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                          {c.rank}
                        </span>
                        <span className="text-slate-700 font-medium">{c.candidateName.split(" ")[0]}</span>
                        <span className="font-semibold text-blue-600">{c.matchScore}%</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${RECO_COLORS[c.recommendation] || ""}`}>
                          {c.recommendation.split(" ")[0]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{r.shortlist[0]?.matchScore ?? 0}%</p>
                    <p className="text-xs text-slate-400">top match</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
