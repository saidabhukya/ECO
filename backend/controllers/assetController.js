const Asset = require('../models/Asset');
const Employee = require('../models/Employee');
const { logAction } = require('../middleware/auditLogger');

const getAssets = async (req, res, next) => {
  try {
    const { category, status, employeeId, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (employeeId) query.assignedEmployee = employeeId;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { assetId: { $regex: search, $options: 'i' } },
        { serialNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const assets = await Asset.find(query)
      .populate('assignedEmployee', 'firstName lastName employeeId department email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: assets });
  } catch (error) {
    next(error);
  }
};

const createAsset = async (req, res, next) => {
  try {
    const asset = await Asset.create(req.body);
    await logAction({
      req,
      action: 'ASSET_CREATE',
      module: 'Asset',
      targetId: asset._id,
      description: `Registered asset: ${asset.name} (${asset.assetId})`
    });
    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    next(error);
  }
};

const assignAsset = async (req, res, next) => {
  try {
    const { employeeId, expectedReturnDate, conditionOnAssign, notes } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    asset.status = 'Assigned';
    asset.assignedEmployee = employeeId;
    asset.assignedDate = new Date();
    asset.expectedReturnDate = expectedReturnDate || undefined;

    asset.assignmentHistory.push({
      employee: employeeId,
      assignedDate: new Date(),
      assignedBy: req.user._id,
      conditionOnAssign: conditionOnAssign || 'Good',
      notes
    });

    await asset.save();

    const emp = await Employee.findById(employeeId);
    await logAction({
      req,
      action: 'ASSET_ASSIGN',
      module: 'Asset',
      targetId: asset._id,
      description: `Assigned asset ${asset.assetId} to ${emp?.fullName}`
    });

    res.json({ success: true, message: 'Asset assigned successfully', data: asset });
  } catch (error) {
    next(error);
  }
};

const returnAsset = async (req, res, next) => {
  try {
    const { conditionOnReturn, notes } = req.body;
    const asset = await Asset.findById(req.params.id);

    if (!asset) return res.status(404).json({ success: false, message: 'Asset not found' });

    const lastAssignment = asset.assignmentHistory[asset.assignmentHistory.length - 1];
    if (lastAssignment) {
      lastAssignment.returnedDate = new Date();
      lastAssignment.conditionOnReturn = conditionOnReturn || 'Good';
      if (notes) lastAssignment.notes = (lastAssignment.notes ? lastAssignment.notes + ' | ' : '') + notes;
    }

    asset.status = 'Available';
    asset.assignedEmployee = undefined;
    asset.assignedDate = undefined;
    asset.expectedReturnDate = undefined;

    await asset.save();

    await logAction({
      req,
      action: 'ASSET_RETURN',
      module: 'Asset',
      targetId: asset._id,
      description: `Asset ${asset.assetId} was returned to inventory`
    });

    res.json({ success: true, message: 'Asset marked as returned', data: asset });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAssets,
  createAsset,
  assignAsset,
  returnAsset
};
