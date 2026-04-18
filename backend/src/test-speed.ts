import { extractCandidateInfo } from './services/gemini.service';

const testSpeed = async () => {
    console.log("=== Testing Gemini API Extraction Speed ===");

    const mockResumeText = `
    JOHN DOE
    johndoe@example.com | +250 788 123 456
    Kigali, Rwanda
    
    SUMMARY
    Highly skilled Full-Stack Developer with 5+ years of experience in React, Node.js, and Cloud Infrastructure.
    
    SKILLS
    JavaScript, TypeScript, React, Next.js, Node.js, Express, MongoDB, PostgreSQL, Docker, AWS.
    
    EXPERIENCE
    Senior Software Engineer - Umurava (2021 - Present)
    - Architected and deployed scalable backend using Node.js and AWS.
    - Improved frontend load time by 40% with Next.js optimization.
    
    EDUCATION
    B.Sc. in Computer Science - University of Rwanda (2015 - 2019)
    `;

    console.log("Starting API Request...");
    const startTime = Date.now();
    try {
        const aiInfo = await extractCandidateInfo(mockResumeText);
        const duration = Date.now() - startTime;
        console.log("AI Info Result:", JSON.stringify(aiInfo, null, 2));
        console.log(`⏱️ API parsing took: ${duration}ms (${(duration / 1000).toFixed(2)} seconds)`);

        if (duration > 5000) {
            console.log("⚠️ WARNING: Parsing takes longer than 5s. This might lead to bad UX or Vercel edge function timeouts (10s limit). We may need to adjust the scope (process in background).");
        } else {
            console.log("✅ API speed is acceptable.");
        }
    } catch (e: any) {
        console.error("Test failed:", e.message);
    }
};

testSpeed();
