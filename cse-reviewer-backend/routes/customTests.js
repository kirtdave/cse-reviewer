// routes/customTests.js
const express = require('express');
const router = express.Router();
const customTestController = require('../controllers/customTestController');
const { protect } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// ==================== PUBLIC ROUTES ====================

// Browse public tests
router.get('/public/browse', customTestController.browsePublicTests);

// ==================== PROTECTED ROUTES ====================

// Get all user's custom tests
router.get('/', protect, customTestController.getUserTests);

// Get specific test by ID
router.get('/:id', protect, customTestController.getTestById);

// Create new custom test
router.post('/', protect, customTestController.createCustomTest);

// Update custom test
router.put('/:id', protect, customTestController.updateCustomTest);

// Delete custom test
router.delete('/:id', protect, customTestController.deleteCustomTest);

// Generate questions from PDF
router.post(
  '/generate-from-pdf', 
  protect, 
  upload.single('file'), 
  customTestController.generateQuestionsFromPDF
);

// Get test statistics
router.get('/:id/stats', protect, customTestController.getTestStats);

// Record test attempt
router.post('/:id/attempt', protect, customTestController.recordTestAttempt);

// ==================== ERROR HANDLER ====================
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        error: 'File is too large. Maximum size is 10MB.' 
      });
    }
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  next(err);
});

module.exports = router;