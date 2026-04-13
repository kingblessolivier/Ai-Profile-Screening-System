import mongoose, { Schema, Document } from "mongoose";
import { ScreeningResult } from "../types";

export interface ScreeningResultDocument extends Omit<ScreeningResult, "_id">, Document {}

const ScoreBreakdownSchema = new Schema({
  skillsScore: Number,
  experienceScore: Number,
  educationScore: Number,
  projectsScore: Number,
  availabilityScore: Number,
});

const SkillGapSchema = new Schema({
  matched: [String],
  missing: [String],
  bonus: [String],
});

const CandidateScoreSchema = new Schema({
  candidateId: { type: String, required: true },
  candidateName: { type: String, required: true },
  email: { type: String, required: true },
  rank: { type: Number, required: true },
  matchScore: { type: Number, required: true },
  deterministicScore: { type: Number, default: 0 },
  breakdown: ScoreBreakdownSchema,
  strengths: [String],
  gaps: [String],
  recommendation: {
    type: String,
    enum: ["Strongly Recommended", "Recommended", "Consider", "Not Recommended"],
  },
  summary: String,
  interviewQuestions: [String],
  skillGapAnalysis: SkillGapSchema,
});

const PoolInsightsSchema = new Schema({
  topSkills: [{ skill: String, count: Number }],
  missingCriticalSkills: [String],
  avgExperienceYears: Number,
  availabilityBreakdown: [{ status: String, count: Number }],
});

const ScreeningResultSchema = new Schema<ScreeningResultDocument>(
  {
    jobId: { type: String, required: true, index: true },
    jobTitle: { type: String, required: true },
    totalApplicants: { type: Number, required: true },
    shortlistSize: { type: Number, required: true },
    shortlist: [CandidateScoreSchema],
    aiModel: { type: String, default: "gemini-2.0-flash" },
    processingTimeMs: { type: Number, default: 0 },
    screeningDate: { type: String, default: () => new Date().toISOString() },
    poolInsights: PoolInsightsSchema,
  },
  { timestamps: true }
);

export const ScreeningResultModel = mongoose.model<ScreeningResultDocument>(
  "ScreeningResult",
  ScreeningResultSchema
);
