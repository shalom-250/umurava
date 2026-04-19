import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    headline?: string;
    bio?: string;
    location?: string;
    skills: { name: string; level: string; yearsOfExperience: number }[];
    languages: { name: string; proficiency: string }[];
    experience: {
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        description: string;
        technologies: string[];
        isCurrent: boolean;
    }[];
    education: {
        institution: string;
        degree: string;
        fieldOfStudy: string;
        startYear: number;
        endYear: number | null;
    }[];
    certifications: { name: string; issuer: string; issueDate: string }[];
    projects: {
        name: string;
        description: string;
        technologies: string[];
        role: string;
        link: string;
        startDate: string;
        endDate: string;
    }[];
    availability: {
        status: string;
        type: string;
        startDate?: string;
    };
    socialLinks?: {
        linkedin?: string;
        github?: string;
        portfolio?: string;
    };
    resumeUrl?: string;
    extractedText?: string;
    source: 'structured' | 'unstructured';
    createdAt: Date;
}

const CandidateSchema: Schema = new Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    headline: { type: String },
    bio: { type: String },
    location: { type: String },
    skills: [{
        name: String,
        level: String,
        yearsOfExperience: Number
    }],
    languages: [{
        name: String,
        proficiency: String
    }],
    experience: [{
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        description: String,
        technologies: [String],
        isCurrent: Boolean
    }],
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number
    }],
    certifications: [{
        name: String,
        issuer: String,
        issueDate: String
    }],
    projects: [{
        name: String,
        description: String,
        technologies: [String],
        role: String,
        link: String,
        startDate: String,
        endDate: String
    }],
    availability: {
        status: { type: String, default: 'Available' },
        type: { type: String, default: 'Full-time' },
        startDate: String
    },
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
    },
    resumeUrl: { type: String },
    extractedText: { type: String },
    source: { type: String, enum: ['structured', 'unstructured'], default: 'structured' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
