import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
    name: string;
    website?: string;
    industry?: string;
    description?: string;
    location?: string;
    logoUrl?: string;
}

const CompanySchema: Schema = new Schema({
    name: { type: String, required: true },
    website: { type: String },
    industry: { type: String },
    description: { type: String },
    location: { type: String },
    logoUrl: { type: String },
});

export default mongoose.model<ICompany>('Company', CompanySchema);
