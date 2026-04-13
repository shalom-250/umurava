import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
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
