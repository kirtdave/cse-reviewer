// src/utils/testResultHelper.js

/**
 * ✅ UPDATED: Calculate section scores for ALL 7 categories
 */
export const calculateSectionScores = (questions, answers, results) => {
  // Map all 7 category names to their keys
  const categoryMap = {
    'Verbal Ability': 'verbal',
    'Numerical Ability': 'numerical',
    'Analytical Ability': 'analytical',
    'General Knowledge': 'generalInfo',
    'Clerical Ability': 'clerical',
    'Philippine Constitution': 'constitution'
  };

  const sections = {
    verbal: { correct: 0, total: 0 },
    numerical: { correct: 0, total: 0 },
    analytical: { correct: 0, total: 0 },
    generalInfo: { correct: 0, total: 0 },
    clerical: { correct: 0, total: 0 },
    constitution: { correct: 0, total: 0 }
  };

  questions.forEach((q, index) => {
    const category = q.category || 'General Knowledge';
    
    // Try exact match first
    let sectionKey = categoryMap[category];
    
    // If no exact match, try fuzzy matching
    if (!sectionKey) {
      const lowerCategory = category.toLowerCase();
      if (lowerCategory.includes('verbal')) sectionKey = 'verbal';
      else if (lowerCategory.includes('numerical')) sectionKey = 'numerical';
      else if (lowerCategory.includes('analytical')) sectionKey = 'analytical';
      else if (lowerCategory.includes('clerical')) sectionKey = 'clerical';
      else if (lowerCategory.includes('constitution') || lowerCategory.includes('philippine')) sectionKey = 'constitution';
      else sectionKey = 'generalInfo';
    }

    sections[sectionKey].total++;
    if (results[index] === 'correct') {
      sections[sectionKey].correct++;
    }
  });

  // Calculate percentages for all 7 sections
  const sectionScores = {};
  Object.keys(sections).forEach(key => {
    sectionScores[key] = sections[key].total > 0 
      ? Math.round((sections[key].correct / sections[key].total) * 100)
      : 0;
  });

  return sectionScores;
};

/**
 * ✅ NEW: Calculate question type scores (Multiple Choice, Essay, Situational)
 */
export const calculateQuestionTypeScores = (questions, results) => {
  const typeScores = {
    multipleChoice: { correct: 0, total: 0 },
    essay: { correct: 0, total: 0 },
    situational: { correct: 0, total: 0 }
  };

  questions.forEach((q, index) => {
    const questionType = q.type || determineQuestionType(q);
    
    if (questionType === 'Multiple Choice') {
      typeScores.multipleChoice.total++;
      if (results[index] === 'correct') {
        typeScores.multipleChoice.correct++;
      }
    }
  });

  // Calculate percentages
  return {
    multipleChoice: typeScores.multipleChoice.total > 0 
      ? Math.round((typeScores.multipleChoice.correct / typeScores.multipleChoice.total) * 100)
      : 0,
    essay: typeScores.essay.total > 0 
      ? Math.round((typeScores.essay.correct / typeScores.essay.total) * 100)
      : 0,
    situational: typeScores.situational.total > 0 
      ? Math.round((typeScores.situational.correct / typeScores.situational.total) * 100)
      : 0
  };
};

/**
 * ✅ FIXED: Determine question type - prioritize explicit type, then check for multiple choice
 */
const determineQuestionType = (question) => {
  // If question already has a type, use it
  if (question.type) {
    return question.type;
  }

  const questionText = question.question?.toLowerCase() || '';
  
  // If it has 2+ options, it's definitely Multiple Choice
  if (question.options && Array.isArray(question.options) && question.options.length >= 2) {
    const hasValidOptions = question.options.every(opt => opt && typeof opt === 'string' && opt.trim().length > 0);
    if (hasValidOptions) {
      return 'Multiple Choice';
    }
  }
};

/**
 * Format time duration in human-readable format
 */
export const formatTimeSpent = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${remainingSeconds} seconds`;
  } else if (remainingSeconds === 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`;
  }
};

/**
 * Generate test name based on categories
 */
export const generateTestName = (categories, isMockExam = false) => {
  if (!categories || categories.length === 0) {
    return isMockExam ? "Mock Exam" : "Practice Test";
  }
  
  const date = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  const prefix = isMockExam ? "Mock Exam" : "Practice Test";
  
  if (categories.length === 1) {
    return `${prefix}: ${categories[0]} - ${date}`;
  } else if (categories.length === 2) {
    return `${prefix}: ${categories[0]} & ${categories[1]} - ${date}`;
  } else {
    return `${prefix} - ${date}`;
  }
};

/**
 * Check if question is math-related
 */
