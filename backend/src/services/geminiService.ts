/**
 * Gemini AI Service (Thinking Edition)
 * ──────────────────────────────────────
 * Uses Google Gemini 2.5 Flash with thinking enabled.
 *
 * Flow:
 *   1. Deterministic scores computed first (scoringEngine.ts)
 *   2. Top candidates sent to Gemini with thinking mode ON
 *   3. Thinking tokens streamed via callback → SSE → frontend
 *   4. Gemini returns: final score, strengths, gaps, recommendation, summary, interview Qs
 *   5. Results merged and returned with thinking log
 */

import { GoogleGenAI } from "@google/genai";
import {
  TalentProfile, Job, CandidateScore, ScreeningResult, ScoreBreakdown, SkillGapAnalysis,
} from "../types";
import {
  computeDeterministicScore, computeSkillGap, computePoolInsights,
} from "./scoringEngine";

const MODEL_DEFAULT  = "gemini-2.5-flash";
const THINKING_MODELS = new Set(["gemini-2.5-flash", "gemini-2.5-pro"]); // models that support includeThoughts
const BATCH_SIZE      = 25;

function getAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set in environment variables");
  return new GoogleGenAI({ apiKey });
}

function extractJSON(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  return (fenced ? fenced[1] : text).trim();
}

function isGeminiQuotaError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return (
    msg.includes("429") ||
    msg.includes("Quota exceeded") ||
    msg.includes("rate limit") ||
    msg.includes("RESOURCE_EXHAUSTED") ||
    msg.includes("503") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("high demand") ||
    msg.includes("fetch failed")
  );
}

// ─── Fallback: pure deterministic scoring ────────────────────────────────────

function buildDeterministicCandidateScore(
  candidate: TalentProfile,
  compositeScore: number,
  breakdown: ScoreBreakdown,
  skillGap: SkillGapAnalysis,
  rank: number
): CandidateScore {
  const strengths: string[] = [];
  if (breakdown.skillsScore >= 80) strengths.push("Strong direct skill alignment with the job requirements");
  if (breakdown.experienceScore >= 80) strengths.push("Relevant experience level aligns well with the role seniority");
  if (breakdown.projectsScore >= 70) strengths.push("Portfolio shows relevant project work and applied experience");
  if (breakdown.availabilityScore >= 80) strengths.push("Availability profile is favorable for hiring timelines");
  if (strengths.length === 0) strengths.push("Deterministic scoring indicates a reasonable baseline match");

  const gaps = skillGap.missing.length > 0
    ? skillGap.missing.slice(0, 3).map(skill => `Missing or weak evidence for ${skill}`)
    : ["No major gaps identified from the available profile data"];

  const recommendation: CandidateScore["recommendation"] =
    compositeScore >= 85 ? "Strongly Recommended" :
    compositeScore >= 70 ? "Recommended" :
    compositeScore >= 55 ? "Consider" :
    "Not Recommended";

  const name = `${candidate.firstName} ${candidate.lastName}`;

  return {
    candidateId: candidate._id ?? candidate.email,
    candidateName: name,
    email: candidate.email,
    rank,
    matchScore: compositeScore,
    deterministicScore: compositeScore,
    breakdown,
    strengths: strengths.slice(0, 5),
    gaps,
    evidence: [
      `Skills score ${breakdown.skillsScore}/100 from direct requirement overlap`,
      `Experience score ${breakdown.experienceScore}/100 from role history and tenure`,
      `Projects score ${breakdown.projectsScore}/100 from applied project evidence`,
    ],
    confidence: Math.min(95, Math.max(55, compositeScore)),
    recommendation,
    summary: `${name} received a deterministic score of ${compositeScore}/100. Screening fell back to the local scoring engine because Gemini quota was unavailable.`,
    interviewQuestions: [
      "Walk me through the most relevant project or role for this job.",
      "Which parts of the required stack are you strongest in, and where would you need support?",
      "How would you approach your first 30 days in this role?",
    ],
    skillGapAnalysis: skillGap,
  };
}

function buildFallbackResult(
  job: Job,
  prescored: { candidate: TalentProfile; compositeScore: number; breakdown: ScoreBreakdown; skillGap: SkillGapAnalysis }[],
  shortlistSize: number,
  startTime: number
): Omit<ScreeningResult, "_id"> {
  const shortlist = prescored
    .slice()
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, shortlistSize)
    .map((entry, index) =>
      buildDeterministicCandidateScore(entry.candidate, entry.compositeScore, entry.breakdown, entry.skillGap, index + 1)
    );

  return {
    jobId: job._id ?? "",
    jobTitle: job.title,
    totalApplicants: prescored.length,
    shortlistSize: shortlist.length,
    shortlist,
    aiModel: "deterministic-fallback",
    processingTimeMs: Date.now() - startTime,
    screeningDate: new Date().toISOString(),
    status: "completed",
    progress: 100,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    poolInsights: computePoolInsights(prescored.map(item => item.candidate), job),
  };
}

