// controllers/aiController.js
const aiService = require('../services/aiService');
const { User } = require('../models');

// Helper to handle AI-specific errors
function handleAiError(res, error) {
  if (error.message.startsWith('AI_OVERLOAD:')) {
    return res.status(503).json({ 
      success: false,
      message: error.message.replace('AI_OVERLOAD: ', ''),
      type: 'AI_ERROR',
      isOverload: true
    });
  } else if (error.message.startsWith('AI_INVALID_JSON:')) {
    return res.status(500).json({ 
      success: false,
      message: error.message.replace('AI_INVALID_JSON: ', ''),
      type: 'AI_ERROR'
    });
  } else if (error.message.startsWith('AI_GENERIC_ERROR:')) {
    return res.status(500).json({ 
      success: false,
      message: error.message.replace('AI_GENERIC_ERROR: ', ''),
      type: 'AI_ERROR'
    });
  }
  // Fallback for any other unexpected errors
  return res.status(500).json({ 
    success: false,
    message: 'An unexpected error occurred with the AI service. Please try again.', 
    error: error.message 
  });
}

// ✅ NEW: Helper to track AI usage
async function trackAIUsage(userId, questionsCount = 0, success = true) {
  try {
    const user = await User.findByPk(userId);
    if (user) {
      user.aiRequestCount = (user.aiRequestCount || 0) + 1;
      
      if (success) {
        user.apiSuccessCount = (user.apiSuccessCount || 0) + 1;
        if (questionsCount > 0) {
          user.questionsGeneratedCount = (user.questionsGeneratedCount || 0) + questionsCount;
        }
      } else {
        user.apiFailureCount = (user.apiFailureCount || 0) + 1;
      }
      
      await user.save();
    }
  } catch (error) {
    console.error('Error tracking AI usage:', error);
    // Don't throw - tracking shouldn't break the main flow
  }
}

// ==================== 1. GENERATE QUESTIONS ====================
exports.generateQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count } = req.body;

    // Validate input
    if (!topic || !difficulty) {
      return res.status(400).json({ 
        success: false,
        message: 'Topic and difficulty are required' 
      });
    }

    const questionCount = parseInt(count) || 5;

    console.log(`🤖 Generating ${questionCount} questions for ${topic} (${difficulty})`);

    const questions = await aiService.generateQuestions(topic, difficulty, questionCount);
    
    // ✅ Track successful generation
    await trackAIUsage(req.user.id, questions.length, true);
    
    res.status(200).json({ 
      success: true, 
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Controller Error generating questions:', error.message);
    
    // ✅ Track failed generation
    await trackAIUsage(req.user.id, 0, false);
    
    handleAiError(res, error);
  }
};

// ==================== 2. EXPLAIN ANSWER ====================
exports.explainAnswer = async (req, res) => {
  try {
    const { question, studentAnswer, correctAnswer } = req.body;

    if (!question || !studentAnswer || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question, student answer, and correct answer are required'
      });
    }

    const explanation = await aiService.explainAnswer(question, studentAnswer, correctAnswer);
    
    // ✅ Track successful explanation
    await trackAIUsage(req.user.id, 0, true);
    
    res.status(200).json({ 
      success: true, 
      explanation 
    });
  } catch (error) {
    console.error('Controller Error explaining answer:', error.message);
    
    // ✅ Track failed explanation
    await trackAIUsage(req.user.id, 0, false);
    
    handleAiError(res, error);
  }
};

// ==================== 4. GET STUDY RECOMMENDATIONS ====================
exports.getRecommendations = async (req, res) => {
  try {
    const { weakTopics, strongTopics, recentScores } = req.body;
    
    const recommendations = await aiService.getStudyRecommendations(
      weakTopics || [], 
      strongTopics || [], 
      recentScores || []
    );
    
    // ✅ Track successful recommendations
    await trackAIUsage(req.user.id, 0, true);
    
    res.status(200).json({ 
      success: true, 
      recommendations 
    });
  } catch (error) {
    console.error('Controller Error getting recommendations:', error.message);
    
    // ✅ Track failed recommendations
    await trackAIUsage(req.user.id, 0, false);
    
    handleAiError(res, error);
  }
};


