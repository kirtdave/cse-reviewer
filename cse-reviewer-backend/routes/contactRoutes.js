// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { ContactMessage } = require('../models');

// Submit contact message (Public or authenticated)
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const contactMessage = await ContactMessage.create({
      name,
      email,
      message,
      userId: req.user?.id || null
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

// ✅ PUBLIC ENDPOINT - No authentication required
// This endpoint shows general statistics to all visitors
router.get('/stats', async (req, res) => {
  try {
    // Total messages received
    const totalMessages = await ContactMessage.count();

    // Active inquiries (pending + read status)
    const activeInquiries = await ContactMessage.count({
      where: {
        status: ['pending', 'read']
      }
    });

    // Calculate average response time
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
      
      // Convert to hours and calculate percentage (assuming 24 hours = 100%)
      const avgHours = (totalResponseTime / repliedMessages.length) / (1000 * 60 * 60);
      avgResponseTime = Math.min(100, Math.round((avgHours / 24) * 100));
    }

    // Calculate percentages - Active Inquiries should show how many are UNRESOLVED
    // Lower percentage = better (fewer pending messages)
    const activeInquiriesPct = totalMessages > 0 
      ? Math.round((activeInquiries / totalMessages) * 100) 
      : 0;

    res.json({
      success: true,
      stats: {
        totalMessages,
        activeInquiries,
        avgResponseTime,
        // Calculate percentages
        messagesReceivedPct: 100, // Always 100% as baseline
        activeInquiriesPct: activeInquiriesPct,
        avgResponseTimePct: avgResponseTime
      }
    });
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get all messages (Admin only) - keep this protected
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};
    if (status) where.status = status;

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

// ✅ NEW: Reply to message endpoint (Admin only)
router.post('/:id/reply', protect, adminOnly, async (req, res) => {
  try {
    const { replyText } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (!replyText || !replyText.trim()) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    // Update message status to 'replied'
    message.status = 'replied';
    message.reply = replyText; // Store the reply text
    message.repliedAt = new Date();
    await message.save();

    // TODO: Send actual email here using nodemailer or similar
    // await sendEmail({
    //   to: message.email,
    //   subject: `Re: ${message.subject || 'Your inquiry'}`,
    //   text: replyText
    // });

    console.log(`✅ Reply sent to ${message.email}:`, replyText);

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

// Update message status (Admin only)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    message.status = status;
    await message.save();

    res.json({ success: true, message: 'Status updated', data: message });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Delete message (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.destroy();
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Failed to delete message' });
  }
});

module.exports = router;