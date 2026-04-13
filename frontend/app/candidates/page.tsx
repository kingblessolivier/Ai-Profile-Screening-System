"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchCandidates, deleteCandidate } from "@/store/candidatesSlice";
import { Plus, Upload, Search, Users, MapPin, Trash2, ExternalLink, CheckCircle } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  platform: "bg-blue-100 text-blue-700",
  csv: "bg-amber-100 text-amber-700",
  pdf: "bg-violet-100 text-violet-700",
};

const AVAIL_COLORS: Record<string, string> = {
  Available: "text-emerald-600",
  "Open to Opportunities": "text-amber-600",
  "Not Available": "text-slate-400",
};

export default function CandidatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, loading } = useSelector((s: RootState) => s.candidates);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    dispatch(fetchCandidates({ search, source: source || undefined }));
  }, [dispatch, search, source]);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidates</h1>
          <p className="text-slate-500 mt-1">{total} candidate{total !== 1 ? "s" : ""} in the pool</p>
        </div>
        <div className="flex gap-3">
          <Link href="/candidates/upload" className="flex items-center gap-2 px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-sm font-medium text-slate-700 transition-colors">
            <Upload className="w-4 h-4" /> Import
          </Link>
          <Link href="/candidates/new" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Candidate
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Search by name, email, skill..." />
        </div>
        <select value={source} onChange={(e) => setSource(e.target.value)}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">All Sources</option>
          <option value="platform">Platform</option>
          <option value="csv">CSV Import</option>
          <option value="pdf">PDF Resume</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">Loading candidates...</div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 py-20 text-center">
          <Users className="w-10 h-10 mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 mb-4">No candidates found.</p>
          <Link href="/candidates/upload" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
            <Upload className="w-4 h-4" /> Import Candidates
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((c) => (
            <div key={c._id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-semibold text-slate-900 truncate">{c.firstName} {c.lastName}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${SOURCE_COLORS[c.source || "platform"]}`}>
                      {c.source || "platform"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{c.headline}</p>
                </div>
                <button onClick={() => dispatch(deleteCandidate(c._id))} className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded-lg text-slate-400 transition-colors ml-2 flex-shrink-0">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                <span className={`flex items-center gap-1 font-medium ${AVAIL_COLORS[c.availability.status]}`}>
                  <CheckCircle className="w-3 h-3" />{c.availability.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {c.skills.slice(0, 4).map((s) => (
                  <span key={s.name} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{s.name}</span>
                ))}
                {c.skills.length > 4 && (
                  <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-400 rounded-full">+{c.skills.length - 4}</span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{c.experience.length} roles</span>
                <span>·</span>
                <span>{c.projects.length} projects</span>
                {c.socialLinks?.github && (
                  <>
                    <span>·</span>
                    <a href={c.socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-blue-600 transition-colors">
                      <ExternalLink className="w-3 h-3" /> GitHub
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
