import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import { compareCandidates } from '../services/gemini.service';

export const getComparison = async (req: Request, res: Response): Promise<void> => {
    const { jobId, candidateAId, candidateBId } = req.body;

    try {
        const job = await Job.findById(jobId);
        const candidateA = await Candidate.findById(candidateAId);
        const candidateB = await Candidate.findById(candidateBId);

        if (!job || !candidateA || !candidateB) {
            res.status(404).json({ message: 'Job or candidates not found' });
            return;
        }

        const jobDescription = `${job.title}\n${job.description}\nMust-Have: ${job.mustHaveSkills.join(', ')}`;
        const result = await compareCandidates(jobDescription, candidateA, candidateB);

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: 'Comparison failed' });
    }
};
