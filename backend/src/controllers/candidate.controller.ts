import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { extractTextFromPdf } from '../services/pdf.service';
import { extractTextFromDocx } from '../services/doc.service';
import { parseCandidatesCsv } from '../services/csv.service';
import { extractCandidateInfoFromFile, extractCandidateInfoFromText } from '../services/gemini.service';
import Candidate from '../models/Candidate';
import Application from '../models/Application';
import Screening from '../models/Screening';
import Job from '../models/Job';

import fs from 'fs';

// Setup Multer
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const jobTitle = req.query.jobTitle as string;
        let dest = uploadDir;
        if (jobTitle) {
            // Sanitize job title for directory name
            const sanitizedTitle = jobTitle.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
            dest = path.join(uploadDir, sanitizedTitle);
        }

        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const candidateName = req.query.candidateName as string;
        if (candidateName) {
            const sanitizedName = candidateName.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
            cb(null, `${sanitizedName}-CV-${Date.now()}${path.extname(file.originalname)}`);
        } else {
            cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
        }
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|csv|doc|docx/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOCX, and CSV files are allowed'));
    },
}).array('files', 100);

export const parseCandidateFile = (req: Request, res: Response) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).json({ message: err.message });
            return;
        }

        const files = req.files as Express.Multer.File[];

        if (!files || files.length === 0) {
            res.status(400).json({ message: 'Please upload at least one file' });
            return;
        }

        const allParsedCandidates: any[] = [];

        try {
            for (const file of files) {
                const filePath = file.path;
                const fileExtension = path.extname(file.originalname).toLowerCase();
                let aiInfo: any = null;
                let text = '';

                if (fileExtension === '.pdf') {
                    try {
                        aiInfo = await extractCandidateInfoFromFile(filePath, 'application/pdf');
                        const isNamePlaceholder = aiInfo?.name?.toLowerCase().includes('unknown') || aiInfo?.name?.toLowerCase().includes('candidate') || !aiInfo?.name;
                        const isEmailPlaceholder = aiInfo?.email?.toLowerCase().includes('unknown') || aiInfo?.email?.toLowerCase().includes('example.com') || !aiInfo?.email;

                        if (isNamePlaceholder || isEmailPlaceholder) {
                            try {
                                text = await extractTextFromPdf(filePath);
                                const betterInfo = await extractCandidateInfoFromText(text);
                                if (betterInfo?.name && !betterInfo.name.toLowerCase().includes('unknown')) aiInfo.name = betterInfo.name;
                                if (betterInfo?.email && !betterInfo.email.toLowerCase().includes('unknown')) aiInfo.email = betterInfo.email;
                                if (!aiInfo.phone) aiInfo.phone = betterInfo?.phone || null;
                                if (aiInfo.skills?.length === 0) aiInfo.skills = betterInfo?.skills || [];
                            } catch (e: any) {
                                console.warn("Secondary extraction failed:", e.message);
                            }
                        }
                    } catch (pdfError: any) {
                        try {
                            text = await extractTextFromPdf(filePath);
                            aiInfo = await extractCandidateInfoFromText(text);
                        } catch (innerTextError: any) {
                            console.error("PDF extraction failed:", innerTextError.message);
                        }
                    }
                } else if (fileExtension === '.doc' || fileExtension === '.docx') {
                    try {
                        text = await extractTextFromDocx(filePath);
                        aiInfo = await extractCandidateInfoFromText(text);
                    } catch (docError: any) {
                        console.error("DOCX extraction failed:", docError.message);
                    }
                } else if (fileExtension === '.csv') {
                    try {
                        const candidatesData = await parseCandidatesCsv(filePath);
                        const mappedCsvData = candidatesData.map((c) => {
                            const findValue = (possibleKeys: string[]) => {
                                const key = Object.keys(c).find(k => possibleKeys.includes(k.trim().toLowerCase()));
                                return key ? c[key] : '';
                            };
                            const fullName = findValue(['name', 'full name', 'candidate name', 'candidate']) || 'Unknown Candidate';
                            const nameParts = fullName.split(' ');
                            return {
                                firstName: nameParts[0],
                                lastName: nameParts.slice(1).join(' ') || '',
                                email: findValue(['email', 'mail', 'email address']) || 'no-email@example.com',
                                phone: findValue(['phone', 'mobile', 'contact', 'phone number']) || '',
                                skills: (findValue(['skills', 'core skills', 'technologies', 'tech stack']) || '').replace(/[\n\r"]/g, '').split(',').map((s: string) => ({ name: s.trim(), level: 'Intermediate', yearsOfExperience: 1 })).filter((s: any) => s.name.length > 0),
                                experience: [{ company: 'Previous', role: 'Role', description: findValue(['experience', 'years of exp', 'yoe', 'work experience', 'years of experience']) || '', startDate: '', endDate: '', isCurrent: false, technologies: [] }],
                                source: 'structured',
                            };
                        });
                        allParsedCandidates.push(...mappedCsvData);
                    } catch (csvError: any) {
                        console.error("CSV extraction failed:", csvError.message);
                    }
                }

                if (aiInfo) {
                    allParsedCandidates.push({
                        ...aiInfo,
                        source: 'unstructured',
                        resumeUrl: filePath.replace(/\\/g, '/') // Ensure URL/Path is preserved
                    });
                }

                // Only unlink if no jobTitle was provided (meaning it's just a temporary parse)
                const jobTitle = req.query.jobTitle as string;
                if (!jobTitle && fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }

            res.status(200).json({ parsedCandidates: allParsedCandidates });
        } catch (error: any) {
            console.error("Bulk Parse Error:", error);
            res.status(500).json({ message: 'Failed to process files: ' + (error.message || 'Unknown error') });
        }
    });
};

