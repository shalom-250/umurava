# Umurava AI - Intelligent Recruitment & Screening Platform

Umurava AI is a state-of-the-art recruitment ecosystem designed to streamline the hiring process using Generative AI. It automates candidate screening, job description extraction, and talent pool management, providing recruiters with data-driven insights and a seamless workflow.

## 🔗 Live Deployment
- **URL**: [https://umurava-41e9.vercel.app/](https://umurava-41e9.vercel.app/)

## 🏗️ System Architecture

The platform follows a decoupled architecture with a high-performance Next.js frontend and a robust Node.js/Express backend, integrated with Google Gemini AI for intelligent processing.

```mermaid
graph TD
    subgraph "Frontend (Next.js 15)"
        R[Recruiter Dashboard]
        A[Applicant Portal]
        S[Shared Components - Tailwind/Lucide]
    end

    subgraph "Backend (Node.js/Express)"
        API[REST API Layer]
        AI[AI Service - Gemini 1.5 Flash]
        DB[Database Service - Mongoose]
        Storage[Cloudinary Service]
    end

    subgraph "External Services"
        G[Google Gemini API]
        C[Cloudinary CMS]
        M[MongoDB Atlas]
    end

    R & A --> API
    API --> AI
    AI --> G
    API --> DB
    DB --> M
    API --> Storage
    Storage --> C
```

## 📊 Database Architecture

The platform uses a document-oriented schema optimized for AI-driven relationships.

```mermaid
erDiagram
    COMPANY ||--o{ JOB : "posts"
    USER ||--o{ JOB : "manages"
    JOB ||--o{ APPLICATION : "receives"
    CANDIDATE ||--o{ APPLICATION : "submits"
    JOB ||--o{ SCREENING : "results_for"
    CANDIDATE ||--o{ SCREENING : "evaluated_in"
    APPLICATION ||--o{ INTERVIEW : "schedules"
    APPLICATION ||--o{ REVIEW : "feedback_on"
```

> [!TIP]
> Each **Screening** result stores a persistent snapshot of AI reasoning, scores, and interview questions to minimize redundant API calls.

## 📡 Interactive API Documentation (Swagger)

The backend includes a fully interactive Swagger UI for real-time API exploration.

- **URL**: `http://localhost:5000/doc`
- **Authentication**:
  1. Login via `/api/auth/login` to get your JWT token.
  2. Click the **Authorize** button in Swagger (top right).
  3. Enter `Bearer <your_token>` and click **Authorize**.
- **Usage**: You can execute requests directly from the browser to test screening triggers, candidate parsing, and analytics endpoints.

## 🚀 Current Features

- **Gemini-Powered Candidate Ranking**: Automated 1-100 scoring based on Skills (40%), experience (30%), Education (20%), and Documents (10%).
- **AI-Driven Job Extraction**: Instantly populate job specs by uploading PDF/DOCX files.
- **Cloudinary Integration**: Permanent and secure cloud storage for all resumes and profile photos.
- **Recruiter Decision Suite**: Dynamic actions for Interviewing, Hiring, or Rejecting with visual state feedback.
- **Applicant Leaderboard**: Transparent ranking visibility for shortlisted talent to encourage engagement.
- **Export Engine**: boardroom-ready PDF and Excel reports of candidate rankings and talent pools.
- **Identity Hydration**: Session-based profile management for a personalized experience.
- **Mobile-Responsive UI**: Fully optimized experience across all modern device screen sizes.

## 🗺️ Documentation Map

To understand the system in depth, please refer to the following documentation files:

### ⚙️ Core Technical Docs (Root `docs/`)
- **[DEEP_SCREENING_ANALYSIS.md](file:///d:/umurava/docs/DEEP_SCREENING_ANALYSIS.md)**: Algorithmic breakdown of how Gemini scores and ranks candidates.
- **[STATUS_FLOW.md](file:///d:/umurava/docs/STATUS_FLOW.md)**: Lifecycle of application statuses from submission to hiring.
- **[TECHNICAL_DOCUMENTATION.md](file:///d:/umurava/docs/TECHNICAL_DOCUMENTATION.md)**: Full-stack codebase overview and system capabilities.

### 🏗️ Technical Architecture
- **[SYSTEM_ARCHITECTURE.md](file:///d:/umurava/docs/SYSTEM_ARCHITECTURE.md)**: High-level architectural overview and component interactions.
- **[ARCHITECTURE.md](file:///d:/umurava/backend/docs/ARCHITECTURE.md)**: Full-stack codebase overview and system capabilities.
- **[DATABASE.md](file:///d:/umurava/backend/docs/DATABASE.md)**: Definition of core MongoDB schemas and ER diagrams.
- **[STABILITY.md](file:///d:/umurava/backend/docs/STABILITY.md)**: Error handling, rate limiting, and performance strategies.

### 🗄️ Backend & Operational Docs (`backend/docs/`)
- **[API_REFERENCE.md](file:///d:/umurava/backend/docs/API_REFERENCE.md)**: Documentation for REST API endpoints and testing credentials.
- **[FRONTEND_INTEGRATION.md](file:///d:/umurava/backend/docs/FRONTEND_INTEGRATION.md)**: Guide on API consumption and data flow to the UI.
- **[AI_DECISION_FLOW.md](file:///d:/umurava/backend/docs/AI_DECISION_FLOW.md)**: High-level overview of AI logic with flow diagrams.
- **[JOB_PROCESS.md](file:///d:/umurava/backend/docs/JOB_PROCESS.md)**: End-to-end flow from job posting to hiring.
- **[Umurava_Updates_Doc.md](file:///d:/umurava/backend/docs/Umurava_Updates_Doc.md)**: Narrative of recent technical migrations and interface upgrades.

---

## 🛠️ Setup Instructions

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Return to the root directory:
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Access the app at `http://localhost:4028`.

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
| --- | --- |
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `CLOUDINARY_URL` | Cloudinary connection string |
| `JWT_SECRET` | Secret key for JWT authentication |

### Frontend (`.env`)
| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | URL of the backend API |

## ⚠️ Assumptions and Limitations

- **File Types**: AI direct processing is optimized for PDF. DOCX files use a text-extraction fallback.
- **Rate Limits**: The system implements batching and exponential backoff to handle Gemini API quotas.
- **Language**: Optimization is focused on English; accuracy may vary for other languages.

## 📄 License
Internal Development - Umurava AI.

