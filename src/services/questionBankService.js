// src/services/questionBankService.js

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with auth
const api = axios.create({
  baseURL: `${API_URL}/questions`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==================== QUESTION GENERATION ====================

/**
 * Generate smart questions (checks DB first, then AI)
 * @param {string} topic - Category name
 * @param {string} difficulty - Easy/Normal/Hard
 * @param {number} count - Number of questions
 */
export const generateSmartQuestions = async (topic, difficulty, count = 5) => {
  try {
    console.log(`📝 Requesting ${count} ${difficulty} questions for ${topic}...`);
    
    const response = await api.post('/generate', {
      topic,
      difficulty,
      count
    });

    console.log('✅ Questions received:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error generating questions:', error);
    throw error.response?.data || error.message;
  }
};

// ==================== USER PROGRESS ====================

/**
 * Update user's progress after completing a test
 * @param {Array} questionResults - [{questionId, isCorrect}, ...]
 */
export const updateUserProgress = async (questionResults) => {
  try {
    console.log('💾 Updating user progress for', questionResults.length, 'questions...');
    
    const response = await api.post('/progress/update', {
      questionResults
    });

    console.log('✅ Progress updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating progress:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get user's personal question mastery stats
 */
export const getUserQuestionStats = async () => {
  try {
    console.log('📊 Fetching user question stats...');
    
    const response = await api.get('/stats/user');
    
    console.log('✅ User stats received:', response.data);
    return response.data.stats;
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    throw error.response?.data || error.message;
  }
};

/**
 * Get questions that user needs to review
 * @param {number} limit - Max number of questions
 */
export const getQuestionsNeedingReview = async (limit = 10) => {
  try {
    console.log('📚 Fetching questions needing review...');
    
    const response = await api.get('/review', {
      params: { limit }
    });
    
    console.log('✅ Review questions received:', response.data);
    return response.data.questions;
  } catch (error) {
    console.error('❌ Error fetching review questions:', error);
    throw error.response?.data || error.message;
  }
};

// ==================== QUESTION BANK STATS ====================

/**
 * Get overall question bank statistics
 */
export const getQuestionBankStats = async () => {
  try {
    console.log('📈 Fetching question bank stats...');
    
    const response = await api.get('/stats/bank');
    
    console.log('✅ Question bank stats received:', response.data);
    return response.data.stats;
  } catch (error) {
    console.error('❌ Error fetching bank stats:', error);
    // Return empty stats on error
    return {
      total: 0,
      byCategory: [],
      byDifficulty: []
    };
  }
};

// ==================== ADMIN: MANUAL QUESTION CREATION ====================

/**
 * Manually create a question (Admin only)
 * @param {Object} questionData - Question details
 */
export const createQuestion = async (questionData) => {
  try {
    console.log('📝 Creating manual question...');
    
    const response = await api.post('/create', questionData);
    
    console.log('✅ Question created:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating question:', error);
    throw error.response?.data || error.message;
  }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Format user stats for display
 */
export const formatUserStats = (stats) => {
  return [
    { name: 'Mastered', value: stats.mastered || 0, color: 'blue' },
    { name: 'Learning', value: stats.learning || 0, color: 'green' },
    { name: 'Needs Review', value: stats.needsReview || 0, color: 'orange' },
  ];
};

/**
 * Calculate mastery percentage
 */
export const calculateMasteryPercentage = (stats) => {
  const total = stats.total || 0;
  if (total === 0) return 0;
  
  const mastered = stats.mastered || 0;
  return Math.round((mastered / total) * 100);
};