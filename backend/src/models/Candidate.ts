import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    name: string;
    email: string;
    phone?: string;
    skills: string[];
    experience?: string;
    education?: string;
    extractedText?: string;
    resumeUrl?: string; // If stored in cloud
    missingDocuments?: string[];
    source: 'structured' | 'unstructured'; // Umurava schema vs PDF/CSV
    createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    skills: [{ type: String }],
    experience: { type: String },
    education: { type: String },
    extractedText: { type: String },
    resumeUrl: { type: String },
    missingDocuments: [{ type: String }],
    source: { type: String, enum: ['structured', 'unstructured'], required: true },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
