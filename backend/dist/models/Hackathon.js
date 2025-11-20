import mongoose, { Schema } from 'mongoose';
const hackathonUpdateSchema = new Schema({
    hackathonId: { type: Schema.Types.ObjectId, ref: 'HackathonEvent', required: true },
    playerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    playerName: { type: String, required: true },
    date: { type: Date, required: true, default: Date.now },
    summary: { type: String, required: true },
    tasksCompleted: [
        {
            task: String,
            completed: { type: Boolean, default: false },
        },
    ],
    projectProgress: { type: String, required: true },
    blockers: String,
    nextSteps: { type: String, required: true },
    hoursWorked: { type: Number, default: 0 },
    loomVideoLink: String,
}, { timestamps: true });
const hackathonSchema = new Schema({
    name: { type: String, required: true },
    description: String,
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    theme: String,
    maxPlayers: { type: Number, default: 100 },
    currentPlayers: { type: Number, default: 0 },
    prizes: {
        first: String,
        second: String,
        third: String,
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming',
    },
    players: [
        {
            userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
            name: String,
            email: String,
            joinedAt: { type: Date, default: Date.now },
            score: { type: Number, default: 0 },
            bonusMultiplier: { type: Number, default: 1 },
            completedInOneDay: { type: Boolean, default: false },
        },
    ],
    tasks: [
        {
            title: { type: String, required: true },
            description: String,
            assignedTo: [{ type: Schema.Types.ObjectId, ref: 'User' }],
            createdAt: { type: Date, default: Date.now },
            dueDate: Date,
            priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        },
    ],
    updates: [{ type: Schema.Types.ObjectId, ref: 'HackathonUpdate' }],
}, { timestamps: true });
export const HackathonEvent = mongoose.model('HackathonEvent', hackathonSchema);
export const HackathonUpdate = mongoose.model('HackathonUpdate', hackathonUpdateSchema);
//# sourceMappingURL=Hackathon.js.map