# AI Screening Engine

The UmuravaAI platform uses Google Gemini AI to automate the screening and ranking of candidates against job descriptions.

## 🚀 Overview
The AI engine transforms unstructured candidate profiles into a ranked list, providing objective scores and qualitative reasoning to help recruiters identify top talent quickly.

## 🧠 Gemini Integration
- **Model**: `gemini-1.5-flash`
- **Backend Service**: `backend/src/services/gemini.service.ts`
- **Route**: `POST /api/screening/test-gemini/:jobId` (Current testing endpoint)

## 📝 Prompt Strategy
We employ a **Chain-of-Thought** prompt strategy that forces the AI to evaluate candidates across three specific dimensions:
1.  **Skills (Weight: High)**: Technical alignment with required/must-have skills.
2.  **Experience (Weight: Medium)**: Direct relevance of past roles to the current job.
3.  **Education (Weight: Low)**: Academic credentials and certifications.

### JSON Response Structure
The engine returns a strictly structured JSON response for seamless frontend integration:
- `score`: Overall match percentage (0-100).
- `recommendation`: One of "Shortlist", "Waitlist", or "Reject".
- `aiReasoning`: A professional justification for the rank.
- `interviewQuestions`: Three custom questions based on the candidate's unique gaps.

## 🧪 Testing with Dummy Profiles
For development and QA purposes, the platform includes 5 hardcoded dummy profiles (Jean Paul, Alice Umutoni, etc.) used to verify the AI's ranking accuracy and response shape without needing a live candidate database.

## 🛠️ Setup
1.  Ensure `GEMINI_API_KEY` is set in the backend `.env`.
2.  The backend handles markdown sanitization to ensure valid JSON parsing.
