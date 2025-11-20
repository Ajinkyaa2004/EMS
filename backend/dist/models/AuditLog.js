import mongoose, { Schema } from 'mongoose';
const auditLogSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: Schema.Types.ObjectId, required: true },
    changes: Schema.Types.Mixed,
}, { timestamps: true });
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
//# sourceMappingURL=AuditLog.js.map