const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Leave', 'Payroll', 'Announcement', 'Performance', 'Document', 'Attendance', 'Asset', 'System'],
    default: 'System'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
