"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJobById = exports.getJobs = exports.createJob = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const createJob = async (req, res) => {
    const { title, description, requirements, skills, mustHaveSkills, department, location, type, experienceLevel, salaryRange, deadline, status } = req.body;
    try {
        const job = await Job_1.default.create({
            title,
            description,
            requirements,
            skills,
            mustHaveSkills: mustHaveSkills || [],
            recruiterId: req.user._id,
            department,
            location,
            type: type || 'Full-time',
            experienceLevel: experienceLevel || 'Junior',
            salaryRange,
            deadline,
            status: status || 'Active'
        });
        res.status(201).json(job);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.createJob = createJob;
const Application_1 = __importDefault(require("../models/Application"));
const getJobs = async (req, res) => {
    try {
        const jobs = await Job_1.default.find({}).populate('recruiterId', 'name email').lean();
        // Enhance jobs with actual application counts
        const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
            const count = await Application_1.default.countDocuments({ jobId: job._id });
            return {
                ...job,
                applicantCount: count,
                id: job._id // ensure 'id' alias is present for frontend
            };
        }));
        res.json(jobsWithCounts);
    }
    catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getJobs = getJobs;
const getJobById = async (req, res) => {
    try {
        const job = await Job_1.default.findById(req.params.id).populate('recruiterId', 'name email');
        if (job) {
            res.json(job);
        }
        else {
            res.status(404).json({ message: 'Job not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getJobById = getJobById;
