const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Announcement title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Announcement content is required'],
    trim: true
  },
  priority: {
    type: String,
    enum: ['Normal', 'Important', 'Urgent'],
    default: 'Normal'
  },
  targetAudience: {
    type: String,
    enum: ['All', 'Department', 'Role'],
    default: 'All'
  },
  targetDepartment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  targetRole: {
    type: String,
    enum: ['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'All'],
    default: 'All'
  },
  publishedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expiresAt: Date,
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
