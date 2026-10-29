const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: [true, 'Employee ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  profilePhoto: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Non-Binary', 'Prefer not to say'],
    default: 'Prefer not to say'
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true }
  },
  emergencyContact: {
    name: { type: String, trim: true },
    relationship: { type: String, trim: true },
    phone: { type: String, trim: true }
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department is required']
  },
  designation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Designation'
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  joiningDate: {
    type: Date,
    required: [true, 'Joining date is required'],
    default: Date.now
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Intern'],
    default: 'Full-time'
  },
  employmentStatus: {
    type: String,
    enum: ['Active', 'On Leave', 'Resigned', 'Terminated', 'Inactive'],
    default: 'Active'
  },
  workLocation: {
    type: String,
    default: 'Headquarters',
    trim: true
  },
  shift: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shift'
  },
  salaryStructure: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SalaryStructure'
  },
  bankDetails: {
    accountHolderName: { type: String, trim: true },
    bankName: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
    ifscOrRoutingCode: { type: String, trim: true }
  },
  employmentHistory: [
    {
      company: { type: String, trim: true },
      role: { type: String, trim: true },
      fromDate: { type: Date },
      toDate: { type: Date },
      description: { type: String, trim: true }
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  archivedAt: {
    type: Date
  },
  archivedReason: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

employeeSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

module.exports = mongoose.model('Employee', employeeSchema);
