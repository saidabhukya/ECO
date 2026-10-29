const Setting = require('../models/Setting');
const { logAction } = require('../middleware/auditLogger');

const getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ key: 'global' });
    if (!settings) {
      settings = await Setting.create({
        key: 'global',
        companyName: 'ECO TRACK',
        tagline: 'Track Employees. Manage Work. Drive Performance.'
      });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOneAndUpdate(
      { key: 'global' },
      { ...req.body, lastUpdatedBy: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );

    await logAction({
      req,
      action: 'SETTINGS_UPDATE',
      module: 'Settings',
      targetId: settings._id,
      description: 'Updated system settings'
    });

    res.json({ success: true, message: 'Settings saved successfully', data: settings });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
