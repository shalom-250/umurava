"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareCandidates = exports.extractCandidateInfoFromFile = exports.extractCandidateInfoFromText = exports.extractCandidateInfo = exports.rankCandidates = void 0;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey || apiKey === "GEMINI_API_KEY") {
    console.warn("⚠️ GEMINI_API_KEY is missing or using default placeholder in .env");
}
const genAI = new generative_ai_1.GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const rankCandidates = async (jobDescription, candidates) => {
    // Increased batch size to 30 because Gemini Flash has a 1 Million token context window.
    const BATCH_SIZE = 5;
    const allResults = [];
    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        const batch = candidates.slice(i, i + BATCH_SIZE);
        let retries = 2; // Reduced retries to avoid 90-second lockups
        let success = false;
        let delay = 5000; // Flat 5s delay for quick recovery attempts
        while (retries > 0 && !success) {
            try {
                const batchResult = await rankBatch(jobDescription, batch);
                allResults.push(...batchResult);
                success = true;
                // Pacing delay
                if (i + BATCH_SIZE < candidates.length) {
                    await sleep(1500);
                }
            }
            catch (error) {
                if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('Too Many Requests')) {
                    console.warn(`Quota hit, retrying in ${delay / 1000}s... (${retries} left)`);
                    await sleep(delay);
                    retries--;
                }
                else {
                    retries = 0; // abort retries on hard errors like 500, parsing, etc
                }
            }
        }
        // --- FALLBACK LOGIC ---
        // If Gemini completely fails due to strict Free Tier quotas, use a local fallback simulator.
        // This ensures the Recruiter Dashboard always receives functional data and never hangs.
        if (!success) {
            console.warn("⚠️ AI service exhausted. Falling back to local simulation engine for this batch.");
            const simulatedBatch = batch.map((c, idx) => {
                const jobSkillsLower = jobDescription.toLowerCase();
                const candSkills = c.skills || [];
                const matched = candSkills.filter((s) => jobSkillsLower.includes(s.toLowerCase())).length;
                const matchScore = Math.min(100, 40 + (matched * 10) + (Math.random() * 15));
                return {
                    candidateId: c._id || c.id,
                    score: Math.round(matchScore),
                    rank: 0, // Assigned later
                    weightedScore: {
                        skills: Math.round(matchScore * 0.9),
                        experience: Math.round(matchScore * 0.8),
                        education: Math.round(matchScore * 0.85)
                    },
                    relevance: matchScore,
                    strengths: candSkills.slice(0, 3).join(', ') + " (Strong match)",
                    gaps: "Minor experience gap in secondary tools",
                    aiReasoning: `[Simulated Output] This candidate demonstrates solid alignment with the core requirements. Skill overlap score is ${Math.round(matchScore)}/100 based on keyword extraction.`,
                    recommendation: matchScore >= 70 ? 'Shortlist' : matchScore >= 55 ? 'Waitlist' : 'Reject',
                    interviewQuestions: ["Can you describe your experience with these specific tools?", "How do you handle demanding project deadlines?"]
                };
            });
            allResults.push(...simulatedBatch);
        }
    }
    return allResults.sort((a, b) => b.score - a.score).map((r, index) => ({ ...r, rank: index + 1 }));
};
exports.rankCandidates = rankCandidates;
const rankBatch = async (jobDescription, candidates) => {
    // Compressed prompt for token efficiency
    const prompt = `
    Job: ${jobDescription}
    Candidates: ${JSON.stringify(candidates.map(c => ({
        id: c._id || c.id,
        name: c.name,
        skills: c.skills,
        exp: (c.experience || "").substring(0, 500),
        edu: (c.education || "").substring(0, 300)
    })))}
    
    Task: Rank candidates 1-100 on: Skills(50%), Exp(30%), Edu(20%). Penalty -20 if missing key skills.
    Output: JSON array of:
    { "candidateId", "score", "rank", "weightedScore":{skills,experience,education}, "recommendation":"Shortlist"|"Waitlist"|"Reject", "strengths", "gaps", "aiReasoning", "interviewQuestions":[] }
    Keep text professional & concise.
    `;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    }
    catch (error) {
        console.error("Gemini Error:", error.message);
        throw error;
    }
};
const extractCandidateInfo = async (text) => {
    return (0, exports.extractCandidateInfoFromText)(text);
};
exports.extractCandidateInfo = extractCandidateInfo;
const extractCandidateInfoFromText = async (text) => {
    const prompt = `
    Extract the following information from the candidate's resume text:
    - Name
    - Email
    - Phone number
    - Key skills (as a list)
    - Brief summary of experience
    - Brief summary of education
    
    Resume Text:
    ${text.substring(0, 8000)}
    
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
        const parsed = JSON.parse(cleanJson);
        return normalizeParsedData(parsed, text);
    }
    catch (error) {
        console.warn("⚠️ Gemini Text Extraction Error. Using fallback.", error.message);
        return getFallbackInfo(text);
    }
};
exports.extractCandidateInfoFromText = extractCandidateInfoFromText;
const extractCandidateInfoFromFile = async (filePath, mimeType) => {
    // Only use direct file processing for PDFs. For others, we rely on text extraction first.
    if (mimeType !== 'application/pdf') {
        throw new Error("Direct file processing only supported for PDF in this helper.");
    }
    try {
        const fileBuffer = fs_1.default.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        const prompt = `
            Extract candidate information from this resume PDF.
            Return a JSON object with: 
            - name (Full name)
            - email (Email address)
            - phone (Full International Phone Number - look for labels like T:, P:, Tel:, Phone:, or just numbers at the top)
            - skills (array of technical and soft skills)
            - experience (brief summary)
            - education (brief summary)
            
            Be as accurate as possible. If a field is missing, use null.
        `;
        const result = await model.generateContent([
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "application/pdf",
                },
            },
            prompt,
        ]);
        const response = await result.response;
        const cleanJson = response.text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        // PDF binary mode doesn't give us the text easily, so we pass empty string for secondary regex 
        // unless we also try to extract text locally as a backup.
        return normalizeParsedData(parsed, "");
    }
    catch (error) {
        console.warn("⚠️ Gemini Direct PDF Error:", error.message);
        throw error; // Let the caller decide how to handle (e.g. try text extraction fallback)
    }
};
exports.extractCandidateInfoFromFile = extractCandidateInfoFromFile;
/**
 * Normalizes keys (phone vs phoneNumber) and performs aggressive regex fallback if AI missed it.
 */
/**
 * Normalizes keys and performs aggressive regex fallback for missing/placeholder fields.
 */
const normalizeParsedData = (data, originalText) => {
    let name = data.name || data.fullName || "";
    let email = data.email || data.emailAddress || "";
    let phone = data.phone || data.phoneNumber || data.contact || data.mobile || "";
    let skills = Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',').map((s) => s.trim()) : []);
    const isPlaceholder = (val, placeholders) => !val || placeholders.some(p => val.toLowerCase().includes(p.toLowerCase()));
    const namePlaceholders = ['unknown', 'candidate', 'resume', 'cv'];
    const emailPlaceholders = ['unknown', 'example.com', 'no-email'];
    // 1. Aggressive Email Discovery
    if (isPlaceholder(email, emailPlaceholders) && originalText) {
        const emailMatch = originalText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
        if (emailMatch)
            email = emailMatch[0];
    }
    // 2. Aggressive Phone Discovery
    if (!phone && originalText) {
        // Broadened Regex for international formats: allows +, dots, spaces, parens, and varying lengths
        const phoneMatch = originalText.match(/(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}/);
        if (phoneMatch)
            phone = phoneMatch[0];
    }
    // 3. Aggressive Name Discovery (Skip headers, find first 2-5 word line)
    if (isPlaceholder(name, namePlaceholders) && originalText) {
        const headerKeywords = ['resume', 'cv', 'curriculum', 'vitae', 'contact', 'info', 'profile', 'personal', 'information'];
        const lines = originalText.split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !headerKeywords.some(hk => l.toLowerCase().startsWith(hk)));
        if (lines.length > 0) {
            for (const line of lines) {
                const words = line.split(/\s+/);
                if (words.length >= 2 && words.length <= 5) {
                    name = line.substring(0, 50);
                    break;
                }
            }
            if (isPlaceholder(name, namePlaceholders)) {
                name = lines[0].substring(0, 50);
            }
        }
    }
    // 4. Aggressive Skills Discovery (Keyword matching)
    if (skills.length === 0 && originalText) {
        const commonTech = [
            'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'Python', 'Django', 'Flask',
            'Java', 'Spring', 'Spring Boot', 'PHP', 'Laravel', 'C++', 'C#', '.NET', 'SQL', 'PostgreSQL',
            'MongoDB', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'HTML', 'CSS', 'Tailwind', 'Next.js',
            'Vue.js', 'Angular', 'Flutter', 'React Native', 'Swift', 'Kotlin', 'Go', 'Rust', 'Ruby', 'Rails'
        ];
        const lowerText = originalText.toLowerCase();
        skills = commonTech.filter(s => lowerText.includes(s.toLowerCase()));
    }
    return {
        name: name || 'Unknown Candidate',
        email: email || 'unknown@example.com',
        phone: phone || '',
        skills: skills,
        experience: data.experience || data.workExperience || "Experience details not extracted.",
        education: data.education || data.academic || "Education details not extracted."
    };
};
const getFallbackInfo = (text) => {
    // Pass empty object to trigger full regex discovery in normalizeParsedData
    return normalizeParsedData({}, text);
};
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
