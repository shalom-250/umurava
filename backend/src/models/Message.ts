import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
    senderId: mongoose.Types.ObjectId;
    receiverId: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
}

const MessageSchema: Schema = new Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMessage>('Message', MessageSchema);
