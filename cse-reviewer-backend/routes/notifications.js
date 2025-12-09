const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Notification, UserNotification } = require('../models');
const { Op } = require('sequelize');

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get user's notifications
// @route   GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false } = req.query;

    console.log(`🔔 [DEBUG] Fetching notifications for User ID: ${userId}`);

    const publishedNotifications = await Notification.findAll({
      where: {
        status: 'Published',
        [Op.or]: [
          { recipients: 'All Users' },      // Global Announcements
          { userId: userId }                // Private Messages
        ]
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    console.log(`🔔 [DEBUG] Found ${publishedNotifications.length} notifications in DB matching query.`);

    if (publishedNotifications.length === 0) {
      return res.json({ success: true, notifications: [], unreadCount: 0 });
    }

    // --- Tracking Logic ---
    const notificationIds = publishedNotifications.map(n => n.id);
    
    // Create view records if missing
    const existingViews = await UserNotification.findAll({
      where: { userId, notificationId: { [Op.in]: notificationIds }, hasViewed: true },
      attributes: ['notificationId']
    });
    const viewedIds = existingViews.map(v => v.notificationId);
    const newViewIds = notificationIds.filter(id => !viewedIds.includes(id));

    if (newViewIds.length > 0) {
      await Notification.increment('views', { by: 1, where: { id: { [Op.in]: newViewIds } } });
      try {
         await UserNotification.bulkCreate(
           newViewIds.map(notificationId => ({
             userId, notificationId, isRead: false, isDismissed: false, hasViewed: true
           })), 
           { ignoreDuplicates: true }
         );
      } catch (err) { console.log("⚠️ Minor error creating view records:", err.message); }
    }

    // --- Get Status (Read/Dismissed) ---
    const userNotifications = await UserNotification.findAll({
      where: { userId, notificationId: { [Op.in]: notificationIds } }
    });

    const statusMap = new Map();
    userNotifications.forEach(un => {
      statusMap.set(un.notificationId, { isRead: un.isRead, isDismissed: un.isDismissed, readAt: un.readAt });
    });

    // --- Format Response ---
    let notifications = publishedNotifications
      .filter(notif => {
        const status = statusMap.get(notif.id);
        // HIDE if dismissed
        if (status && status.isDismissed) return false;
        return true;
      })
      .map(notif => {
        const status = statusMap.get(notif.id) || { isRead: false, readAt: null };
        return {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          unread: !status.isRead,
          time: getTimeAgo(notif.createdAt),
          publishedDate: notif.publishedDate || notif.createdAt,
          readAt: status.readAt
        };
      });

    if (unreadOnly === 'true') {
      notifications = notifications.filter(n => n.unread);
    }

    console.log(`🔔 [DEBUG] Sending ${notifications.length} notifications to frontend.`);
    res.json({ success: true, notifications, unreadCount: notifications.filter(n => n.unread).length });

  } catch (error) {
    console.error('❌ [ERROR] Fetching notifications:', error);
    res.status(500).json({ success: false, message: 'Error fetching notifications' });
  }
});

// @desc    Get unread count
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;
    const publishedNotifications = await Notification.findAll({
      where: { status: 'Published', [Op.or]: [{ recipients: 'All Users' }, { userId: userId }] },
      attributes: ['id']
    });

    const notificationIds = publishedNotifications.map(n => n.id);
    const userNotifications = await UserNotification.findAll({
      where: { userId, notificationId: { [Op.in]: notificationIds } },
      attributes: ['notificationId', 'isRead', 'isDismissed']
    });

    const statusMap = new Map();
    userNotifications.forEach(un => statusMap.set(un.notificationId, { isRead: un.isRead, isDismissed: un.isDismissed }));

    const unreadCount = notificationIds.filter(id => {
      const status = statusMap.get(id);
      if (!status) return true;
      return !status.isRead && !status.isDismissed;
    }).length;

    res.json({ success: true, unreadCount: Math.max(0, unreadCount) });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// @desc    Mark all as read
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user.id;
    // Simple update for all user records
    await UserNotification.update({ isRead: true, readAt: new Date() }, { where: { userId, isRead: false } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// @desc    Mark single as read
router.post('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    let userNotification = await UserNotification.findOne({ where: { userId, notificationId } });
    if (userNotification) {
      userNotification.isRead = true;
      userNotification.readAt = new Date();
      await userNotification.save();
    } else {
      await UserNotification.create({
        userId, notificationId, isRead: true, readAt: new Date(), isDismissed: false, hasViewed: true
      });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// ✅✅✅ THIS IS THE MISSING ROUTE CAUSING 404 ✅✅✅
// @desc    Dismiss notification
router.delete('/:id/dismiss', async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;
    
    console.log(`🗑️ [DEBUG] Request to dismiss notification #${notificationId} for user ${userId}`);

    // Check if notification exists (optional, but good for safety)
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
        console.log(`⚠️ Notification #${notificationId} not found in DB`);
        return res.status(404).json({ success: false, message: 'Not found' });
    }

    let userNotification = await UserNotification.findOne({ where: { userId, notificationId } });

    if (userNotification) {
      userNotification.isDismissed = true;
      userNotification.isRead = true; // Dismissing implies reading
      await userNotification.save();
      console.log(`✅ Notification #${notificationId} marked as dismissed.`);
    } else {
      // If no record exists yet, create one that is immediately dismissed
      await UserNotification.create({
        userId, 
        notificationId, 
        isRead: true, 
        isDismissed: true, 
        hasViewed: true
      });
      console.log(`✅ Created new dismissed record for #${notificationId}.`);
    }

    res.json({ success: true, message: 'Dismissed' });
  } catch (error) {
    console.error('❌ Error dismissing notification:', error);
    res.status(500).json({ success: false });
  }
});

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = { year: 31536000, month: 2592000, week: 604800, day: 86400, hour: 3600, minute: 60 };
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
  }
  return 'Just now';
}

module.exports = router;