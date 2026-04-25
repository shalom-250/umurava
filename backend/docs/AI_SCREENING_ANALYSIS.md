# Deep Screening & AI Analysis Documentation

This document provides a technical deep-dive into the AI-driven screening and analysis engine of the Umurava AI platform.

## 🧠 AI Engine Overview

The "Deep Screening" engine is powered by **Google Gemini 1.5 Flash**. We chose this model for its exceptional speed, massive context window, and native ability to process multimodal inputs (direct PDF reading).

### ⚙️ Core Logic Flow

1. **Input Ingestion**: Resumes are uploaded as PDFs and stored permanently in **Cloudinary**.
2. **Text Extraction**: 
    - **Primary**: Direct PDF processing via Gemini's multimodal capabilities.
    - **Secondary/Fallback**: Text extraction using `pdf-parse` for rate-limit scenarios.
3. **Structured Mapping**: Raw data is mapped to a strict JSON schema (Name, Contact, Education, Experience, Skills, Certifications, etc.).
4. **Contextual Analysis**: The candidate's structured profile is compared against the specific requirements and description of a job.

## 📊 Scoring & Ranking Algorithm

The screening logic uses a weighted scoring mechanism (1-100 scale) divided into four strategic pillars:

| Pillar | Weight | Description |
| :--- | :--- | :--- |
| **Technical Skills** | 40% | Direct match with required/must-have skills. Software proficiencies, languages, and tools. |
| **Experience** | 30% | Number of years in relevant roles, company tier, and progression. |
| **Education** | 20% | Degree relevance, institution reputation, and academic achievements. |
| **Document Checklist** | 10% | Verification of required certificates, licenses, or specific background checks. |

### 🤖 AI Decision Output

For every screened candidate, the AI generates:
- **Match Score**: A percentage representing overall alignment.
- **AI Recommendation**: One of `Shortlist`, `Waitlist`, or `Reject`.
- **Reasoning**: Specific narrative explaining *why* the candidate received their score.
- **Strengths & Gaps**: Bulleted lists identifying competitive advantages and missing requirements.
- **Interview Questions**: Custom-tailored questions to probe identified gaps or verify claimed strengths.

## 🛡️ Reliability & Robustness

### 1. Quota & Rate Limit Management
The system implements a robust `rankCandidates` service with:
- **Batching**: Processes candidates in batches of 5 to avoid prompt overflow.
- **Exponential Backoff**: Automatically sleeps and retries if a `429 Too Many Requests` status is returned from Google.
- **Simulated Fallback**: In the event of persistent service exhaustion, a local simulation engine kicks in to provide basic keyword-based scoring, ensuring recruiters never encounter a "broken" screen.

### 2. Data Normalization
The `normalizeParsedData` function acts as a safety layer, using regex fallbacks for names, emails, and phone numbers if the AI extraction misses them in highly complex layouts.

## 🔍 Evaluative Insights

The platform provides recruiters with a **Candidate Reasoning Drawer**, where they can see the raw AI logic behind a score. This mitigates "black box" AI concerns and allows human recruiters to verify the AI's conclusions instantly.

### Skill Visualization
We use **Recharts Radar Charts** (`SkillMatchChart.tsx`) to visualize the match. The AI outputs a breakdown of scores (0-100) for specific skills, which is then mapped against the job's requirement expectations to show a visual "overlap."
