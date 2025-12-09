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
const Notification = require('./Notification');
const UserNotification = require('./UserNotification');
const AdminTest = require('./AdminTest');
const Activity = require('./Activity');

// ==================== ASSOCIATIONS ====================

// User associations
User.hasMany(TestAttempt, { foreignKey: 'userId', as: 'testAttempts' });
User.hasMany(UserAchievement, { foreignKey: 'userId', as: 'achievements' });
User.hasMany(UserQuestionProgress, { foreignKey: 'userId', as: 'questionProgress' });
User.hasMany(QuestionReport, { foreignKey: 'userId', as: 'reportedQuestions' });
User.hasMany(ContactMessage, { foreignKey: 'userId', as: 'contactMessages' });
User.hasMany(CustomTest, { foreignKey: 'userId', as: 'customTests' });
User.hasMany(Notification, { foreignKey: 'createdBy', as: 'notificationsCreated' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notificationsReceived' }); // ✅ NEW
User.hasMany(UserNotification, { foreignKey: 'userId', as: 'userNotifications' });
User.hasMany(AdminTest, { foreignKey: 'createdBy', as: 'adminTests' });
User.hasMany(Activity, { foreignKey: 'userId', as: 'activities' });

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

// ✅ UPDATED: Notification associations
Notification.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Notification.belongsTo(User, { 
  foreignKey: 'createdBy', 
  as: 'creator' 
});

Notification.hasMany(UserNotification, { 
  foreignKey: 'notificationId', 
  as: 'userNotifications' 
});

// UserNotification associations
UserNotification.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

UserNotification.belongsTo(Notification, { 
  foreignKey: 'notificationId', 
  as: 'notification' 
});

// AdminTest associations
AdminTest.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Activity associations
Activity.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
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
  CustomTest,
  Notification,
  UserNotification,
  AdminTest,
  Activity
};