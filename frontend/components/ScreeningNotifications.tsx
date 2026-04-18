"use client";

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { AppDispatch, RootState } from "@/store";
import { dismiss, markRead } from "@/store/screeningQueueSlice";
import { dismissUpload } from "@/store/uploadQueueSlice";
import { CheckCircle, AlertCircle, X, ExternalLink, Loader2, FileUp } from "lucide-react";

// ─── Individual toast ─────────────────────────────────────────────────────────

function Toast({
  id, jobTitle, status, resultId, error,
}: {
  id: string; jobTitle: string; status: "complete" | "failed";
  resultId?: string; error?: string;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const router   = useRouter();
  const timer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => dispatch(dismiss(id)), 10000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [id, dispatch]);

  const ok = status === "complete";

  return (
    <div
      className="flex items-start gap-3 w-80 rounded-2xl p-4 shadow-2xl animate-slide-up"
      style={{
        background: ok
          ? "linear-gradient(135deg,#052e16,#064e3b)"
          : "linear-gradient(135deg,#1c0a0a,#3b0909)",
        border: `1px solid ${ok ? "rgba(5,150,105,0.4)" : "rgba(239,68,68,0.35)"}`,
        boxShadow: ok
          ? "0 8px 32px rgba(5,150,105,0.25)"
          : "0 8px 32px rgba(239,68,68,0.2)",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: ok ? "rgba(5,150,105,0.2)" : "rgba(239,68,68,0.2)",
          border: `1px solid ${ok ? "rgba(5,150,105,0.35)" : "rgba(239,68,68,0.3)"}`,
        }}
      >
        {ok
          ? <CheckCircle className="w-4 h-4" style={{ color: "#34d399" }} />
          : <AlertCircle className="w-4 h-4" style={{ color: "#f87171" }} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white leading-snug">
          {ok ? "Screening complete" : "Screening failed"}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
          {jobTitle}
        </p>
        {ok && resultId && (
          <button
            onClick={() => { dispatch(markRead(id)); router.push(`/results/${resultId}`); }}
            className="mt-2 flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-all"
            style={{ background: "rgba(5,150,105,0.25)", color: "#34d399", border: "1px solid rgba(5,150,105,0.3)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(5,150,105,0.4)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(5,150,105,0.25)"; }}
          >
            View Results <ExternalLink className="w-3 h-3" />
          </button>
        )}
        {!ok && error && (
          <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>
        )}
      </div>

      <button
        onClick={() => dispatch(dismiss(id))}
        className="p-1 rounded-lg transition-colors flex-shrink-0"
        style={{ color: "rgba(255,255,255,0.3)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Upload toast ─────────────────────────────────────────────────────────────

function UploadToast({
  id, jobTitle, status, created, updated, failed, error, fileCount, type,
}: {
  id: string; jobTitle: string; status: "complete" | "failed";
  created?: number; updated?: number; failed?: number;
  error?: string; fileCount: number; type: "pdf" | "csv";
}) {
  const dispatch = useDispatch<AppDispatch>();
  const timer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    timer.current = setTimeout(() => dispatch(dismissUpload(id)), 10000);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [id, dispatch]);

  const ok = status === "complete";

  return (
    <div
      className="flex items-start gap-3 w-80 rounded-2xl p-4 shadow-2xl animate-slide-up"
      style={{
        background: ok
          ? "linear-gradient(135deg,#052e16,#064e3b)"
          : "linear-gradient(135deg,#1c0a0a,#3b0909)",
        border: `1px solid ${ok ? "rgba(5,150,105,0.4)" : "rgba(239,68,68,0.35)"}`,
        boxShadow: ok ? "0 8px 32px rgba(5,150,105,0.25)" : "0 8px 32px rgba(239,68,68,0.2)",
      }}
    >
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: ok ? "rgba(5,150,105,0.2)" : "rgba(239,68,68,0.2)",
          border: `1px solid ${ok ? "rgba(5,150,105,0.35)" : "rgba(239,68,68,0.3)"}`,
        }}
      >
        {ok
          ? <FileUp className="w-4 h-4" style={{ color: "#34d399" }} />
          : <AlertCircle className="w-4 h-4" style={{ color: "#f87171" }} />}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-white leading-snug">
          {ok ? `${type === "pdf" ? "Resumes" : "CSV"} import complete` : "Upload failed"}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(255,255,255,0.5)" }}>
          {jobTitle}
        </p>
        {ok && (
          <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>
            {created ?? 0} imported{(failed ?? 0) > 0 ? ` · ${failed} skipped` : ""}
          </p>
        )}
        {!ok && error && (
          <p className="text-xs mt-1" style={{ color: "#f87171" }}>{error}</p>
        )}
      </div>

      <button
        onClick={() => dispatch(dismissUpload(id))}
        className="p-1 rounded-lg transition-colors flex-shrink-0"
        style={{ color: "rgba(255,255,255,0.3)" }}
        onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.3)"; }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Global container (fixed, bottom-right) ───────────────────────────────────

export function ScreeningNotifications() {
  const screeningItems  = useSelector((s: RootState) => s.screeningQueue.items);
  const screeningUnread = useSelector((s: RootState) => s.screeningQueue.unread);
  const uploadItems     = useSelector((s: RootState) => s.uploadQueue.items);
  const uploadUnread    = useSelector((s: RootState) => s.uploadQueue.unread);

  const screeningProcessing = screeningItems.filter((i) => i.status === "processing").length;
  const uploadProcessing    = uploadItems.filter((i) => i.status === "processing");

  const screeningToasts = screeningItems.filter(
    (i) => (i.status === "complete" || i.status === "failed") && screeningUnread.includes(i.id)
  );
  const uploadToasts = uploadItems.filter(
    (i) => (i.status === "complete" || i.status === "failed") && uploadUnread.includes(i.id)
  );

  const hasAnything =
    screeningProcessing > 0 || uploadProcessing.length > 0 ||
    screeningToasts.length > 0 || uploadToasts.length > 0;

  if (!hasAnything) return null;

  return (
    <div className="fixed z-[9999] flex flex-col gap-3 pointer-events-none" style={{ bottom: 24, right: 24 }}>
      {/* Screening in-progress pill */}
      {screeningProcessing > 0 && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold pointer-events-auto"
          style={{
            background: "rgba(37,99,235,0.12)",
            border: "1px solid rgba(37,99,235,0.25)",
            color: "#60a5fa",
          }}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          {screeningProcessing === 1 ? "Screening in progress…" : `${screeningProcessing} screenings running…`}
        </div>
      )}

      {/* Upload in-progress pills */}
      {uploadProcessing.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-2 px-3 py-2 rounded-full text-xs font-semibold pointer-events-auto"
          style={{
            background: "rgba(16,185,129,0.1)",
            border: "1px solid rgba(16,185,129,0.25)",
            color: "#34d399",
          }}
        >
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          AI parsing {item.fileCount} resume{item.fileCount !== 1 ? "s" : ""} for {item.jobTitle}…
        </div>
      ))}

      {/* Screening done toasts */}
      {screeningToasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <Toast
            id={item.id}
            jobTitle={item.jobTitle}
            status={item.status as "complete" | "failed"}
            resultId={item.resultId}
            error={item.error}
          />
        </div>
      ))}

      {/* Upload done toasts */}
      {uploadToasts.map((item) => (
        <div key={item.id} className="pointer-events-auto">
          <UploadToast
            id={item.id}
            jobTitle={item.jobTitle}
            status={item.status as "complete" | "failed"}
            created={item.created}
            updated={item.updated}
            failed={item.failed}
            error={item.error}
            fileCount={item.fileCount}
            type={item.type}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Bell badge (used in topbar) ──────────────────────────────────────────────

export function ScreeningBadge() {
  const unread      = useSelector((s: RootState) => s.screeningQueue.unread.length);
  const processing  = useSelector(
    (s: RootState) => s.screeningQueue.items.filter((i) => i.status === "processing").length
  );

  if (processing > 0) {
    return (
      <span
        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white"
        style={{ background: "#3b82f6", animation: "blink-cursor 1.5s ease infinite" }}
      />
    );
  }
  if (unread > 0) {
    return (
      <span
        className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center"
        style={{ background: "#ef4444", fontSize: 9, color: "#fff", fontWeight: 700 }}
      >
        {unread > 9 ? "9+" : unread}
      </span>
    );
  }
  return null;
}
