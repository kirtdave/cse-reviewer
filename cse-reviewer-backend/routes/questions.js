// routes/questions.js

const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { protect, adminOnly } = require('../middleware/auth');

// ==================== PUBLIC/USER ROUTES ====================

// Generate smart questions (checks DB first, then AI)
router.post('/generate', protect, questionController.generateSmartQuestions);

// Update user's progress after test
router.post('/progress/update', protect, questionController.updateUserProgress);

// Get overall question bank stats
router.get('/stats/bank', questionController.getQuestionBankStats);

// Get user's personal mastery stats
router.get('/stats/user', protect, questionController.getUserQuestionStats);

// Get questions user needs to review
router.get('/review', protect, questionController.getQuestionsNeedingReview);

// ==================== ADMIN ROUTES ====================

// Manually create a question (admin only)
router.post('/create', protect, adminOnly, questionController.createQuestion);

module.exports = router;