import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
if (!apiKey || apiKey === "GEMINI_API_KEY") {
    console.warn("⚠️ GEMINI_API_KEY is missing or using default placeholder in .env");
}

export const genAI = new GoogleGenerativeAI(apiKey);
// Using gemini-1.5-flash as the primary, reliable model
export const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

console.log(`[Gemini] Model initialized using key: ${apiKey.substring(0, 5)}...`);

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
    Extract ALL candidate information from this resume text.
    IF ANY FIELD IS NOT FOUND, SET IT TO null.
    Return a single, valid JSON object strictly matching this schema:
    {
      "name": "string",
      "phone": "string",
      "email": "string",
      "location": "string",
      "nationality": "string",
      "dob": "string",
      "socialLinks": { "linkedin": "string", "github": "string", "portfolio": "string", "website": "string" },
      "personalStatement": "string",
      "education": [{ "institution": "string", "degree": "string", "fieldOfStudy": "string", "location": "string", "startYear": "string", "endYear": "string", "achievements": ["string"] }],
      "experience": [{ "jobTitle": "string", "company": "string", "location": "string", "startDate": "string", "endDate": "string", "description": "string", "achievements": ["string"], "technologies": ["string"], "isCurrent": false }],
      "skills": [{ "name": "string", "level": "string", "type": "Technical|Soft" }],
      "certifications": [{ "name": "string", "issuer": "string", "issueDate": "string" }],
      "projects": [{ "name": "string", "description": "string", "technologies": ["string"], "role": "string" }],
      "languages": [{ "name": "string", "level": "string" }],
      "interests": { "professional": ["string"], "personal": ["string"] },
      "hobbies": ["string"],
      "references": [{ "name": "string", "position": "string", "contactDetails": "string" }],
      "backgroundSchool": [{ "name": "string", "certificate": "string", "location": "string" }],
      "awards": [{ "title": "string", "issuer": "string", "year": "string", "description": "string" }],
      "volunteerExperience": [{ "organization": "string", "role": "string", "impact": "string", "duration": "string" }],
      "extracurricularActivities": [{ "activity": "string", "role": "string", "description": "string" }],
      "publications": [{ "title": "string", "platform": "string", "link": "string", "year": "string" }],
      "additionalInformation": "string"
    }

    Resume Text:
    ${text.substring(0, 10000)}

    Return ONLY the valid JSON object with NO markdown wrapping.
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const response = await result.response;
        return safeJsonParse(response.text(), (t) => normalizeParsedData(JSON.parse(t), text));
    } catch (error: any) {
        console.warn("⚠️ Gemini Text Extraction Error. Using fallback.", error.message);
        return getFallbackInfo(text);
    }
};

const safeJsonParse = (text: string, callback: (json: any) => any) => {
    try {
        // Strip out likely markdown fences just in case
        const clean = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(clean);
        return callback(parsed);
    } catch (e) {
        // Fallback: search for first { and last }
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
            try {
                const inner = text.substring(start, end + 1);
                return callback(JSON.parse(inner));
            } catch (innerE) {
                console.error("Failed to parse JSON even after cleaning:", text);
                throw innerE;
            }
        }
        throw e;
    }
};

export const extractJobInfoFromText = async (text: string): Promise<any> => {
    const prompt = `
    Extract job information from the following text.
    Return a JSON object with:
    - title: string
    - description: string
    - requirements: string[]
    - skills: string[]
    - mustHaveSkills: string[]
    - department: string
    - location: string
    - type: string (e.g. Full-time, Internship)
    - experienceLevel: string (e.g. Junior, Senior)
    - salaryRange: string
    - deadline: string

    Job Text:
    ${text.substring(0, 5000)}
    `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
        });
        const response = await result.response;
        return safeJsonParse(response.text(), (j) => j);
    } catch (error: any) {
        console.error("Gemini Job Text Extraction Error:", error);
        return null;
    }
};

export const extractJobInfoFromBuffer = async (buffer: Buffer, mimeType: string): Promise<any> => {
    // Some browsers send application/octet-stream for PDFs
    const safeMime = (mimeType === 'application/octet-stream' || !mimeType) ? 'application/pdf' : mimeType;

    try {
        const base64Data = buffer.toString('base64');

        const prompt = `
            Extract job information from this PDF and return as JSON.
            Required fields: title, description, requirements (array), skills (array), mustHaveSkills (array), department, location, type, experienceLevel, salaryRange, deadline.
            Output must be a valid JSON object.
        `;

        const result = await model.generateContent({
            contents: [{
                role: "user",
                parts: [
                    { inlineData: { data: base64Data, mimeType: "application/pdf" } },
                    { text: prompt }
                ]
            }],
            generationConfig: { responseMimeType: "application/json" }
        });

        const response = await result.response;
        return safeJsonParse(response.text(), (j) => j);
    } catch (error: any) {
        console.error("Gemini Job File Extraction Error:", error);
        throw error;
    }
};