// ─── Candidate summary for prompt ────────────────────────────────────────────

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

// ─── Screening prompt ─────────────────────────────────────────────────────────

function buildScreeningPrompt(
  job: Job,
  candidates: ReturnType<typeof buildCandidateSummary>[],
  shortlistSize: number
): string {
  const jobBlock = [
    "JOB OPENING:",
    `- Title: ${job.title}`,
    `- Level: ${job.experienceLevel}`,
    `- Type: ${job.type}`,
    `- Location: ${job.location}`,
    `- Description: ${job.description.substring(0, 400)}`,
    `- Required Skills: ${job.requirements.filter(r => r.required).map(r => `${r.skill}${r.level ? ` (${r.level})` : ""}${r.yearsRequired ? ` ${r.yearsRequired}+ yrs` : ""}`).join(", ")}`,
    `- Nice to Have: ${job.niceToHave?.join(", ") || "N/A"}`,
    `- Key Responsibilities: ${job.responsibilities.slice(0, 5).join("; ")}`,
  ].join("\n");

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

  return [
    "You are an expert AI recruitment specialist for Umurava, a leading African tech talent platform. Your task is to evaluate and rank candidates for the job opening below.",
    "",
    jobBlock,
    "",
    `CANDIDATES TO EVALUATE (${candidates.length} total):`,
    candidatesBlock,
    "",
    "SCORING INSTRUCTIONS:",
    "1. Build on the preScore (deterministic algorithmic score) - adjust up or down based on qualitative signals",
    "2. Consider: depth of relevant experience, quality of projects, role-tech stack alignment, communication from headline",
    "3. Be SPECIFIC - reference actual data from profiles, not generic statements",
    "4. Be HONEST about gaps - do not inflate scores",
    `5. Produce a ranked shortlist of the TOP ${shortlistSize} candidates`,
    "",
    "RETURN ONLY valid JSON in this exact structure (no markdown, no extra text):",
    "",
    "{",
    "  \"shortlist\": [",
    "    {",
    "      \"candidateId\": \"<id from profile>\",",
    "      \"candidateName\": \"<full name>\",",
    "      \"email\": \"<email>\",",
    "      \"rank\": 1,",
    "      \"matchScore\": 88,",
    "      \"breakdown\": {",
    "        \"skillsScore\": 92,",
    "        \"experienceScore\": 85,",
    "        \"educationScore\": 78,",
    "        \"projectsScore\": 90,",
    "        \"availabilityScore\": 100",
    "      },",
    "      \"strengths\": [",
    "        \"5 years Node.js with microservices at scale\",",
    "        \"Led AI integration project using Gemini API\"",
    "      ],",
    "      \"gaps\": [",
    "        \"No direct experience with GraphQL (nice-to-have)\"",
    "      ],",
    "      \"recommendation\": \"Strongly Recommended\",",
    "      \"summary\": \"Strong match with 5+ years of relevant Node.js experience.\",",
    "      \"confidence\": 92,",
    "      \"evidence\": [",
    "        \"5+ years of Node.js and TypeScript in production\"",
    "      ],",
    "      \"interviewQuestions\": [",
    "        \"Walk me through the architecture of your most recent AI integration project.\",",
    "        \"How have you handled scalability challenges in Node.js microservices?\",",
    "        \"Describe a time you led a team through a complex technical migration.\"",
    "      ],",
    "      \"skillGapAnalysis\": {",
    "        \"matched\": [\"Node.js\", \"PostgreSQL\"],",
    "        \"missing\": [\"GraphQL\"],",
    "        \"bonus\": [\"Rust\"]",
    "      }",
    "    }",
    "  ]",
    "}",
    "",
    "IMPORTANT:",
    "- recommendation must be one of: \"Strongly Recommended\", \"Recommended\", \"Consider\", \"Not Recommended\"",
    "- matchScore must be between 0 and 100",
    "- strengths: 3-5 specific bullet points",
    "- gaps: 1-3 honest gaps",
    "- confidence: 0-100",
    "- evidence: 2-4 specific facts grounded in the profile data",
    "- interviewQuestions: exactly 3 tailored questions",
    "- Output ONLY the JSON object above, nothing else",
  ].join("\n");
}

