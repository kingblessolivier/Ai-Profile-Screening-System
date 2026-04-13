/**
 * Gemini AI Service
 * ─────────────────
 * Orchestrates the AI reasoning layer using Google Gemini 2.0 Flash.
 *
 * Flow:
 *   1. Deterministic scores computed first (scoringEngine.ts)
 *   2. Top candidates (pre-filtered by deterministic score) sent to Gemini
 *   3. Gemini provides: final score, strengths, gaps, recommendation, summary, interview Qs
 *   4. Results merged and returned
 *
 * Design Principles:
 *   - Structured prompts only (no freeform AI answers)
 *   - Pre-score filters reduce token usage and hallucination risk
 *   - Batch processing for large candidate pools (30 per call)
 *   - Strict JSON output enforced via prompt + extraction
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  TalentProfile, Job, CandidateScore, ScreeningResult, ScoreBreakdown, SkillGapAnalysis,
} from "../types";
import {
  computeDeterministicScore, computeSkillGap, computePoolInsights,
} from "./scoringEngine";

const MODEL = "gemini-2.0-flash";
const BATCH_SIZE = 25; // candidates per Gemini call

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables");
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: MODEL });
}

// Strip markdown fences Gemini may add despite instructions
function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

// ─── Pre-process candidate into a clean evaluation object ─────────────────────

function buildCandidateSummary(c: TalentProfile, score: number, breakdown: ScoreBreakdown) {
  const totalMonths = c.experience.reduce((acc, e) => {
    if (!e.startDate) return acc;
    const start = new Date(e.startDate + "-01");
    const end = e.isCurrent ? new Date() : new Date((e.endDate || "2024-01") + "-01");
    return acc + Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
  }, 0);

  return {
    id: c._id ?? c.email,
    name: `${c.firstName} ${c.lastName}`,
    email: c.email,
    headline: c.headline,
    location: c.location,
    availabilityStatus: c.availability.status,
    availabilityType: c.availability.type,
    yearsExperience: Math.round((totalMonths / 12) * 10) / 10,
    skills: c.skills.map(s => `${s.name} (${s.level}, ${s.yearsOfExperience}yr)`),
    recentRoles: c.experience.slice(0, 3).map(e => `${e.role} at ${e.company} using ${e.technologies.slice(0, 4).join(", ")}`),
    education: c.education.map(e => `${e.degree} in ${e.fieldOfStudy} – ${e.institution}`),
    certifications: c.certifications?.map(cert => cert.name) ?? [],
    projects: c.projects.slice(0, 3).map(p => `${p.name}: ${p.technologies.slice(0, 4).join(", ")}`),
    preScore: score,
    preScoreBreakdown: breakdown,
  };
}

// ─── Build the main screening prompt ─────────────────────────────────────────

function buildScreeningPrompt(
  job: Job,
  candidates: ReturnType<typeof buildCandidateSummary>[],
  shortlistSize: number
): string {
  const jobBlock = `
JOB OPENING:
- Title: ${job.title}
- Level: ${job.experienceLevel}
- Type: ${job.type}
- Location: ${job.location}
- Description: ${job.description.substring(0, 400)}
- Required Skills: ${job.requirements.filter(r => r.required).map(r => `${r.skill}${r.level ? ` (${r.level})` : ""}${r.yearsRequired ? ` ${r.yearsRequired}+ yrs` : ""}`).join(", ")}
- Nice to Have: ${job.niceToHave?.join(", ") || "N/A"}
- Key Responsibilities: ${job.responsibilities.slice(0, 5).join("; ")}
`;

  const candidatesBlock = candidates
    .map(
      (c, i) => `
CANDIDATE_${i + 1}:
  id: "${c.id}"
  name: "${c.name}"
  email: "${c.email}"
  headline: "${c.headline}"
  yearsExperience: ${c.yearsExperience}
  availability: "${c.availabilityStatus} / ${c.availabilityType}"
  skills: [${c.skills.join(", ")}]
  recentRoles: [${c.recentRoles.join(" | ")}]
  education: [${c.education.join(", ")}]
  certifications: [${c.certifications.join(", ") || "None"}]
  projects: [${c.projects.join(" | ")}]
  preScore: ${c.preScore}
`
    )
    .join("---\n");

  return `You are an expert AI recruitment specialist for Umurava, a leading African tech talent platform. Your task is to evaluate and rank candidates for the job opening below.

${jobBlock}

CANDIDATES TO EVALUATE (${candidates.length} total):
${candidatesBlock}

SCORING INSTRUCTIONS:
1. Build on the preScore (deterministic algorithmic score) — adjust up or down based on qualitative signals
2. Consider: depth of relevant experience, quality of projects, role-tech stack alignment, communication from headline
3. Be SPECIFIC — reference actual data from profiles, not generic statements
4. Be HONEST about gaps — do not inflate scores
5. Produce a ranked shortlist of the TOP ${shortlistSize} candidates

RETURN ONLY valid JSON in this exact structure (no markdown, no extra text):

{
  "shortlist": [
    {
      "candidateId": "<id from profile>",
      "candidateName": "<full name>",
      "email": "<email>",
      "rank": 1,
      "matchScore": 88,
      "breakdown": {
        "skillsScore": 92,
        "experienceScore": 85,
        "educationScore": 78,
        "projectsScore": 90,
        "availabilityScore": 100
      },
      "strengths": [
        "5 years Node.js with microservices at scale",
        "Led AI integration project using Gemini API",
        "Open source contributor with 200+ GitHub stars"
      ],
      "gaps": [
        "No direct experience with GraphQL (nice-to-have)",
        "Location may require relocation for on-site roles"
      ],
      "recommendation": "Strongly Recommended",
      "summary": "Alice is a strong match with 5+ years of relevant Node.js experience, proven AI project delivery, and immediate availability. Her skill set directly covers 90% of required technologies.",
      "interviewQuestions": [
        "Walk me through the architecture of your most recent AI integration project.",
        "How have you handled scalability challenges in Node.js microservices?",
        "Describe a time you led a team through a complex technical migration."
      ],
      "skillGapAnalysis": {
        "matched": ["Node.js", "PostgreSQL", "TypeScript"],
        "missing": ["GraphQL"],
        "bonus": ["Rust", "Go"]
      }
    }
  ]
}

IMPORTANT:
- recommendation must be one of: "Strongly Recommended", "Recommended", "Consider", "Not Recommended"
- matchScore must be between 0 and 100
- strengths: 3-5 specific bullet points
- gaps: 1-3 honest gaps
- interviewQuestions: exactly 3 tailored questions
- Output ONLY the JSON object above, nothing else`;
}

// ─── Main screening orchestrator ──────────────────────────────────────────────

export async function screenCandidates(
  job: Job,
  candidates: TalentProfile[],
  shortlistSize: number = 10
): Promise<Omit<ScreeningResult, "_id">> {
  const startTime = Date.now();
  const model = getModel();

  // Step 1: Deterministic pre-scoring for ALL candidates
  const prescored = candidates.map(c => {
    const { compositeScore, breakdown } = computeDeterministicScore(c, job);
    const skillGap = computeSkillGap(c, job);
    return { candidate: c, compositeScore, breakdown, skillGap };
  });

  // Step 2: Sort by pre-score and take top candidates for AI evaluation
  // For large pools, only send top 2x shortlistSize to Gemini (saves tokens, keeps quality high)
  const maxForAI = Math.min(prescored.length, shortlistSize * 3);
  const topPrescored = prescored
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, maxForAI);

  // Step 3: Run AI in batches
  let allScores: CandidateScore[] = [];

  const batches: typeof topPrescored[] = [];
  for (let i = 0; i < topPrescored.length; i += BATCH_SIZE) {
    batches.push(topPrescored.slice(i, i + BATCH_SIZE));
  }

  if (batches.length === 1) {
    // Single batch
    const summaries = batches[0].map(({ candidate, compositeScore, breakdown }) =>
      buildCandidateSummary(candidate, compositeScore, breakdown)
    );
    const prompt = buildScreeningPrompt(job, summaries, shortlistSize);
    const result = await model.generateContent(prompt);
    const text = extractJSON(result.response.text());
    const parsed = JSON.parse(text);
    allScores = mergeScores(parsed.shortlist, topPrescored);
  } else {
    // Multi-batch: collect top from each, then final re-rank
    const batchTopSize = Math.ceil(shortlistSize * 1.5);

    const batchResults = await Promise.all(
      batches.map(async batch => {
        const summaries = batch.map(({ candidate, compositeScore, breakdown }) =>
          buildCandidateSummary(candidate, compositeScore, breakdown)
        );
        const prompt = buildScreeningPrompt(job, summaries, batchTopSize);
        const result = await model.generateContent(prompt);
        const text = extractJSON(result.response.text());
        const parsed = JSON.parse(text);
        return mergeScores(parsed.shortlist, batch);
      })
    );

    const combined = batchResults.flat().sort((a, b) => b.matchScore - a.matchScore);
    const top = combined.slice(0, shortlistSize * 2);

    // Final re-rank pass with combined top candidates
    const topOriginals = top
      .map(s => topPrescored.find(p => p.candidate.email === s.email))
      .filter(Boolean) as typeof topPrescored;

    const finalSummaries = topOriginals.map(({ candidate, compositeScore, breakdown }) =>
      buildCandidateSummary(candidate, compositeScore, breakdown)
    );
    const finalPrompt = buildScreeningPrompt(job, finalSummaries, shortlistSize);
    const finalResult = await model.generateContent(finalPrompt);
    const finalText = extractJSON(finalResult.response.text());
    allScores = mergeScores(JSON.parse(finalText).shortlist, topOriginals);
  }

  // Step 4: Normalize ranks
  allScores = allScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, shortlistSize)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  // Step 5: Pool insights
  const poolInsights = computePoolInsights(candidates, job);

  return {
    jobId: job._id ?? "",
    jobTitle: job.title,
    totalApplicants: candidates.length,
    shortlistSize: allScores.length,
    shortlist: allScores,
    aiModel: MODEL,
    processingTimeMs: Date.now() - startTime,
    screeningDate: new Date().toISOString(),
    poolInsights,
  };
}

// Merge AI output with pre-computed deterministic data
function mergeScores(
  aiScores: Partial<CandidateScore>[],
  prescored: { candidate: TalentProfile; compositeScore: number; breakdown: ScoreBreakdown; skillGap: SkillGapAnalysis }[]
): CandidateScore[] {
  return aiScores.map(ai => {
    const match = prescored.find(
      p => p.candidate.email === ai.email ||
           p.candidate._id === ai.candidateId ||
           `${p.candidate.firstName} ${p.candidate.lastName}` === ai.candidateName
    );

    return {
      candidateId: ai.candidateId ?? match?.candidate._id ?? match?.candidate.email ?? "",
      candidateName: ai.candidateName ?? `${match?.candidate.firstName} ${match?.candidate.lastName}`,
      email: ai.email ?? match?.candidate.email ?? "",
      rank: ai.rank ?? 0,
      matchScore: ai.matchScore ?? match?.compositeScore ?? 0,
      deterministicScore: match?.compositeScore ?? 0,
      breakdown: ai.breakdown ?? match?.breakdown ?? { skillsScore: 0, experienceScore: 0, educationScore: 0, projectsScore: 0, availabilityScore: 0 },
      strengths: ai.strengths ?? [],
      gaps: ai.gaps ?? [],
      recommendation: ai.recommendation ?? "Consider",
      summary: ai.summary ?? "",
      interviewQuestions: ai.interviewQuestions ?? [],
      skillGapAnalysis: ai.skillGapAnalysis ?? match?.skillGap ?? { matched: [], missing: [], bonus: [] },
    } as CandidateScore;
  });
}

// ─── Resume parser ────────────────────────────────────────────────────────────

export async function parseResumeToProfile(rawText: string, emailHint?: string): Promise<Partial<TalentProfile>> {
  const model = getModel();

  const prompt = `You are an expert resume parser. Extract ALL structured information from the resume text below and return it as JSON matching the Umurava Talent Profile Schema exactly.

RESUME TEXT:
${rawText.substring(0, 6000)}

Return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "firstName": "",
  "lastName": "",
  "email": "${emailHint ?? ""}",
  "headline": "",
  "bio": "",
  "location": "",
  "skills": [{"name": "", "level": "Beginner|Intermediate|Advanced|Expert", "yearsOfExperience": 0}],
  "languages": [{"name": "", "proficiency": "Basic|Conversational|Fluent|Native"}],
  "experience": [{"company": "", "role": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM", "description": "", "technologies": [], "isCurrent": false}],
  "education": [{"institution": "", "degree": "", "fieldOfStudy": "", "startYear": 0, "endYear": 0}],
  "certifications": [{"name": "", "issuer": "", "issueDate": "YYYY-MM"}],
  "projects": [{"name": "", "description": "", "technologies": [], "role": "", "link": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM"}],
  "availability": {"status": "Available", "type": "Full-time"},
  "socialLinks": {"linkedin": "", "github": "", "portfolio": ""}
}

Rules:
- skill levels must be one of: Beginner, Intermediate, Advanced, Expert
- dates must be YYYY-MM format
- if endDate is current, use today's date in YYYY-MM format and set isCurrent: true
- infer headline from most recent role if not explicitly stated
- estimate skill levels from context (years, responsibilities described)`;

  const result = await model.generateContent(prompt);
  const text = extractJSON(result.response.text());
  return JSON.parse(text) as Partial<TalentProfile>;
}
