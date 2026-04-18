import { Request, Response } from "express";
import fs from "fs";
import csv from "csv-parser";
import pdfParse from "pdf-parse";
import { Candidate } from "../models/Candidate";
import { parseResumeToProfile } from "../services/geminiService";
import { TalentProfile } from "../types";

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toSkillSet(profile: { skills?: { name: string }[]; experience?: { technologies?: string[] }[]; projects?: { technologies?: string[] }[] }) {
  const values = [
    ...(profile.skills ?? []).map((skill) => skill.name),
    ...(profile.experience ?? []).flatMap((entry) => entry.technologies ?? []),
    ...(profile.projects ?? []).flatMap((entry) => entry.technologies ?? []),
  ];
  return new Set(values.map(normalizeText).filter(Boolean));
}

async function flagPotentialDuplicate(candidateId: string, profile: TalentProfile) {
  const others = await Candidate.find({ _id: { $ne: candidateId } }).select("firstName lastName email location skills experience projects");
  const targetName = normalizeText(`${profile.firstName} ${profile.lastName}`);
  const targetSkills = toSkillSet(profile);

  let duplicateOf: string | undefined;
  for (const other of others) {
    const otherName = normalizeText(`${other.firstName} ${other.lastName}`);
    const sameName = otherName === targetName;
    const sameEmailLocalPart = normalizeText(other.email.split("@")[0]) === normalizeText(profile.email.split("@")[0]);
    const sameLocation = normalizeText(other.location) === normalizeText(profile.location);
    const otherSkills = toSkillSet(other as unknown as TalentProfile);
    const overlap = [...targetSkills].filter((skill) => otherSkills.has(skill)).length;

    if (sameName || sameEmailLocalPart || (sameLocation && overlap >= 2)) {
      duplicateOf = String(other._id);
      break;
    }
  }

  if (duplicateOf) {
    await Candidate.findByIdAndUpdate(candidateId, { potentialDuplicate: true, duplicateOf });
  }
}

export async function getCandidates(req: Request, res: Response): Promise<void> {
  try {
    const { source, search, page = "1", limit = "20", jobId } = req.query;
    const filter: Record<string, unknown> = {};
    if (source) filter.source = source;
    if (jobId) filter.jobIds = String(jobId); // filter candidates assigned to this job
    if (search) {
      const s = String(search);
      filter.$or = [
        { firstName: new RegExp(s, "i") },
        { lastName: new RegExp(s, "i") },
        { email: new RegExp(s, "i") },
        { headline: new RegExp(s, "i") },
        { "skills.name": new RegExp(s, "i") },
      ];
    }
    const skip = (Number(page) - 1) * Number(limit);
    const [candidates, total] = await Promise.all([
      Candidate.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Candidate.countDocuments(filter),
    ]);
    res.json({ candidates, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidates", error: String(err) });
  }
}

export async function getCandidate(req: Request, res: Response): Promise<void> {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      res.status(404).json({ message: "Candidate not found" });
      return;
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch candidate", error: String(err) });
  }
}

export async function createCandidate(req: Request, res: Response): Promise<void> {
  try {
    const jobIds = Array.isArray(req.body.jobIds)
      ? req.body.jobIds
      : req.body.jobId
        ? [req.body.jobId]
        : undefined;
    const candidate = await Candidate.create({
      ...req.body,
      ...(jobIds ? { jobIds } : {}),
      source: "platform",
    });
    void flagPotentialDuplicate(String(candidate._id), candidate as unknown as TalentProfile);
    res.status(201).json({ _id: candidate._id });
  } catch (err) {
    res.status(400).json({ message: "Failed to create candidate", error: String(err) });
  }
}

export async function bulkCreateCandidates(req: Request, res: Response): Promise<void> {
  try {
    const profiles: TalentProfile[] = req.body.candidates;
    const jobIds = Array.isArray(req.body.jobIds)
      ? req.body.jobIds
      : req.body.jobId
        ? [req.body.jobId]
        : undefined;
    if (!Array.isArray(profiles) || profiles.length === 0) {
      res.status(400).json({ message: "candidates array is required" });
      return;
    }
    // Upsert by email to avoid duplicates
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: any[] = profiles.map((p) => ({
      updateOne: {
        filter: { email: p.email },
        update: { $set: { ...p, ...(jobIds ? { jobIds } : {}), source: "platform" as const } },
        upsert: true,
      },
    }));
    const result = await Candidate.bulkWrite(ops);
    await Promise.all(profiles.map(async (p) => {
      const updated = await Candidate.findOne({ email: p.email });
      if (updated) await flagPotentialDuplicate(String(updated._id), updated as unknown as TalentProfile);
    }));
    res.status(201).json({
      message: `${result.upsertedCount} created, ${result.modifiedCount} updated`,
      total: profiles.length,
    });
  } catch (err) {
    res.status(400).json({ message: "Bulk import failed", error: String(err) });
  }
}

export async function deleteCandidate(req: Request, res: Response): Promise<void> {
  try {
    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete candidate", error: String(err) });
  }
}

// ─── PDF upload ───────────────────────────────────────────────────────────────

export async function uploadPDFResumes(req: Request, res: Response): Promise<void> {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ message: "No PDF files uploaded" });
      return;
    }

    const results: {
      file: string;
      status: "imported" | "skipped" | "error";
      name?: string;
      email?: string;
      skillsCount?: number;
      experienceCount?: number;
      error?: string;
    }[] = [];

    for (const file of files) {
      try {
        const pdfBuffer = fs.readFileSync(file.path);

        // Extract raw text for storage — best-effort, not required for parsing
        let rawText = "";
        try {
          const parsed = await pdfParse(pdfBuffer);
          rawText = parsed.text;
        } catch {
          // Gemini reads the PDF directly so text extraction is optional
        }

        // Pass the PDF buffer so Gemini reads it natively; rawText is used if quota fallback triggers
        const profile = await parseResumeToProfile({ pdfBuffer }, undefined, rawText);

        if (!profile.email || !profile.firstName) {
          results.push({ file: file.originalname, status: "skipped", error: "Could not extract name or email from resume" });
        } else {
          const jobIds = req.body.jobId ? [req.body.jobId] : undefined;
          await Candidate.findOneAndUpdate(
            { email: profile.email },
            { $set: { ...profile, ...(jobIds ? { jobIds } : {}), source: "pdf", rawText: rawText || undefined } },
            { upsert: true, new: true }
          );
          const saved = await Candidate.findOne({ email: profile.email });
          if (saved) void flagPotentialDuplicate(String(saved._id), saved as unknown as TalentProfile);
          results.push({
            file: file.originalname,
            status: "imported",
            name: `${profile.firstName} ${profile.lastName}`,
            email: profile.email,
            skillsCount: profile.skills?.length ?? 0,
            experienceCount: profile.experience?.length ?? 0,
          });
        }
      } catch (e) {
        results.push({ file: file.originalname, status: "error", error: String(e) });
      } finally {
        try { fs.unlinkSync(file.path); } catch { /* already gone */ }
      }
    }

    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: "PDF upload failed", error: String(err) });
  }
}

