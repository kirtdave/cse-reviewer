const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { Notification, UserNotification, User } = require('../models');
const { Op } = require('sequelize');

// Apply auth middleware to all routes
router.use(protect);

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { unreadOnly = false } = req.query;

    // Find all published notifications
    const publishedNotifications = await Notification.findAll({
      where: {
        status: 'Published',
        publishedDate: { [Op.lte]: new Date() }
      },
      order: [['publishedDate', 'DESC']],
      limit: 50
    });

    // Track that this user has viewed the notification list
    const notificationIds = publishedNotifications.map(n => n.id);
    
    if (notificationIds.length > 0) {
      const existingViews = await UserNotification.findAll({
        where: {
          userId,
          notificationId: { [Op.in]: notificationIds },
          hasViewed: true
        },
        attributes: ['notificationId']
      });

      const viewedIds = existingViews.map(v => v.notificationId);
      const newViewIds = notificationIds.filter(id => !viewedIds.includes(id));

      // Mark as viewed and increment view count for new views
      if (newViewIds.length > 0) {
        // Increment view count on notifications
        await Notification.increment('views', {
          by: 1,
          where: { id: { [Op.in]: newViewIds } }
        });

        // Update or create UserNotification records with hasViewed flag
        const userNotifRecords = await UserNotification.findAll({
          where: {
            userId,
            notificationId: { [Op.in]: newViewIds }
          }
        });

        const existingRecordIds = userNotifRecords.map(r => r.notificationId);

        // Update existing records
        if (existingRecordIds.length > 0) {
          await UserNotification.update(
            { hasViewed: true },
            {
              where: {
                userId,
                notificationId: { [Op.in]: existingRecordIds }
              }
            }
          );
        }

        // Create new records for notifications without existing records
        const newRecordIds = newViewIds.filter(id => !existingRecordIds.includes(id));
        if (newRecordIds.length > 0) {
          await UserNotification.bulkCreate(
            newRecordIds.map(notificationId => ({
              userId,
              notificationId,
              isRead: false,
              isDismissed: false,
              hasViewed: true
            }))
          );
        }

        // Refresh notifications to get updated view counts
        await Promise.all(
          publishedNotifications
            .filter(n => newViewIds.includes(n.id))
            .map(n => n.reload())
        );
      }
    }

    // Get user's status for these notifications
    const userNotifications = await UserNotification.findAll({
      where: {
        userId,
        notificationId: {
          [Op.in]: notificationIds
        }
      }
    });

    // Create a map of notification ID -> user status
    const statusMap = new Map();
    userNotifications.forEach(un => {
      statusMap.set(un.notificationId, {
        isRead: un.isRead,
        readAt: un.readAt,
        isDismissed: un.isDismissed
      });
    });

    // Format notifications, excluding dismissed ones
    let notifications = publishedNotifications
      .filter(notif => {
        const status = statusMap.get(notif.id);
        return !status || !status.isDismissed; // Exclude dismissed notifications
      })
      .map(notif => {
        const status = statusMap.get(notif.id) || { isRead: false, readAt: null };
        
        return {
          id: notif.id,
          title: notif.title,
          message: notif.message,
          type: notif.type,
          unread: !status.isRead,
          time: getTimeAgo(notif.publishedDate),
          publishedDate: notif.publishedDate,
          readAt: status.readAt
        };
      });

    // Filter for unread only if requested
    if (unreadOnly === 'true' || unreadOnly === true) {
      notifications = notifications.filter(n => n.unread);
    }

    res.json({
      success: true,
      notifications,
      unreadCount: notifications.filter(n => n.unread).length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching notifications', 
      error: error.message 
    });
  }
});

