const Holiday = require('../models/Holiday');
const { logAction } = require('../middleware/auditLogger');

const getHolidays = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31, 23, 59, 59);

    const holidays = await Holiday.find({
      date: { $gte: startDate, $lte: endDate },
      isActive: true
    }).sort({ date: 1 });

    res.json({ success: true, data: holidays });
  } catch (error) {
    next(error);
  }
};

const createHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.create(req.body);
    await logAction({
      req,
      action: 'HOLIDAY_CREATE',
      module: 'Settings',
      targetId: holiday._id,
      description: `Created holiday: ${holiday.name} on ${holiday.date}`
    });
    res.status(201).json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const updateHoliday = async (req, res, next) => {
  try {
    const holiday = await Holiday.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!holiday) return res.status(404).json({ success: false, message: 'Holiday not found' });
    res.json({ success: true, data: holiday });
  } catch (error) {
    next(error);
  }
};

const deleteHoliday = async (req, res, next) => {
  try {
    await Holiday.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Holiday deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getHolidays,
  createHoliday,
  updateHoliday,
  deleteHoliday
};
