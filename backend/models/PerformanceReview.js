const mongoose = require('mongoose');

const performanceReviewSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewPeriod: {
    type: String, // e.g. "Q1 2026", "Annual 2026"
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true,
    default: () => new Date().getFullYear()
  },
  ratings: {
    productivity: { type: Number, min: 1, max: 5, default: 3 },
    technicalSkills: { type: Number, min: 1, max: 5, default: 3 },
    communication: { type: Number, min: 1, max: 5, default: 3 },
    teamwork: { type: Number, min: 1, max: 5, default: 3 },
    qualityOfWork: { type: Number, min: 1, max: 5, default: 3 },
    leadership: { type: Number, min: 1, max: 5, default: 3 }
  },
  overallScore: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  strengths: {
    type: String,
    trim: true
  },
  areasForImprovement: {
    type: String,
    trim: true
  },
  reviewerFeedback: {
    type: String,
    required: true,
    trim: true
  },
  employeeComments: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Submitted', 'Acknowledged'],
    default: 'Draft'
  },
  acknowledgedAt: Date
}, {
  timestamps: true
});

performanceReviewSchema.pre('save', function (next) {
  if (this.ratings) {
    const keys = ['productivity', 'technicalSkills', 'communication', 'teamwork', 'qualityOfWork', 'leadership'];
    const sum = keys.reduce((acc, k) => acc + (this.ratings[k] || 0), 0);
    this.overallScore = Number((sum / keys.length).toFixed(2));
  }
  next();
});

module.exports = mongoose.model('PerformanceReview', performanceReviewSchema);
