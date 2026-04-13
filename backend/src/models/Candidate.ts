import mongoose, { Schema, Document } from "mongoose";
import { TalentProfile } from "../types";

export interface CandidateDocument extends Omit<TalentProfile, "_id">, Document {}

const SkillSchema = new Schema({
  name: { type: String, required: true },
  level: {
    type: String,
    enum: ["Beginner", "Intermediate", "Advanced", "Expert"],
    required: true,
  },
  yearsOfExperience: { type: Number, required: true, min: 0 },
});

const LanguageSchema = new Schema({
  name: { type: String, required: true },
  proficiency: {
    type: String,
    enum: ["Basic", "Conversational", "Fluent", "Native"],
    required: true,
  },
});

const ExperienceSchema = new Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  isCurrent: { type: Boolean, default: false },
});

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  fieldOfStudy: { type: String, required: true },
  startYear: { type: Number, required: true },
  endYear: { type: Number, required: true },
});

const CertificationSchema = new Schema({
  name: { type: String, required: true },
  issuer: { type: String, required: true },
  issueDate: { type: String, required: true },
});

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  role: { type: String, required: true },
  link: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
});

const AvailabilitySchema = new Schema({
  status: {
    type: String,
    enum: ["Available", "Open to Opportunities", "Not Available"],
    required: true,
  },
  type: {
    type: String,
    enum: ["Full-time", "Part-time", "Contract"],
    required: true,
  },
  startDate: { type: String },
});

const CandidateSchema = new Schema<CandidateDocument>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    headline: { type: String, required: true },
    bio: { type: String },
    location: { type: String, required: true },
    skills: { type: [SkillSchema], default: [] },
    languages: { type: [LanguageSchema], default: [] },
    experience: { type: [ExperienceSchema], default: [] },
    education: { type: [EducationSchema], default: [] },
    certifications: { type: [CertificationSchema], default: [] },
    projects: { type: [ProjectSchema], default: [] },
    availability: { type: AvailabilitySchema, required: true },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
    },
    source: {
      type: String,
      enum: ["platform", "csv", "pdf"],
      default: "platform",
    },
    rawText: { type: String, select: false },
  },
  { timestamps: true }
);

// Index for faster screening queries
CandidateSchema.index({ "skills.name": 1 });
CandidateSchema.index({ "availability.status": 1 });

export const Candidate = mongoose.model<CandidateDocument>("Candidate", CandidateSchema);
