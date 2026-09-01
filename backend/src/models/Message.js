import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  session_id: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    default: 85
  },
  citations: {
    type: Array,
    default: []
  },
  mode: {
    type: String,
    default: 'simple'
  },
  language: {
    type: String,
    default: 'auto'
  },
  processing_time: {
    type: Number,
    default: 0.4
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Message = mongoose.model('Message', messageSchema);
