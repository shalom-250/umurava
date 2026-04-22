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
        const now = new Date();
        const jobs = await Job.find({}).populate('recruiterId', 'name email').lean();

        // Enhance jobs with actual application counts and automated status updates
        const jobsEnhanced = await Promise.all(jobs.map(async (job: any) => {
            let currentStatus = job.status;

            // 1. Automated Status Transition (Deadline check)
            if (job.deadline && currentStatus !== 'Closed') {
                const deadlineDate = new Date(job.deadline);
                if (!isNaN(deadlineDate.getTime()) && now > deadlineDate) {
                    await Job.findByIdAndUpdate(job._id, { status: 'Closed' });
                    currentStatus = 'Closed';
                }
            }

            // 2. Visibility Rule Logic (for Applicant Portal)
            // If the request comes from an applicant route (we can check headers or query params)
            // or we just return the 'isVisible' flag for frontend to handle.
            let isVisible = true;
            if (currentStatus === 'Closed' && job.deadline) {
                const deadlineDate = new Date(job.deadline);
                const thirtyMinutesAfter = new Date(deadlineDate.getTime() + 30 * 60000);
                if (now > thirtyMinutesAfter) {
                    isVisible = false;
                }
            }

            const count = await Application.countDocuments({ jobId: job._id });
            return {
                ...job,
                status: currentStatus,
                applicantCount: count,
                id: job._id,
                isVisible // Flag for portal logic
            };
        }));

        res.json(jobsEnhanced);
    } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateJob = async (req: any, res: Response): Promise<void> => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        // Optional: Ensure only the creator can update
        // if (job.recruiterId.toString() !== req.user._id.toString()) {
        //     res.status(403).json({ message: 'Not authorized' });
        //     return;
        // }

        const updatedJob = await Job.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        res.json(updatedJob);
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
