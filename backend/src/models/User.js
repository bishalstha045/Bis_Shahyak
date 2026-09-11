import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return this.provider === 'local';
    }
  },
  provider: {
    type: String,
    enum: ['local', 'supabase'],
    default: 'local'
  },
  supabase_id: {
    type: String,
    sparse: true,
    unique: true
  },
  full_name: {
    type: String,
    required: true,
    trim: true
  },
  company_name: {
    type: String,
    default: 'Independent Enterprise'
  },
  role: {
    type: String,
    default: 'Manufacturer'
  },
  phone: {
    type: String,
    default: ''
  },
  sector: {
    type: String,
    default: 'Consumer Goods & Utensils'
  },
  enterprise_category: {
    type: String,
    default: 'MSME - Small Enterprise'
  },
  gstin: {
    type: String,
    default: ''
  },
  udyam_number: {
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
  is_active: {
    type: Boolean,
    default: true
  },
  is_admin: {
    type: Boolean,
    default: false
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_status: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'rejected'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['active', 'suspended', 'deleted'],
    default: 'active'
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  deleted_at: {
    type: Date,
    default: null
  },
  last_login: {
    type: Date,
    default: null
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export const User = mongoose.model('User', userSchema);
