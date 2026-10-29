const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  leaveType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LeaveType',
    required: [true, 'Leave type is required']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  days: {
    type: Number,
    required: [true, 'Total leave days required'],
    min: 0.5
  },
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDaySession: {
    type: String,
    enum: ['First Half', 'Second Half', 'None'],
    default: 'None'
  },
  reason: {
    type: String,
    required: [true, 'Reason for leave is required'],
    trim: true
  },
  supportingDocuments: [
    {
      originalName: String,
      filename: String,
      path: String,
      mimeType: String,
      size: Number
    }
  ],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Cancelled'],
    default: 'Pending'
  },
  approvalWorkflow: {
    managerApproval: {
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Not Required'],
        default: 'Pending'
      },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      remarks: String
    },
    hrApproval: {
      status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
      },
      approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: Date,
      remarks: String
    }
  },
  cancelledAt: Date,
  cancelReason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
