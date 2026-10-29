const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Document title is required'],
    trim: true
  },
  category: {
    type: String,
    enum: [
      'Resume',
      'Offer Letter',
      'Appointment Letter',
      'Certificate',
      'Experience Letter',
      'Employment Document',
      'Salary Slip',
      'ID Proof',
      'Other'
    ],
    default: 'Other'
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  accessRole: {
    type: String,
    enum: ['PUBLIC', 'EMPLOYEE_AND_HR', 'HR_AND_ADMIN', 'ADMIN_ONLY'],
    default: 'EMPLOYEE_AND_HR'
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);