// ==================== 6. CHAT WITH AI (FIXED WITH TIMEOUT & BETTER ERROR HANDLING) ====================
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [], questionData, userData } = req.body;

    console.log('=== AI CHAT REQUEST ===');
    console.log('Message:', message?.substring(0, 100) + '...');
    console.log('Has userData?', !!userData);
    console.log('Has questionData?', !!questionData);

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    // ✅ ADD TIMEOUT - Prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('AI_TIMEOUT: AI service took too long to respond (30s timeout)')), 30000);
    });

    let response;

    // If questionData is provided, use question-specific help
    if (questionData && questionData.questionText) {
      console.log('📝 Using question-specific help...');
      
      if (typeof aiService.helpWithQuestion === 'function') {
        const aiPromise = aiService.helpWithQuestion(questionData, message);
        response = await Promise.race([aiPromise, timeoutPromise]);
      } else {
        // Fallback: Use regular chat with context
        const contextMessage = `Help me understand this question:\n\nQuestion: ${questionData.questionText}\nCategory: ${questionData.category}\nStudent's Answer: ${questionData.isCorrect ? 'Correct' : 'Wrong'}\n\nStudent asks: ${message}`;
        const aiPromise = aiService.chatWithAI(contextMessage, conversationHistory, userData);
        response = await Promise.race([aiPromise, timeoutPromise]);
      }
    } else {
      console.log('💬 Using general chat...');
      
      // ✅ CRITICAL FIX: Check if chatWithAI exists
      if (typeof aiService.chatWithAI !== 'function') {
        console.error('❌ aiService.chatWithAI is not a function!');
        throw new Error('AI_GENERIC_ERROR: Chat service is not properly configured');
      }

      // ✅ Add timeout protection
      const aiPromise = aiService.chatWithAI(message, conversationHistory, userData);
      response = await Promise.race([aiPromise, timeoutPromise]);
    }

    console.log('✅ AI response received:', response?.substring(0, 100) + '...');

    // ✅ Track successful chat
    await trackAIUsage(req.user.id, 0, true);

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('❌ AI Chat error:', error.message);
    console.error('Stack:', error.stack);
    
    // ✅ Track failed chat
    try {
      await trackAIUsage(req.user.id, 0, false);
    } catch (trackError) {
      console.error('Failed to track error:', trackError);
    }
    
    // ✅ Handle timeout specifically
    if (error.message.includes('AI_TIMEOUT')) {
      return res.status(504).json({
        success: false,
        message: 'The AI service is taking too long to respond. Please try again.',
        type: 'TIMEOUT_ERROR'
      });
    }
    
    handleAiError(res, error);
  }
};

// ==================== 7. HELP WITH SPECIFIC QUESTION ====================
exports.questionHelp = async (req, res) => {
  try {
    const { questionData, message, userMessage } = req.body;

    if (!questionData || !questionData.questionText) {
      return res.status(400).json({ 
        success: false, 
        message: 'Question data is required' 
      });
    }

    // Support both 'message' and 'userMessage' parameter names
    const userQuery = message || userMessage;

    const response = await aiService.helpWithQuestion(questionData, userQuery);

    // ✅ Track successful question help
    await trackAIUsage(req.user.id, 0, true);

    res.json({
      success: true,
      response: response,
      help: response  // Include both for compatibility
    });

  } catch (error) {
    console.error('Question help error:', error);
    
    // ✅ Track failed question help
    await trackAIUsage(req.user.id, 0, false);
    
    handleAiError(res, error);
  }
};

// ==================== 8. GENERATE ANSWER CHOICES FOR EXISTING QUESTION ====================
exports.generateAnswerChoices = async (req, res) => {
  try {
    const { questionText, category } = req.body;

    if (!questionText) {
      return res.status(400).json({
        success: false,
        message: 'Question text is required'
      });
    }

    const result = await aiService.generateAnswerChoices(
      questionText, 
      category || 'General'
    );

    // ✅ Track successful answer choice generation
    await trackAIUsage(req.user.id, 0, true);

    res.json({
      success: true,
      choices: result.choices,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation
    });

  } catch (error) {
    console.error('Error generating answer choices:', error);
    
    // ✅ Track failed answer choice generation
    await trackAIUsage(req.user.id, 0, false);
    
    handleAiError(res, error);
  }
};