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

        // Fetch only candidates who have applied to this specific job
        const applications = await Application.find({ jobId }).populate('candidateId');

        if (applications.length === 0) {
            res.status(400).json({ message: 'No candidates have applied to this job yet.' });
            return;
        }

        // Set all related applications to 'Under Review' status
        await Application.updateMany({ jobId }, { status: 'Under Review' });

        const candidates = applications
            .map(app => app.candidateId)
            .filter(c => c !== null) as any[];

        if (candidates.length === 0) {
            res.status(400).json({ message: 'Applicant data is incomplete.' });
            return;
        }

        const jobDescription = `${job.title}\n${job.description}\nRequirements: ${job.requirements.join(', ')}\nSkills: ${job.skills.join(', ')}\nMust-Have Priority: ${job.mustHaveSkills.join(', ')}`;

        // Prepare candidate data for Gemini with document verification
        const jobRequiredDocs = job.requiredDocuments || ['Resume / CV'];

        const candidatesForAI = applications.map(app => {
            const c = app.candidateId as any;
            const appAttachments = app.attachments || [];

            // Build document status checklist
            const docStatus = jobRequiredDocs.map(docName => {
                // Check if document exists in application attachments OR candidate profile
                const isResume = docName.toLowerCase().includes('resume') || docName.toLowerCase().includes('cv');
                const attachment = appAttachments.find((a: any) => a.name.toLowerCase().includes(docName.toLowerCase()));

                if (isResume && c.resumeUrl) {
                    return { name: docName, status: 'completed', url: c.resumeUrl };
                } else if (attachment) {
                    return { name: docName, status: 'completed', url: attachment.url };
                }
                return { name: docName, status: 'missing' };
            });

            return {
                id: c._id,
                name: `${c.firstName} ${c.lastName}`.trim(),
                skills: (c.skills || []).map((s: any) => typeof s === 'string' ? s : s.name),
                experience: c.experience,
                text: c.extractedText?.substring(0, 2000),
                documentChecklist: docStatus // Pass to Gemini
            };
        });

        const rankingResults = await rankCandidates(jobDescription, candidatesForAI);

        // Save results to database
        const screeningPromises = rankingResults.map(async (result) => {
            // Find the corresponding docStatus we generated
            const candidateData = candidatesForAI.find(c => c.id.toString() === result.candidateId.toString());

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
                    skillBreakdown: result.skillBreakdown,
                    documentStatus: candidateData?.documentChecklist || []
                },
                { upsert: true, new: true }
            );

            // Update the corresponding Application status to 'Screened'
            await Application.findOneAndUpdate(
                { jobId, candidateId: result.candidateId },
                { status: 'Screened' }
            );
        });

        await Promise.all(screeningPromises);

        // Update Job with last screening timestamp
        await Job.findByIdAndUpdate(jobId, { lastScreenedAt: new Date() });

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

        if (typeof jobId === 'string' && jobId.startsWith('job-')) {
            // Mock job fallback: For speed, use a sample of candidates
            candidates = await Candidate.find({}).limit(10);
        } else {
            // Real Job: Evaluate only actual applicants
            const applications = await Application.find({ jobId }).populate('candidateId');
            candidates = applications
                .map(app => app.candidateId)
                .filter(c => c !== null);
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
        if (!(typeof jobId === 'string' && jobId.startsWith('job-'))) {
            await Job.findByIdAndUpdate(jobId, { lastScreenedAt: new Date() });
        }

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
