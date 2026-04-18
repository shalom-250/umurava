import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { extractTextFromPdf } from '../services/pdf.service';
import { extractTextFromDocx } from '../services/doc.service';
import { parseCandidatesCsv } from '../services/csv.service';
import { extractCandidateInfo } from '../services/gemini.service';
import Candidate from '../models/Candidate';

import fs from 'fs';

// Setup Multer
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
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
}).single('file');

export const parseCandidateFile = (req: Request, res: Response) => {
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
            let text = '';
            if (fileExtension === '.pdf') {
                text = await extractTextFromPdf(filePath);
            } else if (fileExtension === '.doc' || fileExtension === '.docx') {
                text = await extractTextFromDocx(filePath);
            }

            if (text) {
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

                // Remove file after parsing to save space
                fs.unlinkSync(filePath);

                res.status(200).json({ parsedCandidates: [candidateData] });
            } else if (fileExtension === '.csv') {
                const candidatesData = await parseCandidatesCsv(filePath);
                const mappedCsvData = candidatesData.map((c) => {
                    // Helper to map different variations of column names
                    const findValue = (possibleKeys: string[]) => {
                        const key = Object.keys(c).find(k => possibleKeys.includes(k.trim().toLowerCase()));
                        return key ? c[key] : '';
                    };

                    const name = findValue(['name', 'full name', 'candidate name', 'candidate']) || 'Unknown Candidate';
                    const email = findValue(['email', 'mail', 'email address']) || 'no-email@example.com';
                    const phone = findValue(['phone', 'mobile', 'contact', 'phone number']) || '';
                    const rawSkills = findValue(['skills', 'core skills', 'technologies', 'tech stack']);
                    const experience = findValue(['experience', 'years of exp', 'yoe', 'work experience', 'years of experience']) || '';

                    return {
                        name,
                        email,
                        phone,
                        skills: rawSkills ? rawSkills.replace(/[\n\r"]/g, '').split(',').map((s: string) => s.trim()) : [],
                        experience,
                        source: 'structured',
                    };
                });

                fs.unlinkSync(filePath);

                res.status(200).json({ parsedCandidates: mappedCsvData });
            }
        } catch (error: any) {
            console.error("Upload & Parse Error:", error);
            res.status(500).json({ message: 'Failed to process file: ' + (error.message || 'Unknown error') });
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
        const result = await Candidate.insertMany(candidates);
        res.status(201).json(result);
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
