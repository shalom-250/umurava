"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComparison = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const Candidate_1 = __importDefault(require("../models/Candidate"));
const gemini_service_1 = require("../services/gemini.service");
const getComparison = async (req, res) => {
    const { jobId, candidateAId, candidateBId } = req.body;
    try {
        const job = await Job_1.default.findById(jobId);
        const candidateA = await Candidate_1.default.findById(candidateAId);
        const candidateB = await Candidate_1.default.findById(candidateBId);
        if (!job || !candidateA || !candidateB) {
            res.status(404).json({ message: 'Job or candidates not found' });
            return;
        }
        const jobDescription = `${job.title}\n${job.description}\nMust-Have: ${job.mustHaveSkills.join(', ')}`;
        const result = await (0, gemini_service_1.compareCandidates)(jobDescription, candidateA, candidateB);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: 'Comparison failed' });
    }
};
exports.getComparison = getComparison;
