# API Reference for Frontend Integration - UMURAVA SCREENING AI

Base URL: `http://localhost:5000`

> [!NOTE]
> All endpoints except Authentication require a `Bearer <token>` in the `Authorization` header.

## 🔑 Testing Credentials
For demonstration and diagnostic testing, use the following seeded account:
- **Email**: `aline.uwimana@umurava.africa`
- **Password**: `Recruiter2026!`

## 1. Authentication
Endpoints for user registration and login.

- **POST `/api/auth/register`**
  - **Body**: `{ "name": "...", "email": "...", "password": "...", "role": "recruiter" }`
- **POST `/api/auth/login`**
  - **Body**: `{ "email": "...", "password": "..." }`
  - **Response**: `{ "token": "...", "user": { ... } }`

## 2. Job Management
- **POST `/api/jobs`**
  - **Body**: `{ "title": "...", "description": "...", "requirements": ["..."], "skills": ["..."], "mustHaveSkills": ["..."] }`
- **GET `/api/jobs`**: Fetch all available jobs.
- **GET `/api/jobs/:id`**: Fetch detailed specs for a specific job.

## 3. Candidate Ingestion & Profile
- **POST `/api/candidates/parse`**
  - **Body**: `multipart/form-data` with `file` field (PDF or CSV).
  - **Description**: Extracts AI data and uploads the file to **Cloudinary**.
- **POST `/api/candidates/me/photo`**
  - **Body**: `multipart/form-data` with `photo` field.
  - **Description**: Uploads and center-crops a profile avatar to Cloudinary.
- **GET `/api/candidates/me/dashboard`**: Fetch stats for the applicant leaderboard and application status.
- **PUT `/api/candidates/me`**: Update personal profile details (headline, bio, etc.).

## 4. AI Screening & Ranking
- **POST `/api/screening/:jobId`**
  - **Description**: Triggers the AI batch evaluation (Gemini 1.5 Flash).
- **POST `/api/screening/test-gemini/:jobId`**
  - **Description**: Diagnostic endpoint to verify Gemini connectivity for a specific job.
- **GET `/api/screening/:jobId`**
  - **Description**: Fetch ranked results with strengths, gaps, and weighted scores.

## 5. Comparative Analysis
- **POST `/api/comparison`**
  - **Body**: `{ "jobId": "...", "candidateAId": "...", "candidateBId": "..." }`
  - **Description**: Returns a head-to-head AI comparison between two candidates.

## 6. Recruitment Lifecycle & Actions
- **GET/POST `/api/applications`**: Manage the hiring pipeline status (`Applied`, `Interview`, `Hired`, `Rejected`).
- **GET/POST `/api/interviews`**: Schedule technical/behavioral meetings.
- **GET/POST `/api/reviews`**: Post-interview scorecards and recruiter recommendations.

## 7. Metrics & Analytics
- **GET `/api/analytics/stats`**: Dashboard KPIs for recruiters (Total Candidates, Active Jobs, Shortlisted).
- **GET `/api/notifications`**: Real-time system alerts.
- **GET `/api/settings`**: Manage user-specific preferences.
