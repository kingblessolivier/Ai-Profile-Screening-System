import { Router } from "express";
import multer from "multer";
import path from "path";
import { authenticate } from "../middleware/auth";
import { register, login, me } from "../controllers/authController";
import { createJob, getJobs, getJob, updateJob, deleteJob } from "../controllers/jobController";
import {
  getCandidates, getCandidate, createCandidate, bulkCreateCandidates,
  deleteCandidate, uploadPDFResumes, uploadCSV,
} from "../controllers/candidateController";
import {
  runScreening, getScreeningResults, getScreeningResult,
  getLatestResultForJob, deleteScreeningResult, exportScreeningResultPdf,
  streamThinking,
} from "../controllers/screeningController";

const router = Router();

// ─── Multer config ────────────────────────────────────────────────────────────
const upload = multer({
  dest: path.join(process.cwd(), "uploads"),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_req, file, cb) => {
    const allowed = [".pdf", ".csv", ".xlsx"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext) || file.mimetype === "text/csv") cb(null, true);
    else cb(new Error(`Unsupported file type: ${ext}`));
  },
});

// ─── Auth ─────────────────────────────────────────────────────────────────────
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/me", authenticate, me);

// ─── Jobs ─────────────────────────────────────────────────────────────────────
router.get("/jobs", authenticate, getJobs);
router.post("/jobs", authenticate, createJob);
router.get("/jobs/:id", authenticate, getJob);
router.put("/jobs/:id", authenticate, updateJob);
router.delete("/jobs/:id", authenticate, deleteJob);

// ─── Candidates ───────────────────────────────────────────────────────────────
router.get("/candidates", authenticate, getCandidates);
router.post("/candidates", authenticate, createCandidate);
router.post("/candidates/bulk", authenticate, bulkCreateCandidates);
router.post("/candidates/upload/pdf", authenticate, upload.array("resumes", 20), uploadPDFResumes);
router.post("/candidates/upload/csv", authenticate, upload.single("file"), uploadCSV);
router.get("/candidates/:id", authenticate, getCandidate);
router.delete("/candidates/:id", authenticate, deleteCandidate);

// ─── Screening ────────────────────────────────────────────────────────────────
router.post("/screening/run", authenticate, runScreening);
router.get("/screening", authenticate, getScreeningResults);
router.get("/screening/job/:jobId/latest", authenticate, getLatestResultForJob);
router.get("/screening/:id/thinking-stream", authenticate, streamThinking);
router.get("/screening/:id/report/pdf", authenticate, exportScreeningResultPdf);
router.get("/screening/:id", authenticate, getScreeningResult);
router.delete("/screening/:id", authenticate, deleteScreeningResult);

export default router;
