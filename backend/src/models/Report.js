import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  reporter_id: {
    type: String,
    default: 'anonymous'
  },
  reporter_name: {
    type: String,
    default: 'Concerned Citizen / Inspector'
  },
  reporter_email: {
    type: String,
    default: ''
  },
  target_type: {
    type: String,
    enum: ['submission', 'user', 'content', 'standard'],
    default: 'submission'
  },
  target_id: {
    type: String,
    required: true
  },
  target_title: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'dismissed'],
    default: 'open',
    index: true
  },
  evidence_urls: {
    type: Array,
    default: []
  },
  resolution_notes: {
    type: String,
    default: ''
  },
  action_taken: {
    type: String,
    default: ''
  },
  resolved_by: {
    type: String,
    default: null
  },
  resolved_at: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Report = mongoose.model('Report', reportSchema);
