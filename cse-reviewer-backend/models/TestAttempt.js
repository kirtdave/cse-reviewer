// models/TestAttempt.js
const { DataTypes, Op } = require('sequelize');
const { sequelize } = require('../config/db');

const TestAttempt = sequelize.define('TestAttempt', {
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
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0,
      max: 100
    }
  },
  result: {
    type: DataTypes.ENUM('Passed', 'Failed'),
    allowNull: false
  },
  isMockExam: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  details: {
    type: DataTypes.JSON,
    allowNull: false,
    // ✅ Add getter/setter for safe JSON parsing
    get() {
      const rawValue = this.getDataValue('details');
      if (!rawValue) return {};
      if (typeof rawValue === 'object') return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Failed to parse details JSON:', e);
        return {};
      }
    }
  },
  questionResponses: {
    type: DataTypes.JSON,
    defaultValue: [],
    // ✅ CRITICAL FIX: Add getter/setter to handle JSON parsing
    get() {
      const rawValue = this.getDataValue('questionResponses');
      if (!rawValue) return [];
      // If it's already an array/object, return it
      if (typeof rawValue === 'object') return rawValue;
      // If it's a string, parse it
      try {
        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Failed to parse questionResponses JSON:', e);
        return [];
      }
    },
    set(value) {
      // Ensure we're storing an array
      const arrayValue = Array.isArray(value) ? value : [];
      this.setDataValue('questionResponses', arrayValue);
    }
  },
  testConfig: {
    type: DataTypes.JSON,
    defaultValue: {},
    // ✅ Add getter/setter for safe JSON parsing
    get() {
      const rawValue = this.getDataValue('testConfig');
      if (!rawValue) return {};
      if (typeof rawValue === 'object') return rawValue;
      try {
        return JSON.parse(rawValue);
      } catch (e) {
        console.error('Failed to parse testConfig JSON:', e);
        return {};
      }
    }
  },
  startedAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'completedAt'] },
    { fields: ['userId', 'score'] },
    { fields: ['result'] },
    { fields: ['isMockExam'] }
  ]
});

// Virtual for duration in minutes
TestAttempt.prototype.getDurationMinutes = function() {
  if (this.startedAt && this.completedAt) {
    return Math.round((new Date(this.completedAt) - new Date(this.startedAt)) / 60000);
  }
  return 0;
};

// Virtual for accuracy percentage
TestAttempt.prototype.getAccuracy = function() {
  if (this.details && this.details.totalQuestions > 0) {
    return Math.round((this.details.correctQuestions / this.details.totalQuestions) * 100);
  }
  return 0;
};

// Static method to get user stats
TestAttempt.getUserStats = async function(userId, filter = {}) {
  const whereClause = { userId, ...filter };

  const results = await this.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('COUNT', sequelize.col('id')), 'totalAttempts'],
      [sequelize.fn('AVG', sequelize.col('score')), 'averageScore'],
      [sequelize.fn('MAX', sequelize.col('score')), 'highestScore'],
      [sequelize.fn('MIN', sequelize.col('score')), 'lowestScore']
    ]
  });

  const passedCount = await this.count({
    where: { ...whereClause, result: 'Passed' }
  });

  const failedCount = await this.count({
    where: { ...whereClause, result: 'Failed' }
  });

  // For section scores, we need to extract from JSON
  const attempts = await this.findAll({
    where: whereClause,
    attributes: ['details']
  });

  const sectionTotals = {
    verbal: 0, numerical: 0, analytical: 0, generalInfo: 0,
    clerical: 0, numericalReasoning: 0, constitution: 0
  };
  const sectionCounts = {
    verbal: 0, numerical: 0, analytical: 0, generalInfo: 0,
    clerical: 0, numericalReasoning: 0, constitution: 0
  };

  attempts.forEach(attempt => {
    if (attempt.details?.sectionScores) {
      Object.keys(sectionTotals).forEach(key => {
        if (attempt.details.sectionScores[key] !== undefined) {
          sectionTotals[key] += attempt.details.sectionScores[key];
          sectionCounts[key]++;
        }
      });
    }
  });

  const result = results[0] ? results[0].toJSON() : {};

  return {
    totalAttempts: parseInt(result.totalAttempts) || 0,
    totalPassed: passedCount,
    totalFailed: failedCount,
    averageScore: parseFloat(result.averageScore) || 0,
    highestScore: parseFloat(result.highestScore) || 0,
    lowestScore: parseFloat(result.lowestScore) || 0,
    avgVerbal: sectionCounts.verbal ? sectionTotals.verbal / sectionCounts.verbal : 0,
    avgNumerical: sectionCounts.numerical ? sectionTotals.numerical / sectionCounts.numerical : 0,
    avgAnalytical: sectionCounts.analytical ? sectionTotals.analytical / sectionCounts.analytical : 0,
    avgGeneralInfo: sectionCounts.generalInfo ? sectionTotals.generalInfo / sectionCounts.generalInfo : 0,
    avgClerical: sectionCounts.clerical ? sectionTotals.clerical / sectionCounts.clerical : 0,
    avgNumericalReasoning: sectionCounts.numericalReasoning ? sectionTotals.numericalReasoning / sectionCounts.numericalReasoning : 0,
    avgConstitution: sectionCounts.constitution ? sectionTotals.constitution / sectionCounts.constitution : 0
  };
};

