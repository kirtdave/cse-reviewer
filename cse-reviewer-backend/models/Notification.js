// models/Notification.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    type: DataTypes.ENUM('All Users', 'Active Users', 'Inactive Users'),
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
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['publishedDate'] }
  ]
});

// Static method to get all notifications with filters
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

// Instance method to publish notification
Notification.prototype.publish = async function() {
  this.status = 'Published';
  this.publishedDate = new Date();
  await this.save();
  return this;
};

// Instance method to increment views
Notification.prototype.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

module.exports = Notification;