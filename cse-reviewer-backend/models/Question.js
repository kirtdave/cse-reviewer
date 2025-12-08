// models/Question.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  options: {
    type: DataTypes.JSON,
    allowNull: false,
    validate: {
      isValidOptions(value) {
        if (!Array.isArray(value) || value.length !== 4) {
          throw new Error('Must have exactly 4 options');
        }
      }
    }
  },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false
  },
  category: {
    type: DataTypes.ENUM(
      'Verbal Ability',
      'Numerical Ability',
      'Analytical Ability',
      'General Knowledge',
      'Clerical Ability',
      'Philippine Constitution'
      // Removed 'Numerical Reasoning' since we merged it into Analytical/Numerical
    ),
    allowNull: false
  },
  // ✅ NEW FIELD ADDED HERE:
  subCategory: {
    type: DataTypes.STRING,
    allowNull: true, // It is null for general mock exams
    defaultValue: null
  },
  difficulty: {
    type: DataTypes.ENUM('Easy', 'Normal', 'Hard'),
    allowNull: false
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  usageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  source: {
    type: DataTypes.ENUM('AI', 'Admin', 'Manual'),
    defaultValue: 'AI'
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['category', 'difficulty', 'usageCount'] },
    { fields: ['isActive', 'category', 'difficulty'] },
    { fields: ['category'] },
    // Indexing subCategory helps search speed for study guides
    { fields: ['subCategory'] }, 
    { fields: ['difficulty'] },
    { fields: ['usageCount'] }
  ]
});

// Instance method to increment usage
Question.prototype.incrementUsage = async function() {
  this.usageCount += 1;
  await this.save();
};

// Static method to get questions by filters
Question.getByFilters = async function(category, difficulty, limit = 10) {
  return await this.findAll({
    where: {
      category,
      difficulty,
      isActive: true
    },
    order: [['usageCount', 'ASC']],
    limit
  });
};

// Static method to get random questions
Question.getRandomQuestions = async function(category, difficulty, count = 5) {
  return await this.findAll({
    where: {
      category,
      difficulty,
      isActive: true
    },
    order: sequelize.random(),
    limit: count
  });
};

// Static method to check if question exists
Question.questionExists = async function(questionText, category) {
  const count = await this.count({
    where: {
      questionText: questionText.trim(),
      category
    }
  });
  return count > 0;
};

// Static method to get stats
Question.getStats = async function() {
  const total = await this.count({ where: { isActive: true } });
  
  const byCategory = await this.findAll({
    where: { isActive: true },
    attributes: [
      'category',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
      [sequelize.fn('AVG', sequelize.col('usageCount')), 'avgUsage']
    ],
    group: ['category']
  });

  const byDifficulty = await this.findAll({
    where: { isActive: true },
    attributes: [
      'difficulty',
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: ['difficulty']
  });

  return {
    total,
    byCategory: byCategory.map(c => ({
      _id: c.category,
      count: parseInt(c.get('count')),
      avgUsage: parseFloat(c.get('avgUsage'))
    })),
    byDifficulty: byDifficulty.map(d => ({
      _id: d.difficulty,
      count: parseInt(d.get('count'))
    }))
  };
};

module.exports = Question;