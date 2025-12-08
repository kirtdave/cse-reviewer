// routes/testAttempts.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { TestAttempt, User, UserAchievement } = require('../models');
const { protect } = require('../middleware/auth');

// ==================== CREATE ====================

router.post('/', protect, async (req, res) => {
  try {
    const {
      name,
      score,
      result,
      isMockExam,
      details,
      questionResponses,
      testConfig,
      startedAt,
      completedAt
    } = req.body;

    if (!name || score === undefined || !result || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const testAttempt = await TestAttempt.create({
      userId: req.user.id,
      name,
      score: Math.round(score),
      result,
      isMockExam: isMockExam || false,
      details: {
        sectionScores: details.sectionScores || { 
          verbal: 0, 
          numerical: 0, 
          analytical: 0, 
          generalInfo: 0,
          clerical: 0,
          numericalReasoning: 0,
          constitution: 0
        },
        questionTypeScores: details.questionTypeScores || {
          multipleChoice: 0,
          essay: 0,
          situational: 0
        },
        timeSpent: details.timeSpent || '0 minutes',
        timeSpentSeconds: details.timeSpentSeconds || 0,
        correctQuestions: details.correctQuestions || 0,
        incorrectQuestions: details.incorrectQuestions || 0,
        totalQuestions: details.totalQuestions || (details.correctQuestions + details.incorrectQuestions),
        unansweredQuestions: details.unansweredQuestions || 0
      },
      questionResponses: questionResponses || [],
      testConfig: testConfig || {},
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      completedAt: completedAt ? new Date(completedAt) : new Date()
    });

    // ✅ UPDATE USER STATS AND AWARD ACHIEVEMENTS
    const user = await User.findByPk(req.user.id);
    
    if (user) {
      // Update user stats
      user.testsCompleted += 1;
      user.questionsSolved += (details.correctQuestions || 0);
      user.totalStudyTimeMinutes += details.timeSpentSeconds ? Math.floor(details.timeSpentSeconds / 60) : 0;
      
      // Update average score
      if (user.testsCompleted === 1) {
        user.avgScore = score;
      } else {
        user.avgScore = ((user.avgScore * (user.testsCompleted - 1)) + score) / user.testsCompleted;
      }
      
      // Update streak
      user.updateStreak();
      
      await user.save();
      
      console.log('✅ User stats updated:', {
        testsCompleted: user.testsCompleted,
        avgScore: user.avgScore,
        questionsSolved: user.questionsSolved,
        currentStreak: user.currentStreak
      });
      
      // ✅ CHECK AND AWARD ACHIEVEMENTS
      let newAchievements = [];
      try {
        newAchievements = await UserAchievement.checkAndAward(user);
        
        // ✅ Award perfect score achievement if score is 100%
        if (score === 100) {
          const perfectScore = await UserAchievement.awardSpecific(req.user.id, 'perfect_score');
          if (perfectScore) {
            newAchievements.push(perfectScore);
          }
        }
        
        if (newAchievements.length > 0) {
          console.log(`🏆 Awarded ${newAchievements.length} new achievements!`);
        }
      } catch (achievementError) {
        console.error('⚠️ Error checking achievements:', achievementError.message);
        // Continue even if achievements fail
      }
      
      // ✅ RETURN TEST RESULT WITH NEW ACHIEVEMENTS
      res.status(201).json({ 
        message: 'Test attempt saved successfully', 
        attempt: testAttempt,
        newAchievements: newAchievements.map(a => ({
          icon: a.icon,
          title: a.title,
          description: a.description
        }))
      });
    } else {
      // User not found, just save the test
      res.status(201).json({ 
        message: 'Test attempt saved successfully', 
        attempt: testAttempt 
      });
    }

  } catch (error) {
    console.error('Error saving test attempt:', error);
    res.status(500).json({ error: 'Failed to save test attempt', details: error.message });
  }
});

// ==================== READ ====================

// ✅ UPDATED: Can include deleted tests for analytics
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'completedAt', 
      sortOrder = 'desc',
      result,
      isMockExam,
      includeDeleted = false  // ✅ NEW: Allow including deleted for analytics
    } = req.query;

    const where = { 
      userId: req.user.id
    };
    
    // ✅ Only filter deleted if not explicitly requesting them
    if (includeDeleted !== 'true') {
      where.isDeleted = false;
    }
    
    if (result && result !== 'All') {
      where.result = result;
    }
    
    if (isMockExam === 'true') {
      where.isMockExam = true;
    }

    const order = [[sortBy, sortOrder.toUpperCase()]];
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await TestAttempt.findAndCountAll({
      where,
      order,
      offset,
      limit: parseInt(limit)
    });

    res.json({
      attempts: rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching test attempts:', error);
    res.status(500).json({ error: 'Failed to fetch test attempts', details: error.message });
  }
});

// ✅ UPDATED: Stats include ALL tests (even deleted) for accuracy
router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { isMockExam } = req.query;
    const filter = {};

    if (isMockExam === 'true') {
      filter.isMockExam = true;
    }
    
    // ✅ getUserStats includes deleted tests for accurate stats
    const stats = await TestAttempt.getUserStats(req.user.id, filter);
    res.json(stats);

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

