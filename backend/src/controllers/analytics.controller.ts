import { Request, Response } from 'express';
import Job from '../models/Job';
import Candidate from '../models/Candidate';
import Screening from '../models/Screening';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalJobs = await Job.countDocuments();
        const totalCandidates = await Candidate.countDocuments();
        const totalScreenings = await Screening.countDocuments();

        // Average score across all screenings
        const screenings = await Screening.find({});
        const avgScore = screenings.length > 0
            ? screenings.reduce((acc, s) => acc + s.score, 0) / screenings.length
            : 0;

        res.json({
            totalJobs,
            totalCandidates,
            totalScreenings,
            avgScore: Math.round(avgScore * 100) / 100,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
