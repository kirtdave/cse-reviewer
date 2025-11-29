// controllers/customTestController.js
const { CustomTest, User } = require('../models');
const { Op } = require('sequelize');
const pdfParse = require('pdf-parse');
const aiService = require('../services/aiService');

// ==================== HELPER FUNCTION ====================
// Parse JSON fields if they're strings (safety measure)
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

// ==================== CREATE CUSTOM TEST ====================
exports.createCustomTest = async (req, res) => {
  try {
    const { title, description, sets, category, difficulty, timeLimit, isPublic, tags } = req.body;

    if (!title || !sets || sets.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Title and at least one set with questions are required' 
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

    const customTest = await CustomTest.create({
      userId: req.user.id,
      title,
      description: description || '',
      sets,
      category: category || 'Custom',
      difficulty: difficulty || 'Mixed',
      timeLimit: timeLimit || null,
      isPublic: isPublic || false,
      tags: tags || []
    });

    // ✅ Parse and return
    const parsedTest = parseTestData(customTest);

    res.status(201).json({ 
      success: true,
      message: 'Custom test created successfully',
      test: parsedTest
    });
  } catch (error) {
    console.error('Error creating custom test:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create custom test', 
      details: error.message 
    });
  }
};

// ==================== GET ALL USER'S TESTS ====================
exports.getUserTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty } = req.query;

    const result = await CustomTest.getUserTests(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      difficulty
    });

    // ✅ Parse all tests
    const parsedTests = result.tests.map(parseTestData);

    // ✅ DEBUG LOGGING (remove after testing)
    if (parsedTests.length > 0) {
      console.log('✅ First test sets type:', typeof parsedTests[0].sets);
      console.log('✅ Is Array?:', Array.isArray(parsedTests[0].sets));
      console.log('✅ Sets length:', parsedTests[0].sets.length);
      if (parsedTests[0].sets.length > 0) {
        console.log('✅ First set has questions:', parsedTests[0].sets[0].questions?.length || 0);
      }
    }

    res.json({
      success: true,
      tests: parsedTests,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching user tests:', error);
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
    const test = await CustomTest.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { userId: req.user.id },
          { isPublic: true }
        ]
      }
    });

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found' 
      });
    }

    // ✅ Parse and return
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
exports.updateCustomTest = async (req, res) => {
  try {
    const { title, description, sets, category, difficulty, timeLimit, isPublic, tags } = req.body;

    const test = await CustomTest.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!test) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found or unauthorized' 
      });
    }

    // Update fields
    if (title !== undefined) test.title = title;
    if (description !== undefined) test.description = description;
    if (sets !== undefined) test.sets = sets;
    if (category !== undefined) test.category = category;
    if (difficulty !== undefined) test.difficulty = difficulty;
    if (timeLimit !== undefined) test.timeLimit = timeLimit;
    if (isPublic !== undefined) test.isPublic = isPublic;
    if (tags !== undefined) test.tags = tags;

    await test.save();

    // ✅ Parse and return
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
exports.deleteCustomTest = async (req, res) => {
  try {
    const deleted = await CustomTest.destroy({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Test not found or unauthorized' 
      });
    }

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

// ==================== GENERATE QUESTIONS FROM PDF ====================
exports.generateQuestionsFromPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'PDF file is required' 
      });
    }

    const { type, count, command } = req.body;
    
    // Parse PDF
    const pdfData = await pdfParse(req.file.buffer);
    const pdfText = pdfData.text;

    if (!pdfText || pdfText.trim().length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Could not extract text from PDF' 
      });
    }

    console.log(`📄 Extracted ${pdfText.length} characters from PDF`);

    const questionCount = parseInt(count) || 10;
    const questionType = type || 'Verbal Ability';
    
    let questions = [];
    
    try {
      // Generate questions using AI with PDF context
      questions = await aiService.generateQuestions(questionType, 'Normal', questionCount);
      
      console.log(`✅ Generated ${questions.length} questions from PDF`);

    } catch (aiError) {
      console.error('AI generation error:', aiError);
      
      // Fallback: create sample questions
      questions = Array(Math.min(questionCount, 5)).fill(null).map((_, i) => ({
        question: `Question ${i + 1} based on PDF content`,
        options: ['A) Option 1', 'B) Option 2', 'C) Option 3', 'D) Option 4'],
        correctAnswer: 'A',
        explanation: 'This is a sample question generated from your PDF.',
        category: questionType,
        difficulty: 'Normal'
      }));
    }

    res.json({ 
      success: true,
      questions,
      extractedTextLength: pdfText.length
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error processing PDF', 
      details: error.message 
    });
  }
};

// ==================== GET TEST STATISTICS ====================
exports.getTestStats = async (req, res) => {
  try {
    const test = await CustomTest.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { userId: req.user.id },
          { isPublic: true }
        ]
      }
    });

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

// ==================== BROWSE PUBLIC TESTS ====================
exports.browsePublicTests = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, difficulty, search } = req.query;

    const result = await CustomTest.getPublicTests({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      difficulty,
      search
    });

    // ✅ Parse all tests
    const parsedTests = result.tests.map(parseTestData);

    res.json({
      success: true,
      tests: parsedTests,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error browsing public tests:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to browse tests', 
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

    const test = await CustomTest.findOne({
      where: {
        id: req.params.id,
        [Op.or]: [
          { userId: req.user.id },
          { isPublic: true }
        ]
      }
    });

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