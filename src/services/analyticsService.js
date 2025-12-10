import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/test-attempts";

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ==================== ANALYTICS DATA ====================

/**
 * ✅ FIXED: Get comprehensive analytics data
 * - ALL TESTS (including deleted) for stats, KPIs, speed, consistency, streak
 * - VISIBLE TESTS ONLY for history display
 */
export const getAnalyticsData = async () => {
  try {
    // ✅ CHECK: Don't fetch if user is not logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    
    if (!isLoggedIn) {
      console.log('👤 Guest user - returning empty analytics');
      return getEmptyAnalyticsData();
    }

    console.log('📊 Fetching analytics data...');
    console.log('   - ALL tests (including deleted) for accurate analytics');
    console.log('   - Visible tests only for history display');

    const filterParams = { isMockExam: true };

    // ✅ CRITICAL FIX: Fetch ALL data INCLUDING DELETED for accurate analytics
    const [stats, sectionStats, trend, allMockAttempts, visibleMockAttempts, allAttemptsForStreak] = await Promise.all([
      // Stats (already includes deleted) ✅
      axios.get(`${API_URL}/test-attempts/stats/overview`, { headers: getAuthHeader(), params: filterParams }),
      axios.get(`${API_URL}/test-attempts/stats/sections`, { headers: getAuthHeader(), params: filterParams }),
      axios.get(`${API_URL}/test-attempts/stats/trend`, { headers: getAuthHeader(), params: { ...filterParams, limit: 7 } }),
      
      // ✅ ALL MOCK EXAMS (including deleted) for time metrics
    axios.get(`${API_URL}/test-attempts`, { 
        headers: getAuthHeader(),
        params: {
            ...filterParams,
            includeDeleted: true,  
          page: 1, 
          limit: 50, 
          sortBy: 'completedAt', 
          sortOrder: 'desc' 
        } 
      }),
      
      // ✅ VISIBLE MOCK EXAMS ONLY for display
      axios.get(`${API_URL}`, { 
        headers: getAuthHeader(), 
        params: { 
          ...filterParams, 
          page: 1, 
          limit: 10, 
          sortBy: 'completedAt', 
          sortOrder: 'desc' 
        } 
      }),
      
      // ✅ ALL TESTS (including deleted) for accurate streak
      axios.get(`${API_URL}`, { 
        headers: getAuthHeader(), 
        params: { 
          includeDeleted: true,  // ✅ INCLUDE DELETED
          page: 1, 
          limit: 50, 
          sortBy: 'completedAt', 
          sortOrder: 'desc' 
        } 
      })
    ]);

    // ✅ Calculate time metrics from ALL mock exams (including deleted)
    const timeMetrics = calculateTimeMetrics(allMockAttempts.data.attempts);

    // ✅ Safely process section stats with fallback to empty array
    const sectionData = Array.isArray(sectionStats.data) ? sectionStats.data : [];

    // ✅ Process all 7 sections (used in Strengths & Weaknesses)
    const sections = {
      verbal: sectionData.find(s => s.category === 'Verbal Ability')?.averageScore || 0,
      numerical: sectionData.find(s => s.category === 'Numerical Ability')?.averageScore || 0,
      analytical: sectionData.find(s => s.category === 'Analytical Ability')?.averageScore || 0,
      generalInfo: sectionData.find(s => s.category === 'General Knowledge')?.averageScore || 0,
      clerical: sectionData.find(s => s.category === 'Clerical Ability')?.averageScore || 0,
      constitution: sectionData.find(s => s.category === 'Philippine Constitution')?.averageScore || 0
    };

    const analyticsData = {
      // KPI Metrics (INCLUDES ALL TESTS, even deleted)
      accuracy: Math.round(stats.data.averageScore || 0),
      avgScore: Math.round(stats.data.averageScore || 0),
      totalExams: stats.data.totalAttempts || 0,
      totalPassed: stats.data.totalPassed || 0,
      totalFailed: stats.data.totalFailed || 0,
      
      timeMetrics: timeMetrics,
      
      // ✅ All 7 categories (INCLUDES ALL, even deleted)
      sections: sections,
      
      // Performance Trend (MOCK EXAMS ONLY)
      trend: trend.data.map((item, index) => ({
        exam: `Mock ${index + 1}`,
        score: item.score,
        date: new Date(item.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        verbal: item.details?.sectionScores?.verbal || 0,
        numerical: item.details?.sectionScores?.numerical || 0,
        analytical: item.details?.sectionScores?.analytical || 0,
        generalInfo: item.details?.sectionScores?.generalInfo || 0,
        clerical: item.details?.sectionScores?.clerical || 0,
        constitution: item.details?.sectionScores?.constitution || 0
      })),
      
      // ✅ Recent Attempts (VISIBLE ONLY - for display)
      recentAttempts: visibleMockAttempts.data.attempts.map(attempt => ({
        id: attempt.id,
        title: attempt.name,
        score: attempt.score,
        result: attempt.result,
        date: new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        accuracy: `${attempt.details.totalQuestions > 0 ? Math.round((attempt.details.correctQuestions / attempt.details.totalQuestions) * 100) : 0}%`,
        time: attempt.details.timeSpent,
        details: attempt.details
      })),

      // ✅ ALL ATTEMPTS (including deleted) for accurate streak calculation
      allAttempts: allAttemptsForStreak.data.attempts.map(attempt => ({
        id: attempt.id,
        title: attempt.name,
        score: attempt.score,
        result: attempt.result,
        date: new Date(attempt.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        completedAt: attempt.completedAt,
        accuracy: `${attempt.details.totalQuestions > 0 ? Math.round((attempt.details.correctQuestions / attempt.details.totalQuestions) * 100) : 0}%`,
        time: attempt.details.timeSpent,
        details: attempt.details,
        isMockExam: attempt.isMockExam || false,
        isDeleted: attempt.isDeleted || false
      })),

      recentFlashcardSessions: [],
      recentPractice: [],
      
      questionTypes: {
        multipleChoice: 0,
        essay: 0,
        situational: 0
      }
    };

    console.log('✅ Analytics data loaded:');
    console.log('   - All mock attempts (for metrics):', allMockAttempts.data.attempts.length);
    console.log('   - Visible mock attempts (for display):', visibleMockAttempts.data.attempts.length);
    console.log('   - All attempts for streak:', allAttemptsForStreak.data.attempts.length);
    console.log('   - Time Metrics:', timeMetrics);
    return analyticsData;

  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    return getEmptyAnalyticsData();
  }
};

/**
 * ✅ Return empty analytics data for guest users
 */
const getEmptyAnalyticsData = () => {
  return {
    accuracy: 0,
    avgScore: 0,
    totalExams: 0,
    totalPassed: 0,
    totalFailed: 0,
    timeMetrics: {
      avgTimePerQuestion: 0,
      consistency: 0,
      speedScore: 0
    },
    sections: {
      verbal: 0,
      numerical: 0,
      analytical: 0,
      generalInfo: 0,
      clerical: 0,
      constitution: 0
    },
    trend: [],
    recentAttempts: [],
    allAttempts: [],
    recentFlashcardSessions: [],
    recentPractice: [],
    questionTypes: {
      multipleChoice: 0,
      essay: 0,
      situational: 0
    }
  };
};

/**
 * ✅ Calculate time-based metrics using ACTUAL time spent
 */
export const calculateTimeMetrics = (attempts) => {
  console.log('🔍 Calculating time metrics for', attempts?.length || 0, 'attempts');
  
  if (!attempts || attempts.length === 0) {
    console.log('⚠️ No attempts found, returning zeros');
    return { avgTimePerQuestion: 0, consistency: 0, speedScore: 0 };
  }

  let totalTimeSeconds = 0;
  let totalQuestions = 0;

  attempts.forEach((attempt, index) => {
    let attemptTimeSeconds = 0;
    
    if (attempt.details?.timeSpentSeconds !== undefined && attempt.details.timeSpentSeconds > 0) {
      attemptTimeSeconds = attempt.details.timeSpentSeconds;
    } else if (attempt.details?.timeSpent) {
      const timeStr = attempt.details.timeSpent.toString();
      const minutes = parseInt(timeStr) || 0;
      attemptTimeSeconds = minutes * 60;
    }
    
    const questions = attempt.details?.totalQuestions || 0;
    
    console.log(`  📝 Attempt ${index + 1}:`, {
      time: attemptTimeSeconds + 's',
      questions: questions,
      timePerQ: questions > 0 ? Math.round(attemptTimeSeconds / questions) + 's' : 'N/A',
      isDeleted: attempt.isDeleted ? '🗑️ DELETED' : '✅'
    });
    
    totalTimeSeconds += attemptTimeSeconds;
    totalQuestions += questions;
  });

  const avgTimePerQuestion = totalQuestions > 0 
    ? Math.round(totalTimeSeconds / totalQuestions) 
    : 0;

  console.log('📊 Total time:', totalTimeSeconds + 's', '| Total questions:', totalQuestions);
  console.log('⏱️  Average time per question:', avgTimePerQuestion + 's');

  // Calculate consistency (based on score variance)
  const scores = attempts.map(a => a.score || 0);
  const avgScore = scores.length > 0 
    ? scores.reduce((a, b) => a + b, 0) / scores.length 
    : 0;
  
  const variance = scores.length > 0
    ? scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / scores.length
    : 0;
  
  const stdDev = Math.sqrt(variance);
  const consistency = Math.max(0, Math.round(100 - stdDev));

  console.log('📈 Consistency:', consistency, '(stdDev:', Math.round(stdDev) + ')');

  // Calculate speed score
  let speedScore = 0;
  
  if (avgTimePerQuestion === 0) {
    speedScore = 0;
  } else if (avgTimePerQuestion < 30) {
    speedScore = 95;
  } else if (avgTimePerQuestion < 45) {
    speedScore = 85;
  } else if (avgTimePerQuestion < 60) {
    speedScore = 75;
  } else if (avgTimePerQuestion < 90) {
    speedScore = 65;
  } else {
    speedScore = 50;
  }

  console.log('⚡ Speed score:', speedScore);
  console.log('✅ Final metrics:', { avgTimePerQuestion, consistency, speedScore });

  return { 
    avgTimePerQuestion, 
    consistency, 
    speedScore 
  };
};

/**
 * ✅ Calculate strengths and weaknesses for ALL 7 categories
 */
export const calculateStrengthsWeaknesses = (sectionStats) => {
  const sections = [
    { label: 'Verbal Ability', value: sectionStats.verbal || 0 },
    { label: 'Numerical Ability', value: sectionStats.numerical || 0 },
    { label: 'Analytical Ability', value: sectionStats.analytical || 0 },
    { label: 'General Knowledge', value: sectionStats.generalInfo || 0 },
    { label: 'Clerical Ability', value: sectionStats.clerical || 0 },
    { label: 'Philippine Constitution', value: sectionStats.constitution || 0 }
  ];

  return sections.map(section => ({
    ...section,
    type: section.value >= 75 ? 'strength' : section.value >= 60 ? 'neutral' : 'weakness',
    gradient: section.value >= 85 ? 'from-green-500 to-emerald-500' :
              section.value >= 75 ? 'from-blue-500 to-cyan-500' :
              section.value >= 60 ? 'from-yellow-500 to-orange-500' :
              section.value >= 50 ? 'from-orange-500 to-red-500' :
              'from-red-500 to-pink-500'
  }));
};

/**
 * ✅ Generate AI recommendations
 */
export const generateRecommendations = (analyticsData) => {
  const recommendations = [];
  const { sections, avgScore, totalExams, recentAttempts, timeMetrics } = analyticsData;

  const weakSections = [
    { name: 'Verbal Ability', score: sections.verbal, icon: 'fa-spell-check' },
    { name: 'Numerical Ability', score: sections.numerical, icon: 'fa-calculator' },
    { name: 'Analytical Ability', score: sections.analytical, icon: 'fa-brain' },
    { name: 'General Knowledge', score: sections.generalInfo, icon: 'fa-book' },
    { name: 'Clerical Ability', score: sections.clerical, icon: 'fa-file-pen' },
    { name: 'Philippine Constitution', score: sections.constitution, icon: 'fa-gavel' }
  ].filter(s => s.score > 0 && s.score < 75);

  weakSections.slice(0, 1).forEach(section => {
    recommendations.push({
      icon: section.icon,
      text: `Focus on ${section.name} – current score: ${section.score}%.`,
      color: 'from-blue-500 to-purple-500',
      insight: 'AI detected improvement potential'
    });
  });

  if (timeMetrics.avgTimePerQuestion > 60) {
    recommendations.push({
      icon: 'fa-clock',
      text: `Work on speed – averaging ${timeMetrics.avgTimePerQuestion}s per question.`,
      color: 'from-red-500 to-orange-500',
      insight: 'Practice under time pressure'
    });
  } else if (timeMetrics.avgTimePerQuestion < 30 && avgScore > 75) {
    recommendations.push({
      icon: 'fa-bolt',
      text: `Excellent speed! Maintain ${timeMetrics.avgTimePerQuestion}s/q while ensuring accuracy.`,
      color: 'from-green-500 to-emerald-500',
      insight: 'Speed mastery achieved'
    });
  }

  if (totalExams < 5) {
    recommendations.push({
      icon: 'fa-calendar',
      text: 'Take at least 3 mock exams per week to build consistency.',
      color: 'from-green-500 to-emerald-500',
      insight: 'Optimal practice frequency'
    });
  }

  if (recentAttempts.length > 0) {
    const totalErrors = recentAttempts.reduce((sum, a) => sum + (a.details?.incorrectQuestions || 0), 0);
    if (totalErrors > 0) {
      recommendations.push({
        icon: 'fa-book-open',
        text: `Review ${totalErrors} incorrect answers from recent tests.`,
        color: 'from-purple-500 to-pink-500',
        insight: 'Error analysis in progress'
      });
    }
  }

  if (avgScore > 0 && totalExams >= 3) {
    const improvement = Math.min(10, Math.round(5 + (totalExams * 0.5)));
    recommendations.push({
      icon: 'fa-chart-line',
      text: `AI predicts +${improvement}% improvement with consistent practice.`,
      color: 'from-purple-500 to-pink-500',
      insight: `${Math.min(95, 80 + totalExams * 2)}% confidence prediction`
    });
  }

  return recommendations.slice(0, 5);
};

/**
 * Calculate readiness score
 */
export const calculateReadiness = (analyticsData) => {
  const { avgScore, totalExams, sections, timeMetrics } = analyticsData;
  let readiness = avgScore;
  readiness += Math.min(10, totalExams * 2);
  
  const weakSections = Object.values(sections).filter(score => score > 0 && score < 65).length;
  readiness -= weakSections * 5;
  
  if (timeMetrics.avgTimePerQuestion > 90) {
    readiness -= 5;
  } else if (timeMetrics.avgTimePerQuestion < 30 && avgScore > 75) {
    readiness += 5;
  }
  
  return Math.max(0, Math.min(100, Math.round(readiness)));
};