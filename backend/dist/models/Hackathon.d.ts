import mongoose, { Document } from 'mongoose';
export interface IHackathonUpdate extends Document {
    hackathonId: mongoose.Types.ObjectId;
    playerId: mongoose.Types.ObjectId;
    playerName: string;
    date: Date;
    summary: string;
    tasksCompleted: Array<{
        task: string;
        completed: boolean;
    }>;
    projectProgress: string;
    blockers?: string;
    nextSteps: string;
    hoursWorked: number;
    loomVideoLink?: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IHackathon extends Document {
    name: string;
    description?: string;
    startDate: Date;
    endDate: Date;
    theme?: string;
    maxPlayers: number;
    currentPlayers: number;
    prizes?: {
        first: string;
        second: string;
        third: string;
    };
    status: 'upcoming' | 'active' | 'completed';
    players: Array<{
        userId: mongoose.Types.ObjectId;
        name: string;
        email: string;
        joinedAt: Date;
        score?: number;
        bonusMultiplier?: number;
        completedInOneDay?: boolean;
    }>;
    tasks: Array<{
        _id?: mongoose.Types.ObjectId;
        title: string;
        description: string;
        assignedTo: mongoose.Types.ObjectId[];
        createdAt?: Date;
        dueDate?: Date;
        priority: 'low' | 'medium' | 'high';
    }>;
    updates: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const HackathonEvent: mongoose.Model<IHackathon, {}, {}, {}, mongoose.Document<unknown, {}, IHackathon> & IHackathon & {
    _id: mongoose.Types.ObjectId;
}, any>;
export declare const HackathonUpdate: mongoose.Model<IHackathonUpdate, {}, {}, {}, mongoose.Document<unknown, {}, IHackathonUpdate> & IHackathonUpdate & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Hackathon.d.ts.map