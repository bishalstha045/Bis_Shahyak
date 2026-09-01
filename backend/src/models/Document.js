import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    index: true
  },
  file_name: {
    type: String,
    required: true
  },
  original_name: {
    type: String,
    required: true
  },
  file_path: {
    type: String
  },
  mime_type: {
    type: String
  },
  size_bytes: {
    type: Number
  },
  standard_id: {
    type: String
  },
  standard_title: {
    type: String
  },
  readiness_score: {
    type: Number,
    default: 0
  },
  sections: {
    type: Array,
    default: []
  },
  summary: {
    type: Object,
    default: {}
  },
  action_required: {
    type: Object,
    default: {}
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Document = mongoose.model('Document', documentSchema);
