"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCandidates = exports.uploadCandidate = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const pdf_service_1 = require("../services/pdf.service");
const csv_service_1 = require("../services/csv.service");
const gemini_service_1 = require("../services/gemini.service");
const Candidate_1 = __importDefault(require("../models/Candidate"));
// Setup Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path_1.default.extname(file.originalname)}`);
    },
});
const upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|csv/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only PDF and CSV files are allowed'));
    },
}).single('file');
const uploadCandidate = (req, res) => {
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
            if (fileExtension === '.pdf') {
                const text = await (0, pdf_service_1.extractTextFromPdf)(filePath);
                const aiInfo = await (0, gemini_service_1.extractCandidateInfo)(text);
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
                const candidate = await Candidate_1.default.create(candidateData);
                res.status(201).json(candidate);
            }
            else if (fileExtension === '.csv') {
                const candidatesData = await (0, csv_service_1.parseCandidatesCsv)(filePath);
                const candidates = await Candidate_1.default.insertMany(candidatesData.map((c) => ({
                    name: c.name || c.Name,
                    email: c.email || c.Email,
                    skills: c.skills ? c.skills.split(',') : [],
                    source: 'structured',
                })));
                res.status(201).json(candidates);
            }
        }
        catch (error) {
            res.status(500).json({ message: 'Failed to process file' });
        }
    });
};
exports.uploadCandidate = uploadCandidate;
const getCandidates = async (req, res) => {
    const { search } = req.query;
    try {
        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { skills: { $in: [new RegExp(search, 'i')] } },
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
