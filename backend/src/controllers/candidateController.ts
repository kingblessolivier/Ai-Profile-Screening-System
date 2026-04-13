import { Request, Response } from "express";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import pdfParse from "pdf-parse";
import { Candidate } from "../models/Candidate";
import { parseResumeToProfile } from "../services/geminiService";
import { TalentProfile } from "../types";

export async function getCandidates(req: Request, res: Response): Promise<void> {
  try {
    const { source, search, page = "1", limit = "20" } = req.query;
    const filter: Record<string, unknown> = {};
    if (source) filter.source = source;
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
    const candidate = await Candidate.create({ ...req.body, source: "platform" });
    res.status(201).json(candidate);
  } catch (err) {
    res.status(400).json({ message: "Failed to create candidate", error: String(err) });
  }
}

export async function bulkCreateCandidates(req: Request, res: Response): Promise<void> {
  try {
    const profiles: TalentProfile[] = req.body.candidates;
    if (!Array.isArray(profiles) || profiles.length === 0) {
      res.status(400).json({ message: "candidates array is required" });
      return;
    }
    // Upsert by email to avoid duplicates
    const ops = profiles.map((p) => ({
      updateOne: {
        filter: { email: p.email },
        update: { $set: { ...p, source: "platform" } },
        upsert: true,
      },
    }));
    const result = await Candidate.bulkWrite(ops);
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

    const results: { file: string; status: string; email?: string; error?: string }[] = [];

    for (const file of files) {
      try {
        const data = await pdfParse(fs.readFileSync(file.path));
        const rawText = data.text;
        const profile = await parseResumeToProfile(rawText);
        if (!profile.email || !profile.firstName) {
          results.push({ file: file.originalname, status: "skipped", error: "Could not extract name/email" });
        } else {
          await Candidate.findOneAndUpdate(
            { email: profile.email },
            { $set: { ...profile, source: "pdf", rawText } },
            { upsert: true, new: true }
          );
          results.push({ file: file.originalname, status: "imported", email: profile.email });
        }
      } catch (e) {
        results.push({ file: file.originalname, status: "error", error: String(e) });
      } finally {
        fs.unlinkSync(file.path); // clean up temp
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
      source: "csv" as const,
    }));

    const valid = profiles.filter((p) => p.email && p.firstName);
    const ops = valid.map((p) => ({
      updateOne: {
        filter: { email: p.email },
        update: { $set: p },
        upsert: true,
      },
    }));

    const result = await Candidate.bulkWrite(ops);
    res.json({
      message: `CSV imported: ${result.upsertedCount} created, ${result.modifiedCount} updated`,
      total: valid.length,
      skipped: rows.length - valid.length,
    });
  } catch (err) {
    res.status(500).json({ message: "CSV import failed", error: String(err) });
  }
}
