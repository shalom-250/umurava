# Technical Documentation - Umurava AI Platform

This document serves as the comprehensive technical guide for the Umurava AI platform, covering backend architecture, frontend interactions, and deployment standards.

## 🏗️ Architecture Stack

### Backend (API & Logic)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Intelligence**: Google Gemini 1.5 Flash SDK
- **Database**: MongoDB (Mongoose ODM)
- **Storage**: Cloudinary (for persistent file management)
- **Auth**: JWT (JSON Web Tokens) & Bcrypt

### Frontend (UI & UX)
- **Framework**: Next.js 15 (App Router)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (Radar & Line charts)
- **Icons**: Lucide React

---

## 🌟 Feature Deep-Dives

### 1. Cloudinary Integration
To ensure high availability and persistence, the system has migrated from local ephemeral storage to Cloudinary.
- **Workflow**: Files are received via `Multer`, streamed to Cloudinary, and the returned `secure_url` is stored in the MongoDB candidate record.
- **Organization**: Folders are dynamically created within Cloudinary to group resumes by Job Title.

### 2. Recruiter Dashboard Logic
The dashboard is built for high-volume screening.
- **Live State Updates**: Action buttons for Interviewing, Hiring, and Rejecting trigger immediate state updates in the `ShortlistTable.tsx`, providing instant visual feedback.
- **Exporting**: Integrated `XLSX` and `jsPDF` engines allow recruiters to download filtered views of their talent pool for offline reporting.

### 3. Applicant Transparency (Leaderboard)
Shortlisted candidates gain access to a "Competitive Leaderboard."
- **Logic**: A filtered API call fetches other shortlisted candidates for the same job (anonymized) to show a relative ranking based on AI match score.

---

## 📡 API Layer Breakdown

The backend is structured into modular routes:
- `/api/jobs`: CRUD operations for job postings and AI extraction from descriptions.
- `/api/candidates`: Bulk parsing of CSVs and PDF resumes.
- `/api/screening`: Core AI ranking and reasoning engine.
- `/api/auth`: Identity management and session tokens.

---

## ⚙️ Deployment & Standards

### Repository Structure
- `/backend`: Contains the Express server, Mongoose models, and AI services.
- `/src`: The Next.js 15 frontend source code.
- `/docs`: Centralized technical documentation (including this file).
- `/public`: Static assets used by the frontend.

### Coding Standards
- **Clean Code**: We utilize ESLint and Prettier to maintain a consistent style.
- **Type Safety**: TypeScript is used across both frontend and backend to minimize runtime errors.
- **Modularity**: Services (like `gemini.service.ts`) are decoupled from controllers to allow for easy model swapping or engine updates.

## 📈 Future Scaling
- **Model Upgrades**: The `genAI.getGenerativeModel` call is centralized, allowing a 1-line update to `gemini-1.5-pro` if higher reasoning depth is required.
- **Database Indexing**: Advanced MongoDB indexing is planned for the `extractedText` field to support full-text search within the talent pool.
