const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserNotification = sequelize.define('UserNotification', {
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
  notificationId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'notifications',
      key: 'id'
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isDismissed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  hasViewed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'user_notifications',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['notificationId'] },
    { fields: ['isRead'] },
    { fields: ['isDismissed'] },
    { fields: ['hasViewed'] },
    { unique: true, fields: ['userId', 'notificationId'], name: 'unique_user_notification' }
  ]
});

module.exports = UserNotification;