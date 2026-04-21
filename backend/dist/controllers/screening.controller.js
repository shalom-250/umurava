"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreeningResults = exports.runTestScreening = exports.runScreening = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const Candidate_1 = __importDefault(require("../models/Candidate"));
const Screening_1 = __importDefault(require("../models/Screening"));
const gemini_service_1 = require("../services/gemini.service");
const runScreening = async (req, res) => {
    const { jobId } = req.params;
    try {
        const job = await Job_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }
        const candidates = await Candidate_1.default.find({}); // Or filter by some criteria
        if (candidates.length === 0) {
            res.status(400).json({ message: 'No candidates to screen' });
            return;
        }
        const jobDescription = `${job.title}\n${job.description}\nRequirements: ${job.requirements.join(', ')}\nSkills: ${job.skills.join(', ')}\nMust-Have Priority: ${job.mustHaveSkills.join(', ')}`;
        // Prepare candidate data for Gemini
        const candidatesForAI = candidates.map(c => ({
            id: c._id,
            name: `${c.firstName} ${c.lastName}`.trim(),
            skills: (c.skills || []).map((s) => typeof s === 'string' ? s : s.name),
            experience: c.experience,
            text: c.extractedText?.substring(0, 2000) // Truncate text to avoid token limits
        }));
        const rankingResults = await (0, gemini_service_1.rankCandidates)(jobDescription, candidatesForAI);
        // Save results to database
        const screeningPromises = rankingResults.map(async (result) => {
            return Screening_1.default.findOneAndUpdate({ jobId, candidateId: result.candidateId }, {
                score: result.score,
                rank: result.rank,
                weightedScore: result.weightedScore,
                relevance: result.relevance,
                strengths: result.strengths,
                gaps: result.gaps,
                aiReasoning: result.aiReasoning,
                recommendation: result.recommendation,
                interviewQuestions: result.interviewQuestions,
            }, { upsert: true, new: true });
        });
        await Promise.all(screeningPromises);
        res.json({ message: 'Screening completed successfully', results: rankingResults });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Screening failed' });
    }
};
exports.runScreening = runScreening;
const runTestScreening = async (req, res) => {
    const { jobId } = req.params;
    let jobDescription = "";
    try {
        // Handle mock job IDs that start with "job-"
        if (typeof jobId === 'string' && jobId.startsWith('job-')) {
            // For testing purposes, we use a generic placeholder for mock jobs
            jobDescription = "Senior Fullstack Developer (Node.js/React). Requirements: 5+ years experience, MERN stack, specialized in scalable APIs and responsive UI.";
        }
        else {
            const job = await Job_1.default.findById(jobId);
            if (!job) {
                res.status(404).json({ message: 'Job not found in database' });
                return;
            }
            jobDescription = `${job.title}\n${job.description}\nRequirements: ${job.requirements.join(', ')}\nSkills: ${job.skills.join(', ')}`;
        }
        // UNIFIED RANKING POOL
        // We fetch ALL candidates from the database. This inherently merges formal 
        // job applicants with generically uploaded CSVs and unstructured PDFs into a 
        // single holistic talent pool evaluating everyone against the Job Requirements.
        let candidates = [];
        const allCandidates = await Candidate_1.default.find({});
        if (typeof jobId === 'string' && jobId.startsWith('job-')) {
            // Mock job fallback: For speed, limit to 10 latest candidates
            candidates = allCandidates.reverse().slice(0, 10);
        }
        else {
            // Real Job: Evaluate the entire unified pool 
            candidates = allCandidates;
        }
        if (candidates.length === 0) {
            res.status(400).json({ message: 'No candidates have applied to this job yet.' });
            return;
        }
        // Prepare candidate data for Gemini
        const candidatesForAI = candidates.map(c => ({
            id: c._id.toString(),
            name: c.name,
            email: c.email,
            skills: c.skills,
            experience: c.experience || "No experience provided",
            education: c.education || "No education provided"
        }));
        const rankingResults = await (0, gemini_service_1.rankCandidates)(jobDescription, candidatesForAI);
        // Return results to FE for testing
        res.json({
            message: 'Test Screening completed successfully',
            results: rankingResults,
            qa_note: 'This is a test run using 5 hardcoded dummy profiles against the real job description.'
        });
    }
    catch (error) {
        console.error("Test Screening Error:", error);
        res.status(500).json({
            message: 'Test Screening failed',
            error: error.message || 'Unknown backend error'
        });
    }
};
exports.runTestScreening = runTestScreening;
const getScreeningResults = async (req, res) => {
    const { jobId } = req.params;
    const { minScore, maxScore } = req.query;
    try {
        const query = { jobId };
        if (minScore || maxScore) {
            query.score = {};
            if (minScore)
                query.score.$gte = Number(minScore);
            if (maxScore)
                query.score.$lte = Number(maxScore);
        }
        const results = await Screening_1.default.find(query)
            .populate('candidateId', 'name email skills')
            .sort({ rank: 1 });
        res.json(results);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getScreeningResults = getScreeningResults;
