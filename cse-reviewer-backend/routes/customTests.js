// routes/customTests.js - FIXED
const express = require('express');
const router = express.Router();
const customTestController = require('../controllers/customTestController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const rateLimit = require('express-rate-limit');

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

// Rate limiting middleware
const publicBrowseLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests to browse tests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ FIXED: PDF generation rate limit with proper key generator
const pdfGenerationLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use 'anonymous'
    return req.user?.id?.toString() || 'anonymous';
  },
  message: 'Too many PDF generation requests. Please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== PUBLIC ROUTES ====================
router.get('/public/browse', publicBrowseLimit, customTestController.browsePublicTests);

// ==================== PROTECTED ROUTES ====================
router.get('/', protect, customTestController.getUserTests);
router.post('/', protect, customTestController.createCustomTest);

// PDF generation - MUST BE BEFORE /:id routes
router.post(
  '/generate-from-pdf', 
  protect,
  pdfGenerationLimit,
  upload.single('file'), 
  customTestController.generateQuestionsFromPDF
);

router.get('/:id', protect, customTestController.getTestById);
router.put('/:id', protect, customTestController.updateCustomTest);
router.delete('/:id', protect, customTestController.deleteCustomTest);
router.get('/:id/stats', protect, customTestController.getTestStats);
router.post('/:id/attempt', protect, customTestController.recordTestAttempt);

// ==================== ERROR HANDLER ====================
router.use((err, req, res, next) => {
  // Handle rate limit errors
  if (err.status === 429) {
    return res.status(429).json({ 
      success: false,
      error: err.message,
      retryAfter: err.retryAfter
    });
  }

  // Handle multer errors
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
  
  // Handle file type validation errors
  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ 
      success: false,
      error: err.message 
    });
  }
  
  next(err);
});

module.exports = router;