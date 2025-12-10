// routes/testAttempts.js
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
// ⚠️ ADDED 'Bookmark' and 'Question' to imports
const { TestAttempt, User, UserAchievement, Bookmark, Question } = require('../models');
const { protect } = require('../middleware/auth');

// ========================================================
// 🔖 BOOKMARK ROUTES (FIXED & COMPLETE)
// ========================================================

// 1. Get All Bookmarks
router.get('/bookmarks/all', protect, async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Question,
        attributes: ['id', 'questionText', 'options', 'correctAnswer', 'explanation', 'category', 'difficulty']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formatted = bookmarks.map(b => {
      if (!b.Question) return null;
      return {
        ...b.Question.toJSON(),
        bookmarkId: b.id,
        note: b.note,
        bookmarkedAt: b.createdAt,
        attemptId: 0, 
        questionIndex: 0 
      };
    }).filter(b => b !== null);

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks', details: error.message });
  }
});

// 2. Check Bookmark Status
router.get('/:id/bookmark/:questionIndex/status', protect, async (req, res) => {
  try {
    const { id, questionIndex } = req.params;
    const userId = req.user.id;
    const attempt = await TestAttempt.findOne({ where: { id, userId } });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });

    let targetQuestionId = null;
    const qIndex = parseInt(questionIndex);
    
    if (attempt.questionResponses && attempt.questionResponses[qIndex]) {
        const q = attempt.questionResponses[qIndex];
        targetQuestionId = q.questionId || q._id || q.id;
    }

    if (!targetQuestionId) return res.json({ bookmarked: false, note: '' });

    const bookmark = await Bookmark.findOne({
        where: { userId, questionId: targetQuestionId }
    });

    res.json({ bookmarked: !!bookmark, note: bookmark ? bookmark.note : '' });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({ error: 'Failed to check status', details: error.message });
  }
});

// 3. Toggle Bookmark
router.post('/:id/bookmark/:questionIndex', protect, async (req, res) => {
  try {
    const { id, questionIndex } = req.params;
    const { note = '' } = req.body;
    const userId = req.user.id;

    const attempt = await TestAttempt.findOne({ where: { id, userId } });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });

    const qIndex = parseInt(questionIndex);
    let targetQuestionId = null;

    if (attempt.questionResponses && attempt.questionResponses[qIndex]) {
        const q = attempt.questionResponses[qIndex];
        targetQuestionId = q.questionId || q._id || q.id;
    }

    if (!targetQuestionId) return res.status(400).json({ error: 'Invalid question ID' });

    const existing = await Bookmark.findOne({
      where: { userId, questionId: targetQuestionId }
    });

    let isBookmarked = false;
    if (existing) {
      await existing.destroy();
      isBookmarked = false;
    } else {
      await Bookmark.create({ userId, questionId: targetQuestionId, note });
      isBookmarked = true;
    }

    // Sync UI
    if (attempt.questionResponses) {
        const responses = [...attempt.questionResponses];
        if (responses[qIndex]) {
            responses[qIndex].bookmarked = isBookmarked;
            responses[qIndex].bookmarkNote = note;
            attempt.questionResponses = responses;
            attempt.changed('questionResponses', true);
            await attempt.save();
        }
    }

    res.json({ message: isBookmarked ? 'Question bookmarked!' : 'Bookmark removed', bookmarked: isBookmarked, note });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ error: 'Failed to toggle bookmark', details: error.message });
  }
});

// 4. Update Bookmark Note
router.put('/:id/bookmark/:questionIndex/note', protect, async (req, res) => {
  try {
    const { id, questionIndex } = req.params;
    const { note } = req.body;
    const userId = req.user.id;

    const attempt = await TestAttempt.findOne({ where: { id, userId } });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });

    const qIndex = parseInt(questionIndex);
    let targetQuestionId = null;

    if (attempt.questionResponses && attempt.questionResponses[qIndex]) {
        const q = attempt.questionResponses[qIndex];
        targetQuestionId = q.questionId || q._id || q.id;
    }

    if (!targetQuestionId) return res.status(400).json({ error: 'Invalid question ID' });

    const bookmark = await Bookmark.findOne({ where: { userId, questionId: targetQuestionId } });
    if (bookmark) {
        bookmark.note = note;
        await bookmark.save();
    } else {
        await Bookmark.create({ userId, questionId: targetQuestionId, note });
    }

    if (attempt.questionResponses) {
        const responses = [...attempt.questionResponses];
        if (responses[qIndex]) {
            responses[qIndex].bookmarked = true;
            responses[qIndex].bookmarkNote = note;
            attempt.questionResponses = responses;
            attempt.changed('questionResponses', true);
            await attempt.save();
        }
    }

    res.json({ message: 'Note updated', note });
  } catch (error) {
    console.error('Error updating bookmark note:', error);
    res.status(500).json({ error: 'Failed to update note', details: error.message });
  }
});

// ========================================================
// 📝 CREATE & HISTORY (Restored Full Original Code)
// ========================================================

