# Frontend Integration Guide - UMURAVA SCREENING AI

Use this guide to quickly integrate the backend APIs into your frontend application.

- **Base URL**: `http://localhost:5000`
- **Auth Header**: All protected routes require `Authorization: Bearer <JWT_TOKEN>`

## 1. Authentication

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | `{ "name": "", "email": "", "password": "", "role": "recruiter" }` | Sign Up |
| `/api/auth/login` | `POST` | `{ "email": "", "password": "" }` | Sign In |

## 2. Job Management

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/jobs` | `POST` | `{ "title": "", "description": "", "requirements": [], "skills": [] }` | Post Job |
| `/api/jobs` | `GET` | None | List Jobs |
| `/api/jobs/:id` | `GET` | `id` (path) | Job Details |

## 3. Candidate & Profile

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/candidates/parse` | `POST` | `FormData` (append `file` with PDF/CSV) | Upload & Parse |
| `/api/candidates/me/photo` | `POST` | `FormData` (append `photo` with Image) | Update Avatar |
| `/api/candidates/me/dashboard` | `GET` | None | Leaderboard Stats |

## 4. AI Screening Engine

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/screening/:jobId` | `POST` | `jobId` (path) | Run AI Match |
| `/api/screening/:jobId` | `GET` | `jobId` (path) | Get Rankings |
| `/api/comparison` | `POST` | `{ "jobId": "", "candidateAId": "", "candidateBId": "" }` | Compare Talent |

## 5. Lifecycle Actions

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | : :--- | :--- |
| `/api/applications` | `POST` | `{ "jobId": "", "candidateId": "", "status": "Hired" }` | Move Status |
| `/api/interviews` | `POST` | `{ "applicationId": "", "scheduledAt": "", "type": "Technical" }` | Schedule |
| `/api/reviews` | `POST` | `{ "applicationId": "", "score": 8, "comments": "" }` | HR Review |

---

### File Upload Implementation (React/Next.js)
```javascript
const uploadResume = async (file, jobId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('jobId', jobId);

  const response = await axios.post('/api/candidates/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
```
