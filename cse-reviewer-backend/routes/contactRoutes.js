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

// Get all messages (Admin only)
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