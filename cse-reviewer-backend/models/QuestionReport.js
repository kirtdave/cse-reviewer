// models/QuestionReport.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const QuestionReport = sequelize.define('QuestionReport', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  questionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attemptId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  issueType: {
    type: DataTypes.ENUM('wrong_answer', 'typo', 'unclear', 'duplicate', 'outdated', 'other'),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'reviewing', 'resolved', 'rejected'),
    defaultValue: 'pending'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'question_reports',
  timestamps: true
});

// ✅ Associations will be defined in models/index.js
// No need to define them here

module.exports = QuestionReport;