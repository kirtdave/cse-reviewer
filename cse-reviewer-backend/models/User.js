// models/User.js - Updated avatar field
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Please provide a name' }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Please provide a valid email' }
    },
    set(value) {
      this.setDataValue('email', value.toLowerCase());
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: {
        args: [6, 255],
        msg: 'Password must be at least 6 characters'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  },
  
  // Profile fields
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  location: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.TEXT('long'), // ✅ Changed to TEXT for base64 storage
    allowNull: true,
    defaultValue: 'https://i.pravatar.cc/200?img=1'
  },
  studyGoal: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'Pass CSE Professional Level'
  },
  targetDate: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  
  // Stats
  testsCompleted: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  avgScore: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  totalStudyTimeMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  questionsSolved: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  currentStreak: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastStudyDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  
  lastActive: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['role'] }
  ],
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to compare password
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update study streak
User.prototype.updateStreak = function() {
  const today = new Date().toISOString().split('T')[0];
  const lastStudy = this.lastStudyDate;
  
  if (!lastStudy) {
    this.currentStreak = 1;
    this.lastStudyDate = today;
  } else if (lastStudy === today) {
    return;
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (lastStudy === yesterdayStr) {
      this.currentStreak += 1;
    } else {
      this.currentStreak = 1;
    }
    this.lastStudyDate = today;
  }
};

// Method to get profile with stats
User.prototype.getProfileData = function() {
  return {
    id: this.id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    location: this.location,
    bio: this.bio,
    avatar: this.avatar,
    studyGoal: this.studyGoal,
    targetDate: this.targetDate,
    joinDate: this.createdAt,
    stats: {
      testsCompleted: this.testsCompleted,
      avgScore: Math.round(this.avgScore),
      studyHours: Math.floor(this.totalStudyTimeMinutes / 60),
      questionsSolved: this.questionsSolved,
      currentStreak: this.currentStreak
    }
  };
};

module.exports = User;