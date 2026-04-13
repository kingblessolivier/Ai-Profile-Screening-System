"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { AppDispatch, RootState } from "@/store";
import { fetchCandidates, deleteCandidate } from "@/store/candidatesSlice";
import {
  Plus, Upload, Search, Users, MapPin, Trash2,
  ExternalLink, CheckCircle, AlertTriangle, Eye,
  LayoutGrid, List,
} from "lucide-react";

const SOURCE_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  platform: { bg: "#eff6ff", text: "#2563eb",  label: "Platform" },
  csv:      { bg: "#fffbeb", text: "#d97706",  label: "CSV" },
  pdf:      { bg: "#f0f9ff", text: "#0284c7",  label: "PDF" },
};

const AVAIL_STYLE: Record<string, { color: string; dot: string }> = {
  "Available":             { color: "#059669", dot: "#10b981" },
  "Open to Opportunities": { color: "#d97706", dot: "#f59e0b" },
  "Not Available":         { color: "#94a3b8", dot: "#94a3b8" },
};

export default function CandidatesPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, total, page, pages, loading } = useSelector((s: RootState) => s.candidates);
  const [search, setSearch]   = useState("");
  const [source, setSource]   = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCandidates({ search, source: source || undefined, page: currentPage }));
  }, [dispatch, search, source, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, source]);

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "#059669" }}>
            Recruitment
          </p>
          <h1
            className="text-3xl font-bold"
            style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}
          >
            Candidates
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            {total} profile{total !== 1 ? "s" : ""} in the pool
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/candidates/upload"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
          >
            <Upload className="w-4 h-4" />
            Import
          </Link>
          <Link
            href="/candidates/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg, #059669, #047857)" }}
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 14px rgba(5,150,105,0.35)")}
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
          >
            <Plus className="w-4 h-4" />
            Add Candidate
          </Link>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
            style={{ color: "var(--text-muted)" }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, skill…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg focus:outline-none transition-all"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(37,99,235,0.12)"; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = "var(--border)";  e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
        <div className="flex items-center gap-2">
          {[
            { val: "",         label: "All Sources" },
            { val: "platform", label: "Platform" },
            { val: "csv",      label: "CSV" },
            { val: "pdf",      label: "PDF" },
          ].map(({ val, label }) => (
            <button
              key={val}
              onClick={() => setSource(val)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={
                source === val
                  ? { background: "var(--accent)", color: "#fff" }
                  : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
              }
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={
              viewMode === "grid"
                ? { background: "var(--accent)", color: "#fff" }
                : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
            }
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={
              viewMode === "list"
                ? { background: "var(--accent)", color: "#fff" }
                : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
            }
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card p-5">
              <div className="flex gap-3 mb-3">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1">
                  <div className="skeleton h-4 w-2/3 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              </div>
              <div className="skeleton h-3 w-3/4 mb-2" />
              <div className="flex gap-2">
                <div className="skeleton h-5 w-14 rounded-full" />
                <div className="skeleton h-5 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card py-20 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: "#ecfdf5" }}
          >
            <Users className="w-7 h-7" style={{ color: "#059669" }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
            {search || source ? "No candidates match your filters" : "No candidates yet"}
          </p>
          <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
            {search || source ? "Try clearing your search" : "Import PDF resumes or a CSV batch to get started"}
          </p>
          {!search && !source && (
            <Link
              href="/candidates/upload"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: "#059669" }}
            >
              <Upload className="w-4 h-4" /> Import Candidates
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-3"}>
            {items.map((c) => {
              const srcStyle  = SOURCE_STYLE[c.source || "platform"] || SOURCE_STYLE.platform;
              const availStyle = AVAIL_STYLE[c.availability.status] || AVAIL_STYLE["Not Available"];
              const isList = viewMode === "list";

              return (
                <div
                  key={c._id}
                  className={isList ? "card card-hover p-4 flex flex-col gap-3" : "card card-hover p-5 flex flex-col"}
                >
                  {/* Top row */}
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div
                      className={isList ? "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0" : "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"}
                      style={{ background: "linear-gradient(135deg, #dbeafe, #e0f2fe)", color: "#1d4ed8" }}
                    >
                      {c.firstName[0]}{c.lastName[0]}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <h3 className={isList ? "font-semibold text-base truncate" : "font-semibold text-sm truncate"} style={{ color: "var(--text-primary)" }}>
                          {c.firstName} {c.lastName}
                        </h3>
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{ background: srcStyle.bg, color: srcStyle.text }}
                        >
                          {srcStyle.label}
                        </span>
                      </div>
                      <p className={isList ? "text-sm truncate" : "text-xs truncate"} style={{ color: "var(--text-muted)" }}>
                        {c.headline}
                      </p>
                    </div>

                    <button
                      onClick={() => dispatch(deleteCandidate(c._id))}
                      className="p-1.5 rounded-lg transition-colors flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--error-light)"; e.currentTarget.style.color = "var(--error)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-muted)"; }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Duplicate warning */}
                  {c.potentialDuplicate && (
                    <div
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg mb-2 text-xs font-medium"
                      style={{ background: "var(--warning-light)", border: "1px solid var(--warning-border)", color: "var(--warning)" }}
                    >
                      <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                      Possible duplicate profile
                    </div>
                  )}

                  {/* Meta */}
                  <div className={isList ? "flex items-center gap-3 text-xs mt-2" : "flex items-center gap-3 text-xs mb-3"} style={{ color: "var(--text-muted)" }}>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {c.location}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium" style={{ color: availStyle.color }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: availStyle.dot }}
                      />
                      <CheckCircle className="w-3 h-3" />
                      {c.availability.status}
                    </span>
                  </div>

                  {/* Skills */}
                  <div className={isList ? "flex flex-wrap gap-1.5 mb-0 flex-1" : "flex flex-wrap gap-1.5 mb-3 flex-1"}>
                    {c.skills.slice(0, 5).map((s) => (
                      <span
                        key={s.name}
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--surface-inset)", color: "var(--text-secondary)" }}
                      >
                        {s.name}
                      </span>
                    ))}
                    {c.skills.length > 5 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "var(--surface-inset)", color: "var(--text-muted)" }}
                      >
                        +{c.skills.length - 5}
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-3 text-xs"
                    style={{ borderTop: "1px solid var(--border)", color: "var(--text-muted)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span>{c.experience.length} role{c.experience.length !== 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{c.projects.length} project{c.projects.length !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {c.socialLinks?.github && (
                        <a
                          href={c.socialLinks.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 transition-colors"
                          style={{ color: "var(--text-muted)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                          <ExternalLink className="w-3 h-3" />
                          GitHub
                        </a>
                      )}
                      <Link
                        href={`/candidates/${c._id}`}
                        className="flex items-center gap-1 transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  currentPage <= 1
                    ? { background: "var(--surface-inset)", color: "var(--text-muted)", cursor: "not-allowed" }
                    : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
                }
              >
                Previous
              </button>

              {Array.from({ length: pages }, (_, i) => i + 1)
                .slice(Math.max(0, page - 3), Math.min(pages, page + 2))
                .map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setCurrentPage(pageNumber)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={
                      page === pageNumber
                        ? { background: "var(--accent)", color: "#fff" }
                        : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
                    }
                  >
                    {pageNumber}
                  </button>
                ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
                disabled={currentPage >= pages}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={
                  currentPage >= pages
                    ? { background: "var(--surface-inset)", color: "var(--text-muted)", cursor: "not-allowed" }
                    : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
                }
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
