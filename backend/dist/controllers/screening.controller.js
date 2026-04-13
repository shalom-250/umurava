"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScreeningResults = exports.runScreening = void 0;
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
            name: c.name,
            skills: c.skills,
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
