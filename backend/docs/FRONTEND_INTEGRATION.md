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
| `/api/jobs` | `POST` | `{ "title": "", "description": "", "requirements": [], "skills": [], "mustHaveSkills": [] }` | Post Job |
| `/api/jobs` | `GET` | None | List Jobs |
| `/api/jobs/:id` | `GET` | `id` (path) | Job Details |

## 3. Candidate Management

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/candidates` | `POST` | `FormData` (append `file` with PDF/CSV) | Upload Resume |
| `/api/candidates` | `GET` | Query Parameter: `search` (optional) | Search Talent |

## 4. AI Screening Engine

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/screening/:jobId` | `POST` | `jobId` (path) | Run AI Match |
| `/api/screening/:jobId` | `GET` | `jobId` (path), Query `minScore` (optional) | Get Rankings |
| `/api/comparison` | `POST` | `{ "jobId": "", "candidateAId": "", "candidateBId": "" }` | Head-Head |

## 5. Recruitment Lifecycle

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/applications` | `POST` | `{ "jobId": "", "candidateId": "", "status": "Applied" }` | Apply |
| `/api/interviews` | `POST` | `{ "applicationId": "", "interviewerId": "", "scheduledAt": "", "type": "HR" }` | Schedule |
| `/api/reviews` | `POST` | `{ "applicationId": "", "reviewerId": "", "score": 8, "comments": "", "recommendation": "Pass" }` | Feedback |

## 6. Dashboard & Data

| URL Path | Method | Payload / Parameters | Goal |
| :--- | :--- | :--- | :--- |
| `/api/analytics/stats` | `GET` | None | Stats |
| `/api/companies` | `GET` | None | List Clients |
| `/api/notifications` | `GET` | None | Get Alerts |
| `/api/settings` | `GET` | None (Use `PUT` with `{ theme: "Dark" }` to update) | Settings |

---

### Example Frontend Call (Axios)
```javascript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000' });

// Example: Get Rankings
const getRankings = async (jobId) => {
  const token = localStorage.getItem('token');
  const response = await API.get(`/api/screening/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};
```
