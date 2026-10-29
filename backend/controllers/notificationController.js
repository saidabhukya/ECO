const Notification = require('../models/Notification');
const Announcement = require('../models/Announcement');
const { logAction } = require('../middleware/auditLogger');

// NOTIFICATIONS
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    });

    res.json({ success: true, unreadCount, data: notifications });
  } catch (error) {
    next(error);
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    res.json({ success: true, data: notification });
  } catch (error) {
    next(error);
  }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

// ANNOUNCEMENTS
const getAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('publishedBy', 'email')
      .populate('targetDepartment', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: announcements });
  } catch (error) {
    next(error);
  }
};

const createAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.create({
      ...req.body,
      publishedBy: req.user._id
    });

    await logAction({
      req,
      action: 'ANNOUNCEMENT_CREATE',
      module: 'Announcement',
      targetId: announcement._id,
      description: `Published announcement: "${announcement.title}"`
    });

    res.status(201).json({ success: true, data: announcement });
  } catch (error) {
    next(error);
  }
};

const deleteAnnouncement = async (req, res, next) => {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getAnnouncements,
  createAnnouncement,
  deleteAnnouncement
};
