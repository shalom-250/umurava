"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareCandidates = exports.extractCandidateInfo = exports.rankCandidates = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const rankCandidates = async (jobDescription, candidates) => {
    // Optimization: Batch candidates if there are more than 5 to ensure accuracy and avoid token limits
    const BATCH_SIZE = 5;
    const allResults = [];
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        const batch = candidates.slice(i, i + BATCH_SIZE);
        const batchResult = await rankBatch(jobDescription, batch);
        allResults.push(...batchResult);
    }
    // Re-rank across all batches
    return allResults.sort((a, b) => b.score - a.score).map((r, index) => ({ ...r, rank: index + 1 }));
};
exports.rankCandidates = rankCandidates;
const rankBatch = async (jobDescription, candidates) => {
    const prompt = `
    You are an expert HR Recruitment AI. Your task is to rank the following candidates against a specific job description.
    
    Job Description:
    ${jobDescription}
    
    Candidates:
    ${JSON.stringify(candidates)}
    
    Instructions:
    1. Evaluate each candidate based on their skills, experience, and educational background.
    2. Provide a "weightedScore" breakdown (0-100 for each: skills, experience, education).
    3. Assign an overall "score" (0-100) and a "relevance" score (0-100).
    4. CRITICAL: If a job has "mustHaveSkills" (provided in job details), penalize candidates heavily if they lack these.
    5. Rank the candidates from best to worst.
    6. Categorize each candidate into a "recommendation": "Shortlist", "Waitlist", or "Reject".
    7. Generate 3 specific "interviewQuestions" for each candidate based on their identified "gaps".
    8. Provide concise "strengths", "gaps", and professional "aiReasoning".
    9. Return ONLY a valid JSON array of objects.
    
    Expected JSON Format:
    [
      {
        "candidateId": "id_here",
        "score": 95,
        "rank": 1,
        "weightedScore": { "skills": 98, "experience": 92, "education": 90 },
        "relevance": 97,
        "recommendation": "Shortlist",
        "interviewQuestions": ["...", "...", "..."],
        "strengths": "...",
        "gaps": "...",
        "aiReasoning": "..."
      }
    ]
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean text in case Gemini wraps it in markdown blocks
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    }
    catch (error) {
        console.error("Gemini API Error:", error);
        throw new Error("Failed to rank candidates via AI");
    }
};
const extractCandidateInfo = async (text) => {
    const prompt = `
    Extract the following information from the candidate's resume text:
    - Name
    - Email
    - Phone number
    - Key skills (as a list)
    - Brief summary of experience
    - Brief summary of education
    
    Resume Text:
    ${text.substring(0, 5000)}
    
    Return ONLY a valid JSON object. Do not include markdown formatting.
    
    Expected JSON Format:
    {
      "name": "Full Name",
      "email": "email@example.com",
      "phone": "string",
      "skills": ["Skill1", "Skill2"],
      "experience": "Summary of experience",
      "education": "Summary of education"
    }
  `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanJson = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    }
    catch (error) {
        console.error("Gemini Extraction Error:", error);
        return null; // Fallback to manual entry if AI fails
    }
};
exports.extractCandidateInfo = extractCandidateInfo;
const compareCandidates = async (jobDescription, candidateA, candidateB) => {
    const prompt = `
        Compare these two candidates for the following job:
        
        Job:
        ${jobDescription}
        
        Candidate A:
        ${JSON.stringify(candidateA)}
        
        Candidate B:
        ${JSON.stringify(candidateB)}
        
        Provide a side-by-side comparison. Who is the better fit and why?
        Return ONLY a valid JSON object.
        
        Expected JSON Format:
        {
            "winner": "Candidate Name",
            "justification": "Detailed explanation",
            "comparison": {
                "skills": "Comp A vs Comp B",
                "experience": "Comp A vs Comp B",
                "education": "Comp A vs Comp B"
            }
        }
    `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanJson = response.text().replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    }
    catch (error) {
        console.error("Gemini Comparison Error:", error);
        throw new Error("Failed to compare candidates");
    }
};
exports.compareCandidates = compareCandidates;
