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
  Activity,
  sequelize 
} = require('../models');
const Notification = require('../models/Notification');

// Apply auth middleware to all routes
router.use(protect);
router.use(adminOnly);

// routes/admin.js - Updated /stats endpoint
// Add this to your existing admin.js file, replace the existing /stats route

router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.setHours(0, 0, 0, 0));
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // ==================== STATISTICS ====================
    
    // 1. Total Users
    const totalUsers = await User.count();

    // 2. Active Users Today (based on lastActive field)
    const activeUsers = await User.count({
      where: {
        lastActive: {
          [Op.gte]: todayStart
        }
      }
    });

    // 3. Total Questions
    const totalQuestions = await Question.count({ 
      where: { isActive: true } 
    });

    // 4. AI Requests (from User model tracking)
    const aiRequestsResult = await User.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('aiRequestCount')), 'total']
      ],
      raw: true
    });
    const aiRequests = parseInt(aiRequestsResult?.total || 0);

    // 5. Questions Generated (from User model tracking)
    const questionsGeneratedResult = await User.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('questionsGeneratedCount')), 'total']
      ],
      raw: true
    });
    const questionsGenerated = parseInt(questionsGeneratedResult?.total || 0);

    // 6. AI Success Rate
    const aiStatsResult = await User.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('apiSuccessCount')), 'totalSuccess'],
        [sequelize.fn('SUM', sequelize.col('apiFailureCount')), 'totalFailure']
      ],
      raw: true
    });
    
    const totalSuccess = parseInt(aiStatsResult?.totalSuccess || 0);
    const totalFailure = parseInt(aiStatsResult?.totalFailure || 0);
    const totalApiCalls = totalSuccess + totalFailure;
    const successRate = totalApiCalls > 0 
      ? ((totalSuccess / totalApiCalls) * 100).toFixed(1)
      : '0';

    // 7. Growth Calculations
    const lastWeekUsers = await User.count({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });
    const userGrowth = totalUsers > 0 
      ? `+${Math.round((lastWeekUsers / totalUsers) * 100)}%`
      : '+0%';

    const lastWeekQuestions = await Question.count({
      where: {
        createdAt: { [Op.gte]: sevenDaysAgo },
        isActive: true
      }
    });
    const questionGrowth = `+${lastWeekQuestions}`;

    const lastWeekAiRequests = await Activity.count({
      where: {
        type: 'question_generated',
        createdAt: { [Op.gte]: sevenDaysAgo }
      }
    });
    const aiGrowth = `+${lastWeekAiRequests}`;

// ==================== DAILY ACTIVITY ====================

// Get all activities per day for the last 7 days
const dailyActivityRaw = await Activity.findAll({
  where: {
    createdAt: {
      [Op.gte]: sevenDaysAgo
    }
  },
  attributes: [
    [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
  order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
  raw: true
});

console.log('📊 Daily Activity Raw:', dailyActivityRaw); // ✅ Debug log

    // Fill in missing days with 0 count
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existing = dailyActivityRaw.find(d => d.date === dateStr);
      dailyActivity.push({
        date: dateStr,
        count: existing ? parseInt(existing.count) : 0
      });
    }

    // ==================== RECENT ACTIVITY ====================
    
    // Fetch from Activity model
    const recentActivitiesRaw = await Activity.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email', 'avatar']
      }]
    });

    const recentActivity = recentActivitiesRaw.map(activity => ({
      user: activity.user?.name || 'Unknown User',
      action: activity.action,
      icon: getActivityIcon(activity.type),
      color: getActivityColor(activity.type),
      time: getTimeAgo(activity.createdAt),
      timestamp: new Date(activity.createdAt).getTime()
    }));

    // ==================== RESPONSE ====================
    
    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalQuestions,
        aiRequests,
        questionsGenerated,
        successRate,
        userGrowth,
        questionGrowth,
        aiGrowth
      },
      dailyActivity,
      recentActivity
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard stats:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard statistics',
      error: error.message 
    });
  }
});

// ==================== HELPER FUNCTIONS ====================

function getActivityIcon(type) {
  const icons = {
    'user_login': 'fa-sign-in-alt',
    'user_register': 'fa-user-plus',
    'test_started': 'fa-play-circle',
    'test_completed': 'fa-check-circle',
    'question_generated': 'fa-brain',
    'question_answered': 'fa-clipboard-check',
    'achievement_earned': 'fa-trophy',
    'profile_updated': 'fa-user-edit',
    'question_reported': 'fa-flag',
    'custom_test_created': 'fa-plus-circle'
  };
  return icons[type] || 'fa-circle';
}

function getActivityColor(type) {
  const colors = {
    'user_login': '#3b82f6',
    'user_register': '#10b981',
    'test_started': '#f59e0b',
    'test_completed': '#10b981',
    'question_generated': '#8b5cf6',
    'question_answered': '#3b82f6',
    'achievement_earned': '#fbbf24',
    'profile_updated': '#6366f1',
    'question_reported': '#ef4444',
    'custom_test_created': '#8b5cf6'
  };
  return colors[type] || '#6b7280';
}

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