// routes/admin.js
const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { Op } = require('sequelize');
const { 
  User, 
  Question, 
  TestAttempt, 
  QuestionReport, 
  ContactMessage,
  sequelize 
} = require('../models');
const Notification = require('../models/Notification');

// Apply auth middleware to all routes
router.use(protect);
router.use(adminOnly);

// ==================== DASHBOARD STATS ====================
router.get('/stats', async (req, res) => {
  try {
    // Total users
    const totalUsers = await User.count();
    const activeUsers = await User.count({
      where: {
        lastActive: {
          [Op.gte]: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    });

    // Total questions
    const totalQuestions = await Question.count({ where: { isActive: true } });

    // AI Requests
    const aiRequests = await Question.sum('usageCount', {
      where: { source: 'AI', isActive: true }
    }) || 0;

    // Recent activity - with timestamps for proper sorting
    const recentTests = await TestAttempt.findAll({
      limit: 4,
      order: [['completedAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name']
      }]
    });

    const recentReports = await QuestionReport.findAll({
      limit: 2,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['name']
      }]
    });

    const recentMessages = await ContactMessage.findAll({
      limit: 2,
      order: [['createdAt', 'DESC']]
    });

    // Combine all activities with timestamps
    const allActivities = [
      ...recentTests.map(test => ({
        user: test.user?.name || 'Unknown User',
        action: `Completed ${test.name}`,
        time: getTimeAgo(test.completedAt),
        timestamp: new Date(test.completedAt).getTime(),
        icon: 'fa-check-circle',
        color: '#10b981'
      })),
      ...recentReports.map(report => ({
        user: report.reporter?.name || 'Unknown User',
        action: 'Reported question error',
        time: getTimeAgo(report.createdAt),
        timestamp: new Date(report.createdAt).getTime(),
        icon: 'fa-exclamation-circle',
        color: '#f59e0b'
      })),
      ...recentMessages.map(msg => ({
        user: msg.name,
        action: 'Sent message to admin',
        time: getTimeAgo(msg.createdAt),
        timestamp: new Date(msg.createdAt).getTime(),
        icon: 'fa-envelope',
        color: '#3b82f6'
      }))
    ];

    // ✅ Sort by timestamp (most recent first) and take top 4
    const recentActivity = allActivities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 4)
      .map(({ timestamp, ...rest }) => rest);

    // User activity for last 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyActivity = await TestAttempt.findAll({
      where: {
        completedAt: { [Op.gte]: sevenDaysAgo }
      },
      attributes: [
        [sequelize.fn('DATE', sequelize.col('completedAt')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: [sequelize.fn('DATE', sequelize.col('completedAt'))],
      order: [[sequelize.fn('DATE', sequelize.col('completedAt')), 'ASC']]
    });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalQuestions,
        aiRequests
      },
      recentActivity,
      dailyActivity: dailyActivity.map(day => ({
        date: day.get('date'),
        count: parseInt(day.get('count'))
      }))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard stats', error: error.message });
  }
});

// ==================== USER MONITORING ====================
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      status = 'All' 
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status !== 'All') {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      if (status === 'Active') {
        where.lastActive = { [Op.gte]: oneDayAgo };
      } else {
        where.lastActive = { [Op.lt]: oneDayAgo };
      }
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastActive', 'DESC']],
      attributes: { exclude: ['password'] }
    });

    // ✅ Calculate accurate per-user stats with avatar
    const usersWithStats = users.map(user => {
      const totalRequests = (user.apiSuccessCount || 0) + (user.apiFailureCount || 0);
      const successRate = totalRequests > 0 
        ? ((user.apiSuccessCount / totalRequests) * 100).toFixed(1)
        : 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar, // ✅ Include avatar
        role: user.role,
        status: isUserActive(user.lastActive) ? 'Active' : 'Inactive',
        testsCompleted: user.testsCompleted || 0,
        avgScore: Math.round(user.avgScore || 0),
        lastActive: getTimeAgo(user.lastActive),
        joinDate: formatDate(user.createdAt),
        aiRequests: user.aiRequestCount || 0,
        questionsGenerated: user.questionsGeneratedCount || 0,
        apiSuccessRate: parseFloat(successRate)
      };
    });

    res.json({
      users: usersWithStats,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// ✅ GET SINGLE USER WITH AVATAR
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: { exclude: ['password'] },
      include: [{
        model: TestAttempt,
        as: 'testAttempts',
        limit: 5,
        order: [['completedAt', 'DESC']]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate AI stats
    const totalRequests = (user.apiSuccessCount || 0) + (user.apiFailureCount || 0);
    const successRate = totalRequests > 0 
      ? ((user.apiSuccessCount / totalRequests) * 100).toFixed(1)
      : 0;

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar, // ✅ Include avatar
      role: user.role,
      status: isUserActive(user.lastActive) ? 'Active' : 'Inactive',
      testsCompleted: user.testsCompleted || 0,
      avgScore: Math.round(user.avgScore || 0),
      lastActive: getTimeAgo(user.lastActive),
      joinDate: formatDate(user.createdAt),
      aiRequests: user.aiRequestCount || 0,
      questionsGenerated: user.questionsGeneratedCount || 0,
      apiSuccessRate: parseFloat(successRate)
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user', error: error.message });
  }
});

// ==================== QUESTION BANK ====================
router.get('/questions', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category = 'All',
      difficulty = 'All'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { isActive: true };

    if (search) {
      where.questionText = { [Op.like]: `%${search}%` };
    }

    if (category !== 'All') {
      where.category = category;
    }

    if (difficulty !== 'All') {
      where.difficulty = difficulty;
    }

    const { count, rows: questions } = await Question.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      questions,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
});

