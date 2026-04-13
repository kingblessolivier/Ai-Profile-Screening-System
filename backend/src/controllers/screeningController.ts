import { Request, Response } from "express";
import { Job } from "../models/Job";
import { Candidate } from "../models/Candidate";
import { ScreeningResultModel } from "../models/ScreeningResult";
import { screenCandidates } from "../services/geminiService";
import { TalentProfile } from "../types";

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

    // Fetch candidates — either specific ones or all
    const query = candidateIds?.length ? { _id: { $in: candidateIds } } : {};
    const candidateDocs = await Candidate.find(query);

    if (candidateDocs.length === 0) {
      res.status(400).json({ message: "No candidates found to screen" });
      return;
    }

    // Map mongoose docs to TalentProfile type
    const profiles: TalentProfile[] = candidateDocs.map((c) => ({
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

    const result = await screenCandidates(jobPlain, profiles, Number(shortlistSize));

    const saved = await ScreeningResultModel.create(result);
    res.status(201).json(saved);
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
