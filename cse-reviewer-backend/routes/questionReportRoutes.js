// routes/questionReportRoutes.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { QuestionReport, User } = require('../models');

// Submit a question report (Authenticated users)
router.post('/', protect, async (req, res) => {
  try {
    const { questionId, attemptId, questionText, category, issueType, description } = req.body;

    if (!attemptId || !questionText || !category || !issueType || !description) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const report = await QuestionReport.create({
      questionId,
      attemptId,
      questionText,
      category,
      issueType,
      description,
      userId: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully',
      data: report
    });
  } catch (error) {
    console.error('Error creating question report:', error);
    res.status(500).json({ message: 'Failed to submit report' });
  }
});

// Get all question reports (Admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, issueType, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const where = {};
    if (status) where.status = status;
    if (issueType) where.issueType = issueType;

    const reports = await QuestionReport.findAll({
      where,
      include: [
        { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] }
      ],
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    const total = await QuestionReport.count({ where });

    res.json({
      success: true,
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

// Update report status (Admin only)
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const report = await QuestionReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.status = status;
    if (adminNotes) report.adminNotes = adminNotes;
    
    if (status === 'resolved' || status === 'rejected') {
      report.resolvedBy = req.user.id;
      report.resolvedAt = new Date();
    }

    await report.save();

    res.json({ success: true, message: 'Status updated', data: report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Failed to update status' });
  }
});

// Delete report (Admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const report = await QuestionReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await report.destroy();
    res.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
});

module.exports = router;