// ─── Gemini call with thinking ────────────────────────────────────────────────
// Uses non-streaming generateContent (more reliable on free tier than streaming).
// Thinking tokens require includeThoughts: true in the config.

async function callGeminiWithThinking(
  prompt: string,
  onThinkingChunk: (text: string) => void,
  model: string = MODEL_DEFAULT
): Promise<{ responseText: string; thinkingText: string; modelUsed: string }> {
  const ai = getAI();
  const supportsThinking = THINKING_MODELS.has(model);

  const response = await ai.models.generateContent({
    model,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    ...(supportsThinking ? {
      config: {
        thinkingConfig: {
          includeThoughts: true,
          thinkingBudget: 8192,
        },
      },
    } : {}),
  });

  let thinkingText = "";
  let responseText = "";

  for (const part of response.candidates?.[0]?.content?.parts ?? []) {
    const text = part.text ?? "";
    if (part.thought === true) {
      thinkingText += text;
    } else {
      responseText += text;
    }
  }

  if (thinkingText) onThinkingChunk(thinkingText);

  return { responseText, thinkingText, modelUsed: model };
}

// ─── Score merging ────────────────────────────────────────────────────────────

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
      evidence: ai.evidence ?? [
        `Pre-score ${match?.compositeScore ?? 0}/100 provided the initial ranking signal`,
        `Profile data matched ${match?.skillGap.matched.length ?? 0} required skills`,
      ],
      confidence: ai.confidence ?? Math.min(95, Math.max(50, match?.compositeScore ?? 0)),
      recommendation: ai.recommendation ?? "Consider",
      summary: ai.summary ?? "",
      interviewQuestions: ai.interviewQuestions ?? [],
      skillGapAnalysis: ai.skillGapAnalysis ?? match?.skillGap ?? { matched: [], missing: [], bonus: [] },
    } as CandidateScore;
  });
}

// ─── Main screening orchestrator ──────────────────────────────────────────────

export async function screenCandidates(
  job: Job,
  candidates: TalentProfile[],
  shortlistSize: number = 10,
  onThinkingChunk: (text: string) => void = () => undefined,
  model: string = MODEL_DEFAULT
): Promise<Omit<ScreeningResult, "_id">> {
  const startTime = Date.now();

  // Step 1: Deterministic pre-scoring
  const prescored = candidates.map(c => {
    const { compositeScore, breakdown } = computeDeterministicScore(c, job);
    const skillGap = computeSkillGap(c, job);
    return { candidate: c, compositeScore, breakdown, skillGap };
  });

  // Step 2: Sort and take top candidates for AI
  const maxForAI = Math.min(prescored.length, shortlistSize * 3);
  const topPrescored = prescored
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .slice(0, maxForAI);

  const fallback = () => buildFallbackResult(job, prescored, shortlistSize, startTime);

  let allThinking = "";

  // Wrap thinking callback to also accumulate the full log
  const thinkingCollector = (text: string) => {
    allThinking += text;
    onThinkingChunk(text);
  };

  const batches: typeof topPrescored[] = [];
  for (let i = 0; i < topPrescored.length; i += BATCH_SIZE) {
    batches.push(topPrescored.slice(i, i + BATCH_SIZE));
  }

  let allScores: CandidateScore[] = [];
  let finalModel = model;

  try {
    if (batches.length === 1) {
      const summaries = batches[0].map(({ candidate, compositeScore, breakdown }) =>
        buildCandidateSummary(candidate, compositeScore, breakdown)
      );
      const prompt = buildScreeningPrompt(job, summaries, shortlistSize);
      const { responseText, modelUsed } = await callGeminiWithThinking(prompt, thinkingCollector, model);
      finalModel = modelUsed;
      const parsed = JSON.parse(extractJSON(responseText));
      allScores = mergeScores(parsed.shortlist, topPrescored);
    } else {
      const batchTopSize = Math.ceil(shortlistSize * 1.5);

      const batchResults = (
        await Promise.all(
          batches.map(async (batch, batchIdx) => {
            const summaries = batch.map(({ candidate, compositeScore, breakdown }) =>
              buildCandidateSummary(candidate, compositeScore, breakdown)
            );
            const prompt = buildScreeningPrompt(job, summaries, batchTopSize);
            const batchThinking = (text: string) => {
              if (batchIdx === 0) thinkingCollector(text);
            };
            const { responseText, modelUsed } = await callGeminiWithThinking(prompt, batchThinking, model);
            if (batchIdx === 0) finalModel = modelUsed;
            const parsed = JSON.parse(extractJSON(responseText));
            return mergeScores(parsed.shortlist, batch);
          })
        )
      ).flat();

      const combined = batchResults.sort((a, b) => b.matchScore - a.matchScore);
      const top = combined.slice(0, shortlistSize * 2);

      const topOriginals = top
        .map(s => topPrescored.find(p => p.candidate.email === s.email))
        .filter(Boolean) as typeof topPrescored;

      const finalSummaries = topOriginals.map(({ candidate, compositeScore, breakdown }) =>
        buildCandidateSummary(candidate, compositeScore, breakdown)
      );
      const finalPrompt = buildScreeningPrompt(job, finalSummaries, shortlistSize);
      const { responseText, modelUsed } = await callGeminiWithThinking(finalPrompt, thinkingCollector, model);
      finalModel = modelUsed;
      allScores = mergeScores(JSON.parse(extractJSON(responseText)).shortlist, topOriginals);
    }
  } catch (error) {
    if (isGeminiQuotaError(error)) return fallback();
    throw error;
  }

  allScores = allScores
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, shortlistSize)
    .map((s, i) => ({ ...s, rank: i + 1 }));

  return {
    jobId: job._id ?? "",
    jobTitle: job.title,
    totalApplicants: candidates.length,
    shortlistSize: allScores.length,
    shortlist: allScores,
    aiModel: finalModel,
    processingTimeMs: Date.now() - startTime,
    screeningDate: new Date().toISOString(),
    status: "completed",
    progress: 100,
    startedAt: new Date(startTime).toISOString(),
    completedAt: new Date().toISOString(),
    poolInsights: computePoolInsights(candidates, job),
    thinkingLog: allThinking || undefined,
  };
}