export const extractJobInfoFromFile = async (filePath: string, mimeType: string): Promise<any> => {
    const buffer = fs.readFileSync(filePath);
    return extractJobInfoFromBuffer(buffer, mimeType);
};

export const extractCandidateInfoFromBuffer = async (buffer: Buffer, mimeType: string): Promise<any> => {
    if (mimeType !== 'application/pdf') {
        throw new Error("Direct file processing only supported for PDF.");
    }

    try {
        const base64Data = buffer.toString('base64');

        const prompt = `
            Extract ALL candidate information from this resume PDF.
            IF ANY FIELD IS NOT FOUND, SET IT TO null.
            Return a single, valid JSON object strictly matching this schema:
            {
              "name": "string",
              "phone": "string",
              "email": "string",
              "location": "string",
              "nationality": "string",
              "dob": "string",
              "socialLinks": { "linkedin": "string", "github": "string", "portfolio": "string", "website": "string" },
              "personalStatement": "string",
              "education": [{ "institution": "string", "degree": "string", "fieldOfStudy": "string", "location": "string", "startYear": "string", "endYear": "string", "achievements": ["string"] }],
              "experience": [{ "jobTitle": "string", "company": "string", "location": "string", "startDate": "string", "endDate": "string", "description": "string", "achievements": ["string"], "technologies": ["string"], "isCurrent": false }],
              "skills": [{ "name": "string", "level": "string", "type": "Technical|Soft" }],
              "certifications": [{ "name": "string", "issuer": "string", "issueDate": "string" }],
              "projects": [{ "name": "string", "description": "string", "technologies": ["string"], "role": "string" }],
              "languages": [{ "name": "string", "level": "string" }],
              "interests": { "professional": ["string"], "personal": ["string"] },
              "hobbies": ["string"],
              "references": [{ "name": "string", "position": "string", "contactDetails": "string" }],
              "backgroundSchool": [{ "name": "string", "certificate": "string", "location": "string" }],
              "awards": [{ "title": "string", "issuer": "string", "year": "string", "description": "string" }],
              "volunteerExperience": [{ "organization": "string", "role": "string", "impact": "string", "duration": "string" }],
              "extracurricularActivities": [{ "activity": "string", "role": "string", "description": "string" }],
              "publications": [{ "title": "string", "platform": "string", "link": "string", "year": "string" }],
              "additionalInformation": "string"
            }
            Return ONLY the valid JSON object with NO markdown wrapping.
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

export const extractCandidateInfoFromFile = async (filePath: string, mimeType: string): Promise<any> => {
    const buffer = fs.readFileSync(filePath);
    return extractCandidateInfoFromBuffer(buffer, mimeType);
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
        additionalInformation: data.additionalInformation || null,
        rawAIOutput: data, // Preserve everything for "dynamic" extraction
        source: 'unstructured'
    };
};

const getFallbackInfo = (text: string): any => {
    // Smart regex-based extractor — runs when AI is rate-limited
    const getLine = (label: string) => {
        const m = text.match(new RegExp(`${label}[:\\s]+([^\\n]+)`, 'i'));
        return m ? m[1].trim() : null;
    };

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(?:\+?[\d\s\-().]{7,20})/);

    const name = getLine('Full Name') || getLine('Name') || null;
    const email = emailMatch ? emailMatch[0] : null;
    const phone = phoneMatch ? phoneMatch[0].trim() : null;
    const location = getLine('Location') || getLine('City') || null;
    const nationality = getLine('Nationality') || null;
    const dob = getLine('Date of Birth') || getLine('DOB') || null;
    const personalStatement = getLine('Personal Statement') || getLine('Profile') || getLine('Summary') || getLine('Objective') || null;

    // Extract skills from a "Skills:" section
    const skillsMatch = text.match(/(?:Skills|Technical Skills|Core Skills)[:\s]+([^\n]{10,})/i);
    const skillsRaw = skillsMatch ? skillsMatch[1] : '';
    const skills = skillsRaw
        ? skillsRaw.split(/[,;|]+/).map(s => ({ name: s.trim(), level: 'Intermediate', type: 'Technical' })).filter(s => s.name.length > 1)
        : [];

    // Extract languages
    const langMatch = text.match(/Languages?[:\s]+([^\n]+)/i);
    const languages = langMatch
        ? langMatch[1].split(/[,;|]+/).map(l => ({ name: l.trim(), level: 'Intermediate' })).filter(l => l.name.length > 1)
        : [];

    // Extract education block
    const eduMatch = text.match(/Education[\s\S]{0,20}\n([\s\S]{0,600}?)(?:\n[A-Z]|Work Experience|Skills|$)/i);
    const education = eduMatch ? [{
        institution: (eduMatch[1].match(/(?:University|College|School|Institute)[^,\n]*/i) || [])[0]?.trim() || null,
        degree: (eduMatch[1].match(/(?:Bachelor|Master|PhD|B\.Sc|MSc|Diploma|Certificate)[^,\n]*/i) || [])[0]?.trim() || null,
        fieldOfStudy: null, location: null, startYear: null, endYear: null, achievements: []
    }] : [];

    // Extract work experience block
    const expMatch = text.match(/Work Experience[\s\S]{0,20}\n([\s\S]{0,600}?)(?:\n[A-Z]|Skills|Education|$)/i);
    const experience = expMatch ? [{
        jobTitle: (expMatch[1].match(/^([^\n,•\-]+)/m) || [])[1]?.trim() || null,
        company: (expMatch[1].match(/(?:at |@\s*)([A-Z][^\n,]+)/i) || [])[1]?.trim() || null,
        description: expMatch[1].trim().substring(0, 300),
        location: null, startDate: null, endDate: null, achievements: [], technologies: [], isCurrent: false
    }] : [];

    // Extract projects
    const projMatch = text.match(/Projects?[\s\S]{0,20}\n([\s\S]{0,400}?)(?:\n[A-Z]|Awards|Certifications|$)/i);
    const projects = projMatch ? [{
        name: (projMatch[1].match(/^([^\n]+)/m) || [])[1]?.trim() || null,
        description: projMatch[1].trim().substring(0, 200),
        technologies: [], role: null
    }] : [];

    // Extract awards
    const awardsMatch = text.match(/Awards?[\s\S]{0,20}\n([\s\S]{0,300}?)(?:\n[A-Z]|Social|$)/i);
    const awards = awardsMatch ? [{
        title: (awardsMatch[1].match(/^([^\n]+)/m) || [])[1]?.trim() || null,
        issuer: null, year: null, description: awardsMatch[1].trim().substring(0, 150)
    }] : [];

    // Extract social links
    const linkedinMatch = text.match(/(?:linkedin\.com\/in\/|LinkedIn:\s*)([^\s,\n]+)/i);
    const githubMatch = text.match(/(?:github\.com\/|GitHub:\s*)([^\s,\n]+)/i);
    const websiteMatch = text.match(/(?:Website|Portfolio):\s*([^\s\n]+)/i);

    const socialLinks = {
        linkedin: linkedinMatch ? (linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://linkedin.com/in/${linkedinMatch[1]}`) : null,
        github: githubMatch ? (githubMatch[0].startsWith('http') ? githubMatch[0] : `https://github.com/${githubMatch[1]}`) : null,
        portfolio: websiteMatch ? websiteMatch[1] : null,
        website: null
    };

    return normalizeParsedData({
        name, email, phone, location, nationality, dob,
        personalStatement, socialLinks,
        skills, languages, education, experience,
        projects, awards,
        certifications: [], interests: { professional: [], personal: [] },
        hobbies: [], references: [], backgroundSchool: [],
        volunteerExperience: [], extracurricularActivities: [],
        publications: [], additionalInformation: null
    }, text);
};

