const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  basicSalary: {
    type: Number,
    required: true,
    min: 0
  },
  hra: {
    type: Number,
    default: 0,
    min: 0
  },
  conveyanceAllowance: {
    type: Number,
    default: 0,
    min: 0
  },
  medicalAllowance: {
    type: Number,
    default: 0,
    min: 0
  },
  specialAllowance: {
    type: Number,
    default: 0,
    min: 0
  },
  providentFund: {
    type: Number,
    default: 0,
    min: 0
  },
  taxDeduction: {
    type: Number,
    default: 0,
    min: 0
  },
  insuranceDeduction: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

salaryStructureSchema.virtual('grossSalary').get(function () {
  return (this.basicSalary || 0) + (this.hra || 0) + (this.conveyanceAllowance || 0) + (this.medicalAllowance || 0) + (this.specialAllowance || 0);
});

salaryStructureSchema.virtual('totalDeductions').get(function () {
  return (this.providentFund || 0) + (this.taxDeduction || 0) + (this.insuranceDeduction || 0);
});

salaryStructureSchema.virtual('netSalary').get(function () {
  return this.grossSalary - this.totalDeductions;
});

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
