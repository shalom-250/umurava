import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
    title: string;
    description: string;
    requirements: string[];
    skills: string[];
    mustHaveSkills: string[];
    recruiterId: mongoose.Types.ObjectId;
    status: 'open' | 'closed';
    createdAt: Date;
}

const JobSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }],
    skills: [{ type: String }],
    recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IJob>('Job', JobSchema);
