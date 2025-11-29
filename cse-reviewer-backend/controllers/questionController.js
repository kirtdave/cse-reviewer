// controllers/questionController.js
const { Op } = require('sequelize');
const { Question, UserQuestionProgress } = require('../models'); // ✅ Import from models/index.js
const aiService = require('../services/aiService');

// ==================== SMART QUESTION GENERATION ====================

/**
 * Generate questions with smart DB checking:
 * 1. Check DB for existing questions
 * 2. EXCLUDE questions from the IMMEDIATELY PREVIOUS test only ✅ 
 * 3. ENSURE NO DUPLICATES within the same batch ✅ 
 * 4. Allow questions from older tests (not consecutive)
 * 5. Reuse if available (prioritize least-used)
 * 6. Generate new ones if needed
 * 7. Save new questions to DB
 */
exports.generateSmartQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count = 5 } = req.body;
    const userId = req.user.id;

    if (!topic || !difficulty) {
      return res.status(400).json({ 
        success: false, 
        message: 'Topic and difficulty are required' 
      });
    }

    console.log(`🎯 Generating ${count} ${difficulty} questions for ${topic} (User: ${userId})...`);

    // ✅ Step 1: Get questions used in the LAST TEST ONLY (within last 5 minutes)
    const recentCutoff = new Date(Date.now() - 5 * 60 * 1000);
    
    const recentlyUsedQuestions = await UserQuestionProgress.findAll({ 
      where: {
        userId,
        lastUsedInTest: {
          [Op.gte]: recentCutoff
        }
      },
      attributes: ['questionId']
    });
    
    const recentQuestionIds = recentlyUsedQuestions.map(q => q.questionId);
    
    console.log(`📝 User recently used ${recentQuestionIds.length} questions (last 5 min) - will exclude these`);

    // ✅ Step 2: Track used questions to prevent duplicates within same batch
    const usedQuestionTexts = new Set();
    const usedQuestionIds = new Set(recentQuestionIds);

    // ✅ Step 3: Get existing questions from DB (EXCLUDING recently used ones)
    const existingQuestions = await Question.findAll({
      where: {
        category: topic,
        difficulty: difficulty,
        isActive: true,
        id: {
          [Op.notIn]: recentQuestionIds.length > 0 ? recentQuestionIds : [0]
        }
      },
      order: [['usageCount', 'ASC']],
      limit: count * 2
    });
    
    console.log(`✅ Found ${existingQuestions.length} potential questions in DB`);

    const questionsToReturn = [];
    let questionsToGenerate = count;

    // Step 4: Use existing questions (with deduplication)
    for (const question of existingQuestions) {
      if (questionsToReturn.length >= count) break;

      const questionText = question.questionText.toLowerCase().trim();
      const questionId = question.id;

      // ✅ Skip if duplicate by text or ID
      if (usedQuestionTexts.has(questionText) || usedQuestionIds.has(questionId)) {
        console.log(`⚠️ Skipping duplicate question: ${questionId}`);
        continue;
      }

      // Mark as used
      usedQuestionTexts.add(questionText);
      usedQuestionIds.add(questionId);

      // Increment usage count
      await question.increment('usageCount');
      
      questionsToReturn.push({
        question: question.questionText,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        category: question.category,
        _id: questionId
      });
    }

    questionsToGenerate = count - questionsToReturn.length;
    console.log(`📊 After DB: ${questionsToReturn.length}/${count} questions. Need to generate: ${questionsToGenerate}`);

    // Step 5: Generate new questions if needed
    if (questionsToGenerate > 0) {
      console.log(`🤖 Generating ${questionsToGenerate} new questions with AI...`);
      
      try {
        const generateCount = Math.min(questionsToGenerate * 2, 20);
        const newQuestions = await aiService.generateQuestions(topic, difficulty, generateCount);
        
        console.log(`🤖 AI generated ${newQuestions.length} questions`);

        // Step 6: Save new questions to DB (with deduplication)
        for (const q of newQuestions) {
          if (questionsToReturn.length >= count) break;

          const questionText = q.question.toLowerCase().trim();

          // ✅ Skip if duplicate text
          if (usedQuestionTexts.has(questionText)) {
            console.log(`⚠️ Skipping duplicate AI question`);
            continue;
          }

          try {
            const exists = await Question.questionExists(q.question, topic);
            
            if (!exists) {
              const savedQuestion = await Question.create({
                questionText: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                category: topic,
                difficulty: difficulty,
                usageCount: 1,
                source: 'AI'
              });

              usedQuestionTexts.add(questionText);
              usedQuestionIds.add(savedQuestion.id);

              questionsToReturn.push({
                question: savedQuestion.questionText,
                options: savedQuestion.options,
                correctAnswer: savedQuestion.correctAnswer,
                explanation: savedQuestion.explanation,
                category: savedQuestion.category,
                _id: savedQuestion.id
              });

              console.log(`💾 Saved new question to DB: ${savedQuestion.id}`);
            } else {
              console.log(`⚠️ Question already exists in DB, skipping...`);
            }
          } catch (saveError) {
            console.error('Error saving question:', saveError);
            
            if (!usedQuestionTexts.has(questionText)) {
              usedQuestionTexts.add(questionText);
              
              questionsToReturn.push({
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation,
                category: topic,
                _id: null
              });
            }
          }
        }
      } catch (aiError) {
        console.error('AI generation failed:', aiError);
        
        const remainingNeeded = count - questionsToReturn.length;
        
        if (remainingNeeded > 0) {
          console.log(`⚠️ AI failed, fetching ${remainingNeeded} more from DB as fallback`);
          
          const fallbackQuestions = await Question.findAll({
            where: {
              category: topic,
              difficulty: difficulty,
              isActive: true,
              id: {
                [Op.notIn]: Array.from(usedQuestionIds)
              }
            },
            order: [['usageCount', 'ASC']],
            limit: remainingNeeded * 2
          });
          
          for (const q of fallbackQuestions) {
            if (questionsToReturn.length >= count) break;

            const questionText = q.questionText.toLowerCase().trim();
            const questionId = q.id;

            if (usedQuestionTexts.has(questionText) || usedQuestionIds.has(questionId)) {
              console.log(`⚠️ Skipping duplicate fallback question: ${questionId}`);
              continue;
            }

            usedQuestionTexts.add(questionText);
            usedQuestionIds.add(questionId);

            await q.increment('usageCount');
            
            questionsToReturn.push({
              question: q.questionText,
              options: q.options,
              correctAnswer: q.correctAnswer,
              explanation: q.explanation,
              category: q.category,
              _id: questionId
            });
          }
        }
      }
    }

    // ✅ Final deduplication check
    const uniqueQuestions = [];
    const finalCheck = new Set();
    
    for (const q of questionsToReturn) {
      const checkText = q.question.toLowerCase().trim();
      if (!finalCheck.has(checkText)) {
        finalCheck.add(checkText);
        uniqueQuestions.push(q);
      } else {
        console.log(`⚠️ Final check removed duplicate: "${q.question.substring(0, 50)}..."`);
      }
    }

    // ✅ Step 7: Mark these questions as "used in this test"
    const now = new Date();
    const updatePromises = uniqueQuestions
      .filter(q => q._id)
      .map(q => 
        UserQuestionProgress.findOrCreate({
          where: { userId, questionId: q._id },
          defaults: { userId, questionId: q._id }
        }).then(([progress]) => {
          progress.lastUsedInTest = now;
          return progress.save();
        })
      );
    
    await Promise.all(updatePromises);
    console.log(`✅ Marked ${updatePromises.length} questions as used in this test`);

    const questionsWithIds = uniqueQuestions.filter(q => q._id).length;
    console.log(`✅ Returning ${uniqueQuestions.length} UNIQUE questions (${questionsWithIds} with IDs)`);

    res.json({
      success: true,
      questions: uniqueQuestions,
      stats: {
        requested: count,
        returned: uniqueQuestions.length,
        fromDB: existingQuestions.length,
        generated: uniqueQuestions.length - existingQuestions.length,
        withIds: questionsWithIds,
        recentlyUsedExcluded: recentQuestionIds.length,
        duplicatesRemoved: questionsToReturn.length - uniqueQuestions.length
      }
    });

  } catch (error) {
    console.error('❌ Error in smart question generation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate questions',
      error: error.message
    });
  }
};

