const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Activity = sequelize.define('Activity', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  type: {
    type: DataTypes.ENUM(
      'user_login',
      'user_register',
      'test_started',
      'test_completed',
      'question_generated',
      'question_answered',
      'achievement_earned',
      'profile_updated',
      'question_reported',
      'custom_test_created'
    ),
    allowNull: false
  },
  action: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Additional data like testId, score, questionId, etc.'
  },
  ipAddress: {
    type: DataTypes.STRING(50),
    allowNull: true
  }
}, {
  tableName: 'Activities',
  timestamps: true,
  indexes: [
    // ✅ FIXED: Composite for common query
    { fields: ['userId', 'type', 'createdAt'] },
    { fields: ['type', 'createdAt'] },
    { fields: ['createdAt'] }
  ]
});

Activity.logActivity = async function(userId, type, action, metadata = null, ipAddress = null) {
  try {
    await this.create({ userId, type, action, metadata, ipAddress });
    console.log(`📝 Activity logged: ${action} (User: ${userId})`);
  } catch (error) {
    console.error('Error logging activity:', error.message);
  }
};

Activity.getRecent = async function(limit = 10, types = null) {
  const where = {};
  if (types && Array.isArray(types)) where.type = types;
  return await this.findAll({
    where, limit,
    order: [['createdAt', 'DESC']],
    include: [{ model: require('./User'), as: 'user', attributes: ['id', 'name', 'email', 'avatar'] }]
  });
};

Activity.getActivityByDateRange = async function(startDate, endDate) {
  const { Op } = require('sequelize');
  return await this.findAll({
    where: { createdAt: { [Op.between]: [startDate, endDate] } },
    attributes: [
      [sequelize.fn('DATE', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: [sequelize.fn('DATE', sequelize.col('createdAt'))],
    order: [[sequelize.fn('DATE', sequelize.col('createdAt')), 'ASC']],
    raw: true
  });
};

Activity.getUserActivities = async function(userId, limit = 20) {
  return await this.findAll({
    where: { userId }, limit,
    order: [['createdAt', 'DESC']]
  });
};

module.exports = Activity;