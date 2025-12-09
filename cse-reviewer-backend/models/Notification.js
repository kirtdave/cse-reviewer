const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true // ✅ NULL = "All Users", specific ID = Private Message
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('Announcement', 'New Content', 'Maintenance', 'Update', 'Reminder'),
    defaultValue: 'Announcement'
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Published', 'Scheduled'),
    defaultValue: 'Draft'
  },
  recipients: {
    type: DataTypes.STRING(100),
    defaultValue: 'All Users'
  },
  publishedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  scheduledDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'Notifications',
  timestamps: true,
  indexes: [
    { fields: ['status', 'publishedDate'] },
    { fields: ['type', 'status'] },
    { fields: ['userId'] },
    { fields: ['isRead'] }
  ]
});

// Association
Notification.associate = (models) => {
  Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  Notification.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
  Notification.hasMany(models.UserNotification, { foreignKey: 'notificationId', as: 'userNotifications' });
};

// ✅ ADDED: Static method to fix "Notification.getAll is not a function"
Notification.getAll = async function(filters = {}) {
  const { status, type, limit, offset } = filters;
  
  const where = {};
  if (status && status !== 'All') where.status = status;
  if (type) where.type = type;

  const { count, rows } = await this.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: limit || 50,
    offset: offset || 0
  });

  return { notifications: rows, total: count };
};

Notification.prototype.publish = async function() {
  this.status = 'Published';
  this.publishedDate = new Date();
  await this.save();
  return this;
};

module.exports = Notification;