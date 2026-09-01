import mongoose from 'mongoose';

const assessmentSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  product_name: {
    type: String,
    required: true
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
  matrix: {
    type: Array,
    default: []
  },
  next_action: {
    type: String
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Assessment = mongoose.model('Assessment', assessmentSchema);