// @desc    Get unread count
// @route   GET /api/notifications/unread-count
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all published notifications
    const publishedNotifications = await Notification.findAll({
      where: {
        status: 'Published',
        publishedDate: { [Op.lte]: new Date() }
      },
      attributes: ['id']
    });

    const notificationIds = publishedNotifications.map(n => n.id);

    // Get user notification records
    const userNotifications = await UserNotification.findAll({
      where: {
        userId,
        notificationId: { [Op.in]: notificationIds }
      },
      attributes: ['notificationId', 'isRead', 'isDismissed']
    });

    // Create a map for quick lookup
    const statusMap = new Map();
    userNotifications.forEach(un => {
      statusMap.set(un.notificationId, {
        isRead: un.isRead,
        isDismissed: un.isDismissed
      });
    });

    // Count unread notifications (excluding dismissed ones)
    const unreadCount = notificationIds.filter(id => {
      const status = statusMap.get(id);
      if (!status) return true; // New notification = unread
      return !status.isRead && !status.isDismissed;
    }).length;

    res.json({
      success: true,
      unreadCount: Math.max(0, unreadCount)
    });

  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error getting unread count', 
      error: error.message 
    });
  }
});

// @desc    Mark all notifications as read
// @route   POST /api/notifications/read-all
// @access  Private
router.post('/read-all', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all published notifications
    const publishedNotifications = await Notification.findAll({
      where: {
        status: 'Published',
        publishedDate: { [Op.lte]: new Date() }
      },
      attributes: ['id']
    });

    const notificationIds = publishedNotifications.map(n => n.id);

    // Get existing user notification records
    const existingRecords = await UserNotification.findAll({
      where: {
        userId,
        notificationId: { [Op.in]: notificationIds }
      }
    });

    const existingIds = existingRecords.map(r => r.notificationId);

    // Update existing records (only those not dismissed)
    await UserNotification.update(
      { isRead: true, readAt: new Date() },
      {
        where: {
          userId,
          notificationId: { [Op.in]: existingIds },
          isRead: false,
          isDismissed: false
        }
      }
    );

    // Create records for notifications that don't have a user notification yet
    const newIds = notificationIds.filter(id => !existingIds.includes(id));
    if (newIds.length > 0) {
      await UserNotification.bulkCreate(
        newIds.map(notificationId => ({
          userId,
          notificationId,
          isRead: true,
          readAt: new Date(),
          isDismissed: false,
          hasViewed: true
        }))
      );
    }

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });

  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking all as read', 
      error: error.message 
    });
  }
});

// @desc    Dismiss/delete notification for user
// @route   DELETE /api/notifications/:id/dismiss
// @access  Private
router.delete('/:id/dismiss', async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // Check if notification exists
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    // Find or create user notification record
    let userNotification = await UserNotification.findOne({
      where: { userId, notificationId }
    });

    if (userNotification) {
      // Update existing record to mark as dismissed
      userNotification.isDismissed = true;
      userNotification.isRead = true;
      userNotification.readAt = userNotification.readAt || new Date();
      await userNotification.save();
    } else {
      // Create new record marked as dismissed
      await UserNotification.create({
        userId,
        notificationId,
        isRead: true,
        readAt: new Date(),
        isDismissed: true,
        hasViewed: true
      });
    }

    res.json({
      success: true,
      message: 'Notification dismissed'
    });

  } catch (error) {
    console.error('Error dismissing notification:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error dismissing notification', 
      error: error.message 
    });
  }
});

// @desc    Mark notification as read
// @route   POST /api/notifications/:id/read
// @access  Private
router.post('/:id/read', async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // Check if notification exists
    const notification = await Notification.findByPk(notificationId);
    if (!notification) {
      return res.status(404).json({ 
        success: false,
        message: 'Notification not found' 
      });
    }

    // Find or create user notification record
    let userNotification = await UserNotification.findOne({
      where: { userId, notificationId }
    });

    if (userNotification) {
      // Update existing record
      userNotification.isRead = true;
      userNotification.readAt = new Date();
      await userNotification.save();
    } else {
      // Create new record
      userNotification = await UserNotification.create({
        userId,
        notificationId,
        isRead: true,
        readAt: new Date(),
        isDismissed: false,
        hasViewed: true
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read'
    });

  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking notification as read', 
      error: error.message 
    });
  }
});

// Helper function
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  return 'Just now';
}

module.exports = router;