// ─── CSV upload ───────────────────────────────────────────────────────────────

export async function uploadCSV(req: Request, res: Response): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "No CSV file uploaded" });
      return;
    }

    const rows: Record<string, string>[] = [];
    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on("data", (row: Record<string, string>) => rows.push(row))
        .on("end", resolve)
        .on("error", reject);
    });
    fs.unlinkSync(file.path);

    const profiles: Partial<TalentProfile>[] = rows.map((row) => ({
      firstName: row.firstName || row.first_name || row["First Name"] || "",
      lastName: row.lastName || row.last_name || row["Last Name"] || "",
      email: row.email || row.Email || "",
      headline: row.headline || row.Headline || row.title || row.Title || "Professional",
      location: row.location || row.Location || row.city || "Unknown",
      bio: row.bio || row.Bio || row.summary || "",
      skills: (row.skills || row.Skills || "")
        .split(/[,;|]/)
        .filter(Boolean)
        .map((s) => ({
          name: s.trim(),
          level: "Intermediate" as const,
          yearsOfExperience: 2,
        })),
      experience: [],
      education: [],
      projects: [],
      certifications: [],
      availability: {
        status: (row.availability as TalentProfile["availability"]["status"]) || "Available",
        type: (row.type as TalentProfile["availability"]["type"]) || "Full-time",
      },
      jobIds: req.body.jobId ? [req.body.jobId] : undefined,
      source: "csv" as const,
    }));

    const valid = profiles.filter((p) => p.email && p.firstName);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: any[] = valid.map((p) => ({
      updateOne: {
        filter: { email: p.email },
        update: { $set: p },
        upsert: true,
      },
    }));

    const result = await Candidate.bulkWrite(ops);
    await Promise.all(valid.map(async (p) => {
      const updated = await Candidate.findOne({ email: p.email });
      if (updated) await flagPotentialDuplicate(String(updated._id), updated as unknown as TalentProfile);
    }));
    res.json({
      message: `CSV imported: ${result.upsertedCount} created, ${result.modifiedCount} updated`,
      total: valid.length,
      skipped: rows.length - valid.length,
    });
  } catch (err) {
    res.status(500).json({ message: "CSV import failed", error: String(err) });
  }
}
