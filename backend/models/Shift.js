const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Shift name is required'],
    unique: true,
    trim: true
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required (HH:mm)'],
    trim: true
  },
  endTime: {
    type: String,
    required: [true, 'End time is required (HH:mm)'],
    trim: true
  },
  breakDuration: {
    type: Number,
    default: 60, // minutes
    min: 0
  },
  gracePeriod: {
    type: Number,
    default: 15, // minutes
    min: 0
  },
  applicableDays: {
    type: [String],
    default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  isOvernight: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Shift', shiftSchema);
