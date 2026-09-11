import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    index: true
  },
  admin_id: {
    type: String,
    required: true
  },
  admin_name: {
    type: String,
    required: true
  },
  admin_email: {
    type: String,
    default: ''
  },
  target_type: {
    type: String,
    enum: ['submission', 'user', 'report', 'content', 'system', 'settings'],
    default: 'submission',
    index: true
  },
  target_id: {
    type: String,
    default: ''
  },
  target_title: {
    type: String,
    default: ''
  },
  details: {
    type: Object,
    default: {}
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
