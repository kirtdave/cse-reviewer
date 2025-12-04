// controllers/adminTestController.js
const { AdminTest, User } = require('../models');
const { Op } = require('sequelize');
const { PDFParse } = require('pdf-parse'); // ✅ FIXED: Import PDFParse class
const aiService = require('../services/aiService');

// Parse JSON fields
const parseTestData = (test) => {
  const testData = test.toJSON ? test.toJSON() : test;
  
  return {
    ...testData,
    sets: typeof testData.sets === 'string' 
      ? JSON.parse(testData.sets) 
      : (Array.isArray(testData.sets) ? testData.sets : []),
    tags: typeof testData.tags === 'string'
      ? JSON.parse(testData.tags)
      : (Array.isArray(testData.tags) ? testData.tags : [])
  };
};

// ==================== CREATE ADMIN TEST ====================
exports.createAdminTest = async (req, res) => {
  try {
    const { title, description, testType, sets, category, difficulty, timeLimit, tags } = req.body;

    if (!title || !testType || !sets || sets.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Title, test type, and at least one set with questions are required' 
      });
    }

    // Validate test type
    if (!['Practice', 'Mock'].includes(testType)) {
      return res.status(400).json({
        success: false,
        error: 'Test type must be either "Practice" or "Mock"'
      });
    }

    // Validate sets structure
    for (const set of sets) {
      if (!set.title || !Array.isArray(set.questions)) {
        return res.status(400).json({ 
          success: false,
          error: 'Each set must have a title and questions array' 
        });
      }
    }

    const adminTest = await AdminTest.create({
      createdBy: req.user.id,
      title,
      description: description || '',
      testType,
      sets,
      category: category || 'Admin',
      difficulty: difficulty || 'Mixed',
      timeLimit: timeLimit || null,
      isPublished: false,
      tags: tags || []
    });

    const parsedTest = parseTestData(adminTest);

    res.status(201).json({ 
      success: true,
      message: 'Admin test created successfully',
      test: parsedTest
    });
  } catch (error) {
    console.error('Error creating admin test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create admin test', 
      details: error.message 
    });
  }
};

// ==================== GET ALL ADMIN TESTS ====================
exports.getAllAdminTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, testType, search } = req.query;

    const where = { isActive: true };
    
    if (testType && testType !== 'All') {
      where.testType = testType;
    }
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await AdminTest.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['updatedAt', 'DESC']],
      include: [{
        model: User,
        as: 'creator',
        attributes: ['name', 'email']
      }]
    });

    const parsedTests = rows.map(parseTestData);

    res.json({
      success: true,
      tests: parsedTests,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching admin tests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch tests', 
      details: error.message 
    });
  }
};

// ==================== GET PUBLISHED TESTS BY TYPE (FOR USERS) ====================
exports.getPublishedTestsByType = async (req, res) => {
  try {
    const { testType } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    if (!['Practice', 'Mock'].includes(testType)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid test type. Must be "Practice" or "Mock"'
      });
    }

    const result = await AdminTest.getPublishedByType(testType, {
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });

    const parsedTests = result.tests.map(parseTestData);

    res.json({
      success: true,
      tests: parsedTests,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching published tests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch tests', 
      details: error.message 
    });
  }
};

// ==================== GET SPECIFIC TEST ====================
exports.getTestById = async (req, res) => {
  try {
    const test = await AdminTest.findOne({
      where: {
        id: req.params.id,
        isActive: true
      },
      include: [{
        model: User,
        as: 'creator',
        attributes: ['name', 'email']
      }]
    });

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    const parsedTest = parseTestData(test);

    res.json({
      success: true,
      test: parsedTest
    });
  } catch (error) {
    console.error('Error fetching test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch test', 
      details: error.message 
    });
  }
};

