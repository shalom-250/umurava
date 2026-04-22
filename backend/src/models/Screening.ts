import mongoose, { Schema, Document } from 'mongoose';

export interface IScreening extends Document {
    jobId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    score: number;
    rank: number;
    weightedScore: {
        skills: number;
        experience: number;
        education: number;
    };
    relevance: number;
    strengths: string;
    gaps: string;
    aiReasoning: string;
    recommendation: 'Shortlist' | 'Waitlist' | 'Reject';
    interviewQuestions: string[];
    skillBreakdown: {
        skill: string;
        score: number;
        required: boolean;
    }[];
    documentStatus: {
        name: string;
        status: 'completed' | 'missing';
        url?: string;
    }[];
    createdAt: Date;
}

const ScreeningSchema: Schema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    score: { type: Number, required: true },
    rank: { type: Number, required: true },
    weightedScore: {
        skills: { type: Number },
        experience: { type: Number },
        education: { type: Number },
    },
    relevance: { type: Number },
    strengths: { type: String },
    gaps: { type: String },
    aiReasoning: { type: String },
    recommendation: { type: String, enum: ['Shortlist', 'Waitlist', 'Reject'] },
    interviewQuestions: [{ type: String }],
    skillBreakdown: [{
        skill: { type: String },
        score: { type: Number },
        required: { type: Boolean }
    }],
    documentStatus: [{
        name: { type: String },
        status: { type: String, enum: ['completed', 'missing'] },
        url: { type: String }
    }],
    createdAt: { type: Date, default: Date.now },
});

// Ensure a candidate is screened only once per job (or update if re-screened)
ScreeningSchema.index({ jobId: 1, candidateId: 1 }, { unique: true });

export default mongoose.model<IScreening>('Screening', ScreeningSchema);
