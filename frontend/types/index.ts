// ─── Talent Profile Schema (matches backend types exactly) ────────────────────

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
  startDate: string;
  endDate: string;
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
  issueDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  link?: string;
  startDate: string;
  endDate: string;
}

export interface Availability {
  status: "Available" | "Open to Opportunities" | "Not Available";
  type: "Full-time" | "Part-time" | "Contract";
  startDate?: string;
}

export interface SocialLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface Candidate {
  _id: string;
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
  createdAt?: string;
  jobIds?: string[];
  potentialDuplicate?: boolean;
  duplicateOf?: string;
}

// ─── Job ─────────────────────────────────────────────────────────────────────

export interface JobRequirement {
  skill: string;
  level?: string;
  yearsRequired?: number;
  required: boolean;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  department?: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contract";
  experienceLevel: "Junior" | "Mid-level" | "Senior" | "Lead";
  requirements: JobRequirement[];
  niceToHave?: string[];
  responsibilities: string[];
  salaryRange?: { min: number; max: number; currency: string };
  createdAt?: string;
}

// ─── Screening ────────────────────────────────────────────────────────────────

export interface ScoreBreakdown {
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  projectsScore: number;
  availabilityScore: number;
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
  matchScore: number;
  deterministicScore: number;
  breakdown: ScoreBreakdown;
  strengths: string[];
  gaps: string[];
  evidence: string[];
  confidence: number;
  recommendation: "Strongly Recommended" | "Recommended" | "Consider" | "Not Recommended";
  summary: string;
  interviewQuestions: string[];
  skillGapAnalysis: SkillGapAnalysis;
}

export interface PoolInsights {
  topSkills: { skill: string; count: number }[];
  missingCriticalSkills: string[];
  avgExperienceYears: number;
  availabilityBreakdown: { status: string; count: number }[];
}

export interface ScreeningResult {
  _id: string;
  jobId: string;
  jobTitle: string;
  totalApplicants: number;
  shortlistSize: number;
  shortlist: CandidateScore[];
  aiModel: string;
  processingTimeMs: number;
  screeningDate: string;
  status?: "pending" | "running" | "completed" | "failed";
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  poolInsights?: PoolInsights;
  createdAt?: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