// ✅ UPDATED: Trend includes ALL tests for accuracy
router.get('/stats/trend', protect, async (req, res) => {
  try {
    const { limit = 7, isMockExam } = req.query;
    const filter = {};

    if (isMockExam === 'true') {
      filter.isMockExam = true;
    }

    // ✅ getPerformanceTrend includes deleted tests
    const trend = await TestAttempt.getPerformanceTrend(req.user.id, parseInt(limit), filter);
    res.json(trend);

  } catch (error) {
    console.error('Error fetching performance trend:', error);
    res.status(500).json({ error: 'Failed to fetch performance trend', details: error.message });
  }
});

// ✅ UPDATED: Section stats include ALL tests
router.get('/stats/sections', protect, async (req, res) => {
  try {
    const { isMockExam } = req.query;
    const where = { userId: req.user.id };
    // ✅ Include ALL tests for accurate section averages

    if (isMockExam === 'true') {
      where.isMockExam = true;
    }

    const attempts = await TestAttempt.findAll({
      where,
      attributes: ['details']
    });

    const totals = { 
      verbal: 0, 
      numerical: 0, 
      analytical: 0, 
      generalInfo: 0,
      clerical: 0,
      numericalReasoning: 0,
      constitution: 0
    };
    
    const counts = { 
      verbal: 0, 
      numerical: 0, 
      analytical: 0, 
      generalInfo: 0,
      clerical: 0,
      numericalReasoning: 0,
      constitution: 0
    };

    attempts.forEach(attempt => {
      if (attempt.details?.sectionScores) {
        const scores = attempt.details.sectionScores;
        Object.keys(totals).forEach(key => {
          if (scores[key] !== undefined) {
            totals[key] += scores[key];
            counts[key]++;
          }
        });
      }
    });

    const calculateAvg = (total, count) => count > 0 ? Math.round(total / count) : 0;

    res.json([
      { category: 'Verbal Ability', averageScore: calculateAvg(totals.verbal, counts.verbal) },
      { category: 'Numerical Ability', averageScore: calculateAvg(totals.numerical, counts.numerical) },
      { category: 'Analytical Ability', averageScore: calculateAvg(totals.analytical, counts.analytical) },
      { category: 'General Knowledge', averageScore: calculateAvg(totals.generalInfo, counts.generalInfo) },
      { category: 'Clerical Ability', averageScore: calculateAvg(totals.clerical, counts.clerical) },
      { category: 'Philippine Constitution', averageScore: calculateAvg(totals.constitution, counts.constitution) }
    ]);

  } catch (error) {
    console.error('Error fetching section stats:', error);
    res.status(500).json({ error: 'Failed to fetch section statistics', details: error.message });
  }
});

// ✅ UPDATED: Question type stats include ALL tests
router.get('/stats/question-types', protect, async (req, res) => {
  try {
    const { isMockExam } = req.query;
    const where = { userId: req.user.id };
    // ✅ Include ALL tests for accurate question type averages

    if (isMockExam === 'true') {
      where.isMockExam = true;
    }

    const attempts = await TestAttempt.findAll({
      where,
      attributes: ['details']
    });

    const totals = { multipleChoice: 0, essay: 0, situational: 0 };
    const counts = { multipleChoice: 0, essay: 0, situational: 0 };

    attempts.forEach(attempt => {
      if (attempt.details?.questionTypeScores) {
        const scores = attempt.details.questionTypeScores;
        Object.keys(totals).forEach(key => {
          if (scores[key] !== undefined) {
            totals[key] += scores[key];
            counts[key]++;
          }
        });
      }
    });

    const calculateAvg = (total, count) => count > 0 ? Math.round(total / count) : 0;

    res.json([
      { type: 'Multiple Choice', averageScore: calculateAvg(totals.multipleChoice, counts.multipleChoice) },
      { type: 'Essay', averageScore: calculateAvg(totals.essay, counts.essay) },
      { type: 'Situational', averageScore: calculateAvg(totals.situational, counts.situational) }
    ]);

  } catch (error) {
    console.error('Error fetching question type stats:', error);
    res.status(500).json({ error: 'Failed to fetch question type statistics', details: error.message });
  }
});

// ✅ UPDATED: Only show bookmarks from non-deleted tests
router.get('/bookmarks/all', protect, async (req, res) => {
  try {
    // ✅ getAllBookmarks already filters out deleted tests
    const bookmarks = await TestAttempt.getAllBookmarks(req.user.id);
    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks', details: error.message });
  }
});

router.get('/:id/bookmark/:questionIndex/status', protect, async (req, res) => {
  try {
    const { id, questionIndex } = req.params;
    const attempt = await TestAttempt.findOne({ 
      where: { 
        id, 
        userId: req.user.id,
        isDeleted: false  // ✅ Only non-deleted
      } 
    });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });
    const question = attempt.questionResponses[parseInt(questionIndex)];
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ bookmarked: question.bookmarked || false, note: question.bookmarkNote || '' });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({ error: 'Failed to check bookmark status', details: error.message });
  }
});