const isMathQuestion = (question) => {
  const mathKeywords = [
    'calculate', 'sum', 'difference', 'product', 'quotient',
    'digit', 'number', 'equation', 'formula', 'average',
    'percentage', 'ratio', 'fraction', 'decimal',
    'add', 'subtract', 'multiply', 'divide',
    'greater', 'less', 'equal', 'total',
    'rate', 'speed', 'distance', 'time',
    'area', 'volume', 'perimeter', 'angle'
  ];
  
  const questionText = question.question.toLowerCase();
  return mathKeywords.some(keyword => questionText.includes(keyword)) ||
         /\d/.test(question.question); // Contains numbers
};

/**
 * Generate SHORT explanation - with multiple solutions for math
 */
const generateExplanation = (question, userAnswerIndex, correctAnswerIndex) => {
  const correctAnswer = question.options[correctAnswerIndex];
  
  // Unanswered
  if (userAnswerIndex === undefined || userAnswerIndex === null) {
    return `Correct answer: ${correctAnswer}`;
  }
  
  // Correct answer
  if (userAnswerIndex === correctAnswerIndex) {
    return `✓ Correct! The answer is ${correctAnswer}.`;
  }
  
  // Wrong answer - SHORT
  const userAnswer = question.options[userAnswerIndex];
  return `✗ Incorrect. You chose "${userAnswer}" but the correct answer is "${correctAnswer}".`;
};

/**
 * ✅ UPDATED: Prepare test attempt data for backend - now with ALL 7 categories and question types
 */
export const prepareTestAttemptData = (
  questions,
  answers,
  results,
  categories,
  timeLimit,
  timeLeft,
  startTime,
  isMockExam = false
) => {
  const correctCount = Object.values(results).filter(r => r === 'correct').length;
  const incorrectCount = Object.values(results).filter(r => r === 'wrong').length;
  const unansweredCount = questions.length - Object.keys(answers).length;
  const totalQuestions = questions.length;
  const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  
  // ✅ Calculate section scores for all 7 categories
  const sectionScores = calculateSectionScores(questions, answers, results);
  
  // ✅ Calculate question type scores
  const questionTypeScores = calculateQuestionTypeScores(questions, results);
  
  const timeSpentSeconds = (timeLimit * 60) - timeLeft;
  const timeSpent = formatTimeSpent(timeSpentSeconds);
  
  const testName = generateTestName(categories, isMockExam);
  
  const questionResponses = questions.map((q, index) => {
    const userAnswerIndex = answers[index];
    const correctAnswerIndex = q.answer;
    
    return {
      questionId: q.id || `q_${index}`,
      questionText: q.question,
      category: q.category || 'General',
      questionType: q.type || determineQuestionType(q), // ✅ Track question type
      difficulty: q.difficulty || 'Normal',
      options: q.options || [],
      userAnswer: userAnswerIndex !== undefined ? q.options[userAnswerIndex] : null,
      userAnswerIndex: userAnswerIndex !== undefined ? userAnswerIndex : null,
      correctAnswer: q.options[correctAnswerIndex],
      correctAnswerIndex: correctAnswerIndex,
      isCorrect: userAnswerIndex === correctAnswerIndex,
      timeSpent: totalQuestions > 0 ? Math.floor(timeSpentSeconds / totalQuestions) : 0,
      explanation: q.explanation || generateExplanation(q, userAnswerIndex, correctAnswerIndex)
    };
  });
  
  return {
    name: testName,
    score: score,
    result: score >= 70 ? "Passed" : "Failed",
    isMockExam: isMockExam,
    details: {
      sectionScores: sectionScores, // ✅ Now includes all 7 categories
      questionTypeScores: questionTypeScores, // ✅ NEW: Question type scores
      timeSpent: timeSpent,
      timeSpentSeconds: timeSpentSeconds,
      correctQuestions: correctCount,
      incorrectQuestions: incorrectCount,
      totalQuestions: totalQuestions,
      unansweredQuestions: unansweredCount
    },
    questionResponses: questionResponses,
    testConfig: {
      categories: categories,
      difficulty: 'Mixed',
      questionCount: totalQuestions,
      timeLimit: timeLimit
    },
    startedAt: startTime,
    completedAt: new Date()
  };
};

/**
 * Calculate section-wise performance (helper for analytics)
 */
export const calculateSectionPerformance = (questions, results) => {
  const sections = {};
  
  questions.forEach((q, idx) => {
    const category = q.category || 'General';
    
    if (!sections[category]) {
      sections[category] = {
        total: 0,
        correct: 0,
        incorrect: 0,
        unanswered: 0
      };
    }
    
    sections[category].total++;
    
    if (results[idx] === 'correct') {
      sections[category].correct++;
    } else if (results[idx] === 'wrong') {
      sections[category].incorrect++;
    } else {
      sections[category].unanswered++;
    }
  });
  
  Object.keys(sections).forEach(category => {
    const section = sections[category];
    section.percentage = section.total > 0 
      ? Math.round((section.correct / section.total) * 100) 
      : 0;
  });
  
  return sections;
};