// ==================== UPDATE TEST ====================
exports.updateAdminTest = async (req, res) => {
  try {
    const { title, description, testType, sets, category, difficulty, timeLimit, tags, isPublished } = req.body;

    const test = await AdminTest.findOne({
      where: {
        id: req.params.id,
        isActive: true
      }
    });

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    // Update fields
    if (title !== undefined) test.title = title;
    if (description !== undefined) test.description = description;
    if (testType !== undefined && ['Practice', 'Mock'].includes(testType)) test.testType = testType;
    if (sets !== undefined) test.sets = sets;
    if (category !== undefined) test.category = category;
    if (difficulty !== undefined) test.difficulty = difficulty;
    if (timeLimit !== undefined) test.timeLimit = timeLimit;
    if (tags !== undefined) test.tags = tags;
    if (isPublished !== undefined) test.isPublished = isPublished;

    await test.save();

    const parsedTest = parseTestData(test);

    res.json({ 
      success: true,
      message: 'Test updated successfully',
      test: parsedTest
    });
  } catch (error) {
    console.error('Error updating test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to update test', 
      details: error.message 
    });
  }
};

// ==================== DELETE TEST ====================
exports.deleteAdminTest = async (req, res) => {
  try {
    const test = await AdminTest.findOne({
      where: {
        id: req.params.id,
        isActive: true
      }
    });

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    test.isActive = false;
    await test.save();

    res.json({ 
      success: true,
      message: 'Test deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete test', 
      details: error.message 
    });
  }
};

// ==================== ✅ FIXED: GENERATE QUESTIONS FROM PDF ====================
exports.generateQuestionsFromPDF = async (req, res) => {
  try {
    console.log('📄 ========== PDF GENERATION REQUEST START (ADMIN) ==========');
    console.log('Request Headers:', {
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length']
    });
    console.log('Request Body:', req.body);
    console.log('File Info:', {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      mimeType: req.file?.mimetype,
      bufferLength: req.file?.buffer?.length
    });

    if (!req.file) {
      console.error('❌ No file uploaded');
      return res.status(400).json({ 
        success: false,
        error: 'PDF file is required. Please upload a PDF file.' 
      });
    }

    if (!req.file.buffer || req.file.buffer.length === 0) {
      console.error('❌ File buffer is empty');
      return res.status(400).json({ 
        success: false,
        error: 'Uploaded file is empty or corrupted.' 
      });
    }

    const { type, count, command } = req.body;
    console.log('PDF Generation Parameters:', { type, count, command });
    
    let pdfText = '';
    try {
      console.log('📖 Starting PDF parsing...');
      
      // ✅ FIXED: Use PDFParse class like in customTestController
      const pdfParser = new PDFParse({ data: req.file.buffer });
      const pdfData = await pdfParser.getText();
      pdfText = pdfData.text;
      
      console.log('✅ PDF Parsed Successfully:');
      console.log('  - Text Length:', pdfText.length);
      console.log('  - First 200 chars:', pdfText.substring(0, 200));
      
    } catch (pdfError) {
      console.error('❌ PDF Parsing Error Details:');
      console.error('  - Error Type:', pdfError.constructor.name);
      console.error('  - Error Message:', pdfError.message);
      console.error('  - Error Stack:', pdfError.stack);
      
      return res.status(400).json({ 
        success: false,
        error: 'Could not read PDF file. Make sure it contains readable text (not scanned images).',
        details: pdfError.message
      });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      console.error('❌ PDF contains no text');
      return res.status(400).json({ 
        success: false,
        error: 'Could not extract text from PDF. The PDF might be empty or contain only images.'
      });
    }

    if (pdfText.trim().length < 50) {
      console.warn('⚠️ PDF contains very little text:', pdfText.length, 'characters');
      return res.status(400).json({ 
        success: false,
        error: `PDF contains too little text (${pdfText.trim().length} characters). Need at least 50 characters.`
      });
    }

    const MAX_PDF_LENGTH = 8000;
    if (pdfText.length > MAX_PDF_LENGTH) {
      console.log(`⚠️ PDF text truncated from ${pdfText.length} to ${MAX_PDF_LENGTH} characters`);
      pdfText = pdfText.substring(0, MAX_PDF_LENGTH) + '...';
    }

    const questionCount = parseInt(count) || 10;
    const questionType = type || 'Verbal Ability';
    const userCommand = command || '';
    
    console.log(`🤖 Calling AI to generate ${questionCount} questions for ${questionType}`);
    
    let questions = [];
    
    try {
      // ✅ FIXED: Use the new generateQuestionsFromPDF function
      questions = await aiService.generateQuestionsFromPDF(
        pdfText,
        questionType,
        questionCount,
        userCommand
      );
      
      console.log(`✅ AI Generated ${questions.length} questions`);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('AI generated no valid questions');
      }

      // ✅ Validate and ensure proper structure
      questions = questions.map((q, idx) => ({
        question: q.question || `Question ${idx + 1}`,
        options: Array.isArray(q.options) && q.options.length === 4
          ? q.options
          : ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
        correctAnswer: q.correctAnswer || 'A',
        explanation: q.explanation || 'No explanation provided',
        category: q.category || questionType,
        difficulty: q.difficulty || 'Normal'
      }));

      console.log('✅ Questions validated and formatted');

    } catch (aiError) {
      console.error('❌ AI Generation Error:');
      console.error('  - Error Type:', aiError.constructor.name);
      console.error('  - Error Message:', aiError.message);
      
      if (aiError.message.includes('AI_OVERLOAD')) {
        return res.status(503).json({
          success: false,
          error: 'AI service is currently overloaded. Please try again in a few moments.',
          details: aiError.message
        });
      }

      if (aiError.message.includes('AI_INVALID_JSON')) {
        return res.status(500).json({
          success: false,
          error: 'AI generated invalid response. Please try again.',
          details: aiError.message
        });
      }

      return res.status(500).json({
        success: false,
        error: 'Failed to generate questions from PDF. The AI service may be temporarily unavailable.',
        details: aiError.message
      });
    }

    console.log('✅ ========== PDF GENERATION SUCCESS (ADMIN) ==========');
    res.json({ 
      success: true,
      questions,
      extractedTextLength: pdfText.length,
      message: `Successfully generated ${questions.length} questions from PDF`
    });

  } catch (error) {
    console.error('❌ ========== UNEXPECTED ERROR ==========');
    console.error('Error Type:', error.constructor.name);
    console.error('Error Message:', error.message);
    console.error('Error Stack:', error.stack);
    
    res.status(500).json({ 
      success: false,
      error: 'Unexpected error processing PDF', 
      details: error.message 
    });
  }
};

