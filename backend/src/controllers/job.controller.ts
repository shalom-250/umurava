import { Request, Response } from 'express';
import Job from '../models/Job';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { extractTextFromPdf } from '../services/pdf.service';
import { extractTextFromDocx } from '../services/doc.service';
import { extractJobInfoFromFile, extractJobInfoFromText } from '../services/gemini.service';

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

// Setup Multer for Job Extraction
const uploadDir = 'uploads/jobs/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `job-extract-${Date.now()}${path.extname(file.originalname)}`),
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) return cb(null, true);
        cb(new Error('Only PDF and DOCX files are allowed'));
    },
}).single('file');

export const extractJobRequirements = (req: any, res: Response) => {
    upload(req, res, async (err: any) => {
        if (err) return res.status(400).json({ message: err.message });
        if (!req.file) return res.status(400).json({ message: 'Please upload a file' });

        const filePath = req.file.path;
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        try {
            let extractedData: any = null;

            if (fileExtension === '.pdf') {
                try {
                    // Try direct AI processing (Gemini direct file upload support)
                    extractedData = await extractJobInfoFromFile(filePath, 'application/pdf');
                } catch (pdfError) {
                    console.warn("Direct PDF extraction failed, trying local text extraction fallback...");
                    const text = await extractTextFromPdf(filePath);
                    extractedData = await extractJobInfoFromText(text);
                }
            } else if (fileExtension === '.doc' || fileExtension === '.docx') {
                const text = await extractTextFromDocx(filePath);
                extractedData = await extractJobInfoFromText(text);
            }

            // Cleanup
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            if (extractedData) {
                res.status(200).json(extractedData);
            } else {
                res.status(400).json({ message: 'Could not extract requirements from this document.' });
            }
        } catch (error: any) {
            console.error("Job Extraction Error:", error);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            res.status(500).json({ message: 'Failed to process file: ' + error.message });
        }
    });
};

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
