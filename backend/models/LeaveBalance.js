const mongoose = require('mongoose');

const leaveBalanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: true
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  allocated: {
    type: Number,
    default: 0,
    min: 0
  },
  used: {
    type: Number,
    default: 0,
    min: 0
  },
  pending: {
    type: Number,
    default: 0,
    min: 0
  },
  history: [
    {
      action: {
        type: String,
        enum: ['ALLOCATED', 'DEDUCTED', 'RESTORED', 'ADJUSTED'],
        default: 'ALLOCATED'
      },
      days: Number,
      reason: String,
      leaveRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LeaveRequest' },
      performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

leaveBalanceSchema.virtual('remaining').get(function () {
  return Math.max(0, this.allocated - this.used - this.pending);
});

leaveBalanceSchema.index({ employee: 1, leaveType: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('LeaveBalance', leaveBalanceSchema);
