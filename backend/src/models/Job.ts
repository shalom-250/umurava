import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    mustHaveSkills: string[];
    recruiterId: mongoose.Types.ObjectId;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Contract';
    experienceLevel: 'Junior' | 'Mid-level' | 'Senior' | 'Lead';
    salaryRange: string;
    deadline: string;
    status: 'Active' | 'Draft' | 'Screening' | 'Closed';
    createdAt: Date;
}

const JobSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    mustHaveSkills: [{ type: String }],
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: String },
    location: { type: String },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract'], default: 'Full-time' },
    experienceLevel: { type: String, enum: ['Junior', 'Mid-level', 'Senior', 'Lead'], default: 'Junior' },
    salaryRange: { type: String },
    deadline: { type: String },
    status: { type: String, enum: ['Active', 'Draft', 'Screening', 'Closed'], default: 'Active' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IJob>('Job', JobSchema);
