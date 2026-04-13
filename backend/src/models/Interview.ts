import mongoose, { Schema, Document } from 'mongoose';

export interface IInterview extends Document {
    applicationId: mongoose.Types.ObjectId;
    interviewerId: mongoose.Types.ObjectId;
    scheduledAt: Date;
    duration: number; // in minutes
    location: string; // URL or physical address
    type: 'Technical' | 'Behavioral' | 'HR';
    notes: string;
}

const InterviewSchema: Schema = new Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    interviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledAt: { type: Date, required: true },
    duration: { type: Number, default: 60 },
    location: { type: String },
    type: { type: String, enum: ['Technical', 'Behavioral', 'HR'] },
    notes: { type: String },
});

export default mongoose.model<IInterview>('Interview', InterviewSchema);
