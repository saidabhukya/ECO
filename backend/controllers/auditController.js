const AuditLog = require('../models/AuditLog');

const getAuditLogs = async (req, res, next) => {
  try {
    const { module, action, page = 1, limit = 50 } = req.query;
    const query = {};

    if (module) query.module = module;
    if (action) query.action = action;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    res.json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAuditLogs
};
