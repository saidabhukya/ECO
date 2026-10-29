const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
  companyName: {
    type: String,
    default: 'ECO TRACK'
  },
  tagline: {
    type: String,
    default: 'Track Employees. Manage Work. Drive Performance.'
  },
  companyEmail: {
    type: String,
    default: 'contact@ecotrack.internal'
  },
  companyPhone: {
    type: String,
    default: '+1 (555) 019-2834'
  },
  companyAddress: {
    type: String,
    default: '100 Innovation Boulevard, Tech Park, Suite 400'
  },
  currency: {
    type: String,
    default: 'USD'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  workHoursPerDay: {
    type: Number,
    default: 8
  },
  gracePeriodMinutes: {
    type: Number,
    default: 15
  },
  allowOvertime: {
    type: Boolean,
    default: true
  },
  theme: {
    primaryColor: { type: String, default: '#DC2626' },
    darkModeDefault: { type: Boolean, default: false }
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Setting', settingSchema);
