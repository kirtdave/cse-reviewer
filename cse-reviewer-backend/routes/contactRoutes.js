// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const jwt = require('jsonwebtoken'); // ✅ Added to extract ID manually
const { protect, adminOnly } = require('../middleware/auth');
const { ContactMessage, Notification } = require('../models');

// ==================== SUBMIT MESSAGE ====================

// Submit contact message (Hybrid: Works for Guests AND Logged-in Users)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    let userId = null;

    // ✅ FIX: Manually check for token to link the User ID
    // We don't use 'protect' middleware here because we want to allow Guests too.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
        console.log(`👤 Linked contact message to User ID: ${userId}`);
      } catch (err) {
        console.log("ℹ️ Contact message submitted as Guest (No valid token)");
      }
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      message,
      userId: userId, // ✅ Now this will be populated if logged in
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: contactMessage
    });
  } catch (error) {
    console.error('Error creating contact message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
});

// ==================== ANALYTICS ====================

router.get('/stats', async (req, res) => {
  try {
    const totalMessages = await ContactMessage.count();

    const activeInquiries = await ContactMessage.count({
      where: {
        status: { [Op.in]: ['pending', 'read'] }
      }
    });

    const repliedMessages = await ContactMessage.findAll({
      where: { status: 'replied' },
      attributes: ['createdAt', 'updatedAt']
    });

    let avgResponseTime = 0;
    if (repliedMessages.length > 0) {
      const totalResponseTime = repliedMessages.reduce((sum, msg) => {
        const responseTime = new Date(msg.updatedAt) - new Date(msg.createdAt);
        return sum + responseTime;
      }, 0);
      
      const avgHours = (totalResponseTime / repliedMessages.length) / (1000 * 60 * 60);
      avgResponseTime = Math.min(100, Math.round((avgHours / 24) * 100));
    }

    const activeInquiriesPct = totalMessages > 0 
      ? Math.round((activeInquiries / totalMessages) * 100) 
      : 0;

    res.json({
      success: true,
      stats: {
        totalMessages,
        activeInquiries,
        avgResponseTime,
        messagesReceivedPct: 100,
        activeInquiriesPct: activeInquiriesPct,
        avgResponseTimePct: avgResponseTime
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// ==================== ADMIN ACTIONS ====================

// Get all messages
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};
    if (status && status !== 'All') {
        // Map frontend "Unread" -> DB "pending"
        const statusMap = { 'Unread': 'pending', 'Read': 'read', 'Replied': 'replied' };
        where.status = statusMap[status] || status.toLowerCase();
    }

    const messages = await ContactMessage.findAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await ContactMessage.count({ where });

    res.json({
      success: true,
      messages,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// ✅ REPLY TO MESSAGE & NOTIFY
router.post('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { replyText } = req.body;
    const messageId = req.params.id;

    const message = await ContactMessage.findByPk(messageId);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    // 1. Update status
    message.status = 'replied';
    message.adminReply = replyText; // Make sure your DB has this column or uses 'reply'
    message.repliedAt = new Date();
    await message.save();

    console.log(`✅ Reply saved for message #${messageId}`);

    // 2. ✅ CREATE NOTIFICATION
    if (message.userId) {
      await Notification.create({
        userId: message.userId,
        title: '📩 New Reply from Admin',
        message: `Admin replied: "${replyText.substring(0, 60)}${replyText.length > 60 ? '...' : ''}"`,
        type: 'Update',
        status: 'Published',
        recipients: 'Specific User',
        publishedDate: new Date(),
        isRead: false,
        createdBy: req.user.id
      });
      console.log(`🔔 Notification sent to User ID ${message.userId}`);
    } else {
      console.log(`⚠️ Message #${messageId} has no linked userId. No notification sent.`);
    }

    res.json({ 
      success: true, 
      message: 'Reply sent and message marked as replied',
      data: message 
    });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Failed to send reply' });
  }
});

// Update status
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) return res.status(404).json({ message: 'Message not found' });

    message.status = status;
    await message.save();

    res.json({ success: true, message: 'Status updated', data: message });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Delete message
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    await message.destroy();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

module.exports = router;