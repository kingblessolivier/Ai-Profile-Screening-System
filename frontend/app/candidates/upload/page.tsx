"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams, useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { seedDummyData } from "@/store/candidatesSlice";
import { fetchJobs } from "@/store/jobsSlice";
import { DUMMY_CANDIDATES } from "@/lib/dummyData";
import api from "@/lib/api";
import {
  Upload, FileText, Table, Database, CheckCircle,
  Loader2, AlertCircle, ArrowLeft, XCircle, User, Zap,
  Briefcase, MapPin,
} from "lucide-react";
import Link from "next/link";

interface FileResult {
  file: string;
  status: "imported" | "skipped" | "error";
  name?: string;
  email?: string;
  skillsCount?: number;
  experienceCount?: number;
  error?: string;
}

function UploadPageContent() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlJobId = searchParams.get("jobId") ?? "";

  const { items: jobs } = useSelector((s: RootState) => s.jobs);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [pdfResults, setPdfResults] = useState<FileResult[]>([]);
  const [csvMessage, setCsvMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [seedMessage, setSeedMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [dragging, setDragging] = useState(false);

  const pdfRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchJobs());
  }, [dispatch]);

  const job = jobs.find((j) => j._id === urlJobId);
  const backHref = urlJobId ? `/jobs/${urlJobId}` : "/candidates";

  const processPDFs = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter((f) => f.name.endsWith(".pdf"));
    if (arr.length === 0) return;
    if (!urlJobId) return;
    setPdfLoading(true);
    setPdfResults([]);
    try {
      const form = new FormData();
      arr.forEach((f) => form.append("resumes", f));
      form.append("jobId", urlJobId);
      const { data } = await api.post<{ results: FileResult[] }>("/candidates/upload/pdf", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPdfResults(data.results);
    } catch {
      setPdfResults([{ file: "upload", status: "error", error: "Upload failed. Please try again." }]);
    } finally {
      setPdfLoading(false);
      if (pdfRef.current) pdfRef.current.value = "";
    }
  };

  const handlePDFInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processPDFs(e.target.files);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) processPDFs(e.dataTransfer.files);
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !urlJobId) return;
    setCsvLoading(true);
    setCsvMessage(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("jobId", urlJobId);
      const { data } = await api.post("/candidates/upload/csv", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCsvMessage({ type: "success", text: data.message });
      setTimeout(() => router.push(backHref), 2000);
    } catch {
      setCsvMessage({ type: "error", text: "CSV import failed. Check the file format." });
    } finally {
      setCsvLoading(false);
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const handleSeed = async () => {
    if (!urlJobId) return;
    setSeedLoading(true);
    setSeedMessage(null);
    try {
      await dispatch(seedDummyData({ candidates: DUMMY_CANDIDATES, jobId: urlJobId })).unwrap();
      setSeedMessage({ type: "success", text: `${DUMMY_CANDIDATES.length} demo candidates loaded.` });
      setTimeout(() => router.push(backHref), 2000);
    } catch {
      setSeedMessage({ type: "error", text: "Failed to seed demo data." });
    } finally {
      setSeedLoading(false);
    }
  };

  const importedCount = pdfResults.filter((r) => r.status === "imported").length;
  const allDone = pdfResults.length > 0 && !pdfLoading;

  /* ── No jobId guard ───────────────────────────────────────────────────────── */
  if (!urlJobId) {
    return (
      <div className="max-w-3xl mx-auto animate-slide-up">
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(239,68,68,0.1)" }}>
            <Briefcase className="w-8 h-8" style={{ color: "var(--error, #ef4444)" }} />
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            No job selected
          </h2>
          <p className="text-sm mb-6 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>
            Candidates must be linked to a job. Go to a job first, then use the "Upload Resumes" button there.
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
    <div className="max-w-3xl mx-auto animate-slide-up">

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
            Import
          </p>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-display, system-ui)" }}>
            Upload Resumes
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
            Adding candidates to
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

      <div className="space-y-5">

        {/* ── PDF Upload ─────────────────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent-light)" }}>
              <FileText className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Upload PDF Resumes
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Gemini reads each PDF natively — up to 20 files at once
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ background: "var(--ai-light, rgba(139,92,246,0.12))", color: "var(--ai)" }}>
              <Zap className="w-3 h-3" />
              AI-powered
            </div>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !pdfLoading && pdfRef.current?.click()}
            className="rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center gap-3 py-10"
            style={{
              border: `2px dashed ${dragging ? "var(--accent)" : "var(--border)"}`,
              background: dragging ? "var(--accent-light)" : "var(--surface-inset)",
              opacity: pdfLoading ? 0.6 : 1,
              pointerEvents: pdfLoading ? "none" : "auto",
            }}
          >
            {pdfLoading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--ai)" }} />
                <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                  Gemini is reading resumes…
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: "var(--accent-light)" }}>
                  <Upload className="w-6 h-6" style={{ color: "var(--accent)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    Drop PDF files here or click to browse
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    Extracts name, email, skills, experience, education, projects, and more
                  </p>
                </div>
              </>
            )}
          </div>

          <input ref={pdfRef} type="file" accept=".pdf" multiple className="hidden" onChange={handlePDFInput} />

          {/* Per-file results */}
          {pdfResults.length > 0 && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold" style={{ color: "var(--text-muted)" }}>
                  Results — {importedCount}/{pdfResults.length} imported
                </p>
                <button onClick={() => setPdfResults([])} className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Clear
                </button>
              </div>
              {pdfResults.map((r, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: r.status === "imported"
                      ? "var(--success-light, rgba(5,150,105,0.08))"
                      : r.status === "error"
                        ? "var(--error-light, rgba(239,68,68,0.08))"
                        : "var(--surface-inset)",
                    border: `1px solid ${r.status === "imported" ? "var(--success-border, rgba(5,150,105,0.2))" : r.status === "error" ? "var(--error-border, rgba(239,68,68,0.2))" : "var(--border)"}`,
                  }}>
                  {r.status === "imported" ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
                  ) : r.status === "error" ? (
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--error)" }} />
                  ) : (
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "var(--warning)" }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                      {r.file}
                    </p>
                    {r.status === "imported" && r.name && (
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                        <span className="text-xs flex items-center gap-1" style={{ color: "var(--text-secondary)" }}>
                          <User className="w-3 h-3" /> {r.name}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-muted)" }}>{r.email}</span>
                        {(r.skillsCount ?? 0) > 0 && (
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            {r.skillsCount} skills · {r.experienceCount} roles
                          </span>
                        )}
                      </div>
                    )}
                    {(r.status === "skipped" || r.status === "error") && r.error && (
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{r.error}</p>
                    )}
                  </div>
                </div>
              ))}

              {/* Post-import CTA */}
              {allDone && importedCount > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <Link href={backHref}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to job
                  </Link>
                  <Link href={`/screening?jobId=${urlJobId}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                    style={{ background: "var(--ai)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 12px rgba(2,132,199,0.35)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}>
                    <Zap className="w-3.5 h-3.5" />
                    Screen Now
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── CSV Upload ─────────────────────────────────────────────────────── */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.12)" }}>
              <Table className="w-4 h-4" style={{ color: "#d97706" }} />
            </div>
            <div>
              <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                Upload CSV Spreadsheet
              </h2>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                Bulk import from a spreadsheet with structured columns
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {["firstName", "lastName", "email", "headline", "location", "skills", "availability", "type"].map((col) => (
              <code key={col} className="text-xs px-2 py-0.5 rounded-md font-mono"
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                {col}
              </code>
            ))}
          </div>

          {csvMessage && (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-sm"
              style={{
                background: csvMessage.type === "success" ? "var(--success-light, rgba(5,150,105,0.08))" : "var(--error-light, rgba(239,68,68,0.08))",
                border: `1px solid ${csvMessage.type === "success" ? "var(--success-border, rgba(5,150,105,0.2))" : "var(--error-border, rgba(239,68,68,0.2))"}`,
                color: csvMessage.type === "success" ? "var(--success)" : "var(--error)",
              }}>
              {csvMessage.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {csvMessage.text}
            </div>
          )}

          <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <button
            onClick={() => csvRef.current?.click()}
            disabled={csvLoading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-50"
            style={{ border: "2px dashed var(--border)", color: "var(--text-secondary)", background: "var(--surface-inset)" }}
            onMouseEnter={(e) => { if (!csvLoading) { e.currentTarget.style.borderColor = "#d97706"; e.currentTarget.style.color = "#d97706"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
          >
            {csvLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {csvLoading ? "Importing…" : "Choose CSV file"}
          </button>
        </div>

        {/* ── Demo Data ──────────────────────────────────────────────────────── */}
        <div className="card p-6" style={{ border: "1px solid var(--accent-border, rgba(37,99,235,0.25))" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent-light)" }}>
              <Database className="w-4 h-4" style={{ color: "var(--accent)" }} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                  Load Demo Candidates
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full text-white font-semibold"
                  style={{ background: "var(--accent)" }}>
                  Recommended for demo
                </span>
              </div>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                {DUMMY_CANDIDATES.length} richly structured profiles — African engineers, Umurava schema
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-4">
            {["Node.js", "React", "Python", "AI/ML", "TypeScript", "MongoDB", "DevOps"].map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                {tag}
              </span>
            ))}
          </div>

          {seedMessage && (
            <div className="mb-4 p-3 rounded-xl flex items-center gap-2.5 text-sm"
              style={{
                background: seedMessage.type === "success" ? "var(--success-light, rgba(5,150,105,0.08))" : "var(--error-light, rgba(239,68,68,0.08))",
                border: `1px solid ${seedMessage.type === "success" ? "var(--success-border, rgba(5,150,105,0.2))" : "var(--error-border, rgba(239,68,68,0.2))"}`,
                color: seedMessage.type === "success" ? "var(--success)" : "var(--error)",
              }}>
              {seedMessage.type === "success" ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {seedMessage.text}
            </div>
          )}

          <button
            onClick={handleSeed}
            disabled={seedLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}
            onMouseEnter={(e) => { if (!seedLoading) e.currentTarget.style.boxShadow = "0 6px 20px rgba(37,99,235,0.35)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
          >
            {seedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
            {seedLoading ? `Loading ${DUMMY_CANDIDATES.length} candidates…` : `Seed ${DUMMY_CANDIDATES.length} Demo Candidates`}
          </button>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl text-sm" style={{ background: "var(--surface-inset)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
        <strong style={{ color: "var(--text-secondary)" }}>After importing:</strong>{" "}
        Go back to{" "}
        <Link href={backHref} className="font-semibold" style={{ color: "var(--accent)" }}>
          the job page
        </Link>{" "}
        or{" "}
        <Link href={`/screening?jobId=${urlJobId}`} className="font-semibold" style={{ color: "var(--ai)" }}>
          run AI screening now →
        </Link>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto animate-slide-up">
        <div className="card p-12 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--text-muted)" }} />
        </div>
      </div>
    }>
      <UploadPageContent />
    </Suspense>
  );
}
