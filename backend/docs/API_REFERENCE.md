# API Reference for Frontend Integration - UMURAVA SCREENING AI

Base URL: `http://localhost:5000`

> [!NOTE]
> All endpoints except Authentication require a `Bearer <token>` in the `Authorization` header.

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
- **GET `/api/jobs`**
  - **Parameters**: None
- **GET `/api/jobs/:id`**
  - **Parameters**: `id` (path)

## 3. Candidate Ingestion
- **POST `/api/candidates`**
  - **Body**: `multipart/form-data` with `file` field (PDF or CSV)
- **GET `/api/candidates`**
  - **Query Parameters**: `search` (Search by name or skill)

## 4. AI Screening & Ranking
- **POST `/api/screening/:jobId`**
  - **Parameters**: `jobId` (path)
  - **Description**: Triggers the AI evaluation of all candidates against the job.
- **GET `/api/screening/:jobId`**
  - **Parameters**: `jobId` (path)
  - **Query Parameters**: `minScore` (Optional, filter by score)

## 5. Comparative Analysis
- **POST `/api/comparison`**
  - **Body**: `{ "jobId": "...", "candidateAId": "...", "candidateBId": "..." }`
  - **Description**: Returns a head-to-head AI comparison of two candidates.

## 6. Recruitment Lifecycle
- **GET/POST `/api/applications`**
  - **Body (POST)**: `{ "jobId": "...", "candidateId": "...", "status": "Applied" }`
- **GET/POST `/api/interviews`**
  - **Body (POST)**: `{ "applicationId": "...", "interviewerId": "...", "scheduledAt": "...", "type": "Technical" }`
- **GET/POST `/api/reviews`**
  - **Body (POST)**: `{ "applicationId": "...", "reviewerId": "...", "score": 8, "comments": "...", "recommendation": "Pass" }`

## 7. Organizational & Utilities
- **GET/POST `/api/companies`**: Manage corporate profiles.
- **GET/POST `/api/departments`**: Manage internal departments.
- **GET/POST `/api/skills`**: Manage skills taxonomy.
- **GET/POST `/api/messages`**: Internal chat logs.
- **GET `/api/notifications`**: User system alerts.
- **GET `/api/analytics/stats`**: Dashboard metrics.
- **GET `/api/settings`**: User preferences (PUT to update).
- **GET/POST `/api/subscriptions`**: SaaS tier management.
- **GET `/api/audit-logs`**: Security activity tracking.
