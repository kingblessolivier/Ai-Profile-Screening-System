import { Request, Response } from "express";
import { Job } from "../models/Job";

export async function createJob(req: Request, res: Response): Promise<void> {
  try {
    const job = await Job.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: "Failed to create job", error: String(err) });
  }
}

export async function getJobs(req: Request, res: Response): Promise<void> {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch jobs", error: String(err) });
  }
}

export async function getJob(req: Request, res: Response): Promise<void> {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch job", error: String(err) });
  }
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!job) {
      res.status(404).json({ message: "Job not found" });
      return;
    }
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: "Failed to update job", error: String(err) });
  }
}

export async function deleteJob(req: Request, res: Response): Promise<void> {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete job", error: String(err) });
  }
}
