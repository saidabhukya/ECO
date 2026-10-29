const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Designation title is required'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  description: {
    type: String,
    trim: true
  },
  level: {
    type: String,
    enum: ['Junior', 'Mid', 'Senior', 'Lead', 'Executive', 'Manager'],
    default: 'Mid'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Designation', designationSchema);
