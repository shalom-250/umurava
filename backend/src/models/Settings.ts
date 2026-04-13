import mongoose, { Schema, Document } from 'mongoose';

export interface ISettings extends Document {
    userId: mongoose.Types.ObjectId;
    theme: 'Light' | 'Dark';
    notificationsEnabled: boolean;
    language: string;
}

const SettingsSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['Light', 'Dark'], default: 'Light' },
    notificationsEnabled: { type: Boolean, default: true },
    language: { type: String, default: 'en' },
});

export default mongoose.model<ISettings>('Settings', SettingsSchema);
