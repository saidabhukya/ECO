const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    email: { type: String, required: true },
    role: { type: String, required: true }
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  module: {
    type: String,
    enum: ['Auth', 'Employee', 'Department', 'Attendance', 'Leave', 'Payroll', 'Performance', 'Document', 'Asset', 'Settings', 'Announcement'],
    required: true,
    index: true
  },
  targetId: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String
}, {
  timestamps: { createdAt: true, updatedAt: false } // Immutable logs
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
