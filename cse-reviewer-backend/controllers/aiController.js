const aiService = require('../services/aiService');

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
    
    res.status(200).json({ 
      success: true, 
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error('Controller Error generating questions:', error.message);
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
    
    res.status(200).json({ 
      success: true, 
      explanation 
    });
  } catch (error) {
    console.error('Controller Error explaining answer:', error.message);
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
    
    res.status(200).json({ 
      success: true, 
      recommendations 
    });
  } catch (error) {
    console.error('Controller Error getting recommendations:', error.message);
    handleAiError(res, error);
  }
};


// ==================== 6. CHAT WITH AI ====================
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory = [], questionData } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message is required' 
      });
    }

    let response;

    // If questionData is provided, use question-specific help
    if (questionData && questionData.questionText) {
      // Check if helpWithQuestion exists in aiService
      if (typeof aiService.helpWithQuestion === 'function') {
        response = await aiService.helpWithQuestion(questionData, message);
      } else {
        // Fallback: Use regular chat with context
        const contextMessage = `Help me understand this question:\n\nQuestion: ${questionData.questionText}\nCategory: ${questionData.category}\nStudent's Answer: ${questionData.isCorrect ? 'Correct' : 'Wrong'}\n\nStudent asks: ${message}`;
        response = await aiService.chatWithAI(contextMessage, conversationHistory);
      }
    } else {
      // Regular chat without question context
      response = await aiService.chatWithAI(message, conversationHistory);
    }

    res.json({
      success: true,
      response: response
    });

  } catch (error) {
    console.error('AI Chat error:', error);
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

    res.json({
      success: true,
      response: response,
      help: response  // Include both for compatibility
    });

  } catch (error) {
    console.error('Question help error:', error);
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

    res.json({
      success: true,
      choices: result.choices,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation
    });

  } catch (error) {
    console.error('Error generating answer choices:', error);
    handleAiError(res, error);
  }
};