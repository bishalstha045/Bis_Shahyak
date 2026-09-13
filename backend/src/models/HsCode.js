import mongoose from 'mongoose';

const hsCodeSchema = new mongoose.Schema({
  hs_code: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true,
  collection: 'hs_codes'
});

export const HsCode = mongoose.models.HsCode || mongoose.model('HsCode', hsCodeSchema);
