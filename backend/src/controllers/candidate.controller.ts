import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { extractTextFromPdf } from '../services/pdf.service';
import { parseCandidatesCsv } from '../services/csv.service';
import { extractCandidateInfo } from '../services/gemini.service';
import Candidate from '../models/Candidate';

// Setup Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|csv/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and CSV files are allowed'));
    },
}).single('file');

export const uploadCandidate = (req: Request, res: Response) => {
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
        const fileExtension = path.extname(req.file.originalname).toLowerCase();

        try {
            if (fileExtension === '.pdf') {
                const text = await extractTextFromPdf(filePath);
                const aiInfo = await extractCandidateInfo(text);

                const candidateData = {
                    name: aiInfo?.name || 'Unknown Candidate',
                    email: aiInfo?.email || 'unknown@example.com',
                    phone: aiInfo?.phone,
                    skills: aiInfo?.skills || [],
                    experience: aiInfo?.experience,
                    education: aiInfo?.education,
                    extractedText: text,
                    source: 'unstructured',
                };

                const candidate = await Candidate.create(candidateData);
                res.status(201).json(candidate);
            } else if (fileExtension === '.csv') {
                const candidatesData = await parseCandidatesCsv(filePath);
                const candidates = await Candidate.insertMany(
                    candidatesData.map((c) => ({
                        name: c.name || c.Name,
                        email: c.email || c.Email,
                        skills: c.skills ? c.skills.split(',') : [],
                        source: 'structured',
                    }))
                );
                res.status(201).json(candidates);
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to process file' });
        }
    });
};

export const getCandidates = async (req: Request, res: Response) => {
    const { search } = req.query;

    try {
        const query: any = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { skills: { $in: [new RegExp(search as string, 'i')] } },
            ];
        }
        const candidates = await Candidate.find(query);
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
