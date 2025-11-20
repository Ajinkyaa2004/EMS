import mongoose, { Document } from 'mongoose';
export interface ICoderRecommendation extends Document {
    employeeId: mongoose.Types.ObjectId;
    skills: string;
    experience: string;
    reason: string;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const CoderRecommendation: mongoose.Model<ICoderRecommendation, {}, {}, {}, mongoose.Document<unknown, {}, ICoderRecommendation> & ICoderRecommendation & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=CoderRecommendation.d.ts.map