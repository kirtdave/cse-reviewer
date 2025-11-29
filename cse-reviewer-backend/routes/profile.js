// routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { protect } = require('../middleware/auth');

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

module.exports = router;