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

export const getJobs = async (req: Request, res: Response): Promise<void> => {
    try {
        const jobs = await Job.find({}).populate('recruiterId', 'name email');
        res.json(jobs);
    } catch (error) {
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
