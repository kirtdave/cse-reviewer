// models/CustomTest.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CustomTest = sequelize.define('CustomTest', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  sets: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
    comment: 'Array of sets, each containing id, title, and questions array'
  },
  category: {
    type: DataTypes.STRING(100),
    defaultValue: 'Custom'
  },
  difficulty: {
    type: DataTypes.STRING(50),
    defaultValue: 'Mixed'
  },
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'Time limit in minutes'
  },
  isPublic: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  averageScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'isActive', 'updatedAt'] },
    { fields: ['isPublic', 'isActive', 'category'] },
    { fields: ['attempts'] },
    { fields: ['createdAt'] }
  ]
});

// Instance method to get total question count
CustomTest.prototype.getTotalQuestions = function() {
  return this.sets.reduce((total, set) => total + (set.questions?.length || 0), 0);
};

// Instance method to get test stats
CustomTest.prototype.getStats = function() {
  const totalQuestions = this.getTotalQuestions();
  const setCount = this.sets.length;
  
  return {
    totalQuestions,
    setCount,
    attempts: this.attempts,
    averageScore: this.averageScore,
    categories: this.getCategoryCounts(),
    difficulties: this.getDifficultyCounts()
  };
};

// Get category distribution
CustomTest.prototype.getCategoryCounts = function() {
  const counts = {};
  
  this.sets.forEach(set => {
    (set.questions || []).forEach(q => {
      const category = q.category || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });
  });
  
  return counts;
};

// Get difficulty distribution
CustomTest.prototype.getDifficultyCounts = function() {
  const counts = {};
  
  this.sets.forEach(set => {
    (set.questions || []).forEach(q => {
      const difficulty = q.difficulty || 'Normal';
      counts[difficulty] = (counts[difficulty] || 0) + 1;
    });
  });
  
  return counts;
};

// Record test attempt
CustomTest.prototype.recordAttempt = async function(score) {
  this.attempts += 1;
  this.averageScore = ((this.averageScore * (this.attempts - 1)) + score) / this.attempts;
  await this.save();
};

// Static method to get user's tests with pagination
CustomTest.getUserTests = async function(userId, options = {}) {
  const { page = 1, limit = 10, category, difficulty } = options;
  
  const where = { userId, isActive: true };
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await this.findAndCountAll({
    where,
    limit,
    offset,
    order: [['updatedAt', 'DESC']]
  });
  
  return {
    tests: rows,
    pagination: {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      limit
    }
  };
};

// Static method to get public tests
CustomTest.getPublicTests = async function(options = {}) {
  const { page = 1, limit = 10, category, difficulty, search } = options;
  const { Op } = require('sequelize');
  
  const where = { isPublic: true, isActive: true };
  if (category) where.category = category;
  if (difficulty) where.difficulty = difficulty;
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  
  const offset = (page - 1) * limit;
  
  const { count, rows } = await this.findAndCountAll({
    where,
    limit,
    offset,
    order: [['attempts', 'DESC']]
  });
  
  return {
    tests: rows,
    pagination: {
      total: count,
      page,
      pages: Math.ceil(count / limit),
      limit
    }
  };
};

module.exports = CustomTest;