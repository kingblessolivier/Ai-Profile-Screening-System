/**
 * Deterministic Scoring Engine
 * ─────────────────────────────
 * Runs BEFORE the AI call to produce a pre-score for each candidate.
 * This normalizes data and reduces AI hallucination risk.
 *
 * Weights:
 *   Skills Match      40%
 *   Experience        25%
 *   Projects          15%
 *   Education         10%
 *   Availability      10%
 */

import { TalentProfile, Job, ScoreBreakdown, SkillGapAnalysis } from "../types";

const WEIGHTS = {
  skills: 0.40,
  experience: 0.25,
  projects: 0.15,
  education: 0.10,
  availability: 0.10,
};

const LEVEL_RANK: Record<string, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
  Expert: 4,
};

// ─── Individual scorers ───────────────────────────────────────────────────────

function scoreSkills(candidate: TalentProfile, job: Job): number {
  const required = job.requirements.filter(r => r.required);
  if (required.length === 0) return 70; // No requirements = neutral score

  let totalPoints = 0;
  let maxPoints = 0;

  for (const req of required) {
    maxPoints += 100;
    const match = candidate.skills.find(
      s => s.name.toLowerCase().includes(req.skill.toLowerCase()) ||
           req.skill.toLowerCase().includes(s.name.toLowerCase())
    );

    if (!match) continue;

    // Base: skill present = 50 pts
    let pts = 50;

    // Level match: +30 pts if candidate level >= required level
    if (req.level) {
      const reqRank = LEVEL_RANK[req.level] ?? 1;
      const candRank = LEVEL_RANK[match.level] ?? 1;
      if (candRank >= reqRank) pts += 30;
      else pts += 10; // has it but lower level
    } else {
      pts += 30; // no level specified = bonus
    }

    // Years of experience: +20 pts if meets required years
    if (req.yearsRequired) {
      if (match.yearsOfExperience >= req.yearsRequired) pts += 20;
      else if (match.yearsOfExperience >= req.yearsRequired * 0.6) pts += 10;
    } else {
      pts += 20; // no year requirement = bonus
    }

    totalPoints += pts;
  }

  return maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 70;
}

function scoreExperience(candidate: TalentProfile, job: Job): number {
  const totalMonths = candidate.experience.reduce((acc, exp) => {
    if (!exp.startDate) return acc;
    const start = new Date(exp.startDate + "-01");
    const end = exp.isCurrent
      ? new Date()
      : new Date((exp.endDate || "2024-01") + "-01");
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    return acc + Math.max(0, months);
  }, 0);

  const yearsExp = totalMonths / 12;

  // Expected years by level
  const expected: Record<string, number> = {
    Junior: 1,
    "Mid-level": 3,
    Senior: 6,
    Lead: 8,
  };
  const target = expected[job.experienceLevel] ?? 3;

  // Base score from years
  let baseScore: number;
  if (yearsExp >= target * 1.5) baseScore = 100;
  else if (yearsExp >= target) baseScore = 85;
  else if (yearsExp >= target * 0.7) baseScore = 65;
  else if (yearsExp >= target * 0.4) baseScore = 40;
  else baseScore = 20;

  // Bonus: tech stack overlap with job requirements
  const jobTechs = job.requirements.map(r => r.skill.toLowerCase());
  const candidateTechs = candidate.experience.flatMap(e =>
    e.technologies.map(t => t.toLowerCase())
  );
  const techOverlap = jobTechs.filter(t =>
    candidateTechs.some(ct => ct.includes(t) || t.includes(ct))
  ).length;

  const techBonus = Math.min(15, techOverlap * 3);

  return Math.min(100, Math.round(baseScore + techBonus));
}

function scoreProjects(candidate: TalentProfile, job: Job): number {
  if (candidate.projects.length === 0) return 20;

  const jobTechs = job.requirements.map(r => r.skill.toLowerCase());

  let relevantProjects = 0;
  for (const project of candidate.projects) {
    const techs = project.technologies.map(t => t.toLowerCase());
    const overlap = jobTechs.filter(jt =>
      techs.some(t => t.includes(jt) || jt.includes(t))
    ).length;
    if (overlap > 0) relevantProjects++;
  }

  const coverage = relevantProjects / candidate.projects.length;
  const quantityBonus = Math.min(20, candidate.projects.length * 5);

  return Math.min(100, Math.round(coverage * 80 + quantityBonus));
}

