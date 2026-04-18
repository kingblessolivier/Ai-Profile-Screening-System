"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { enqueueUpload, markUploadComplete, markUploadFailed } from "@/store/uploadQueueSlice";
import { BaseModal } from "./BaseModal";
import { Upload, FileUp, FileText, FileSpreadsheet } from "lucide-react";
import api from "@/lib/api";

interface UploadCandidatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle?: string;
  onSuccess: () => void;
}

type Tab = "resume" | "csv";

function DropZone({
  accept, multiple, hint, files, onFiles,
}: {
  accept: string; multiple: boolean; hint: string;
  files: File[]; onFiles: (f: File[]) => void;
}) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) onFiles(multiple ? dropped : [dropped[0]]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    if (selected.length) onFiles(multiple ? selected : [selected[0]]);
  };

  return (
    <div
      onDragEnter={handleDrag} onDragLeave={handleDrag}
      onDragOver={handleDrag} onDrop={handleDrop}
      className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
        dragActive
          ? "border-blue-500 bg-blue-50"
          : "border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
      }`}
    >
      <input
        type="file" accept={accept} multiple={multiple}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        {files.length > 0 ? (
          <>
            <FileUp className="w-9 h-9 text-emerald-500" />
            <p className="text-sm font-semibold text-slate-800">
              {files.length === 1 ? files[0].name : `${files.length} files selected`}
            </p>
            {files.length > 1 && (
              <ul className="text-xs text-slate-400 space-y-0.5 max-h-24 overflow-y-auto w-full">
                {files.map((f) => <li key={f.name} className="truncate">{f.name}</li>)}
              </ul>
            )}
            <p className="text-xs text-slate-400">Click to change</p>
          </>
        ) : (
          <>
            <Upload className="w-9 h-9 text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">Drag & drop or click to select</p>
            <p className="text-xs text-slate-400">{hint}</p>
          </>
        )}
      </div>
    </div>
  );
}

export function UploadCandidatesModal({
  isOpen, onClose, jobId, jobTitle = "this job", onSuccess,
}: UploadCandidatesModalProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [tab,   setTab]   = useState<Tab>("resume");
  const [files, setFiles] = useState<File[]>([]);

  const handleTabChange = (t: Tab) => { setTab(t); setFiles([]); };

  const handleClose = () => { setFiles([]); onClose(); };

  const handleUpload = () => {
    if (!files.length) return;

    const id = `upload_${Date.now()}`;

    // Enqueue immediately — close modal — user can keep working
    dispatch(enqueueUpload({
      id, jobId, jobTitle, fileCount: files.length,
      type: tab === "resume" ? "pdf" : "csv", status: "processing",
    }));
    handleClose();

    // Fire API in background — no await in UI
    const fd = new FormData();
    fd.append("jobId", jobId);

    const run = async () => {
      try {
        if (tab === "resume") {
          files.forEach((f) => fd.append("resumes", f));
          const { data } = await api.post("/candidates/upload/pdf", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          const results: any[] = data.results ?? [];
          dispatch(markUploadComplete({
            id,
            created: results.filter((r) => r.status === "imported").length,
            updated: 0,
            failed:  results.filter((r) => r.status === "error" || r.status === "skipped").length,
          }));
        } else {
          fd.append("file", files[0]);
          const { data } = await api.post("/candidates/upload/csv", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          dispatch(markUploadComplete({
            id,
            created: data.created ?? 0,
            updated: data.updated ?? 0,
            failed:  data.failed  ?? 0,
          }));
        }
        onSuccess();
      } catch (err: any) {
        dispatch(markUploadFailed({
          id,
          error: err?.response?.data?.message ?? "Upload failed",
        }));
      }
    };

    run();
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Candidates"
      description={`Add candidates for ${jobTitle}`}
      size="md"
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!files.length}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            Upload{files.length > 1 ? ` ${files.length} files` : ""}
          </button>
        </>
      }
    >
      <div className="space-y-5">

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange("resume")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              tab === "resume"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <FileText className="w-4 h-4" /> Resume (PDF)
          </button>
          <button
            onClick={() => handleTabChange("csv")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
              tab === "csv"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> CSV / Excel
          </button>
        </div>

        {/* Drop zone */}
        {tab === "resume" ? (
          <DropZone
            accept=".pdf" multiple
            hint="PDF files only · up to 20 resumes at once"
            files={files} onFiles={setFiles}
          />
        ) : (
          <DropZone
            accept=".csv,.xlsx,.xls" multiple={false}
            hint=".csv or .xlsx — columns: name, email, phone, resume_link"
            files={files} onFiles={setFiles}
          />
        )}

        {/* Info box */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 space-y-1">
          {tab === "resume" ? (
            <>
              <p className="font-semibold text-slate-700 mb-1">How it works</p>
              <p>• Select up to 20 PDF resumes — click Upload and keep working</p>
              <p>• AI parses each resume in the background</p>
              <p>• You get a notification when it&apos;s done</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-slate-700 mb-1">Required columns</p>
              <p>• <span className="font-medium text-slate-600">name</span> or <span className="font-medium text-slate-600">firstName + lastName</span></p>
              <p>• <span className="font-medium text-slate-600">email</span> — unique identifier</p>
              <p>• <span className="font-medium text-slate-600">headline</span>, <span className="font-medium text-slate-600">skills</span> — optional</p>
            </>
          )}
        </div>

      </div>
    </BaseModal>
  );
}
