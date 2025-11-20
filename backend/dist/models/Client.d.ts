import mongoose, { Document } from 'mongoose';
export interface IClient extends Document {
    name: string;
    type: string;
    email: string;
    phone?: string;
    contactPerson?: string;
    oneDriveLink?: string;
    gitHubLink?: string;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Client: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient> & IClient & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Client.d.ts.map