// Static method to get recent attempts
TestAttempt.getRecentAttempts = async function(userId, options = {}) {
  const { 
    page = 1, 
    limit = 10, 
    sortBy = 'completedAt', 
    sortOrder = 'desc',
    result = null 
  } = options;

  const where = { userId };
  if (result) {
    where.result = result;
  }

  const order = [[sortBy, sortOrder.toUpperCase()]];
  const offset = (page - 1) * limit;

  const { count, rows } = await this.findAndCountAll({
    where,
    order,
    offset,
    limit
  });

  return {
    attempts: rows,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
};

// Static method to get performance trend
TestAttempt.getPerformanceTrend = async function(userId, limit = 7) {
  return await this.findAll({
    where: { userId },
    order: [['completedAt', 'DESC']],
    limit,
    attributes: ['name', 'score', 'completedAt', 'details']
  });
};

// Static method to get test for review
TestAttempt.getTestForReview = async function(attemptId, userId) {
  const attempt = await this.findOne({
    where: {
      id: attemptId,
      userId: userId
    }
  });

  if (!attempt) {
    return null;
  }

  // ✅ Now questionResponses is safely parsed as array
  const responses = attempt.questionResponses || [];

  return {
    attemptId: attempt.id,
    name: attempt.name,
    dateCompleted: attempt.completedAt,
    score: attempt.details.correctQuestions,
    totalQuestions: attempt.details.totalQuestions,
    accuracy: Math.round((attempt.details.correctQuestions / attempt.details.totalQuestions) * 100),
    timeSpent: Math.round((new Date(attempt.completedAt) - new Date(attempt.startedAt)) / 60000),
    questions: responses.map(q => ({
      question: q.questionText,
      category: q.category,
      questionType: q.questionType,
      options: q.options || [],
      explanation: q.explanation
    })),
    userAnswers: responses.map(q => q.userAnswerIndex),
    correctAnswers: responses.map(q => q.correctAnswerIndex)
  };
};

// Instance method to toggle bookmark
TestAttempt.prototype.toggleBookmark = async function(questionIndex, note = '') {
  // ✅ Get safely parsed array
  const responses = this.questionResponses || [];
  
  if (!responses[questionIndex]) {
    throw new Error('Question not found');
  }

  const question = responses[questionIndex];
  question.bookmarked = !question.bookmarked;
  
  if (question.bookmarked) {
    question.bookmarkedAt = new Date();
    if (note) {
      question.bookmarkNote = note;
    }
  } else {
    question.bookmarkNote = '';
    question.bookmarkedAt = null;
  }

  this.questionResponses = responses;
  await this.save();
  
  return { bookmarked: question.bookmarked, note: question.bookmarkNote };
};

// Static method to get all bookmarks
TestAttempt.getAllBookmarks = async function(userId) {
  console.log('📚 Fetching all bookmarks for user:', userId);
  
  const attempts = await this.findAll({
    where: {
      userId,
      questionResponses: {
        [Op.ne]: null
      }
    }
  });

  console.log(`Found ${attempts.length} test attempts`);

  const bookmarks = [];
  
  attempts.forEach(attempt => {
    // ✅ questionResponses is now safely parsed as array
    const responses = attempt.questionResponses || [];
    
    console.log(`Attempt ${attempt.id}: ${responses.length} questions, type: ${typeof responses}, isArray: ${Array.isArray(responses)}`);
    
    if (Array.isArray(responses)) {
      responses.forEach((question, index) => {
        if (question && question.bookmarked) {
          bookmarks.push({
            attemptId: attempt.id,
            attemptName: attempt.name,
            questionIndex: index,
            questionText: question.questionText,
            category: question.category,
            questionType: question.questionType,
            isCorrect: question.isCorrect,
            note: question.bookmarkNote || '',
            bookmarkedAt: question.bookmarkedAt,
            completedAt: attempt.completedAt
          });
        }
      });
    } else {
      console.warn(`⚠️ questionResponses is not an array for attempt ${attempt.id}:`, typeof responses);
    }
  });

  console.log(`✅ Found ${bookmarks.length} bookmarked questions`);

  return bookmarks.sort((a, b) => 
    new Date(b.bookmarkedAt) - new Date(a.bookmarkedAt)
  );
};

module.exports = TestAttempt;