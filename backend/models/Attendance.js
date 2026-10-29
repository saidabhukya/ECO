const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  workDate: {
    type: String, // 'YYYY-MM-DD'
    required: [true, 'Work date is required'],
    index: true
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift'
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  breakDuration: {
    type: Number,
    default: 0 // in minutes
  },
  workingHours: {
    type: Number,
    default: 0 // in hours with decimals e.g. 8.25
  },
  lateMinutes: {
    type: Number,
    default: 0
  },
  earlyDepartureMinutes: {
    type: Number,
    default: 0
  },
  overtimeMinutes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late', 'Half Day', 'On Approved Leave', 'Holiday', 'Weekly Off'],
    default: 'Present'
  },
  adjustmentHistory: [
    {
      requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date, default: Date.now },
      originalCheckIn: Date,
      originalCheckOut: Date,
      originalStatus: String,
      requestedCheckIn: Date,
      requestedCheckOut: Date,
      requestedStatus: String,
      reason: String,
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      }
    }
  ],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

attendanceSchema.index({ employee: 1, workDate: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
