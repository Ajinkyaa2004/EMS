import mongoose from 'mongoose';

const projectSessionSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
  },
  attendanceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Attendance',
    required: true,
  },
  sessionStartTime: {
    type: Date,
    default: Date.now,
  },
  sessionEndTime: Date,
  status: {
    type: String,
    enum: ['Active', 'Idle', 'Offline'],
    default: 'Active',
  },
  lastActivityTime: {
    type: Date,
    default: Date.now,
  },
  totalActiveMinutes: {
    type: Number,
    default: 0,
  },
  totalIdleMinutes: {
    type: Number,
    default: 0,
  },
  screenActivityLog: [{
    timestamp: Date,
    type: { type: String, enum: ['Active', 'Idle'] },
    duration: Number, // in seconds
  }],
}, { timestamps: true });

export const ProjectSession = mongoose.model('ProjectSession', projectSessionSchema);
