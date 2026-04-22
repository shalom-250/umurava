import mongoose, { Schema, Document } from 'mongoose';

export interface ICandidate extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    headline?: string;
    bio?: string;
    location?: string;
    nationality?: string;
    dob?: string;
    personalStatement?: string;
    skills: { name: string; level: string; yearsOfExperience: number; type: 'Technical' | 'Soft' | 'Other' }[];
    languages: { name: string; proficiency: string }[];
    experience: {
        company: string;
        role: string;
        location?: string;
        startDate: string;
        endDate: string;
        description: string;
        achievements?: string[];
        technologies: string[];
        isCurrent: boolean;
    }[];
    education: {
        institution: string;
        degree: string;
        fieldOfStudy: string;
        location?: string;
        startYear: number;
        endYear: number | null;
        achievements?: string[];
    }[];
    backgroundSchool?: {
        name: string;
        certificate?: string;
        location?: string;
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
    interests?: {
        professional: string[];
        personal: string[];
    };
    hobbies?: string[];
    references?: {
        name: string;
        position: string;
        contactDetails: string;
    }[];
    awards?: {
        title: string;
        issuer: string;
        year: string;
        description?: string;
    }[];
    volunteerExperience?: {
        organization: string;
        role: string;
        impact?: string;
        duration?: string;
    }[];
    extracurricularActivities?: {
        activity: string;
        role: string;
        description?: string;
    }[];
    publications?: {
        title: string;
        platform: string;
        link?: string;
        year?: string;
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
        website?: string;
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
    nationality: { type: String },
    dob: { type: String },
    personalStatement: { type: String },
    skills: [{
        name: String,
        level: String,
        yearsOfExperience: Number,
        type: { type: String, enum: ['Technical', 'Soft', 'Other'], default: 'Other' }
    }],
    languages: [{
        name: String,
        proficiency: String
    }],
    experience: [{
        company: String,
        role: String,
        location: String,
        startDate: String,
        endDate: String,
        description: String,
        achievements: [String],
        technologies: [String],
        isCurrent: Boolean
    }],
    education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        location: String,
        startYear: Number,
        endYear: Number,
        achievements: [String]
    }],
    backgroundSchool: [{
        name: String,
        certificate: String,
        location: String
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
    interests: {
        professional: [String],
        personal: [String]
    },
    hobbies: [String],
    references: [{
        name: String,
        position: String,
        contactDetails: String
    }],
    awards: [{
        title: String,
        issuer: String,
        year: String,
        description: String
    }],
    volunteerExperience: [{
        organization: String,
        role: String,
        impact: String,
        duration: String
    }],
    extracurricularActivities: [{
        activity: String,
        role: String,
        description: String
    }],
    publications: [{
        title: String,
        platform: String,
        link: String,
        year: String
    }],
    availability: {
        status: { type: String, default: 'Available' },
        type: { type: String, default: 'Full-time' },
        startDate: String
    },
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String,
        website: String
    },
    resumeUrl: { type: String },
    extractedText: { type: String },
    source: { type: String, enum: ['structured', 'unstructured'], default: 'structured' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ICandidate>('Candidate', CandidateSchema);
