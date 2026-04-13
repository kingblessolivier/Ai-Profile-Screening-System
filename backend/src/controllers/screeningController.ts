import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Candidate } from "../models/Candidate";
import { ScreeningResultModel } from "../models/ScreeningResult";
import { screenCandidates } from "../services/geminiService";
import { TalentProfile } from "../types";

function sanitizePdfText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
}

function wrapText(value: string, maxLength: number): string[] {
  const words = value.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxLength) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
}

function buildPdfBuffer(pages: string[][]): Buffer {
  const objects: string[] = [];
  const fontObjectId = 3 + pages.length * 2;

  objects.push(`<< /Type /Catalog /Pages 2 0 R >>`);
  objects.push(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 2} 0 R`).join(" ")}] /Count ${pages.length} >>`);

  pages.forEach((pageLines, index) => {
    const pageObjectId = 3 + index * 2;
    const contentObjectId = pageObjectId + 1;
    const contentLines = [
      "BT",
      "/F1 11 Tf",
      "13 TL",
      "50 780 Td",
      ...pageLines.flatMap((line, lineIndex) => {
        const escaped = sanitizePdfText(line);
        return lineIndex === 0 ? [`(${escaped}) Tj`] : [`T*`, `(${escaped}) Tj`];
      }),
      "ET",
    ];
    const contentStream = contentLines.join("\n");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectId} 0 R >>`);
    objects.push(`<< /Length ${Buffer.byteLength(contentStream, "utf8")} >>\nstream\n${contentStream}\nendstream`);
  });

  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefPosition = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPosition}\n%%EOF`;

  return Buffer.from(pdf, "utf8");
}

function buildPdfReportLines(result: Awaited<ReturnType<typeof ScreeningResultModel.findById>>): string[][] {
  if (!result) return [["No screening result found"]];

  const sections: string[] = [];
  const completedAt = result.completedAt || result.screeningDate;

  sections.push("TalentAI Screening Report");
  sections.push(`Job: ${result.jobTitle}`);
  sections.push(`Generated: ${new Date(completedAt).toLocaleString()}`);
  sections.push("");
  sections.push("Summary");
  sections.push(`Status: ${(result.status || "completed").toUpperCase()}`);
  sections.push(`Applicants screened: ${result.totalApplicants}`);
  sections.push(`Shortlist size: ${result.shortlistSize}`);
  sections.push(`AI model: ${result.aiModel}`);
  sections.push(`Processing time: ${(result.processingTimeMs / 1000).toFixed(1)}s`);
  sections.push("");
  sections.push("Top Shortlist");

  result.shortlist.slice(0, 10).forEach((candidate, index) => {
    sections.push(`${index + 1}. ${candidate.candidateName} (${candidate.matchScore}%)`);
    sections.push(`${candidate.recommendation} | Confidence ${candidate.confidence}%`);
    sections.push(`Email: ${candidate.email}`);
    wrapText(`Strengths: ${(candidate.strengths || []).slice(0, 2).join("; ") || "No strengths listed"}`, 90).forEach((line) => sections.push(line));
    wrapText(`Evidence: ${(candidate.evidence || []).slice(0, 2).join("; ") || "No evidence listed"}`, 90).forEach((line) => sections.push(line));
    wrapText(`Gaps: ${(candidate.gaps || []).slice(0, 2).join("; ") || "No major gaps"}`, 90).forEach((line) => sections.push(line));
    sections.push("");
  });

  sections.push("Pool Insights");
  sections.push(`Average experience: ${result.poolInsights?.avgExperienceYears ?? 0} years`);
  sections.push(`Missing critical skills: ${result.poolInsights?.missingCriticalSkills?.join(", ") || "None"}`);
  sections.push("");
  sections.push("Top Skills in Pool");
  (result.poolInsights?.topSkills || []).slice(0, 8).forEach((skill) => {
    sections.push(`• ${skill.skill} (${skill.count})`);
  });
  sections.push("");
  sections.push("Notes");
  sections.push("This report is intended to support recruiter review. Final hiring decisions remain human-led.");

  const linesPerPage = 36;
  const wrapped = sections.flatMap((line) => wrapText(line, 92));
  const pages: string[][] = [];
  for (let i = 0; i < wrapped.length; i += linesPerPage) {
    pages.push(wrapped.slice(i, i + linesPerPage));
  }

  return pages.length > 0 ? pages : [["No content available"]];
}

