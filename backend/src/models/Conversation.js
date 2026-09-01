import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  user_id: {
    type: String,
    default: 'anonymous',
    index: true
  },
  title: {
    type: String,
    default: 'BIS Compliance Inquiry'
  },
  mode: {
    type: String,
    default: 'simple'
  },
  language: {
    type: String,
    default: 'auto'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Conversation = mongoose.model('Conversation', conversationSchema);
