"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyForJob = exports.updateMyProfile = exports.getApplicantDashboardStats = exports.getCandidates = exports.saveCandidates = exports.parseCandidateFile = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const pdf_service_1 = require("../services/pdf.service");
const doc_service_1 = require("../services/doc.service");
const csv_service_1 = require("../services/csv.service");
const gemini_service_1 = require("../services/gemini.service");
const Candidate_1 = __importDefault(require("../models/Candidate"));
const Application_1 = __importDefault(require("../models/Application"));
const Screening_1 = __importDefault(require("../models/Screening"));
const Job_1 = __importDefault(require("../models/Job"));
const fs_1 = __importDefault(require("fs"));
// Setup Multer
const uploadDir = 'uploads/';
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|csv|doc|docx/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF, DOCX, and CSV files are allowed'));
    },
}).single('file');
const parseCandidateFile = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            res.status(400).json({ message: err.message });
            return;
        }
        if (!req.file) {
            res.status(400).json({ message: 'Please upload a file' });
            return;
        }
        const filePath = req.file.path;
        const fileExtension = path_1.default.extname(req.file.originalname).toLowerCase();
        try {
            let aiInfo = null;
            let text = '';
            if (fileExtension === '.pdf') {
                try {
                    // Try direct PDF processing first (robust to bad XRef, supports OCR)
                    aiInfo = await (0, gemini_service_1.extractCandidateInfoFromFile)(filePath, 'application/pdf');
                    // Suspicious result check: If AI returned placeholders, try local text extraction as secondary source
                    const isNamePlaceholder = aiInfo.name.toLowerCase().includes('unknown') || aiInfo.name.toLowerCase().includes('candidate');
                    const isEmailPlaceholder = aiInfo.email.toLowerCase().includes('unknown') || aiInfo.email.toLowerCase().includes('example.com');
                    if (isNamePlaceholder || isEmailPlaceholder) {
                        try {
                            console.log("AI returned placeholders for PDF, attempting local extraction backup...");
                            text = await (0, pdf_service_1.extractTextFromPdf)(filePath);
                            const betterInfo = await (0, gemini_service_1.extractCandidateInfoFromText)(text);
                            // Merge only if better info was found
                            if (!betterInfo.name.toLowerCase().includes('unknown'))
                                aiInfo.name = betterInfo.name;
                            if (!betterInfo.email.toLowerCase().includes('unknown'))
                                aiInfo.email = betterInfo.email;
                            if (!aiInfo.phone)
                                aiInfo.phone = betterInfo.phone;
                            if (aiInfo.skills.length === 0)
                                aiInfo.skills = betterInfo.skills;
                        }
                        catch (e) {
                            console.warn("Secondary extraction attempt failed:", e.message);
                        }
                    }
                }
                catch (pdfError) {
                    console.warn("Direct PDF extraction failed, trying local text extraction fallback:", pdfError.message);
                    try {
                        text = await (0, pdf_service_1.extractTextFromPdf)(filePath);
                        aiInfo = await (0, gemini_service_1.extractCandidateInfoFromText)(text);
                    }
                    catch (innerTextError) {
                        console.error("Local PDF text extraction also failed:", innerTextError.message);
                        throw new Error("This PDF file is corrupted or unreadable. Please try a different version or format (DOCX/CSV).");
                    }
                }
            }
            else if (fileExtension === '.doc' || fileExtension === '.docx') {
                text = await (0, doc_service_1.extractTextFromDocx)(filePath);
                aiInfo = await (0, gemini_service_1.extractCandidateInfoFromText)(text);
            }
            if (aiInfo) {
                // Exhaustive phone discovery if AI missed it but we have text
                if (!aiInfo.phone && text) {
                    const phoneMatch = text.match(/(?:\+?\d{1,3}[\s.-]?)?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{4,6}/);
                    if (phoneMatch)
                        aiInfo.phone = phoneMatch[0];
                }
                const nameParts = (aiInfo.name || 'Unknown Candidate').split(' ');
                const candidateData = {
                    firstName: nameParts[0],
                    lastName: nameParts.slice(1).join(' ') || '',
                    email: aiInfo.email || 'unknown@example.com',
                    phone: aiInfo.phone || '',
                    skills: (aiInfo.skills || []).map((s) => typeof s === 'string' ? { name: s, level: 'Intermediate', yearsOfExperience: 1 } : s),
                    experience: typeof aiInfo.experience === 'string' ? [{
                            company: 'Extracted Experience',
                            role: 'Professional',
                            description: aiInfo.experience,
                            startDate: '',
                            endDate: '',
                            isCurrent: false,
                            technologies: []
                        }] : (aiInfo.experience || []),
                    education: typeof aiInfo.education === 'string' ? [{
                            institution: 'Extracted Education',
                            degree: aiInfo.education,
                            fieldOfStudy: '',
                            startYear: 2020,
                            endYear: null
                        }] : (aiInfo.education || []),
                    extractedText: text || 'Extracted via direct AI processing',
                    source: 'unstructured',
                };
                // Remove file after parsing
                if (fs_1.default.existsSync(filePath))
                    fs_1.default.unlinkSync(filePath);
                res.status(200).json({ parsedCandidates: [candidateData] });
            }
            else if (fileExtension === '.csv') {
                const candidatesData = await (0, csv_service_1.parseCandidatesCsv)(filePath);
                const mappedCsvData = candidatesData.map((c) => {
                    const findValue = (possibleKeys) => {
                        const key = Object.keys(c).find(k => possibleKeys.includes(k.trim().toLowerCase()));
                        return key ? c[key] : '';
                    };
                    const fullName = findValue(['name', 'full name', 'candidate name', 'candidate']) || 'Unknown Candidate';
                    const nameParts = fullName.split(' ');
                    const email = findValue(['email', 'mail', 'email address']) || 'no-email@example.com';
                    const phone = findValue(['phone', 'mobile', 'contact', 'phone number']) || '';
                    const rawSkills = findValue(['skills', 'core skills', 'technologies', 'tech stack']);
                    const experience = findValue(['experience', 'years of exp', 'yoe', 'work experience', 'years of experience']) || '';
                    return {
                        firstName: nameParts[0],
                        lastName: nameParts.slice(1).join(' ') || '',
                        email,
                        phone,
                        skills: rawSkills ? rawSkills.replace(/[\n\r"]/g, '').split(',').map((s) => ({ name: s.trim(), level: 'Intermediate', yearsOfExperience: 1 })) : [],
                        experience: [{ company: 'Previous', role: 'Role', description: experience, startDate: '', endDate: '', isCurrent: false, technologies: [] }],
                        source: 'structured',
                    };
                });
                fs_1.default.unlinkSync(filePath);
                res.status(200).json({ parsedCandidates: mappedCsvData });
            }
            else {
                // If it was a PDF/DOCX but no text was extracted
                fs_1.default.unlinkSync(filePath);
                res.status(400).json({ message: 'Could not extract text from this document. Please ensure it is not an image-only PDF or use a different format.' });
            }
        }
        catch (error) {
            console.error("Upload & Parse Error:", error);
            res.status(500).json({ message: 'Failed to process file: ' + (error.message || 'Unknown error') });
        }
    });
};
exports.parseCandidateFile = parseCandidateFile;
const saveCandidates = async (req, res) => {
    const { candidates } = req.body;
    if (!candidates || !Array.isArray(candidates)) {
        res.status(400).json({ message: 'Invalid payload: candidates array required.' });
        return;
    }
    try {
        const result = await Candidate_1.default.insertMany(candidates);
        res.status(201).json(result);
    }
    catch (error) {
        console.error("Save Candidates Error:", error);
        res.status(500).json({ message: 'Failed to save candidates: ' + error.message });
    }
};
exports.saveCandidates = saveCandidates;
const getCandidates = async (req, res) => {
    const { search } = req.query;
    try {
        const query = {};
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { "skills.name": { $regex: search, $options: 'i' } },
            ];
        }
        const candidates = await Candidate_1.default.find(query);
        res.json(candidates);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getCandidates = getCandidates;
