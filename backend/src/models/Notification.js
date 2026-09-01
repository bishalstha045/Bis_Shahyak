import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['qco', 'amendments', 'impact', 'labs', 'training', 'general'],
    default: 'general'
  },
  badge: {
    type: String,
    required: true
  },
  badge_class: {
    type: String,
    default: 'bg-blue-50 text-blue-700 border-blue-200'
  },
  title: {
    type: String,
    required: true
  },
  authority: {
    type: String,
    default: 'Bureau of Indian Standards'
  },
  date: {
    type: String,
    required: true
  },
  unread: {
    type: Boolean,
    default: true
  },
  impact: {
    type: String,
    default: 'General Notice'
  },
  description: {
    type: String,
    required: true
  },
  action_primary: {
    type: Object,
    default: null
  },
  action_secondary: {
    type: Object,
    default: null
  },
  user_id: {
    type: String,
    default: 'all'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Notification = mongoose.model('Notification', notificationSchema);
