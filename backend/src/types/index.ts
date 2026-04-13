// ─── Talent Profile Schema (Umurava Standard) ─────────────────────────────────

export interface Skill {
  name: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  yearsOfExperience: number;
}

export interface Language {
  name: string;
  proficiency: "Basic" | "Conversational" | "Fluent" | "Native";
}

export interface Experience {
  company: string;
  role: string;
  startDate: string;       // YYYY-MM
  endDate: string;         // YYYY-MM | "Present"
  description: string;
  technologies: string[];
  isCurrent: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: number;
  endYear: number;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;       // YYYY-MM
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;       // YYYY-MM
  endDate: string;         // YYYY-MM
}

export interface Availability {
  status: "Available" | "Open to Opportunities" | "Not Available";
  type: "Full-time" | "Part-time" | "Contract";
  startDate?: string;      // YYYY-MM-DD (optional)
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface TalentProfile {
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  headline: string;
  bio?: string;
  location: string;
  skills: Skill[];
  languages?: Language[];
  experience: Experience[];
  education: Education[];
  certifications?: Certification[];
  projects: Project[];
  availability: Availability;
  socialLinks?: SocialLinks;
  source?: "platform" | "csv" | "pdf";
  rawText?: string;
}

// ─── Job Schema ───────────────────────────────────────────────────────────────

export interface JobRequirement {
  skill: string;
  level?: string;
  yearsRequired?: number;
  required: boolean;
}

export interface Job {
  _id?: string;
  title: string;
  description: string;
  department?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  experienceLevel: "Junior" | "Mid-level" | "Senior" | "Lead";
  requirements: JobRequirement[];
  niceToHave?: string[];
  responsibilities: string[];
  salaryRange?: {
    min: number;
    max: number;
    currency: string;
  };
  createdAt?: string;
}

// ─── Scoring & AI Output ──────────────────────────────────────────────────────

export interface ScoreBreakdown {
  skillsScore: number;       // 0-100
  experienceScore: number;   // 0-100
  educationScore: number;    // 0-100
  projectsScore: number;     // 0-100
  availabilityScore: number; // 0-100
}

export interface SkillGapAnalysis {
  matched: string[];
  missing: string[];
  bonus: string[];
}

export interface CandidateScore {
  candidateId: string;
  candidateName: string;
  email: string;
  rank: number;
  matchScore: number;        // 0-100 weighted composite
  deterministicScore: number; // pre-AI score
  breakdown: ScoreBreakdown;
  strengths: string[];
  gaps: string[];
  recommendation: "Strongly Recommended" | "Recommended" | "Consider" | "Not Recommended";
  summary: string;
  interviewQuestions: string[];
  skillGapAnalysis: SkillGapAnalysis;
}

export interface ScreeningResult {
  _id?: string;
  jobId: string;
  jobTitle: string;
  totalApplicants: number;
  shortlistSize: number;
  shortlist: CandidateScore[];
  aiModel: string;
  processingTimeMs: number;
  screeningDate: string;
  poolInsights?: PoolInsights;
}

export interface PoolInsights {
  topSkills: { skill: string; count: number }[];
  missingCriticalSkills: string[];
  avgExperienceYears: number;
  availabilityBreakdown: { status: string; count: number }[];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  role: "recruiter" | "admin";
  avatar?: string;
}

// ─── Express augmentation ─────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}
