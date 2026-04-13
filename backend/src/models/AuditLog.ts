import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    resource: string;
    resourceId?: string;
    details?: string;
    timestamp: Date;
}

const AuditLogSchema: Schema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    resource: { type: String, required: true },
    resourceId: { type: String },
    details: { type: String },
    timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
