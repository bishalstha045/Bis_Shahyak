import mongoose from 'mongoose';

const licenceSchema = new mongoose.Schema({
  cml_number: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  standard_id: {
    type: String,
    required: true,
    index: true
  },
  standard_title: {
    type: String,
    default: ''
  },
  manufacturer_name: {
    type: String,
    required: true
  },
  brand_name: {
    type: String,
    default: 'STANDARDS-CERT'
  },
  factory_address: {
    type: String,
    default: ''
  },
  validity_start: {
    type: Date,
    default: Date.now
  },
  validity_end: {
    type: Date,
    default: () => new Date(Date.now() + 3 * 365 * 86400000) // 3 years
  },
  grant_date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['OPERATIVE', 'EXPIRED', 'SUSPENDED'],
    default: 'OPERATIVE',
    index: true
  },
  submission_id: {
    type: String,
    default: null
  },
  is_qco_mandated: {
    type: Boolean,
    default: true
  },
  recognized_testing_lab: {
    type: String,
    default: 'National Test House (NTH) / BIS Central Laboratory'
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const Licence = mongoose.model('Licence', licenceSchema);
