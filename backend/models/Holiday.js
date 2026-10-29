const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Holiday name is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    default: 'All',
    trim: true
  },
  holidayType: {
    type: String,
    enum: ['Public', 'Optional', 'National', 'Company'],
    default: 'Public'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Holiday', holidaySchema);
