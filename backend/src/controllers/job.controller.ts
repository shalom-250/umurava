import { Request, Response } from 'express';
import Job from '../models/Job';

export const createJob = async (req: any, res: Response): Promise<void> => {
    const {
        title,
        description,
        requirements,
        skills,
        mustHaveSkills,
        department,
        location,
        type,
        experienceLevel,
        salaryRange,
        deadline,
        status
    } = req.body;

    try {
        const job = await Job.create({
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
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

import Application from '../models/Application';

export const getJobs = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await Job.find({}).populate('recruiterId', 'name email').lean();

        // Enhance jobs with actual application counts
        const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
            const count = await Application.countDocuments({ jobId: job._id });
            return {
                ...job,
                applicantCount: count,
                id: job._id // ensure 'id' alias is present for frontend
            };
        }));

        res.json(jobsWithCounts);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getJobById = async (req: Request, res: Response): Promise<void> => {
    try {
        const job = await Job.findById(req.params.id).populate('recruiterId', 'name email');
        if (job) {
            res.json(job);
        } else {
            res.status(404).json({ message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