// ─── Resume parser ────────────────────────────────────────────────────────────

const RESUME_PARSE_PROMPT = `You are an expert resume parser for Umurava, an African tech talent platform. Read the resume carefully and extract ALL structured information. Return ONLY valid JSON (no markdown, no extra text) with this exact structure:

{
  "firstName": "",
  "lastName": "",
  "email": "",
  "headline": "",
  "bio": "",
  "location": "",
  "skills": [{"name": "", "level": "Beginner|Intermediate|Advanced|Expert", "yearsOfExperience": 0}],
  "languages": [{"name": "", "proficiency": "Basic|Conversational|Fluent|Native"}],
  "experience": [{"company": "", "role": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM or Present", "description": "", "technologies": [], "isCurrent": false}],
  "education": [{"institution": "", "degree": "", "fieldOfStudy": "", "startYear": 0, "endYear": 0}],
  "certifications": [{"name": "", "issuer": "", "issueDate": "YYYY-MM"}],
  "projects": [{"name": "", "description": "", "technologies": [], "role": "", "link": "", "startDate": "YYYY-MM", "endDate": "YYYY-MM"}],
  "availability": {"status": "Available", "type": "Full-time"},
  "socialLinks": {"linkedin": "", "github": "", "portfolio": "", "twitter": ""}
}

Extraction rules:
- skill.level must be exactly one of: Beginner, Intermediate, Advanced, Expert — infer from years and context
- skill.yearsOfExperience: estimate from work history mentions
- all dates must be YYYY-MM (e.g. "2022-03"); for current roles set isCurrent: true and endDate to today
- headline: use the person's stated title or infer from their most recent role
- bio: summary/objective section text if present
- extract ALL skills including technologies mentioned inside experience and projects
- extract ALL projects explicitly listed
- socialLinks: extract any LinkedIn, GitHub, portfolio, Twitter URLs found in the resume
- availability.status must be one of: "Available", "Open to Opportunities", "Not Available"
- availability.type must be one of: "Full-time", "Part-time", "Contract"
- omit empty arrays; leave string fields as "" if not found
- return ONLY the JSON object, nothing else`;

// ─── Text-based fallback resume parser (no AI needed) ────────────────────────

