import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    companyId: mongoose.Types.ObjectId;
    headId?: mongoose.Types.ObjectId; // Reference to User
}

const DepartmentSchema: Schema = new Schema({
    name: { type: String, required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    headId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
