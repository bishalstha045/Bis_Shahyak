import mongoose from 'mongoose';

const verificationSubmissionSchema = new mongoose.Schema({
  applicant_id: {
    type: String,
    index: true
  },
  applicant_name: {
    type: String,
    required: true
  },
  applicant_email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  company_name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  gstin: {
    type: String,
    default: ''
  },
  udyam_number: {
    type: String,
    default: ''
  },
  enterprise_category: {
    type: String,
    default: 'MSME - Small Enterprise'
  },
  category: {
    type: String,
    default: 'Consumer Goods & Utensils'
  },
  standard_id: {
    type: String,
    required: true
  },
  standard_title: {
    type: String,
    default: ''
  },
  product_name: {
    type: String,
    required: true
  },
  submission_title: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: 'Delhi'
  },
  district: {
    type: String,
    default: 'New Delhi'
  },
  factory_address: {
    type: String,
    default: ''
  },
  annual_capacity: {
    type: String,
    default: '50,000 units/year'
  },
  readiness_score: {
    type: Number,
    default: 0
  },
  documents: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'deleted'],
    default: 'pending',
    index: true
  },
  cml_license: {
    type: String,
    default: null
  },
  approval_ref: {
    type: String,
    default: null
  },
  officer_remarks: {
    type: String,
    default: ''
  },
  rejection_reason: {
    type: String,
    default: null
  },
  verified_by: {
    type: String,
    default: null
  },
  verified_at: {
    type: Date,
    default: null
  },
  rejected_by: {
    type: String,
    default: null
  },
  rejected_at: {
    type: Date,
    default: null
  },
  submitted_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const VerificationSubmission = mongoose.model('VerificationSubmission', verificationSubmissionSchema);