function parseResumeFromText(rawText: string): Partial<TalentProfile> {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Email
  const emailMatch = rawText.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i);
  const email = emailMatch?.[0]?.toLowerCase() ?? "";

  // Name — first non-empty line that looks like a name (no @, no digits dominating)
  const nameLine = lines.find((l) => l.length > 2 && l.length < 60 && !l.includes("@") && !/^\d/.test(l));
  const nameParts = (nameLine ?? "").split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName  = nameParts.slice(1).join(" ");

  // LinkedIn / GitHub / portfolio
  const linkedinMatch   = rawText.match(/linkedin\.com\/in\/[\w-]+/i);
  const githubMatch     = rawText.match(/github\.com\/[\w-]+/i);
  const portfolioMatch  = rawText.match(/https?:\/\/(?!linkedin|github)[\w.-]+\.[a-z]{2,}[\w./%-]*/i);

  // Skills — look for comma/pipe/semicolon separated lists near "Skills" heading
  const skillsSection = rawText.match(/(?:skills?|technologies|tech stack)[:\s\n]+([^\n]{10,300})/i)?.[1] ?? "";
  const skillNames = skillsSection
    .split(/[,|;\n•·]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1 && s.length < 40 && !/^\d+$/.test(s))
    .slice(0, 20);

  const skills = skillNames.map((name) => ({
    name,
    level: "Intermediate" as const,
    yearsOfExperience: 1,
  }));

  // Location — line containing city/country patterns
  const locationMatch = rawText.match(/(?:location|address|city)[:\s]+([^\n]{3,50})/i)
    ?? rawText.match(/\b(Kigali|Nairobi|Lagos|Kampala|Dar es Salaam|Accra|Addis Ababa|Johannesburg|Cape Town|Rwanda|Kenya|Uganda|Nigeria|Ghana|Ethiopia|Tanzania|South Africa)\b/i);
  const location = locationMatch?.[1]?.trim() ?? locationMatch?.[0]?.trim() ?? "Africa";

  // Headline — look for title/role line
  const headlineMatch = rawText.match(/(?:title|role|position|headline)[:\s]+([^\n]{5,80})/i);
  const headline = headlineMatch?.[1]?.trim() ?? (lastName ? `${firstName} ${lastName}` : firstName || "Professional");

  return {
    firstName,
    lastName,
    email,
    headline,
    location,
    skills: skills.length > 0 ? skills : [{ name: "General", level: "Intermediate", yearsOfExperience: 1 }],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    languages: [],
    availability: { status: "Available", type: "Full-time" },
    socialLinks: {
      linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
      github: githubMatch ? `https://${githubMatch[0]}` : "",
      portfolio: portfolioMatch?.[0] ?? "",
    },
  };
}

// ─── Extract retry-after seconds from a 429 error message ────────────────────

function extractRetryAfter(error: unknown): number {
  const msg = error instanceof Error ? error.message : String(error);
  const match = msg.match(/retry[^\d]*(\d+(?:\.\d+)?)\s*s/i);
  return match ? Math.ceil(parseFloat(match[1])) + 1 : 20;
}

function isQuota429(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota exceeded");
}

// ─── Main resume parser ───────────────────────────────────────────────────────

export async function parseResumeToProfile(
  input: { pdfBuffer: Buffer } | { rawText: string },
  emailHint?: string,
  rawTextFallback?: string
): Promise<Partial<TalentProfile>> {
  const ai = getAI();

  const prompt = emailHint
    ? RESUME_PARSE_PROMPT.replace('"email": ""', `"email": "${emailHint}"`)
    : RESUME_PARSE_PROMPT;

  const parts: Array<{ inlineData?: { mimeType: string; data: string }; text?: string }> = [];

  if ("pdfBuffer" in input) {
    parts.push({ inlineData: { mimeType: "application/pdf", data: input.pdfBuffer.toString("base64") } });
  } else {
    parts.push({ text: `RESUME TEXT:\n${input.rawText.substring(0, 8000)}` });
  }
  parts.push({ text: prompt });

  const tryGemini = async (model: string) => {
    const response = await ai.models.generateContent({
      model,
      contents: [{ role: "user", parts }],
    });
    const rawResponse = response.text ?? "";
    const text = extractJSON(rawResponse);
    return JSON.parse(text) as Partial<TalentProfile>;
  };

  // Attempt 1: gemini-2.5-flash (same quota pool as screening — avoids 2.0-flash exhaustion)
  try {
    return await tryGemini("gemini-2.5-flash");
  } catch (err1) {
    if (!isQuota429(err1)) throw err1;

    // Wait the suggested retry delay then try once more
    const wait = extractRetryAfter(err1) * 1000;
    console.warn(`[resume parser] gemini-2.5-flash quota hit, retrying in ${wait}ms…`);
    await new Promise((r) => setTimeout(r, Math.min(wait, 25_000)));

    try {
      return await tryGemini("gemini-2.5-flash");
    } catch (err2) {
      if (!isQuota429(err2)) throw err2;

      // All Gemini quotas exhausted — fall back to text-based extraction
      console.warn("[resume parser] All Gemini quotas exhausted — using text-based fallback parser");
      const rawText = "rawText" in input ? input.rawText : (rawTextFallback ?? "");
      return parseResumeFromText(rawText);
    }
  }
}
