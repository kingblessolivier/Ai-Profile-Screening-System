# TalentAI Backend

Express + TypeScript backend for the Umurava AI screening prototype.

## What it does

- Authenticates recruiters with JWT
- Stores jobs, candidates, and screening results in MongoDB
- Parses PDFs and CSV files into structured candidate profiles
- Orchestrates Gemini-based screening with deterministic fallback scoring

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

- `PORT`: server port, usually `5000`
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: token signing secret
- `GEMINI_API_KEY`: Google Gemini API key
- `CLIENT_URL`: frontend origin for CORS
- `NODE_ENV`: runtime mode

## AI Flow

1. Candidate profiles are normalized into a structured schema.
2. Candidates are pre-scored locally with transparent weighted scoring.
3. The strongest candidates are sent to Gemini for ranking and explanation.
4. If Gemini quota is unavailable, the backend returns a deterministic fallback shortlist.

## Notes

- The app is designed to keep humans in control of the final hiring decision.
- The fallback path keeps screening usable even when Gemini rate limits are hit.
