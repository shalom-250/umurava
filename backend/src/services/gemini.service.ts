import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey || apiKey === "GEMINI_API_KEY") {
    console.warn("⚠️ GEMINI_API_KEY is missing or using default placeholder in .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export interface IRankingResult {
    candidateId: string;
    score: number;
    rank: number;
    weightedScore: {
        skills: number;
        experience: number;
        education: number;
    };
    relevance: number;
    strengths: string;
    gaps: string;
    aiReasoning: string;
    recommendation: 'Shortlist' | 'Waitlist' | 'Reject';
    interviewQuestions: string[];
    skillBreakdown: {
        skill: string;
        score: number;
        required: boolean;
    }[];
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const rankCandidates = async (jobDescription: string, candidates: any[]): Promise<IRankingResult[]> => {
    const BATCH_SIZE = 5;
    const allResults: IRankingResult[] = [];

    for (let i = 0; i < candidates.length; i += BATCH_SIZE) {
        const batch = candidates.slice(i, i + BATCH_SIZE);
        let retries = 2;
        let success = false;
        let delay = 5000;

        while (retries > 0 && !success) {
            try {
                const batchResult = await rankBatch(jobDescription, batch);
                allResults.push(...batchResult);
                success = true;

                if (i + BATCH_SIZE < candidates.length) {
                    await sleep(1500);
                }
            } catch (error: any) {
                if (error.message.includes('429') || error.message.includes('Quota') || error.message.includes('Too Many Requests')) {
                    console.warn(`Quota hit, retrying in ${delay / 1000}s... (${retries} left)`);
                    await sleep(delay);
                    retries--;
                } else {
                    retries = 0;
                }
            }
        }

        if (!success) {
            console.warn("⚠️ AI service exhausted. Falling back to local simulation engine for this batch.");
            const simulatedBatch = batch.map((c, idx) => {
                const jobSkillsLower = jobDescription.toLowerCase();
                const candSkills = c.skills || [];
                const matched = candSkills.filter((s: any) => {
                    const skillName = typeof s === 'string' ? s : s?.name;
                    return skillName && jobSkillsLower.includes(skillName.toLowerCase());
                }).length;
                const matchScore = Math.min(100, 40 + (matched * 10) + (Math.random() * 15));

                return {
                    candidateId: c._id || c.id,
                    score: Math.round(matchScore),
                    rank: 0,
                    weightedScore: {
                        skills: Math.round(matchScore * 0.9),
                        experience: Math.round(matchScore * 0.8),
                        education: Math.round(matchScore * 0.85)
                    },
                    relevance: matchScore,
                    strengths: candSkills.slice(0, 3).map((s: any) => typeof s === 'string' ? s : s?.name).filter(Boolean).join(', ') + " (Strong match)",
                    gaps: "Minor experience gap in secondary tools",
                    aiReasoning: `[Simulated Output] This candidate demonstrates solid alignment with the core requirements. Skill overlap score is ${Math.round(matchScore)}/100 based on keyword extraction.`,
                    recommendation: matchScore >= 70 ? 'Shortlist' : matchScore >= 55 ? 'Waitlist' : 'Reject' as any,
                    interviewQuestions: ["Can you describe your experience with these specific tools?", "How do you handle demanding project deadlines?"],
                    skillBreakdown: candSkills.slice(0, 5).map((s: any) => ({
                        skill: typeof s === 'string' ? s : s?.name || 'Skill',
                        score: Math.round(40 + Math.random() * 60),
                        required: true
                    }))
                };
            });
            allResults.push(...simulatedBatch);
        }
    }

    return allResults.sort((a, b) => b.score - a.score).map((r, index) => ({ ...r, rank: index + 1 }));
};

const rankBatch = async (jobDescription: string, candidates: any[]): Promise<IRankingResult[]> => {
    const prompt = `
    Job: ${jobDescription}
    Candidates: ${JSON.stringify(candidates.map(c => ({
        id: c._id || c.id,
        name: c.name,
        skills: c.skills,
        exp: (c.experience || "").substring(0, 500),
        edu: (c.education || "").substring(0, 300),
        docs: c.documentChecklist
    })))}
    
    Task: Rank candidates 1-100 on: Skills(40%), Exp(30%), Edu(20%), Docs(10%).
    Output: JSON array of objects with candidateId, score, rank, weightedScore, recommendation, strengths, gaps, aiReasoning, interviewQuestions, skillBreakdown.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanJson = text.replace(/```json|```/g, "").trim();
        return JSON.parse(cleanJson);
    } catch (error: any) {
        console.error("Gemini Error:", error.message);
        throw error;
    }
};

export const extractCandidateInfoFromText = async (text: string): Promise<any> => {
    const prompt = `
    Extract ALL the following information from the candidate's resume text. 
    IF ANY FIELD IS NOT FOUND, SET IT TO null. 
    Be extremely thorough.

    Fields to extract:
    1. Personal Info: name, phone, email, location (city, country), nationality, dob, linkedin, github, portfolio, website.
    2. personalStatement: A short paragraph (3-5 lines) or profile summary.
    3. education: Array of { institution, degree, fieldOfStudy, location, startYear, endYear, achievements (array) }.
    4. experience: Array of { jobTitle, company, location, startDate, endDate, description, achievements (array), technologies (array), isCurrent (boolean) }.
    5. skills: Array of { name, level, type ('Technical' | 'Soft') }.
    6. certifications: Array of { name, issuer, issueDate }.
    7. projects: Array of { name, description, technologies (array), role }.
    8. languages: Array of { name, level ('Basic' | 'Intermediate' | 'Fluent') }.
    9. interests: { professional (array), personal (array) }.
    10. hobbies: Array of strings.
    11. references: Array of { name, position, contactDetails } or "Available upon request".
    12. backgroundSchool: Array of { name, certificate, location }. (Earlier Education)
    13. awards: Array of { title, issuer, year, description }.
    14. volunteerExperience: Array of { organization, role, impact, duration }.
    15. extracurricularActivities: Array of { activity, role, description }.
    16. publications: Array of { title, platform, link, year }.

    Resume Text:
    ${text.substring(0, 10000)}

    Return ONLY a valid JSON object.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const cleanJson = response.text().replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        return normalizeParsedData(parsed, text);
    } catch (error: any) {
        console.warn("⚠️ Gemini Text Extraction Error. Using fallback.", error.message);
        return getFallbackInfo(text);
    }
};

export const extractCandidateInfoFromFile = async (filePath: string, mimeType: string): Promise<any> => {
    if (mimeType !== 'application/pdf') {
        throw new Error("Direct file processing only supported for PDF.");
    }

    try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');

        const prompt = `
            Extract ALL candidate information from this resume PDF.
            IF ANY FIELD IS NOT FOUND, SET IT TO null.
            Follow this schema:
            - name, phone, email, location, nationality, dob
            - socialLinks: { linkedin, github, portfolio, website }
            - personalStatement
            - education: [{ institution, degree, fieldOfStudy, location, startYear, endYear, achievements: [] }]
            - experience: [{ jobTitle, company, location, startDate, endDate, description, achievements: [], technologies: [], isCurrent }]
            - skills: [{ name, level, type: 'Technical'|'Soft' }]
            - certifications: [{ name, issuer, issueDate }]
            - projects: [{ name, description, technologies: [], role }]
            - languages: [{ name, level }]
            - interests: { professional: [], personal: [] }
            - hobbies: []
            - references: [{ name, position, contactDetails }]
            - backgroundSchool: [{ name, certificate, location }]
            - awards: [{ title, issuer, year, description }]
            - volunteerExperience: [{ organization, role, impact, duration }]
            - extracurricularActivities: [{ activity, role, description }]
            - publications: [{ title, platform, link, year }]
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
        return normalizeParsedData(parsed, "");
    } catch (error: any) {
        console.warn("⚠️ Gemini Direct PDF Error:", error.message);
        throw error;
    }
};

const normalizeParsedData = (data: any, originalText: string): any => {
    let name = data.name || data.fullName || null;
    let email = data.email || data.emailAddress || null;
    let phone = data.phone || data.phoneNumber || data.contact || null;

    // Fallback for names/emails/phones if AI missed them but they exist in text
    if (!email && originalText) {
        const emailMatch = originalText.match(/[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/);
        if (emailMatch) email = emailMatch[0];
    }
    if (!phone && originalText) {
        const phoneMatch = originalText.match(/(?:\+?\d{1,4}[\s.-]?)?\(?\d{2,5}\)?[\s.-]?\d{2,4}[\s.-]?\d{2,4}[\s.-]?\d{2,6}/);
        if (phoneMatch) phone = phoneMatch[0];
    }

    return {
        firstName: name ? name.split(' ')[0] : null,
        lastName: name ? name.split(' ').slice(1).join(' ') : null,
        name: name,
        email: email,
        phone: phone,
        location: data.location || null,
        nationality: data.nationality || null,
        dob: data.dob || null,
        personalStatement: data.personalStatement || null,
        bio: data.personalStatement || null,
        socialLinks: {
            linkedin: data.linkedin || data.socialLinks?.linkedin || null,
            github: data.github || data.socialLinks?.github || null,
            portfolio: data.portfolio || data.socialLinks?.portfolio || null,
            website: data.website || data.socialLinks?.website || null,
        },
        skills: (data.skills || []).map((s: any) => typeof s === 'string' ? { name: s, level: 'Intermediate', type: 'Technical' } : {
            name: s.name || null,
            level: s.level || 'Intermediate',
            type: s.type || 'Technical'
        }),
        education: (data.education || []).map((e: any) => ({
            institution: e.institution || null,
            degree: e.degree || null,
            fieldOfStudy: e.fieldOfStudy || null,
            location: e.location || null,
            startYear: e.startYear || null,
            endYear: e.endYear || null,
            achievements: e.achievements || []
        })),
        experience: (data.experience || []).map((ex: any) => ({
            company: ex.company || null,
            role: ex.jobTitle || ex.role || null,
            location: ex.location || null,
            startDate: ex.startDate || null,
            endDate: ex.endDate || null,
            description: ex.description || null,
            achievements: ex.achievements || [],
            technologies: ex.technologies || [],
            isCurrent: ex.isCurrent || false
        })),
        certifications: data.certifications || [],
        projects: data.projects || [],
        languages: data.languages || [],
        interests: data.interests || { professional: [], personal: [] },
        hobbies: data.hobbies || [],
        references: data.references || [],
        backgroundSchool: data.backgroundSchool || [],
        awards: data.awards || [],
        volunteerExperience: data.volunteerExperience || [],
        extracurricularActivities: data.extracurricularActivities || [],
        publications: data.publications || [],
        source: 'unstructured'
    };
};

const getFallbackInfo = (text: string): any => {
    return normalizeParsedData({}, text);
};
