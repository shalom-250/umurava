import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    applicationId: mongoose.Types.ObjectId;
    reviewerId: mongoose.Types.ObjectId;
    score: number;
    comments: string;
    recommendation: 'Pass' | 'Fail' | 'Strong Pass';
    createdAt: Date;
}

const ReviewSchema: Schema = new Schema({
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, min: 0, max: 10 },
    comments: { type: String },
    recommendation: { type: String, enum: ['Pass', 'Fail', 'Strong Pass'] },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IReview>('Review', ReviewSchema);
