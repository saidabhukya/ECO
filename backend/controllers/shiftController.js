const Shift = require('../models/Shift');
const { logAction } = require('../middleware/auditLogger');

const getShifts = async (req, res, next) => {
  try {
    const shifts = await Shift.find().sort({ name: 1 });
    res.json({ success: true, data: shifts });
  } catch (error) {
    next(error);
  }
};

const createShift = async (req, res, next) => {
  try {
    const shift = await Shift.create(req.body);
    await logAction({
      req,
      action: 'SHIFT_CREATE',
      module: 'Settings',
      targetId: shift._id,
      description: `Created shift: ${shift.name} (${shift.startTime} - ${shift.endTime})`
    });
    res.status(201).json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

const updateShift = async (req, res, next) => {
  try {
    const shift = await Shift.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shift) return res.status(404).json({ success: false, message: 'Shift not found' });
    res.json({ success: true, data: shift });
  } catch (error) {
    next(error);
  }
};

const deleteShift = async (req, res, next) => {
  try {
    await Shift.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Shift deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getShifts,
  createShift,
  updateShift,
  deleteShift
};
