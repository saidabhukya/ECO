const AuditLog = require('../models/AuditLog');

const logAction = async ({ req, action, module, targetId, description, details }) => {
  try {
    const actorEmail = req?.user?.email || 'system@ecotrack.internal';
    const actorRole = req?.user?.role || 'SYSTEM';
    const actorUserId = req?.user?._id || null;

    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    const userAgent = req?.headers['user-agent'] || 'Unknown';

    await AuditLog.create({
      actor: {
        userId: actorUserId,
        email: actorEmail,
        role: actorRole
      },
      action,
      module,
      targetId: targetId ? targetId.toString() : undefined,
      description,
      details,
      ipAddress,
      userAgent
    });
  } catch (err) {
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = { logAction };
