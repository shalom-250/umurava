/**
 * AI Prompt Engineering Strategy Documentation - UMURAVA SCREENING AI
 * 
 * This file documents the intentional design of prompts used to ensure 
 * accurate, transparent, and efficient candidate screening.
 */

export const PROMPTS = {
    CANDIDATE_RANKING: {
        Goal: "Assign objective scores and ranks to candidates based on a job specification.",
        Strategy: "Chain-of-Thought with Structured JSON output.",
        Structure: [
            "Role: Expert HR Recruitment AI.",
            "Context: Job details vs Candidate data.",
            "Constraint: Return valid JSON only.",
            "Scoring Method: Weighted breakdown (Skills, Experience, Education) + Relevance.",
            "Categorization: Shortlist, Waitlist, Reject recommendations."
        ],
        PromptTemplate: `... (see src/services/gemini.service.ts rankCandidates) ...`
    },
    PROFILE_EXTRACTION: {
        Goal: "Convert unstructured resume text into structured candidate data.",
        Strategy: "Entity extraction with fallback handling.",
        Structure: [
            "Task: Identify Name, Email, Phone, Skills, Experience, Education.",
            "Constraint: Handle diverse PDF/CSV formats.",
            "Sanitization: Clean text and formalize skill lists."
        ],
        PromptTemplate: `... (see src/services/gemini.service.ts extractCandidateInfo) ...`
    }
};

export const getPromptDocs = () => {
    return PROMPTS;
};