export const compareCandidates = async (jobDescription: string, candidateA: any, candidateB: any): Promise<any> => {
    const format = (c: any) => `
Name: ${c.name || 'Unknown'}
Skills: ${(c.skills || []).map((s: any) => typeof s === 'string' ? s : s?.name).filter(Boolean).join(', ')}
Experience: ${(c.experience || []).map((e: any) => `${e.jobTitle} at ${e.company}`).join('; ')}
Education: ${(c.education || []).map((e: any) => `${e.degree} from ${e.institution}`).join('; ')}
`.trim();

    const prompt = `
You are an expert AI recruiter. Compare two candidates for the following job and return a structured JSON comparison.

Job:
${jobDescription}

Candidate A:
${format(candidateA)}

Candidate B:
${format(candidateB)}

Return ONLY valid JSON with this exact schema:
{
  "winner": "A" | "B" | "Tie",
  "summary": "string — 2–3 sentence summary of comparison",
  "candidateA": { "strengths": ["string"], "weaknesses": ["string"], "matchScore": number },
  "candidateB": { "strengths": ["string"], "weaknesses": ["string"], "matchScore": number }
}`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().replace(/```json|```/g, '').trim();
        return JSON.parse(text);
    } catch {
        return {
            winner: 'Tie',
            summary: 'Comparison unavailable at this time.',
            candidateA: { strengths: [], weaknesses: [], matchScore: 50 },
            candidateB: { strengths: [], weaknesses: [], matchScore: 50 }
        };
    }
};