router.post('/', protect, async (req, res) => {
  try {
    const {
      name, score, result, isMockExam, details,
      questionResponses, testConfig, startedAt, completedAt
    } = req.body;

    if (!name || score === undefined || !result || !details) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ RESTORED: Your original detailed default values
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

    const user = await User.findByPk(req.user.id);
    if (user) {
      user.testsCompleted += 1;
      user.questionsSolved += (details.correctQuestions || 0);
      user.totalStudyTimeMinutes += details.timeSpentSeconds ? Math.floor(details.timeSpentSeconds / 60) : 0;
      
      if (user.testsCompleted === 1) {
        user.avgScore = score;
      } else {
        user.avgScore = ((user.avgScore * (user.testsCompleted - 1)) + score) / user.testsCompleted;
      }
      
      user.updateStreak();
      await user.save();
      
      let newAchievements = [];
      try {
        newAchievements = await UserAchievement.checkAndAward(user);
        if (score === 100) {
          const perfectScore = await UserAchievement.awardSpecific(req.user.id, 'perfect_score');
          if (perfectScore) newAchievements.push(perfectScore);
        }
      } catch (e) { console.error('Achievement error', e); }
      
      res.status(201).json({ 
        message: 'Test attempt saved successfully', 
        attempt: testAttempt,
        newAchievements: newAchievements.map(a => ({
          icon: a.icon, title: a.title, description: a.description
        }))
      });
    } else {
      res.status(201).json({ message: 'Test attempt saved successfully', attempt: testAttempt });
    }
  } catch (error) {
    console.error('Error saving test attempt:', error);
    res.status(500).json({ error: 'Failed to save test attempt', details: error.message });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'completedAt', sortOrder = 'desc', result, isMockExam, includeDeleted = false } = req.query;

    const where = { userId: req.user.id };
    if (includeDeleted !== 'true') where.isDeleted = false;
    if (result && result !== 'All') where.result = result;
    if (isMockExam === 'true') where.isMockExam = true;

    const { count, rows } = await TestAttempt.findAndCountAll({
      where,
      order: [[sortBy, sortOrder.toUpperCase()]],
      offset: (parseInt(page) - 1) * parseInt(limit),
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

// ========================================================
// 📊 ANALYTICS ROUTES (Restored Full Original Code)
// ========================================================

router.get('/stats/overview', protect, async (req, res) => {
  try {
    const { isMockExam } = req.query;
    const filter = isMockExam === 'true' ? { isMockExam: true } : {};
    const stats = await TestAttempt.getUserStats(req.user.id, filter);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics', details: error.message });
  }
});

router.get('/stats/trend', protect, async (req, res) => {
  try {
    const { limit = 7, isMockExam } = req.query;
    const filter = isMockExam === 'true' ? { isMockExam: true } : {};
    const trend = await TestAttempt.getPerformanceTrend(req.user.id, parseInt(limit), filter);
    res.json(trend);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch performance trend', details: error.message });
  }
});

router.get('/stats/sections', protect, async (req, res) => {
  try {
    const { isMockExam } = req.query;
    const where = { userId: req.user.id };
    if (isMockExam === 'true') where.isMockExam = true;

    const attempts = await TestAttempt.findAll({ where, attributes: ['details'] });
    
    // ✅ RESTORED: Full manual aggregation logic
    const totals = { verbal: 0, numerical: 0, analytical: 0, generalInfo: 0, clerical: 0, numericalReasoning: 0, constitution: 0 };
    const counts = { verbal: 0, numerical: 0, analytical: 0, generalInfo: 0, clerical: 0, numericalReasoning: 0, constitution: 0 };

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
    res.status(500).json({ error: 'Failed to fetch section stats', details: error.message });
  }
});

router.get('/stats/question-types', protect, async (req, res) => {
  try {
    const { isMockExam } = req.query;
    const where = { userId: req.user.id };
    if (isMockExam === 'true') where.isMockExam = true;

    const attempts = await TestAttempt.findAll({ where, attributes: ['details'] });
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
    res.status(500).json({ error: 'Failed to fetch question type stats', details: error.message });
  }
});

// ========================================================
// 🔎 REVIEW & SINGLE TEST (Restored Full Original Code)
// ========================================================

router.get('/:id/review', protect, async (req, res) => {
  try {
    const reviewData = await TestAttempt.getTestForReview(req.params.id, req.user.id);
    if (!reviewData) return res.status(404).json({ error: 'Test attempt not found' });

    // Inject IDs for frontend consistency
    const rawAttempt = await TestAttempt.findOne({
        where: { id: req.params.id, userId: req.user.id },
        attributes: ['questionResponses']
    });
    if (rawAttempt && rawAttempt.questionResponses && reviewData.questions) {
        reviewData.questions = reviewData.questions.map((q, i) => {
            const rawQ = rawAttempt.questionResponses[i];
            return {
                ...q,
                id: rawQ ? (rawQ.id || rawQ.questionId || rawQ._id) : null
            };
        });
    }
    res.json(reviewData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test for review', details: error.message });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!attempt) return res.status(404).json({ error: 'Test attempt not found' });
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch test attempt', details: error.message });
  }
});

// ========================================================
// 🗑️ DELETE & RESTORE (Restored Full Original Code)
// ========================================================

router.delete('/:id', protect, async (req, res) => {
  try {
    const attempt = await TestAttempt.softDelete(req.params.id, req.user.id, req.user.id);
    res.json({ message: 'Test attempt removed from history', deletedId: req.params.id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete', details: error.message });
  }
});

router.delete('/bulk/all', protect, async (req, res) => {
  try {
    const updated = await TestAttempt.update(
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id },
      { where: { userId: req.user.id, isDeleted: false } }
    );
    res.json({ message: `Removed ${updated[0]} attempts`, deletedCount: updated[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete all', details: error.message });
  }
});

router.get('/deleted/list', protect, async (req, res) => {
  try {
    const deletedAttempts = await TestAttempt.getDeletedAttempts(req.user.id);
    res.json(deletedAttempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch deleted attempts', details: error.message });
  }
});

router.post('/:id/restore', protect, async (req, res) => {
  try {
    const restored = await TestAttempt.restore(req.params.id, req.user.id);
    res.json({ message: 'Test attempt restored successfully', attempt: restored });
  } catch (error) {
    res.status(500).json({ error: 'Failed to restore test attempt', details: error.message });
  }
});

module.exports = router;