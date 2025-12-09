const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { QuestionReport, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Submit a question report (Authenticated users)
router.post('/', protect, async (req, res) => {
  try {
    const { questionId, attemptId, questionText, category, issueType, description } = req.body;

    // ✅ FIXED: Added 'questionId' to the required fields check
    if (!questionId || !attemptId || !questionText || !category || !issueType || !description) {
      return res.status(400).json({ message: 'All fields (including Question ID) are required' });
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
    if (status && status !== 'All') where.status = status;
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

// ✅ Update report status with AUTO-NOTIFICATION
router.patch('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    // Fetch report AND the reporter details
    const report = await QuestionReport.findByPk(req.params.id, {
      include: [{ model: User, as: 'reporter' }]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const oldStatus = report.status;
    report.status = status; // Save the status as sent (likely lowercase)
    
    if (adminNotes) report.adminNotes = adminNotes;
    
    // Check for both 'Resolved' and 'resolved'
    if (status.toLowerCase() === 'resolved' || status.toLowerCase() === 'rejected') {
      report.resolvedBy = req.user.id;
      report.resolvedAt = new Date();
    }

    await report.save();

    let notificationSent = false;

    // Robust User ID detection
    const targetUserId = report.userId || (report.reporter ? report.reporter.id : null);

    console.log(`🔍 [DEBUG] Processing Report #${report.id}. Input Status: "${status}". Target UserID: ${targetUserId}`);

    // Check status change
    const isResolvedNow = status.toLowerCase() === 'resolved';
    const wasNotResolved = oldStatus ? oldStatus.toLowerCase() !== 'resolved' : true;

    if (isResolvedNow && wasNotResolved) {
      if (targetUserId) {
        try {
          // ✅ FIXED: Better Message Logic
          // If ID is missing, we use a snippet of the question text instead of "N/A"
          const questionRef = report.questionId 
            ? `(ID: ${report.questionId})` 
            : `"${report.questionText ? report.questionText.substring(0, 20) + '...' : 'Question'}"`;

          const newNotif = await Notification.create({
            userId: targetUserId,
            title: '✅ Your Question Report Has Been Resolved',
            // Example: "Great news! The question you reported (ID: 105) has been resolved."
            // OR: "Great news! The question you reported "What is 2+2..." has been resolved."
            message: `Great news! The question you reported ${questionRef} in "${report.category}" has been resolved.`,
            type: 'Update',
            status: 'Published',
            recipients: 'Specific User',
            publishedDate: new Date(),
            isRead: false,
            createdBy: req.user.id
          });

          console.log(`✅ [SUCCESS] Notification Created! ID: ${newNotif.id} | For User: ${targetUserId}`);
          notificationSent = true;
        } catch (notifError) {
          console.error('❌ [ERROR] Failed to create notification:', notifError);
        }
      } else {
        console.warn('⚠️ [WARNING] Cannot send notification: No User ID found for this report.');
      }
    }

    // Check "In Review" status
    const isInReviewNow = status.toLowerCase() === 'in review';
    const wasPending = oldStatus ? oldStatus.toLowerCase() === 'pending' : false;

    if (isInReviewNow && wasPending) {
      if (targetUserId) {
        try {
           // ✅ FIXED: Better Message Logic here too
           const questionRef = report.questionId 
            ? `(ID: ${report.questionId})` 
            : `"${report.questionText ? report.questionText.substring(0, 20) + '...' : 'Question'}"`;

          await Notification.create({
            userId: targetUserId,
            title: '👀 Your Report Is Being Reviewed',
            message: `We're currently reviewing your report about question ${questionRef}.`,
            type: 'Reminder',
            status: 'Published',
            recipients: 'Specific User',
            publishedDate: new Date(),
            isRead: false,
            createdBy: req.user.id
          });
          notificationSent = true;
        } catch (notifError) {
          console.error('⚠️ Failed to send review notification:', notifError);
        }
      }
    }

    res.json({ 
      success: true, 
      message: 'Status updated successfully',
      data: report,
      notificationSent
    });

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