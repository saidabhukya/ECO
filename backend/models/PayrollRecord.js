const mongoose = require('mongoose');

const payrollRecordSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'Employee reference is required']
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  payPeriod: {
    type: String, // 'YYYY-MM'
    required: true,
    index: true
  },
  earnings: {
    basicSalary: { type: Number, default: 0, min: 0 },
    hra: { type: Number, default: 0, min: 0 },
    conveyanceAllowance: { type: Number, default: 0, min: 0 },
    medicalAllowance: { type: Number, default: 0, min: 0 },
    specialAllowance: { type: Number, default: 0, min: 0 },
    overtimePay: { type: Number, default: 0, min: 0 },
    bonus: { type: Number, default: 0, min: 0 },
    otherEarnings: { type: Number, default: 0, min: 0 }
  },
  deductions: {
    providentFund: { type: Number, default: 0, min: 0 },
    taxDeduction: { type: Number, default: 0, min: 0 },
    insuranceDeduction: { type: Number, default: 0, min: 0 },
    unpaidLeaveDeductions: { type: Number, default: 0, min: 0 },
    otherDeductions: { type: Number, default: 0, min: 0 }
  },
  attendanceSummary: {
    totalCalendarDays: { type: Number, default: 30 },
    workingDays: { type: Number, default: 22 },
    presentDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 }
  },
  grossEarnings: {
    type: Number,
    required: true,
    default: 0
  },
  totalDeductions: {
    type: Number,
    required: true,
    default: 0
  },
  netPay: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['Draft', 'Review', 'Approved', 'Finalized'],
    default: 'Draft',
    index: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Paid'],
    default: 'Pending'
  },
  paymentDate: Date,
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'Cheque', 'Cash', 'Direct Deposit'],
    default: 'Direct Deposit'
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  finalizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  finalizedAt: Date,
  remarks: String
}, {
  timestamps: true
});

payrollRecordSchema.index({ employee: 1, payPeriod: 1 }, { unique: true });

module.exports = mongoose.model('PayrollRecord', payrollRecordSchema);
