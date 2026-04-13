"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const Candidate_1 = __importDefault(require("../models/Candidate"));
const Screening_1 = __importDefault(require("../models/Screening"));
const getDashboardStats = async (req, res) => {
    try {
        const totalJobs = await Job_1.default.countDocuments();
        const totalCandidates = await Candidate_1.default.countDocuments();
        const totalScreenings = await Screening_1.default.countDocuments();
        // Average score across all screenings
        const screenings = await Screening_1.default.find({});
        const avgScore = screenings.length > 0
            ? screenings.reduce((acc, s) => acc + s.score, 0) / screenings.length
            : 0;
        res.json({
            totalJobs,
            totalCandidates,
            totalScreenings,
            avgScore: Math.round(avgScore * 100) / 100,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getDashboardStats = getDashboardStats;
