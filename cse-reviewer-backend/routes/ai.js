// routes/ai.js

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.post('/generate-questions', protect, aiController.generateQuestions);
router.post('/explain-answer', protect, aiController.explainAnswer);
router.post('/recommendations', protect, aiController.getRecommendations);
router.post('/chat', protect, aiController.chat);
router.post('/generate-answer-choices', protect, aiController.generateAnswerChoices);

// ✅ NEW: Help with specific question
router.post('/question-help', protect, aiController.questionHelp);

module.exports = router;