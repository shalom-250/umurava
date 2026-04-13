import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    companyId: mongoose.Types.ObjectId;
    plan: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
    startDate: Date;
    endDate: Date;
    isActive: boolean;
}

const SubscriptionSchema: Schema = new Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true, unique: true },
    plan: { type: String, enum: ['Free', 'Basic', 'Pro', 'Enterprise'], default: 'Free' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    isActive: { type: Boolean, default: true },
});

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
