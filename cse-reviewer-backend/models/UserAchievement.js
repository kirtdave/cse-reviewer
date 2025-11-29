// models/UserAchievement.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserAchievement = sequelize.define('UserAchievement', {
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
    },
    onDelete: 'CASCADE'
  },
  achievementKey: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: 'Unique key for the achievement (e.g., "first_test", "streak_3")'
  },
  icon: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '🏆'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  earnedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'UserAchievements', // Explicit table name
  timestamps: true,
  indexes: [
    { 
      fields: ['userId', 'earnedAt'] 
    },
    { 
      fields: ['userId', 'achievementKey'], 
      unique: true,
      name: 'unique_user_achievement' // Give it a specific name
    }
  ]
});

// ==================== ACHIEVEMENT DEFINITIONS ====================
const ACHIEVEMENTS = {
  // Welcome & First Steps
  welcome: {
    key: 'welcome',
    icon: '👋',
    title: 'Welcome to CSE Reviewer!',
    description: 'You\'ve joined the CSE Reviewer community',
    condition: (user) => true // Always awarded on first profile view
  },
  
  // Test Milestones
  first_test: {
    key: 'first_test',
    icon: '🎯',
    title: 'First Test Completed',
    description: 'Completed your first practice test',
    condition: (user) => user.testsCompleted >= 1
  },
  three_tests: {
    key: 'three_tests',
    icon: '⭐',
    title: '3 Tests Milestone',
    description: 'Completed 3 practice tests',
    condition: (user) => user.testsCompleted >= 3
  },
  five_tests: {
    key: 'five_tests',
    icon: '🏆',
    title: '5 Tests Milestone',
    description: 'Completed 5 practice tests',
    condition: (user) => user.testsCompleted >= 5
  },
  ten_tests: {
    key: 'ten_tests',
    icon: '💎',
    title: '10 Tests Master',
    description: 'Completed 10 practice tests',
    condition: (user) => user.testsCompleted >= 10
  },
  
  // Streak Achievements
  streak_3: {
    key: 'streak_3',
    icon: '🔥',
    title: '3-Day Streak',
    description: 'Studied for 3 consecutive days',
    condition: (user) => user.currentStreak >= 3
  },
  streak_7: {
    key: 'streak_7',
    icon: '🔥',
    title: '7-Day Streak',
    description: 'Studied for a full week straight!',
    condition: (user) => user.currentStreak >= 7
  },
  streak_30: {
    key: 'streak_30',
    icon: '🔥',
    title: '30-Day Streak',
    description: 'A full month of consistent practice!',
    condition: (user) => user.currentStreak >= 30
  },
  
  // Questions Solved
  questions_50: {
    key: 'questions_50',
    icon: '💪',
    title: '50 Questions Solved',
    description: 'Answered 50 questions correctly',
    condition: (user) => user.questionsSolved >= 50
  },
  questions_100: {
    key: 'questions_100',
    icon: '🎓',
    title: '100 Questions Mastered',
    description: 'Answered 100 questions correctly',
    condition: (user) => user.questionsSolved >= 100
  },
  questions_500: {
    key: 'questions_500',
    icon: '🚀',
    title: '500 Questions Champion',
    description: 'Answered 500 questions correctly',
    condition: (user) => user.questionsSolved >= 500
  },
  
  // Score-based
  perfect_score: {
    key: 'perfect_score',
    icon: '💯',
    title: 'Perfect Score',
    description: 'Achieved 100% on a practice test',
    condition: (user) => false // Awarded separately when test is completed with 100%
  },
  high_achiever: {
    key: 'high_achiever',
    icon: '🌟',
    title: 'High Achiever',
    description: 'Maintained 80%+ average score',
    condition: (user) => user.avgScore >= 80 && user.testsCompleted >= 3
  },
  
  // Study Time
  study_10h: {
    key: 'study_10h',
    icon: '⏰',
    title: '10 Hours of Study',
    description: 'Spent 10 hours practicing',
    condition: (user) => user.totalStudyTimeMinutes >= 600
  },
  study_50h: {
    key: 'study_50h',
    icon: '📚',
    title: '50 Hours Dedicated',
    description: 'Spent 50 hours practicing',
    condition: (user) => user.totalStudyTimeMinutes >= 3000
  }
};

// ==================== STATIC METHODS ====================

/**
 * Check and award achievements for a user
 * @param {User} user - Sequelize User instance
 * @returns {Promise<Array>} - Array of newly awarded achievements
 */
UserAchievement.checkAndAward = async function(user) {
  const newAchievements = [];
  
  try {
    // Get all achievements user already has
    const existingAchievements = await this.findAll({
      where: { userId: user.id },
      attributes: ['achievementKey']
    });
    
    const existingKeys = existingAchievements.map(a => a.achievementKey);
    
    // Check each achievement
    for (const [key, achievement] of Object.entries(ACHIEVEMENTS)) {
      // Skip if user already has this achievement
      if (existingKeys.includes(achievement.key)) {
        continue;
      }
      
      // Check if user meets the condition
      if (achievement.condition(user)) {
        try {
          const newAchievement = await this.create({
            userId: user.id,
            achievementKey: achievement.key,
            icon: achievement.icon,
            title: achievement.title,
            description: achievement.description
          });
          
          newAchievements.push(newAchievement);
          console.log(`🏆 Achievement unlocked for user ${user.id}: ${achievement.title}`);
        } catch (error) {
          // Ignore duplicate key errors (race condition)
          if (!error.message.includes('Duplicate') && !error.message.includes('unique')) {
            console.error('Error awarding achievement:', error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAndAward:', error);
  }
  
  return newAchievements;
};

/**
 * Award a specific achievement to a user
 * @param {number} userId 
 * @param {string} achievementKey 
 */
UserAchievement.awardSpecific = async function(userId, achievementKey) {
  const achievement = Object.values(ACHIEVEMENTS).find(a => a.key === achievementKey);
  
  if (!achievement) {
    console.warn(`Achievement ${achievementKey} not found`);
    return null;
  }
  
  try {
    // Check if user already has it
    const existing = await this.findOne({
      where: { userId, achievementKey }
    });
    
    if (existing) {
      return null; // Already awarded
    }
    
    return await this.create({
      userId,
      achievementKey: achievement.key,
      icon: achievement.icon,
      title: achievement.title,
      description: achievement.description
    });
  } catch (error) {
    if (error.message.includes('Duplicate') || error.message.includes('unique')) {
      return null;
    }
    console.error('Error awarding specific achievement:', error);
    throw error;
  }
};

/**
 * Get user's achievement progress
 * @param {number} userId 
 */
UserAchievement.getProgress = async function(userId) {
  const earned = await this.count({ where: { userId } });
  const total = Object.keys(ACHIEVEMENTS).length;
  
  return {
    earned,
    total,
    percentage: Math.round((earned / total) * 100)
  };
};

module.exports = UserAchievement;