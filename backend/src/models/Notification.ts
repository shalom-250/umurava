import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    isRead: boolean;
    type: 'Info' | 'Warning' | 'Success';
    createdAt: Date;
}

const NotificationSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['Info', 'Warning', 'Success'], default: 'Info' },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<INotification>('Notification', NotificationSchema);
