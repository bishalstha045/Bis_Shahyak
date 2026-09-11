import mongoose from 'mongoose';

const systemSettingsSchema = new mongoose.Schema({
  system_name: {
    type: String,
    default: "Bureau of Indian Standards — Compliance Control Gateway"
  },
  version: {
    type: String,
    default: "2.0.0"
  },
  qco_enforcement_mode: {
    type: String,
    enum: ["Strict Gazette Mandatory", "Advisory Voluntary"],
    default: "Strict Gazette Mandatory"
  },
  rag_gateway_url: {
    type: String,
    default: "http://127.0.0.1:8000"
  },
  auto_cml_issuance: {
    type: Boolean,
    default: true
  },
  require_dual_signoff: {
    type: Boolean,
    default: false
  },
  high_risk_categories: {
    type: [String],
    default: [
      "Household Electrical",
      "Chemical",
      "Medical & Healthcare Devices",
      "Automotive Safety"
    ]
  },
  log_retention_days: {
    type: Number,
    default: 90
  },
  last_saved_by: {
    type: String,
    default: "Dr. Rajesh Verma"
  },
  last_saved_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);
