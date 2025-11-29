// routes/tests.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateTest } = require('../controllers/testController');

// POST /api/tests/generate - Generate AI test questions
router.post('/generate', protect, generateTest);

module.exports = router;