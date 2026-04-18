import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Application from '../models/Application';
import Screening from '../models/Screening';
import { rankCandidates } from '../services/gemini.service';

export const runScreening = async (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            res.status(404).json({ message: 'Job not found' });
            return;
        }

        const candidates = await Candidate.find({}); // Or filter by some criteria
        if (candidates.length === 0) {
            res.status(400).json({ message: 'No candidates to screen' });
            return;
        }

        const jobDescription = `${job.title}\n${job.description}\nRequirements: ${job.requirements.join(', ')}\nSkills: ${job.skills.join(', ')}\nMust-Have Priority: ${job.mustHaveSkills.join(', ')}`;

        // Prepare candidate data for Gemini
        const candidatesForAI = candidates.map(c => ({
            id: c._id,
            name: c.name,
            skills: c.skills,
            experience: c.experience,
            text: c.extractedText?.substring(0, 2000) // Truncate text to avoid token limits
        }));

        const rankingResults = await rankCandidates(jobDescription, candidatesForAI);

        // Save results to database
        const screeningPromises = rankingResults.map(async (result) => {
            return Screening.findOneAndUpdate(
                { jobId, candidateId: result.candidateId },
                {
                    score: result.score,
                    rank: result.rank,
                    weightedScore: result.weightedScore,
                    relevance: result.relevance,
                    strengths: result.strengths,
                    gaps: result.gaps,
                    aiReasoning: result.aiReasoning,
                    recommendation: result.recommendation,
                    interviewQuestions: result.interviewQuestions,
                },
                { upsert: true, new: true }
            );
        });

        await Promise.all(screeningPromises);

        res.json({ message: 'Screening completed successfully', results: rankingResults });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Screening failed' });
    }
};

export const runTestScreening = async (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;

    let jobDescription = "";

    try {
        // Handle mock job IDs that start with "job-"
        if (typeof jobId === 'string' && jobId.startsWith('job-')) {
            // For testing purposes, we use a generic placeholder for mock jobs
            jobDescription = "Senior Fullstack Developer (Node.js/React). Requirements: 5+ years experience, MERN stack, specialized in scalable APIs and responsive UI.";
        } else {
            const job = await Job.findById(jobId);
            if (!job) {
                res.status(404).json({ message: 'Job not found in database' });
                return;
            }
            jobDescription = `${job.title}\n${job.description}\nRequirements: ${job.requirements.join(', ')}\nSkills: ${job.skills.join(', ')}`;
        }

        // UNIFIED RANKING POOL
        // We fetch ALL candidates from the database. This inherently merges formal 
        // job applicants with generically uploaded CSVs and unstructured PDFs into a 
        // single holistic talent pool evaluating everyone against the Job Requirements.
        let candidates: any[] = [];

        const allCandidates = await Candidate.find({});

        if (typeof jobId === 'string' && jobId.startsWith('job-')) {
            // Mock job fallback: For speed, limit to 10 latest candidates
            candidates = allCandidates.reverse().slice(0, 10);
        } else {
            // Real Job: Evaluate the entire unified pool 
            candidates = allCandidates;
        }

        if (candidates.length === 0) {
            res.status(400).json({ message: 'No candidates have applied to this job yet.' });
            return;
        }

        // Prepare candidate data for Gemini
        const candidatesForAI = candidates.map(c => ({
            id: c._id.toString(),
            name: c.name,
            email: c.email,
            skills: c.skills,
            experience: c.experience || "No experience provided",
            education: c.education || "No education provided"
        }));

        const rankingResults = await rankCandidates(jobDescription, candidatesForAI);

        // Return results to FE for testing
        res.json({
            message: 'Test Screening completed successfully',
            results: rankingResults,
            qa_note: 'This is a test run using 5 hardcoded dummy profiles against the real job description.'
        });
    } catch (error) {
        console.error("Test Screening Error:", error);
        res.status(500).json({
            message: 'Test Screening failed',
            error: (error as Error).message || 'Unknown backend error'
        });
    }
};

export const getScreeningResults = async (req: Request, res: Response): Promise<void> => {
    const { jobId } = req.params;
    const { minScore, maxScore } = req.query;

    try {
        const query: any = { jobId };

        if (minScore || maxScore) {
            query.score = {};
            if (minScore) query.score.$gte = Number(minScore);
            if (maxScore) query.score.$lte = Number(maxScore);
        }

        const results = await Screening.find(query)
            .populate('candidateId', 'name email skills')
            .sort({ rank: 1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
