import mongoose, { Schema, Document } from 'mongoose';

export interface ISkill extends Document {
    name: string;
    category: 'Technical' | 'Soft' | 'Domain';
}

const SkillSchema: Schema = new Schema({
    name: { type: String, required: true, unique: true },
    category: { type: String, enum: ['Technical', 'Soft', 'Domain'], default: 'Technical' },
});

export default mongoose.model<ISkill>('Skill', SkillSchema);
