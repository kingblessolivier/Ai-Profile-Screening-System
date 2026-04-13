# TalentAI — AI-Powered Candidate Screening System

> **Umurava AI Hackathon** · Team InnovateX · April 2026

An intelligent recruitment screening platform that uses **Google Gemini 2.0 Flash** to automatically evaluate, rank, and explain candidate matches against job requirements.

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | _Vercel URL after deploy_ |
| Backend API | _Render/Railway URL after deploy_ |

---

## Features

| Feature | Description |
|---|---|
| **AI Screening** | Gemini 2.0 Flash evaluates all candidates with weighted scoring + natural-language reasoning |
| **Hybrid Scoring** | Deterministic engine (skills 40%, experience 25%, projects 15%, education 10%, availability 10%) runs first, then AI enriches with qualitative insight |
| **Resume Parsing** | Upload PDFs — Gemini extracts structured profiles from raw text |
| **CSV Import** | Bulk import candidates from spreadsheets |
| **Demo Data** | One-click seed of 15 richly structured African tech candidates |
| **Ranked Shortlist** | Top 10 or Top 20 with expandable detail cards |
| **Explainable AI** | Every candidate gets: strengths, gaps, recommendation, skill gap pills, 3 interview questions |
| **Pool Insights** | Top skills, missing critical skills, avg experience across all screened candidates |
| **PDF Reports** | Export screening results as downloadable PDF shortlist summaries |
| **Auth** | Email/password JWT authentication |

---

## Tech Stack

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose)
- **AI**: Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Auth**: JWT + bcryptjs
- **File handling**: Multer, pdf-parse, csv-parser

### Frontend
- **Framework**: Next.js 15 (App Router)
- **State**: Redux Toolkit
- **UI**: Tailwind CSS + Lucide React
- **HTTP**: Axios

### Infrastructure
- **Frontend**: Vercel
- **Backend**: Render / Railway
- **Database**: MongoDB Atlas

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (Vercel)                     │
│   Next.js + Redux Toolkit + Tailwind CSS                    │
│   Pages: Dashboard / Jobs / Candidates / Screening / Results│
└────────────────────────┬────────────────────────────────────┘
                         │ REST API (HTTPS)
┌────────────────────────▼────────────────────────────────────┐
│                    BACKEND (Render/Railway)                   │
│   Express.js + TypeScript                                   │
│                                                             │
│   ┌─────────────────┐   ┌──────────────────────────────┐   │
│   │ Scoring Engine  │   │      Gemini AI Service       │   │
│   │ (Deterministic) │──▶│  gemini-2.0-flash            │   │
│   │ Skills:  40%    │   │  • Multi-candidate prompt    │   │
│   │ Exp:     25%    │   │  • Structured JSON output    │   │
│   │ Projects:15%    │   │  • Batch processing          │   │
│   │ Education:10%   │   │  • Resume parser             │   │
│   │ Avail:   10%    │   └──────────────────────────────┘   │
│   └─────────────────┘                                       │
└────────────────────────┬────────────────────────────────────┘
                         │ Mongoose ODM
┌────────────────────────▼────────────────────────────────────┐
│                   MongoDB Atlas                              │
│   Collections: users / jobs / candidates / screeningresults │
└─────────────────────────────────────────────────────────────┘
```

---

## AI Decision Flow

```
1. INGEST
   Recruiter creates job with requirements (skills, level, experience)
   Candidates loaded from: Umurava Platform | CSV | PDF resumes

2. DETERMINISTIC PRE-SCORING (code-based, transparent)
   For each candidate:
   • skillsScore     = skill name match × level adequacy × years
   • experienceScore = total years vs expected + tech stack overlap
   • projectsScore   = relevant projects / total × quality bonus
   • educationScore  = degree rank + certification bonus
   • availabilityScore = status + type match
   compositeScore = weighted sum (40/25/15/10/10)

3. FILTER
   Top 2-3× shortlistSize candidates sent to Gemini (saves tokens, reduces noise)

4. GEMINI AI ANALYSIS (gemini-2.0-flash)
   Structured prompt includes:
   • Job: title, level, requirements, responsibilities
   • Each candidate: pre-score, skills, roles, education, projects (normalized)
   
   Gemini returns strict JSON:
   {
     "shortlist": [{
       "rank": 1,
       "matchScore": 88,
       "breakdown": { skillsScore, experienceScore, ... },
       "strengths": ["...", "...", "..."],
       "gaps": ["...", "..."],
       "recommendation": "Strongly Recommended",
       "summary": "...",
       "interviewQuestions": ["...", "...", "..."],
       "skillGapAnalysis": { matched, missing, bonus }
     }]
   }

