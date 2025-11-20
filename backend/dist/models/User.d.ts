import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'admin' | 'employee' | 'client' | 'freelancer' | 'trainee';
    phone?: string;
    avatar?: string;
    isActive: boolean;
    isTrainee?: boolean;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(password: string): Promise<boolean>;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=User.d.ts.map