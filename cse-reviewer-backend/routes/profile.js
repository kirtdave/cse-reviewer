// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { User } = require('../models');

// All routes require authentication
router.use(protect);

// @route   GET /api/profile
// @desc    Get user profile with stats and achievements
router.get('/', profileController.getProfile);

// @route   PUT /api/profile
// @desc    Update user profile
router.put('/', profileController.updateProfile);

// @route   GET /api/profile/stats
// @desc    Get detailed statistics
router.get('/stats', profileController.getDetailedStats);

// @route   POST /api/profile/update-streak
// @desc    Update study streak
router.post('/update-streak', profileController.updateStreak);

// @route   POST /api/profile/avatar
// @desc    Upload/update avatar
router.post('/avatar', profileController.uploadAvatar);

// ✅ NEW: Heartbeat endpoint - Update user's last active timestamp
// @route   POST /api/profile/heartbeat
// @desc    Update last active timestamp for activity tracking
router.post('/heartbeat', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Update user's lastActive timestamp
    await User.update(
      { 
        lastActive: new Date()
      },
      { 
        where: { id: userId } 
      }
    );
    
    res.json({ 
      success: true,
      message: 'Heartbeat recorded'
    });
  } catch (error) {
    console.error('Heartbeat error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update last active',
      error: error.message 
    });
  }
});

module.exports = router;