export async function runScreening(req: Request, res: Response): Promise<void> {
  try {
    const { jobId, shortlistSize = 10, candidateIds } = req.body;

    if (!jobId) {
      res.status(400).json({ message: "jobId is required" });
      return;
    }

    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }

    // Fetch candidates — either specific ones, job-scoped candidates, or all
    const candidateDocs = candidateIds?.length
      ? await Candidate.find({ _id: { $in: candidateIds } })
      : await Candidate.find();

    // If this job has any assigned candidates, prefer only those.
    const assignedCandidateDocs = await Candidate.find({ jobIds: jobId });
    const effectiveCandidates = assignedCandidateDocs.length > 0 ? assignedCandidateDocs : candidateDocs;

    if (effectiveCandidates.length === 0) {
      res.status(400).json({ message: "No candidates found to screen" });
      return;
    }

    // Map mongoose docs to TalentProfile type
    const profiles: TalentProfile[] = effectiveCandidates.map((c) => ({
      _id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      headline: c.headline,
      bio: c.bio,
      location: c.location,
      skills: c.skills,
      languages: c.languages,
      experience: c.experience,
      education: c.education,
      certifications: c.certifications,
      projects: c.projects,
      availability: c.availability,
      socialLinks: c.socialLinks,
      source: c.source,
      jobIds: c.jobIds,
    }));

    const jobPlain = {
      _id: job.id,
      title: job.title,
      description: job.description,
      department: job.department,
      location: job.location,
      type: job.type,
      experienceLevel: job.experienceLevel,
      requirements: job.requirements,
      niceToHave: job.niceToHave,
      responsibilities: job.responsibilities,
      salaryRange: job.salaryRange,
    };

    const startedAt = new Date().toISOString();
    const pending = await ScreeningResultModel.create({
      jobId: job.id,
      jobTitle: job.title,
      totalApplicants: profiles.length,
      shortlistSize: Number(shortlistSize),
      shortlist: [],
      aiModel: "pending",
      processingTimeMs: 0,
      screeningDate: startedAt,
      status: "running",
      progress: 10,
      startedAt,
      poolInsights: undefined,
    });

    res.status(202).json(pending);

    void (async () => {
      try {
        await ScreeningResultModel.findByIdAndUpdate(pending._id, { progress: 35, aiModel: "gemini-2.0-flash" });
        const result = await screenCandidates(jobPlain, profiles, Number(shortlistSize));
        await ScreeningResultModel.findByIdAndUpdate(pending._id, {
          ...result,
          status: "completed",
          progress: 100,
          completedAt: new Date().toISOString(),
          errorMessage: undefined,
        });
      } catch (err) {
        console.error("Async screening error:", err);
        await ScreeningResultModel.findByIdAndUpdate(pending._id, {
          status: "failed",
          progress: 100,
          errorMessage: String(err),
        });
      }
    })();
  } catch (err) {
    console.error("Screening error:", err);
    res.status(500).json({ message: "Screening failed", error: String(err) });
  }
}

export async function getScreeningResults(req: Request, res: Response): Promise<void> {
  try {
    const results = await ScreeningResultModel.find()
      .sort({ createdAt: -1 })
      .select("-shortlist.interviewQuestions"); // lighter list view
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch results", error: String(err) });
  }
}

export async function getScreeningResult(req: Request, res: Response): Promise<void> {
  try {
    const result = await ScreeningResultModel.findById(req.params.id);
    if (!result) {
      res.status(404).json({ message: "Screening result not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch result", error: String(err) });
  }
}

export async function getLatestResultForJob(req: Request, res: Response): Promise<void> {
  try {
    const result = await ScreeningResultModel.findOne({ jobId: req.params.jobId }).sort({
      createdAt: -1,
    });
    if (!result) {
      res.status(404).json({ message: "No screening result for this job" });
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch result", error: String(err) });
  }
}

export async function deleteScreeningResult(req: Request, res: Response): Promise<void> {
  try {
    await ScreeningResultModel.findByIdAndDelete(req.params.id);
    res.json({ message: "Result deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete result", error: String(err) });
  }
}

export async function exportScreeningResultPdf(req: Request, res: Response): Promise<void> {
  try {
    const result = await ScreeningResultModel.findById(req.params.id);
    if (!result) {
      res.status(404).json({ message: "Screening result not found" });
      return;
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="talentai-screening-${result.jobTitle.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`);
    const pdf = buildPdfBuffer(buildPdfReportLines(result));
    res.end(pdf);
  } catch (err) {
    res.status(500).json({ message: "Failed to export screening report", error: String(err) });
  }
}
