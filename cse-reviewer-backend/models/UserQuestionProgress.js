// models/UserQuestionProgress.js
const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

const UserQuestionProgress = sequelize.define('UserQuestionProgress', {
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
    }
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'id'
    }
  },
  correctStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('needs-review', 'learning', 'mastered'),
    defaultValue: 'needs-review'
  },
  totalAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  correctAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastAnsweredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  masteredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastUsedInTest: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    // ✅ FIXED: Better composite indexes
    { fields: ['userId', 'questionId'], unique: true, name: 'unique_user_question' },
    { fields: ['userId', 'status', 'lastAnsweredAt'] },
    { fields: ['userId', 'lastUsedInTest'] },
    { fields: ['userId', 'correctStreak'] }
  ]
});

// Instance method to record answer
UserQuestionProgress.prototype.recordAnswer = async function(isCorrect) {
  this.totalAttempts += 1;
  this.lastAnsweredAt = new Date();
  
  if (isCorrect) {
    this.correctAttempts += 1;
    this.correctStreak += 1;
    
    if (this.correctStreak >= 3 && this.status !== 'mastered') {
      this.status = 'mastered';
      this.masteredAt = new Date();
    } else if (this.correctStreak >= 1 && this.status === 'needs-review') {
      this.status = 'learning';
    }
  } else {
    this.correctStreak = 0;
    
    if (this.status === 'mastered') {
      this.status = 'learning';
      this.masteredAt = null;
    } else if (this.status === 'learning') {
      this.status = 'needs-review';
    }
  }
  
  await this.save();
  return this;
};

// Static method to get user stats
UserQuestionProgress.getUserStats = async function(userId) {
  const stats = await this.findAll({
    where: { userId },
    attributes: [
      'status',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['status']
  });

  const statsMap = {
    'mastered': 0,
    'learning': 0,
    'needs-review': 0
  };

  stats.forEach(stat => {
    statsMap[stat.status] = parseInt(stat.get('count'));
  });

  return {
    mastered: statsMap['mastered'],
    learning: statsMap['learning'],
    needsReview: statsMap['needs-review'],
    total: Object.values(statsMap).reduce((a, b) => a + b, 0)
  };
};

// Static method to get or create progress
UserQuestionProgress.getOrCreate = async function(userId, questionId) {
  const [progress] = await this.findOrCreate({
    where: { userId, questionId },
    defaults: { userId, questionId }
  });
  return progress;
};

// Static method to get questions needing review
UserQuestionProgress.getQuestionsNeedingReview = async function(userId, limit = 10) {
  const Question = require('./Question');
  
  return await this.findAll({
    where: {
      userId,
      status: 'needs-review'
    },
    order: [['lastAnsweredAt', 'ASC']],
    limit,
    include: [{
      model: Question,
      as: 'questionId'
    }]
  });
};

// Static method to get recently used questions
UserQuestionProgress.getRecentlyUsedQuestions = async function(userId, minutesAgo = 5) {
  const cutoffTime = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  const recentQuestions = await this.findAll({
    where: {
      userId,
      lastUsedInTest: {
        [Op.gte]: cutoffTime
      }
    },
    attributes: ['questionId']
  });
  
  return recentQuestions.map(q => q.questionId);
};

module.exports = UserQuestionProgress;