"use client";

import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { seedDummyData } from "@/store/candidatesSlice";
import { DUMMY_CANDIDATES } from "@/lib/dummyData";
import api from "@/lib/api";
import { Upload, FileText, Table, Database, CheckCircle, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UploadPage() {
  const dispatch = useDispatch<AppDispatch>();
  const [pdfLoading, setPdfLoading] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [seedLoading, setSeedLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const pdfRef = useRef<HTMLInputElement>(null);
  const csvRef = useRef<HTMLInputElement>(null);

  const showMsg = (type: "success" | "error", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handlePDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setPdfLoading(true);
    try {
      const form = new FormData();
      Array.from(files).forEach((f) => form.append("resumes", f));
      const { data } = await api.post("/candidates/upload/pdf", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const imported = data.results.filter((r: { status: string }) => r.status === "imported").length;
      showMsg("success", `${imported} resume(s) imported successfully`);
    } catch {
      showMsg("error", "PDF upload failed. Please try again.");
    } finally {
      setPdfLoading(false);
      if (pdfRef.current) pdfRef.current.value = "";
    }
  };

  const handleCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const { data } = await api.post("/candidates/upload/csv", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showMsg("success", data.message);
    } catch {
      showMsg("error", "CSV upload failed. Check file format.");
    } finally {
      setCsvLoading(false);
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const handleSeed = async () => {
    setSeedLoading(true);
    try {
      await dispatch(seedDummyData(DUMMY_CANDIDATES)).unwrap();
      showMsg("success", `${DUMMY_CANDIDATES.length} demo candidates seeded successfully!`);
    } catch {
      showMsg("error", "Failed to seed demo data.");
    } finally {
      setSeedLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/candidates" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import Candidates</h1>
          <p className="text-slate-500 mt-0.5">Add candidates via PDF resumes, CSV, or demo data</p>
        </div>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-red-50 border border-red-200 text-red-800"}`}>
          {message.type === "success" ? <CheckCircle className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          {message.text}
        </div>
      )}

      <div className="space-y-5">
        {/* PDF Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-800 mb-1">Upload PDF Resumes</h2>
              <p className="text-sm text-slate-500 mb-4">
                Gemini AI will parse each resume and extract structured profile data automatically. Upload up to 20 PDFs at once.
              </p>
              <input ref={pdfRef} type="file" accept=".pdf" multiple className="hidden" onChange={handlePDF} />
              <button
                onClick={() => pdfRef.current?.click()}
                disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 hover:border-violet-400 hover:bg-violet-50 rounded-lg text-sm font-medium text-slate-600 hover:text-violet-700 transition-all disabled:opacity-50"
              >
                {pdfLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {pdfLoading ? "Parsing resumes with Gemini AI..." : "Choose PDF files"}
              </button>
            </div>
          </div>
        </div>

        {/* CSV Upload */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
              <Table className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-800 mb-1">Upload CSV Spreadsheet</h2>
              <p className="text-sm text-slate-500 mb-2">
                Import candidates from a spreadsheet. Supported columns:
              </p>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {["firstName", "lastName", "email", "headline", "location", "skills", "availability"].map((col) => (
                  <code key={col} className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-600">{col}</code>
                ))}
              </div>
              <input ref={csvRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
              <button
                onClick={() => csvRef.current?.click()}
                disabled={csvLoading}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-slate-300 hover:border-amber-400 hover:bg-amber-50 rounded-lg text-sm font-medium text-slate-600 hover:text-amber-700 transition-all disabled:opacity-50"
              >
                {csvLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {csvLoading ? "Importing CSV..." : "Choose CSV file"}
              </button>
            </div>
          </div>
        </div>

        {/* Seed Demo Data */}
        <div className="bg-white rounded-xl border-2 border-blue-200 p-6 bg-blue-50/30">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-semibold text-slate-800">Load Demo Data</h2>
                <span className="text-xs px-2 py-0.5 bg-blue-600 text-white rounded-full">Recommended for demo</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">
                Instantly load {DUMMY_CANDIDATES.length} richly structured candidate profiles following the Umurava Talent Profile Schema. Includes engineers from across Africa with diverse backgrounds.
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Node.js", "React", "Python", "AI/ML", "TypeScript", "MongoDB", "DevOps"].map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 bg-white border border-slate-200 rounded-full text-slate-600">{tag}</span>
                ))}
              </div>
              <button
                onClick={handleSeed}
                disabled={seedLoading}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {seedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                {seedLoading ? `Loading ${DUMMY_CANDIDATES.length} candidates...` : `Seed ${DUMMY_CANDIDATES.length} Demo Candidates`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-slate-100 rounded-xl text-sm text-slate-500">
        <strong className="text-slate-700">After importing:</strong> Go to{" "}
        <Link href="/screening" className="text-blue-600 hover:underline">Run Screening</Link> to trigger AI evaluation against a job.
      </div>
    </div>
  );
}