function scoreEducation(candidate: TalentProfile): number {
  if (candidate.education.length === 0) return 30;

  const degreeRank: Record<string, number> = {
    "High School": 20,
    "Associate": 40,
    "Bachelor's": 65,
    "Master's": 85,
    "PhD": 100,
    "Doctorate": 100,
    "Bootcamp": 50,
    "Certificate": 50,
  };

  let highest = 30;
  for (const edu of candidate.education) {
    for (const [key, score] of Object.entries(degreeRank)) {
      if (edu.degree.toLowerCase().includes(key.toLowerCase())) {
        highest = Math.max(highest, score);
        break;
      }
    }
  }

  // Certification bonus
  const certBonus = Math.min(15, (candidate.certifications?.length ?? 0) * 5);

  return Math.min(100, highest + certBonus);
}

function scoreAvailability(candidate: TalentProfile, job: Job): number {
  const statusScore: Record<string, number> = {
    Available: 100,
    "Open to Opportunities": 70,
    "Not Available": 10,
  };

  const typeScore = candidate.availability.type === job.type ? 100 : 50;

  return Math.round((statusScore[candidate.availability.status] ?? 50) * 0.6 + typeScore * 0.4);
}

// ─── Composite scorer ─────────────────────────────────────────────────────────

export function computeDeterministicScore(
  candidate: TalentProfile,
  job: Job
): { compositeScore: number; breakdown: ScoreBreakdown } {
  const skillsScore = scoreSkills(candidate, job);
  const experienceScore = scoreExperience(candidate, job);
  const projectsScore = scoreProjects(candidate, job);
  const educationScore = scoreEducation(candidate);
  const availabilityScore = scoreAvailability(candidate, job);

  const compositeScore = Math.round(
    skillsScore * WEIGHTS.skills +
    experienceScore * WEIGHTS.experience +
    projectsScore * WEIGHTS.projects +
    educationScore * WEIGHTS.education +
    availabilityScore * WEIGHTS.availability
  );

  return {
    compositeScore,
    breakdown: {
      skillsScore,
      experienceScore,
      educationScore,
      projectsScore,
      availabilityScore,
    },
  };
}

// ─── Skill gap analysis (pre-AI) ──────────────────────────────────────────────

export function computeSkillGap(
  candidate: TalentProfile,
  job: Job
): SkillGapAnalysis {
  const required = job.requirements.map(r => r.skill);
  const candidateSkillNames = candidate.skills.map(s => s.name);
  const allTechs = [
    ...candidateSkillNames,
    ...candidate.experience.flatMap(e => e.technologies),
    ...candidate.projects.flatMap(p => p.technologies),
  ].map(s => s.toLowerCase());

  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of required) {
    const found = allTechs.some(
      t => t.includes(req.toLowerCase()) || req.toLowerCase().includes(t)
    );
    if (found) matched.push(req);
    else missing.push(req);
  }

  // Bonus: skills not required but present
  const bonus = candidateSkillNames.filter(
    s => !required.some(
      r => r.toLowerCase().includes(s.toLowerCase()) ||
           s.toLowerCase().includes(r.toLowerCase())
    )
  ).slice(0, 5);

  return { matched, missing, bonus };
}

// ─── Pool insights ────────────────────────────────────────────────────────────

export function computePoolInsights(candidates: TalentProfile[], job: Job) {
  // Top skills in pool
  const skillCount: Record<string, number> = {};
  for (const c of candidates) {
    for (const s of c.skills) {
      skillCount[s.name] = (skillCount[s.name] ?? 0) + 1;
    }
  }
  const topSkills = Object.entries(skillCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  // Missing critical skills (required but < 30% of pool have them)
  const requiredSkills = job.requirements.filter(r => r.required).map(r => r.skill);
  const missingCriticalSkills = requiredSkills.filter(req => {
    const haveIt = candidates.filter(c =>
      c.skills.some(s =>
        s.name.toLowerCase().includes(req.toLowerCase()) ||
        req.toLowerCase().includes(s.name.toLowerCase())
      )
    ).length;
    return haveIt / candidates.length < 0.3;
  });

  // Average experience
  const avgExperienceYears = Math.round(
    (candidates.reduce((acc, c) => {
      const months = c.experience.reduce((m, e) => {
        if (!e.startDate) return m;
        const start = new Date(e.startDate + "-01");
        const end = e.isCurrent ? new Date() : new Date((e.endDate || "2024-01") + "-01");
        return m + Math.max(0, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()));
      }, 0);
      return acc + months / 12;
    }, 0) / candidates.length) * 10
  ) / 10;

  // Availability breakdown
  const availBreakdown: Record<string, number> = {};
  for (const c of candidates) {
    availBreakdown[c.availability.status] = (availBreakdown[c.availability.status] ?? 0) + 1;
  }
  const availabilityBreakdown = Object.entries(availBreakdown).map(([status, count]) => ({ status, count }));

  return { topSkills, missingCriticalSkills, avgExperienceYears, availabilityBreakdown };
}
