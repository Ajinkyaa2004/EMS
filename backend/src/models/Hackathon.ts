import mongoose, { Schema, Document } from 'mongoose';

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
    assignedTo: mongoose.Types.ObjectId[]; // Array of player IDs
    createdAt?: Date;
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high';
  }>;
  updates: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const hackathonUpdateSchema = new Schema<IHackathonUpdate>(
  {
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
  },
  { timestamps: true }
);

const hackathonSchema = new Schema<IHackathon>(
  {
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
  },
  { timestamps: true }
);

export const HackathonEvent = mongoose.model<IHackathon>('HackathonEvent', hackathonSchema);
export const HackathonUpdate = mongoose.model<IHackathonUpdate>('HackathonUpdate', hackathonUpdateSchema);