router.post('/:id/bookmark/:questionIndex', protect, async (req, res) => {
  try {
    const { id, questionIndex } = req.params;
    const { note = '' } = req.body;
    const attempt = await TestAttempt.findOne({ 
      where: { 
        id, 
        userId: req.user.id,
        isDeleted: false  // ✅ Only non-deleted
      } 
    });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });
    const result = await attempt.toggleBookmark(parseInt(questionIndex), note);
    res.json({ message: result.bookmarked ? 'Question bookmarked!' : 'Bookmark removed', bookmarked: result.bookmarked, note: result.note });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark', details: error.message });
  }
});

router.put('/:id/bookmark/:questionIndex/note', protect, async (req, res) => {
  try {
    const { id, questionIndex } = req.params;
    const { note } = req.body;
    const attempt = await TestAttempt.findOne({ 
      where: { 
        id, 
        userId: req.user.id,
        isDeleted: false  // ✅ Only non-deleted
      } 
    });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });
    const qIndex = parseInt(questionIndex);
    const question = attempt.questionResponses[qIndex];
    if (!question || !question.bookmarked) return res.status(400).json({ error: 'Question is not bookmarked' });
    
    const responses = [...attempt.questionResponses];
    responses[qIndex].bookmarkNote = note || '';
    attempt.questionResponses = responses;
    await attempt.save();
    
    const message = note ? 'Note updated successfully' : 'Note deleted successfully';
    res.json({ message, note: responses[qIndex].bookmarkNote });
  } catch (error) {
    console.error('Error updating bookmark note:', error);
    res.status(500).json({ error: 'Failed to update note', details: error.message });
  }
});

// ✅ UPDATED: Can review deleted tests
router.get('/:id/review', protect, async (req, res) => {
  try {
    // ✅ getTestForReview allows viewing deleted tests
    const reviewData = await TestAttempt.getTestForReview(req.params.id, req.user.id);
    if (!reviewData) return res.status(404).json({ error: 'Test attempt not found' });
    res.json(reviewData);
  } catch (error) {
    console.error('Error fetching test for review:', error);
    res.status(500).json({ error: 'Failed to fetch test for review', details: error.message });
  }
});

// ✅ UPDATED: Can view deleted tests by ID
router.get('/:id', protect, async (req, res) => {
  try {
    // ✅ Allow viewing any test by ID (even deleted)
    const attempt = await TestAttempt.findOne({ 
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      } 
    });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });
    res.json(attempt);
  } catch (error) {
    console.error('Error fetching test attempt:', error);
    res.status(500).json({ error: 'Failed to fetch test attempt', details: error.message });
  }
});

// ==================== DELETE (NOW SOFT DELETE) ====================

// ✅ NEW: Soft delete single test
router.delete('/:id', protect, async (req, res) => {
  try {
    const attempt = await TestAttempt.softDelete(
      req.params.id, 
      req.user.id, 
      req.user.id  // deletedBy = current user
    );
    
    res.json({ 
      message: 'Test attempt removed from history', 
      deletedId: req.params.id 
    });
  } catch (error) {
    if (error.message === 'Test attempt not found') {
      return res.status(404).json({ error: 'Test attempt not found' });
    }
    console.error('Error deleting test attempt:', error);
    res.status(500).json({ error: 'Failed to delete test attempt', details: error.message });
  }
});

// ✅ NEW: Soft delete all tests
router.delete('/bulk/all', protect, async (req, res) => {
  try {
    const updated = await TestAttempt.update(
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id
      },
      {
        where: {
          userId: req.user.id,
          isDeleted: false  // Only delete non-deleted tests
        }
      }
    );
    
    const deletedCount = updated[0];  // Sequelize returns [affectedCount]
    
    res.json({ 
      message: `Removed ${deletedCount} test attempts from history`, 
      deletedCount 
    });
  } catch (error) {
    console.error('Error deleting test attempts:', error);
    res.status(500).json({ error: 'Failed to delete test attempts', details: error.message });
  }
});

// ✅ NEW: Get deleted attempts (optional - for future "restore" feature)
router.get('/deleted/list', protect, async (req, res) => {
  try {
    const deletedAttempts = await TestAttempt.getDeletedAttempts(req.user.id);
    res.json(deletedAttempts);
  } catch (error) {
    console.error('Error fetching deleted attempts:', error);
    res.status(500).json({ error: 'Failed to fetch deleted attempts', details: error.message });
  }
});

// ✅ NEW: Restore deleted attempt (optional - for future feature)
router.post('/:id/restore', protect, async (req, res) => {
  try {
    const restored = await TestAttempt.restore(req.params.id, req.user.id);
    res.json({ 
      message: 'Test attempt restored successfully', 
      attempt: restored 
    });
  } catch (error) {
    if (error.message === 'Deleted test attempt not found') {
      return res.status(404).json({ error: 'Deleted test attempt not found' });
    }
    console.error('Error restoring test attempt:', error);
    res.status(500).json({ error: 'Failed to restore test attempt', details: error.message });
  }
});

module.exports = router;