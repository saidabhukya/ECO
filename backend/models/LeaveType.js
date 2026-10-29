const mongoose = require('mongoose');

const leaveTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Leave type name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Leave code is required'],
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  daysPerYear: {
    type: Number,
    required: [true, 'Default days per year is required'],
    default: 12,
    min: 0
  },
  isPaid: {
    type: Boolean,
    default: true
  },
  requiresProof: {
    type: Boolean,
    default: false
  },
  color: {
    type: String,
    default: '#DC2626'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
