// models/index.js
const { sequelize } = require('../config/db');

// Import all models
const User = require('./User');
const Question = require('./Question');
const TestAttempt = require('./TestAttempt');
const UserAchievement = require('./UserAchievement');
const UserQuestionProgress = require('./UserQuestionProgress');
const QuestionReport = require('./QuestionReport');
const ContactMessage = require('./ContactMessage');
const CustomTest = require('./CustomTest');

// ==================== ASSOCIATIONS ====================

// User associations
User.hasMany(TestAttempt, { foreignKey: 'userId', as: 'testAttempts' });
User.hasMany(UserAchievement, { foreignKey: 'userId', as: 'achievements' });
User.hasMany(UserQuestionProgress, { foreignKey: 'userId', as: 'questionProgress' });
User.hasMany(QuestionReport, { foreignKey: 'userId', as: 'reportedQuestions' });
User.hasMany(ContactMessage, { foreignKey: 'userId', as: 'contactMessages' });
User.hasMany(CustomTest, { foreignKey: 'userId', as: 'customTests' });

// TestAttempt associations
TestAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// UserAchievement associations
UserAchievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// UserQuestionProgress associations
UserQuestionProgress.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserQuestionProgress.belongsTo(Question, { foreignKey: 'questionId', as: 'question' });

// Question associations
Question.hasMany(UserQuestionProgress, { foreignKey: 'questionId', as: 'userProgress' });

// QuestionReport associations
QuestionReport.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'reporter' 
});

QuestionReport.belongsTo(User, { 
  foreignKey: 'resolvedBy', 
  as: 'resolver' 
});

// ContactMessage associations
ContactMessage.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// CustomTest associations
CustomTest.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'creator' 
});

// ==================== EXPORTS ====================

module.exports = {
  sequelize,
  User,
  Question,
  TestAttempt,
  UserAchievement,
  UserQuestionProgress,
  QuestionReport,
  ContactMessage,
  CustomTest
};