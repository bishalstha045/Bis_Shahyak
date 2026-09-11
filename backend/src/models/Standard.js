import mongoose from 'mongoose';

const standardSchema = new mongoose.Schema({
  standard_id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    required: true,
    index: true
  },
  year: {
    type: String,
    default: '2024'
  },
  status: {
    type: String,
    default: 'Current / Mandatory under QCO'
  },
  effective_date: {
    type: String,
    default: '2025-01-01'
  },
  superseded_status: {
    type: String,
    default: 'Active'
  },
  is_qco_mandatory: {
    type: Boolean,
    default: true,
    index: true
  },
  qco_reference: {
    type: String,
    default: 'Gazette of India Quality Control Order 2026'
  },
  applicable_products: {
    type: [String],
    default: []
  },
  characteristics: {
    type: [String],
    default: []
  },
  intended_use: {
    type: [String],
    default: []
  },
  key_clauses: {
    type: Array,
    default: []
  },
  source_url: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Standard = mongoose.model('Standard', standardSchema);