const getApplicantDashboardStats = async (req, res) => {
    try {
        const user = req.user;
        const candidate = await Candidate_1.default.findOne({ email: user.email });
        const browseJobs = await Job_1.default.find({ status: { $in: ['Active', 'Closed'] } }).sort({ createdAt: -1 });
        // Fetch Applications and Screenings for the candidate if they exist
        let applications = [];
        let screenings = [];
        if (candidate) {
            applications = await Application_1.default.find({ candidateId: candidate._id }).populate('jobId');
            screenings = await Screening_1.default.find({ candidateId: candidate._id });
        }
        // Map browse jobs
        const mappedBrowseJobs = browseJobs.map((job) => ({
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
                const raw = candidate.toObject();
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
            applications: applications.map((app) => {
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
    }
    catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};
exports.getApplicantDashboardStats = getApplicantDashboardStats;
const calculateCompleteness = (c) => {
    let score = 20; // Email and name are required
    if (c.phone)
        score += 10;
    if (c.headline)
        score += 10;
    if (c.bio)
        score += 10;
    if (c.skills?.length > 0)
        score += 15;
    if (c.experience?.length > 0)
        score += 15;
    if (c.education?.length > 0)
        score += 10;
    if (c.projects?.length > 0)
        score += 5;
    if (c.socialLinks?.linkedin)
        score += 5;
    return Math.min(100, score);
};
const updateMyProfile = async (req, res) => {
    const user = req.user;
    const updateData = req.body;
    try {
        // Use findOneAndUpdate + $set to avoid Mongoose version conflicts on array fields (__v mismatch)
        const candidate = await Candidate_1.default.findOneAndUpdate({ email: user.email }, { $set: { ...updateData, email: user.email, source: 'structured' } }, { new: true, upsert: true, runValidators: false });
        res.status(200).json(candidate);
    }
    catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: 'Server error while updating profile: ' + error.message });
    }
};
exports.updateMyProfile = updateMyProfile;
const applyForJob = async (req, res) => {
    const user = req.user;
    const { jobId } = req.body;
    if (!jobId) {
        res.status(400).json({ message: 'jobId is required' });
        return;
    }
    try {
        const candidate = await Candidate_1.default.findOne({ email: user.email });
        if (!candidate) {
            res.status(404).json({ message: 'Candidate profile not found. Please complete your profile first.' });
            return;
        }
        const job = await Job_1.default.findById(jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found.' });
            return;
        }
        const existing = await Application_1.default.findOne({ jobId, candidateId: candidate._id });
        if (existing) {
            res.status(409).json({ message: 'You have already applied to this job.' });
            return;
        }
        const application = await Application_1.default.create({
            jobId,
            candidateId: candidate._id,
            status: 'Applied',
            appliedAt: new Date(),
        });
        res.status(201).json({ message: 'Application submitted successfully!', application });
    }
    catch (error) {
        console.error('Error applying for job:', error);
        res.status(500).json({ message: 'Server error while submitting application: ' + error.message });
    }
};
exports.applyForJob = applyForJob;
