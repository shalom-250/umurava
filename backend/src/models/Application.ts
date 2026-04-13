import mongoose, { Schema, Document } from 'mongoose';

export interface IApplication extends Document {
    jobId: mongoose.Types.ObjectId;
    candidateId: mongoose.Types.ObjectId;
    status: 'Applied' | 'Screened' | 'Interview' | 'Offered' | 'Hired' | 'Rejected';
    appliedAt: Date;
    updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    status: {
        type: String,
        enum: ['Applied', 'Screened', 'Interview', 'Offered', 'Hired', 'Rejected'],
        default: 'Applied'
    },
    appliedAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IApplication>('Application', ApplicationSchema);
