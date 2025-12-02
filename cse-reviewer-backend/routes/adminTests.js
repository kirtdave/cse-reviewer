// routes/adminTests.js
const express = require('express');
const router = express.Router();
const adminTestController = require('../controllers/adminTestController');
const { protect, adminOnly } = require('../middleware/auth');
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

// ==================== PUBLIC ROUTES (FOR USERS) ====================

// Get published tests by type (Practice or Mock)
router.get('/published/:testType', protect, adminTestController.getPublishedTestsByType);

// ==================== ADMIN ROUTES ====================

// Get all admin tests
router.get('/', protect, adminOnly, adminTestController.getAllAdminTests);

// Get specific test by ID
router.get('/:id', protect, adminTestController.getTestById);

// Create new admin test
router.post('/', protect, adminOnly, adminTestController.createAdminTest);

// Update admin test
router.put('/:id', protect, adminOnly, adminTestController.updateAdminTest);

// Delete admin test
router.delete('/:id', protect, adminOnly, adminTestController.deleteAdminTest);

// Toggle publish status
router.patch('/:id/publish', protect, adminOnly, adminTestController.togglePublish);

// Generate questions from PDF
router.post(
  '/generate-from-pdf', 
  protect, 
  adminOnly,
  upload.single('file'), 
  adminTestController.generateQuestionsFromPDF
);

// Get test statistics
router.get('/:id/stats', protect, adminOnly, adminTestController.getTestStats);

// Record test attempt (for analytics)
router.post('/:id/attempt', protect, adminTestController.recordTestAttempt);

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