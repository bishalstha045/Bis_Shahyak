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
    required: true
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
  is_active: {
    type: Boolean,
    default: true
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
