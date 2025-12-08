const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const AdminTest = sequelize.define('AdminTest', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  createdBy: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'Users', key: 'id' } },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  testType: { type: DataTypes.ENUM('Practice', 'Mock'), allowNull: false, defaultValue: 'Practice' },
  sets: { type: DataTypes.JSON, allowNull: false, defaultValue: [], comment: 'Array of sets' },
  category: { type: DataTypes.STRING(100), defaultValue: 'Admin' },
  difficulty: { type: DataTypes.STRING(50), defaultValue: 'Mixed' },
  timeLimit: { type: DataTypes.INTEGER, allowNull: true, comment: 'Time limit in minutes' },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
  tags: { type: DataTypes.JSON, defaultValue: [] },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  averageScore: { type: DataTypes.FLOAT, defaultValue: 0 },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  timestamps: true,
  indexes: [
    // ✅ FIXED: Composite indexes
    { fields: ['isPublished', 'testType', 'createdAt'] },
    { fields: ['category', 'isPublished'] },
    { fields: ['createdBy', 'isPublished'] },
    { fields: ['createdAt'] }
  ]
});

AdminTest.prototype.getTotalQuestions = function() {
  return this.sets.reduce((total, set) => total + (set.questions?.length || 0), 0);
};

AdminTest.prototype.getStats = function() {
  return {
    totalQuestions: this.getTotalQuestions(),
    setCount: this.sets.length,
    attempts: this.attempts,
    averageScore: this.averageScore,
    categories: this.getCategoryCounts(),
    difficulties: this.getDifficultyCounts()
  };
};

AdminTest.prototype.getCategoryCounts = function() {
  const counts = {};
  this.sets.forEach(set => {
    (set.questions || []).forEach(q => {
      const category = q.category || 'Uncategorized';
      counts[category] = (counts[category] || 0) + 1;
    });
  });
  return counts;
};

AdminTest.prototype.getDifficultyCounts = function() {
  const counts = {};
  this.sets.forEach(set => {
    (set.questions || []).forEach(q => {
      const difficulty = q.difficulty || 'Normal';
      counts[difficulty] = (counts[difficulty] || 0) + 1;
    });
  });
  return counts;
};

AdminTest.prototype.recordAttempt = async function(score) {
  this.attempts += 1;
  this.averageScore = ((this.averageScore * (this.attempts - 1)) + score) / this.attempts;
  await this.save();
};

AdminTest.getPublishedByType = async function(testType, options = {}) {
  const { page = 1, limit = 10, search } = options;
  const { Op } = require('sequelize');
  const where = { isPublished: true, isActive: true, testType };
  if (search) {
    where[Op.or] = [
      { title: { [Op.like]: `%${search}%` } },
      { description: { [Op.like]: `%${search}%` } }
    ];
  }
  const offset = (page - 1) * limit;
  const { count, rows } = await this.findAndCountAll({
    where, limit, offset,
    order: [['createdAt', 'DESC']],
    include: [{ model: require('./User'), as: 'creator', attributes: ['name', 'email'] }]
  });
  return {
    tests: rows,
    pagination: { total: count, page, pages: Math.ceil(count / limit), limit }
  };
};

module.exports = AdminTest;