export const saveCandidates = async (req: Request, res: Response) => {
    const { candidates } = req.body;

    if (!candidates || !Array.isArray(candidates)) {
        res.status(400).json({ message: 'Invalid payload: candidates array required.' });
        return;
    }

    try {
        const operations = candidates.map(candidate => ({
            updateOne: {
                filter: { email: candidate.email },
                update: { $set: { ...candidate, source: 'structured' } },
                upsert: true
            }
        }));

        await Candidate.bulkWrite(operations);

        // After bulkWrite, we need to return the actually saved candidate objects (with IDs)
        // so the frontend can link them to jobs
        const savedEmails = candidates.map(c => c.email);
        const finalCandidates = await Candidate.find({ email: { $in: savedEmails } });

        res.status(201).json(finalCandidates);
    } catch (error: any) {
        console.error("Save Candidates Error:", error);
        res.status(500).json({ message: 'Failed to save candidates: ' + error.message });
    }
};

export const getCandidates = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const query: any = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { "skills.name": { $regex: search, $options: 'i' } },
            ];
        }
        const candidates = await Candidate.find(query);
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getApplicantDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = (req as any).user;
        const candidate = await Candidate.findOne({ email: user.email });
        const browseJobs = await Job.find({ status: { $in: ['Active', 'Closed'] } }).sort({ createdAt: -1 });

        // Fetch Applications and Screenings for the candidate if they exist
        let applications: any[] = [];
        let screenings: any[] = [];

        if (candidate) {
            applications = await Application.find({ candidateId: candidate._id }).populate('jobId');
            screenings = await Screening.find({ candidateId: candidate._id });
        }

        // Map browse jobs
        const mappedBrowseJobs = browseJobs.map((job: any) => ({
            ...job.toObject(),
            id: job._id,
            requiredSkills: job.skills || [],
            company: job.department || 'Umurava',
            postedDate: job.createdAt.toISOString().split('T')[0],
            deadline: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A',
            applicantCount: 0,
        }));

        const mappedRecommendedJobs = mappedBrowseJobs.filter(j => j.status === 'Active').slice(0, 3);

        const stats = {
            profile: candidate ? (() => {
                const raw = candidate.toObject() as any;
                // Migration: handle old records that still have only 'name' and no firstName/lastName
                if (!raw.firstName && raw.name) {
                    const parts = raw.name.split(' ');
                    raw.firstName = parts[0];
                    raw.lastName = parts.slice(1).join(' ') || '';
                }
                // Ensure arrays are always present
                raw.skills = raw.skills || [];
                raw.languages = raw.languages || [];
                raw.experience = raw.experience || [];
                raw.education = raw.education || [];
                raw.certifications = raw.certifications || [];
                raw.projects = raw.projects || [];
                raw.availability = raw.availability || { status: 'Available', type: 'Full-time' };
                raw.id = candidate._id;
                raw.profileCompleteness = calculateCompleteness(candidate);
                return raw;
            })() : {
                id: user._id,
                firstName: user.name.split(' ')[0],
                lastName: user.name.split(' ').slice(1).join(' ') || '',
                email: user.email,
                headline: 'Job Seeker',
                location: 'Rwanda',
                skills: [],
                experience: [],
                education: [],
                profileCompleteness: 10,
            },
            applications: applications.map((app: any) => {
                const screening = screenings.find(s => s.jobId.toString() === app.jobId._id.toString());
                return {
                    id: app._id,
                    jobId: app.jobId._id,
                    jobTitle: app.jobId.title,
                    company: app.jobId.department || 'Company',
                    status: app.status,
                    appliedDate: new Date(app.appliedAt).toLocaleDateString(),
                    matchScore: screening?.score,
                    screeningResult: screening ? {
                        ...screening.toObject(),
                        strengths: screening.strengths ? screening.strengths.split(', ') : [],
                        gaps: screening.gaps ? screening.gaps.split(', ') : [],
                        skillBreakdown: screening.skillBreakdown || []
                    } : null
                };
            }),
            recommendedJobs: mappedRecommendedJobs,
            browseJobs: mappedBrowseJobs
        };

        res.status(200).json(stats);
    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

