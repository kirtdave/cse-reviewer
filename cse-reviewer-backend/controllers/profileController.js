// controllers/profileController.js - SIMPLIFIED VERSION
const { User, UserAchievement } = require('../models');
const { Op } = require('sequelize');

// @desc    Get user profile with stats
// @route   GET /api/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    console.log('=== GET PROFILE REQUEST ===');
    console.log('User ID from req.user:', req.user?.id);
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      console.error('❌ User not found in database');
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    console.log('✅ User found:', user.email);

    // ✅ AWARD WELCOME ACHIEVEMENT ON FIRST PROFILE VIEW (background process)
    try {
      await UserAchievement.checkAndAward(user);
    } catch (achievementError) {
      console.warn('⚠️ Could not check achievements:', achievementError.message);
    }

    // ✅ GET MASTERED QUESTIONS COUNT FROM UserQuestionProgress
    let questionsMastered = 0;
    try {
      const UserQuestionProgress = require('../models').UserQuestionProgress;
      const masteryStats = await UserQuestionProgress.getUserStats(user.id);
      questionsMastered = masteryStats.mastered;
      console.log('✅ Questions mastered:', questionsMastered);
    } catch (masteryError) {
      console.warn('⚠️ Could not fetch mastered questions:', masteryError.message);
    }

    // Format join date
    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    // Build profile response - NO MORE achievement history array
    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      avatar: user.avatar || 'https://i.pravatar.cc/200?img=1',
      studyGoal: user.studyGoal || 'Pass CSE Professional Level',
      targetDate: user.targetDate || '',
      joinDate: joinDate,
      stats: {
        totalTests: user.testsCompleted || 0,
        studyHours: Math.floor((user.totalStudyTimeMinutes || 0) / 60),
        questionsSolved: user.questionsSolved || 0, // Total correct answers (for stats page)
        questionsMastered: questionsMastered, // ✅ NEW: Actual mastered count (for profile achievement)
        currentStreak: user.currentStreak || 0,
        avgScore: Math.round(user.avgScore || 0)
      }
      // ❌ REMOVED: achievements array - we calculate from stats in frontend now
    };

    console.log('✅ Sending profile data');

    res.json({
      success: true,
      profile: profileData
    });

  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch profile', 
      error: error.message 
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    console.log('=== UPDATE PROFILE REQUEST ===');
    console.log('User ID:', req.user.id);
    console.log('Update data keys:', Object.keys(req.body));
    
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    const { name, email, phone, location, bio, avatar, studyGoal, targetDate } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ where: { email } });
      if (emailExists) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email already in use' 
        });
      }
      user.email = email;
    }

    // Update fields
    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (bio !== undefined) user.bio = bio;
    if (studyGoal) user.studyGoal = studyGoal;
    if (targetDate !== undefined) user.targetDate = targetDate;

    // ✅ HANDLE AVATAR WITH VALIDATION
    if (avatar) {
      if (avatar.startsWith('data:image')) {
        const base64Length = avatar.length;
        const sizeInMB = (base64Length * 0.75) / (1024 * 1024);
        
        if (sizeInMB > 5) {
          console.warn('⚠️ Image too large:', sizeInMB.toFixed(2), 'MB');
          return res.status(400).json({ 
            success: false,
            message: 'Image size too large. Please use an image smaller than 5MB.' 
          });
        }
        
        console.log('✅ Updating avatar with base64 image (', sizeInMB.toFixed(2), 'MB)');
        user.avatar = avatar;
      } else if (avatar.startsWith('http')) {
        console.log('✅ Updating avatar with URL');
        user.avatar = avatar;
      }
    }

    await user.save();
    console.log('✅ Profile updated successfully');

    const joinDate = new Date(user.createdAt).toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });

    // ✅ GET MASTERED QUESTIONS COUNT
    let questionsMastered = 0;
    try {
      const UserQuestionProgress = require('../models').UserQuestionProgress;
      const masteryStats = await UserQuestionProgress.getUserStats(user.id);
      questionsMastered = masteryStats.mastered;
    } catch (masteryError) {
      console.warn('⚠️ Could not fetch mastered questions:', masteryError.message);
    }

    const profileData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      location: user.location || '',
      bio: user.bio || '',
      avatar: user.avatar || 'https://i.pravatar.cc/200?img=1',
      studyGoal: user.studyGoal || 'Pass CSE Professional Level',
      targetDate: user.targetDate || '',
      joinDate: joinDate,
      stats: {
        totalTests: user.testsCompleted || 0,
        studyHours: Math.floor((user.totalStudyTimeMinutes || 0) / 60),
        questionsSolved: user.questionsSolved || 0,
        questionsMastered: questionsMastered, // ✅ NEW
        currentStreak: user.currentStreak || 0,
        avgScore: Math.round(user.avgScore || 0)
      }
      // ❌ REMOVED: achievements array
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      profile: profileData
    });

  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update profile', 
      error: error.message 
    });
  }
};

// @desc    Get detailed stats
// @route   GET /api/profile/stats
// @access  Private
exports.getDetailedStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const TestAttempt = require('../models').TestAttempt;
    const UserQuestionProgress = require('../models').UserQuestionProgress;

    const testStats = await TestAttempt.getUserStats(userId);
    const questionStats = await UserQuestionProgress.getUserStats(userId);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTests = await TestAttempt.count({
      where: {
        userId,
        completedAt: {
          [Op.gte]: thirtyDaysAgo
        }
      }
    });

    res.json({
      success: true,
      stats: {
        tests: {
          total: testStats.totalAttempts,
          passed: testStats.totalPassed,
          failed: testStats.totalFailed,
          averageScore: Math.round(testStats.averageScore),
          highestScore: Math.round(testStats.highestScore),
          recentActivity: recentTests
        },
        questions: {
          mastered: questionStats.mastered,
          learning: questionStats.learning,
          needsReview: questionStats.needsReview,
          total: questionStats.total
        },
        sections: {
          verbal: Math.round(testStats.avgVerbal),
          numerical: Math.round(testStats.avgNumerical),
          analytical: Math.round(testStats.avgAnalytical),
          generalInfo: Math.round(testStats.avgGeneralInfo),
          clerical: Math.round(testStats.avgClerical),
          numericalReasoning: Math.round(testStats.avgNumericalReasoning),
          constitution: Math.round(testStats.avgConstitution)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get detailed stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch stats', 
      error: error.message 
    });
  }
};

// @desc    Update study streak (called when user completes a test)
// @route   POST /api/profile/update-streak
// @access  Private
exports.updateStreak = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    user.updateStreak();
    await user.save();

    // Check for new achievements (background process, still track them)
    let newAchievements = [];
    try {
      newAchievements = await UserAchievement.checkAndAward(user);
    } catch (achievementError) {
      console.warn('⚠️ Could not check achievements:', achievementError.message);
    }

    res.json({
      success: true,
      currentStreak: user.currentStreak,
      newAchievements: newAchievements.map(a => ({
        icon: a.icon,
        title: a.title,
        description: a.description
      }))
    });

  } catch (error) {
    console.error('❌ Update streak error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update streak', 
      error: error.message 
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/profile/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const { avatarUrl } = req.body;
    
    if (!avatarUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Avatar URL is required' 
      });
    }

    const user = await User.findByPk(req.user.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    user.avatar = avatarUrl;
    await user.save();

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      avatar: user.avatar
    });

  } catch (error) {
    console.error('❌ Upload avatar error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to upload avatar', 
      error: error.message 
    });
  }
};