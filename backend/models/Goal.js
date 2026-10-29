const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  targetMetric: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Not Started'
  },
  comments: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: { type: String, required: true },
      date: { type: Date, default: Date.now }
    }
  ]
}, {
  timestamps: true
});

module.exports = mongoose.model('Goal', goalSchema);