const calculateCompleteness = (c: any): number => {
    let score = 20; // Email and name are required
    if (c.phone) score += 10;
    if (c.headline) score += 10;
    if (c.bio) score += 10;
    if (c.skills?.length > 0) score += 15;
    if (c.experience?.length > 0) score += 15;
    if (c.education?.length > 0) score += 10;
    if (c.projects?.length > 0) score += 5;
    if (c.socialLinks?.linkedin) score += 5;
    return Math.min(100, score);
};

export const updateMyProfile = async (req: any, res: Response): Promise<void> => {
    const user = req.user;
    const updateData = req.body;

    try {
        // Use findOneAndUpdate + $set to avoid Mongoose version conflicts on array fields (__v mismatch)
        const candidate = await Candidate.findOneAndUpdate(
            { email: user.email },
            { $set: { ...updateData, email: user.email, source: 'structured' } },
            { new: true, upsert: true, runValidators: false }
        );

        res.status(200).json(candidate);
    } catch (error: any) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Server error while updating profile: ' + error.message });
    }
};

export const applyForJob = async (req: any, res: Response): Promise<void> => {
    const user = req.user;
    const { jobId, candidateId } = req.body;

    if (!jobId) {
        res.status(400).json({ message: 'jobId is required' });
        return;
    }

    try {
        let candidate;
        if (user.role === 'recruiter' && candidateId) {
            candidate = await Candidate.findById(candidateId);
        } else {
            candidate = await Candidate.findOne({ email: user.email });
        }

        if (!candidate) {
            res.status(404).json({ message: 'Candidate profile not found.' });
            return;
        }

        const job = await Job.findById(jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found.' });
            return;
        }

        const existing = await Application.findOne({ jobId, candidateId: candidate._id });
        if (existing) {
            res.status(409).json({ message: 'You have already applied to this job.' });
            return;
        }

        const application = await Application.create({
            jobId,
            candidateId: candidate._id,
            status: 'Applied',
            appliedAt: new Date(),
        });

        // Job-specific CV storage: copy candidate's resume to job folder if it exists
        if (candidate.resumeUrl && fs.existsSync(candidate.resumeUrl)) {
            const sanitizedJobTitle = job.title.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
            const jobDir = path.join('uploads', sanitizedJobTitle);

            if (!fs.existsSync(jobDir)) {
                fs.mkdirSync(jobDir, { recursive: true });
            }

            const fileName = path.basename(candidate.resumeUrl);
            const newPath = path.join(jobDir, fileName).replace(/\\/g, '/');

            if (candidate.resumeUrl !== newPath) {
                try {
                    fs.copyFileSync(candidate.resumeUrl, newPath);
                    application.attachments.push({
                        name: 'Resume',
                        url: newPath
                    });
                    await application.save();
                } catch (copyErr) {
                    console.error("Failed to copy resume to job directory:", copyErr);
                }
            }
        }

        res.status(201).json({ message: 'Application submitted successfully!', application });
    } catch (error: any) {
        console.error('Error applying for job:', error);
        res.status(500).json({ message: 'Server error while submitting application: ' + error.message });
    }
};