router.post('/questions', async (req, res) => {
  try {
    const { question, options, correctAnswer, category, difficulty, explanation } = req.body;

    if (!question || !options || !correctAnswer || !category || !difficulty || !explanation) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: 'Must provide exactly 4 options' });
    }

    const newQuestion = await Question.create({
      questionText: question,
      options,
      correctAnswer: ['A', 'B', 'C', 'D'][correctAnswer],
      category,
      difficulty,
      explanation,
      source: 'Admin'
    });

    res.status(201).json({ 
      message: 'Question created successfully', 
      question: newQuestion 
    });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ message: 'Error creating question', error: error.message });
  }
});

router.put('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const { question: questionText, options, correctAnswer, category, difficulty, explanation } = req.body;

    await question.update({
      questionText,
      options,
      correctAnswer: ['A', 'B', 'C', 'D'][correctAnswer],
      category,
      difficulty,
      explanation
    });

    res.json({ 
      message: 'Question updated successfully', 
      question 
    });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
});

router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.update({ isActive: false });

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
});

// ==================== QUESTION REPORTS ====================
router.get('/reports', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'All',
      priority = 'All'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status !== 'All') {
      where.status = status.toLowerCase();
    }

    const { count, rows: reports } = await QuestionReport.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'reporter',
        attributes: ['name', 'email']
      }]
    });

    const reportsWithPriority = reports.map(report => ({
      id: report.id,
      questionId: report.questionId || `Q-${report.id}`,
      questionText: report.questionText,
      reportedBy: report.reporter?.name || 'Unknown',
      reportType: formatIssueType(report.issueType),
      description: report.description,
      status: capitalizeFirst(report.status),
      priority: getPriorityFromIssueType(report.issueType),
      submittedDate: getTimeAgo(report.createdAt),
      category: report.category
    }));

    res.json({
      reports: reportsWithPriority,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
});

router.put('/reports/:id', async (req, res) => {
  try {
    const report = await QuestionReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const { status } = req.body;
    await report.update({ 
      status: status.toLowerCase(),
      resolvedBy: status === 'Resolved' ? req.user.id : null,
      resolvedAt: status === 'Resolved' ? new Date() : null
    });

    res.json({ 
      message: 'Report updated successfully', 
      report 
    });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ message: 'Error updating report', error: error.message });
  }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const report = await QuestionReport.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    await report.destroy();
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report:', error: error.message });
  }
});

// ==================== MESSAGES ====================
router.get('/messages', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status = 'All',
      priority = 'All'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = {};

    if (status !== 'All') {
      where.status = status === 'Unread' ? 'pending' : 'read';
    }

    const { count, rows: messages } = await ContactMessage.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email'],
        required: false
      }]
    });

    const messagesFormatted = messages.map(msg => ({
      id: msg.id,
      sender: msg.user?.name || msg.name,
      email: msg.user?.email || msg.email,
      subject: `Message from ${msg.name}`,
      message: msg.message,
      status: msg.status === 'pending' ? 'Unread' : 'Read',
      priority: 'Normal',
      receivedDate: getTimeAgo(msg.createdAt),
      avatar: (msg.user?.name || msg.name).charAt(0).toUpperCase()
    }));

    res.json({
      messages: messagesFormatted,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

router.put('/messages/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ status: 'read' });
    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'Error updating message', error: error.message });
  }
});

router.delete('/messages/:id', async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.destroy();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

router.post('/messages/:id/reply', async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    const { reply } = req.body;

    await message.update({ status: 'replied' });

    console.log(`Reply sent to ${message.email}: ${reply}`);

    res.json({ message: 'Reply sent successfully' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ message: 'Error sending reply', error: error.message });
  }
});

// ==================== NOTIFICATIONS ====================
router.get('/notifications', async (req, res) => {
  try {
    const { status = 'All', type = 'All' } = req.query;

    const { notifications, total } = await Notification.getAll({
      status: status !== 'All' ? status : undefined,
      type: type !== 'All' ? type : undefined
    });

    res.json({ notifications, total });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

router.post('/notifications', async (req, res) => {
  try {
    const { title, message, type, status, recipients } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type,
      status,
      recipients,
      createdBy: req.user.id,
      publishedDate: status === 'Published' ? new Date() : null
    });

    res.status(201).json({ 
      message: 'Notification created successfully', 
      notification 
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Error creating notification', error: error.message });
  }
});

router.put('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const { title, message, type, status, recipients } = req.body;

    await notification.update({
      title,
      message,
      type,
      status,
      recipients,
      publishedDate: status === 'Published' && !notification.publishedDate ? new Date() : notification.publishedDate
    });

    res.json({ 
      message: 'Notification updated successfully', 
      notification 
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.destroy();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Error deleting notification', error: error.message });
  }
});

router.post('/notifications/:id/publish', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    await notification.publish();
    res.json({ 
      message: 'Notification published successfully', 
      notification 
    });
  } catch (error) {
    console.error('Error publishing notification:', error);
    res.status(500).json({ message: 'Error publishing notification', error: error.message });
  }
});

// ==================== HELPER FUNCTIONS ====================
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

function isUserActive(lastActive) {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  return new Date(lastActive) >= oneDayAgo;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function formatIssueType(type) {
  const map = {
    'wrong_answer': 'Incorrect Answer',
    'typo': 'Typo Error',
    'unclear': 'Unclear Wording',
    'duplicate': 'Duplicate Question',
    'outdated': 'Outdated Content',
    'other': 'Other'
  };
  return map[type] || type;
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPriorityFromIssueType(type) {
  const highPriority = ['wrong_answer', 'outdated'];
  const mediumPriority = ['typo', 'unclear'];
  
  if (highPriority.includes(type)) return 'High';
  if (mediumPriority.includes(type)) return 'Medium';
  return 'Low';
}

module.exports = router;