// ==================== UPDATE USER PROGRESS ====================

/**
 * Update user's progress after answering questions
 */
exports.updateUserProgress = async (req, res) => {
  try {
    const { questionResults } = req.body;
    const userId = req.user.id;

    console.log('📊 Received progress update request:', {
      userId: userId,
      questionCount: questionResults?.length || 0
    });

    if (!questionResults || !Array.isArray(questionResults)) {
      return res.status(400).json({
        success: false,
        message: 'questionResults array is required'
      });
    }

    if (questionResults.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'questionResults array is empty'
      });
    }

    const updates = [];
    const errors = [];

    for (const result of questionResults) {
      const { questionId, isCorrect } = result;
      
      console.log(`Processing question ${questionId}:`, { isCorrect });
      
      if (!questionId) {
        console.warn('⚠️ Skipping result with no questionId');
        errors.push({ error: 'Missing questionId', result });
        continue;
      }

      try {
        // Validate that question exists
        const questionExists = await Question.findByPk(questionId);
        if (!questionExists) {
          console.warn(`⚠️ Question ${questionId} not found in database`);
          errors.push({ error: 'Question not found', questionId });
          continue;
        }

        // Get or create progress record
        const progress = await UserQuestionProgress.getOrCreate(userId, questionId);
        
        // Update progress based on correctness
        await progress.recordAnswer(isCorrect);
        
        updates.push({
          questionId,
          status: progress.status,
          correctStreak: progress.correctStreak,
          totalAttempts: progress.totalAttempts
        });

        console.log(`✅ Updated progress for question ${questionId}: ${progress.status}`);
      } catch (error) {
        console.error(`❌ Error processing question ${questionId}:`, error);
        errors.push({ error: error.message, questionId });
      }
    }

    console.log(`📊 Progress update complete:`, {
      successful: updates.length,
      failed: errors.length,
      total: questionResults.length
    });

    res.json({
      success: true,
      message: 'Progress updated successfully',
      stats: {
        processed: questionResults.length,
        successful: updates.length,
        failed: errors.length
      },
      updates,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Error updating user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

// ==================== GET QUESTION BANK STATS ====================

exports.getQuestionBankStats = async (req, res) => {
  try {
    const stats = await Question.getStats();
    
    res.json({
      success: true,
      stats: {
        total: stats.total,
        byCategory: stats.byCategory.map(cat => ({
          category: cat._id,
          count: cat.count,
          avgUsage: Math.round(cat.avgUsage)
        })),
        byDifficulty: stats.byDifficulty.map(diff => ({
          difficulty: diff._id,
          count: diff.count
        }))
      }
    });

  } catch (error) {
    console.error('❌ Error fetching question bank stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error.message
    });
  }
};

// ==================== GET USER'S QUESTION STATS ====================

exports.getUserQuestionStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('📊 Fetching question stats for user:', userId);
    
    const userStats = await UserQuestionProgress.getUserStats(userId);
    const totalAvailable = await Question.count({ where: { isActive: true } });
    
    console.log('✅ User question stats:', userStats);
    console.log('📚 Total available questions in DB:', totalAvailable);
    
    res.json({
      success: true,
      stats: {
        mastered: userStats.mastered,
        learning: userStats.learning,
        needsReview: userStats.needsReview,
        total: userStats.total,
        totalAvailable: totalAvailable
      }
    });

  } catch (error) {
    console.error('❌ Error fetching user question stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stats',
      error: error.message
    });
  }
};

// ==================== GET QUESTIONS NEEDING REVIEW ====================

exports.getQuestionsNeedingReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const questions = await UserQuestionProgress.getQuestionsNeedingReview(userId, parseInt(limit));
    
    res.json({
      success: true,
      questions: questions.map(q => ({
        ...q.questionId.toJSON(),
        progress: {
          status: q.status,
          correctStreak: q.correctStreak,
          totalAttempts: q.totalAttempts,
          lastAnswered: q.lastAnsweredAt
        }
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching review questions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch review questions',
      error: error.message
    });
  }
};

// ==================== ADMIN: MANUALLY ADD QUESTION ====================

exports.createQuestion = async (req, res) => {
  try {
    const { questionText, options, correctAnswer, explanation, category, difficulty, tags } = req.body;

    if (!questionText || !options || !correctAnswer || !explanation || !category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const exists = await Question.questionExists(questionText, category);
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Question already exists in the database'
      });
    }

    const question = await Question.create({
      questionText,
      options,
      correctAnswer,
      explanation,
      category,
      difficulty,
      tags: tags || [],
      source: 'Manual'
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });

  } catch (error) {
    console.error('❌ Error creating question:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create question',
      error: error.message
    });
  }
};