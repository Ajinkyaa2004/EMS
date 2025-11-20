import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    userId: mongoose.Types.ObjectId;
    action: string;
    entityType: string;
    entityId: mongoose.Types.ObjectId;
    changes: Record<string, any>;
    timestamp: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog> & IAuditLog & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=AuditLog.d.ts.map