// ==================== PUBLISH/UNPUBLISH TEST ====================
exports.togglePublish = async (req, res) => {
  try {
    const test = await AdminTest.findByPk(req.params.id);

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    test.isPublished = !test.isPublished;
    await test.save();

    res.json({ 
      success: true,
      message: test.isPublished ? 'Test published successfully' : 'Test unpublished successfully',
      isPublished: test.isPublished
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to toggle publish status', 
      details: error.message 
    });
  }
};

// ==================== GET TEST STATISTICS ====================
exports.getTestStats = async (req, res) => {
  try {
    const test = await AdminTest.findByPk(req.params.id);

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    const stats = test.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching test stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch statistics', 
      details: error.message 
    });
  }
};

// ==================== RECORD TEST ATTEMPT ====================
exports.recordTestAttempt = async (req, res) => {
  try {
    const { score } = req.body;
    
    if (score === undefined || score < 0 || score > 100) {
      return res.status(400).json({ 
        success: false,
        error: 'Valid score (0-100) is required' 
      });
    }

    const test = await AdminTest.findByPk(req.params.id);

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    await test.recordAttempt(score);

    res.json({ 
      success: true,
      message: 'Test attempt recorded',
      attempts: test.attempts,
      averageScore: test.averageScore
    });
  } catch (error) {
    console.error('Error recording attempt:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to record attempt', 
      details: error.message 
    });
  }
};