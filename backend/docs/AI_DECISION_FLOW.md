# AI Decision Flow - UMURAVA SCREENING AI

This document explains how AI (Gemini 1.5 Flash) is orchestrated to ensure transparent, accurate, and efficient candidate screening.

## 1. The Decision Engine
The core of the system is the **Gemini 1.5 API**, which acts as an expert HR evaluator.

## 2. Advanced Power Features
- **AI Interview Question Generator**: Automatically generates 3 tailored interview questions per candidate based on their specific skill gaps.
- **Head-to-Head Comparison**: Side-by-side AI evaluation of two candidates to determine the best fit for a role.
- **Must-Have Skill Prioritization**: Recruiters can flag "Must-Have" skills during job creation. The AI ranking engine is instructed to penalize candidates who lack these core requirements heavily.

## 3. Screening Process Flow
1.  **Input Collection**: The backend gathers the Job Description and a batch of Candidates.
2.  **Batching Optimization**: Candidates are processed in chunks of 5 to maintain context accuracy and respect token limits.
3.  **Prompt Execution**: A weighted-scoring prompt is sent to Gemini.
4.  **Structured Evaluation**:
    - **Skills Match**: 0-100 score based on technical alignment.
    - **Experience Match**: 0-100 score based on professional history.
    - **Education Match**: 0-100 score based on academic requirements.
    - **Relevance**: Qualitative assessment of "fit" for the specific role.
5.  **Ranking**: Candidates are ranked globally across all batches based on the final weighted score.
6.  **Recommendation**: AI assigns a status (Shortlist, Waitlist, Reject) based on the top percentile.

## 3. Transparency & Explainability
- **Strengths & Gaps**: Instead of a simple "yes/no", the AI explicitly lists what the candidate has and what they lack.
- **AI Reasoning**: A natural language paragraph explaining *why* the score was assigned, allowing the human recruiter to verify the AI's logic.

## 4. Assumptions & Limitations
- **PDF Text Quality**: Assumptions are made that PDFs are text-based. Scanned images are currently limited.
- **Token Limits**: Large resumes are truncated to 5,000 characters to ensure efficient processing.
- **Language**: The system currently assumes English resumes and job descriptions.
