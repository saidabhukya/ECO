const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    required: [true, 'Asset ID is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  name: {
    type: String,
    required: [true, 'Asset name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Laptop', 'Desktop', 'Mobile Phone', 'Access Card', 'Peripherals', 'Furniture', 'Equipment', 'Other'],
    default: 'Laptop'
  },
  serialNumber: {
    type: String,
    required: [true, 'Serial number is required'],
    unique: true,
    trim: true
  },
  purchaseDate: {
    type: Date
  },
  purchaseCost: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Available', 'Assigned', 'Under Maintenance', 'Retired'],
    default: 'Available',
    index: true
  },
  assignedEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  assignedDate: Date,
  expectedReturnDate: Date,
  assignmentHistory: [
    {
      employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
      assignedDate: { type: Date, default: Date.now },
      returnedDate: Date,
      assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      conditionOnAssign: { type: String, default: 'Good' },
      conditionOnReturn: String,
      notes: String
    }
  ],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', assetSchema);
