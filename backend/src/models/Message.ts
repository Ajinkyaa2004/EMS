import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'recipientType',
    required: true,
  },
  recipientType: {
    type: String,
    enum: ['User', 'Client'],
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  subject: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  app: {
    type: String,
    enum: ['email', 'gmail', 'telegram', 'dashboard'],
    default: 'email',
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent',
  },
  readAt: {
    type: Date,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Message', messageSchema);