5. MERGE & RANK
   AI scores merged with deterministic data
   Final ranking by matchScore
   Pool insights computed (top skills, missing critical skills, avg experience)

6. HUMAN REVIEW
   Recruiter sees ranked shortlist with full explanations
   All hiring decisions remain with the recruiter
```

---

## Scoring Weights

| Category | Weight | Rationale |
|---|---|---|
| Skills Match | 40% | Core competency alignment is most critical |
| Work Experience | 25% | Proven track record in relevant roles |
| Projects Portfolio | 15% | Practical application beyond employment |
| Education & Certs | 10% | Academic foundation + continuous learning |
| Availability | 10% | Immediate practical fit |

---

## Setup Instructions

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Google AI Studio API key (Gemini)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

The frontend example env file lives at [frontend/.env.example](frontend/.env.example).

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret for signing JWTs (use a long random string) |
| `GEMINI_API_KEY` | Google Gemini API key from [Google AI Studio](https://aistudio.google.com) |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `https://talentai.vercel.app`) |
| `NODE_ENV` | `development` or `production` |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL (e.g. `https://talentai-api.onrender.com/api`) |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register recruiter |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Get current user |

### Jobs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/jobs` | List all jobs |
| POST | `/api/jobs` | Create job |
| GET | `/api/jobs/:id` | Get job |
| PUT | `/api/jobs/:id` | Update job |
| DELETE | `/api/jobs/:id` | Delete job |

### Candidates
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/candidates` | List (with search/filter/pagination) |
| POST | `/api/candidates` | Create single candidate |
| POST | `/api/candidates/bulk` | Bulk create (seed) |
| POST | `/api/candidates/upload/pdf` | Upload + AI-parse PDFs |
| POST | `/api/candidates/upload/csv` | Upload + import CSV |
| DELETE | `/api/candidates/:id` | Delete candidate |

### Screening
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/screening/run` | Trigger AI screening |
| GET | `/api/screening` | List all results |
| GET | `/api/screening/:id` | Get result with full shortlist |
| GET | `/api/screening/:id/report/pdf` | Download shortlist summary as PDF |
| GET | `/api/screening/job/:jobId/latest` | Latest result for a job |
| DELETE | `/api/screening/:id` | Delete result |

---

## Deployment

### Frontend → Vercel
1. Connect GitHub repo to Vercel
2. Set `NEXT_PUBLIC_API_URL` to your backend URL
3. Deploy from `frontend/` directory

### Backend → Render
1. Create a new Web Service
2. Connect GitHub repo
3. Build command: `cd backend && npm install && npm run build`
4. Start command: `cd backend && npm start`
5. Add all environment variables

### Database → MongoDB Atlas
1. Create a free M0 cluster
2. Whitelist `0.0.0.0/0` for Render access
3. Copy connection string to `MONGODB_URI`

---

## Assumptions & Limitations

- Gemini API access is mandatory for the ideal AI flow, but the app now falls back to deterministic scoring when quota is exhausted.
- The prototype assumes recruiter-created jobs and candidate ingestion are already available in the system.
- Resume parsing is designed for structured extraction from PDFs and CSV imports, but quality still depends on source document clarity.
- Final hiring decisions remain human-led; the model only assists with ranking and explanation.

---

## Assumptions & Limitations

### Assumptions
- Gemini 2.0 Flash returns valid JSON as instructed (enforced via extraction regex fallback)
- Candidate emails are unique identifiers for deduplication
- Skills level inference from experience context is approximate for PDF-parsed resumes
- All screening results are stored permanently (no expiry)

### Limitations
- PDF parsing quality depends on resume formatting (well-formatted PDFs work best)
- Gemini API rate limits may affect large batch screenings (>50 candidates)
- AI scores are advisory only — recruiter judgment remains authoritative
- No real-time streaming of AI results (polling recommended for UI feedback)
- Resume parsing limited to 6,000 characters of extracted text per PDF

### AI Responsibility
- The system explicitly labels AI outputs as suggestions, not decisions
- Recruiters can override any AI recommendation
- Skill gap analysis provides transparency into scoring rationale
- No protected characteristics (age, gender, ethnicity) are collected or evaluated

---

## Team InnovateX

| Name | Role |
|---|---|
| nizeyelie25@gmail.com | Team Lead |
| nsengimanaolivier100@gmail.com | Backend Engineer |
| bugingopine004@gmail.com | Frontend Engineer |
| dianahporter@gmail.com | AI Engineer |
| elietech25@gmail.com | Full-Stack Engineer |

---

*Built for the Umurava AI Hackathon — April 2026*
