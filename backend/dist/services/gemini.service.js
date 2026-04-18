"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareCandidates = exports.extractCandidateInfo = exports.rankCandidates = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey || apiKey === "GEMINI_API_KEY") {
    console.warn("⚠️ GEMINI_API_KEY is missing or using default placeholder in .env");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
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
    You are an expert HR Recruitment AI for Umurava, specialized in the Rwandan and African tech markets. 
    Your task is to rank the following candidates against a specific job description with high objectivity and "Explainability."
    
    Job Description:
    ${jobDescription}
    
    Candidates:
    ${JSON.stringify(candidates)}
    
    Instructions:
    1. Evaluate each candidate based on three weighted dimensions:
       - Skills (50%): Technical match with required skills.
       - Experience (30%): Relevance of past roles and years of experience.
       - Education (20%): Academic background and certifications.
    2. Provide a "weightedScore" breakdown (0-100 for each).
    3. If a job has "mustHaveSkills", subtract 20 points from the total score for each missing must-have skill.
    4. Categorize each candidate into a "recommendation": "Shortlist" (Score >80), "Waitlist" (60-80), or "Reject" (<60).
    5. Rank candidates numerically starting from 1.
    
    6. EXPLAINABILITY (Recruiter-Friendly):
       - "strengths": 1-2 sentences highlighting why they are a good fit. Focus on unique value.
       - "gaps": 1-2 sentences identifying exactly what they are missing relative to this job.
       - "aiReasoning": A professional, objective summary (max 3 sentences) justifying the final rank.
       - "interviewQuestions": Generate 3 custom questions that probe the identified "gaps."

    Return ONLY a valid JSON array of objects. Do not include any markdown formatting.
    
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
        console.log("Gemini Raw Response Received");
        // Clean text in case Gemini wraps it in markdown blocks
        const cleanJson = text.replace(/```json|```/g, "").trim();
        try {
            return JSON.parse(cleanJson);
        }
        catch (parseError) {
            console.error("JSON Parse Error in Gemini Service:", parseError);
            console.error("Raw Text was:", text);
            throw new Error("AI returned invalid JSON format. Check console for details.");
        }
    }
    catch (error) {
        console.error("Gemini API Error details:", error);
        throw new Error(`Gemini API Error: ${error.message || "Unknown error"}`);
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
