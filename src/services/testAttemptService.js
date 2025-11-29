// src/services/testAttemptService.js
import axios from 'axios';

// Use Vite's import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Token attached to request');
    } else {
      console.warn('⚠️ No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ Authentication failed - clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('isAdmin');
      // Redirect to home instead of /login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);


// ==================== GENERATE ====================

/**
 * @param {object} setupData 
 * @returns {Promise<object>} 
 */
export const generateNewTest = async (setupData) => {
  try {
    console.log('🤖 Requesting new AI-generated test with settings:', setupData);
    const response = await api.post('/tests/generate', setupData);
    console.log('✅ AI test generated successfully:', response.data);
    return response.data;
  } catch (error)
 {
    console.error('❌ Error generating new test:', error);
    throw error.response?.data?.error || error.message || 'Failed to generate test';
  }
};

// ==================== CREATE ====================

export const saveTestAttempt = async (attemptData) => {
  try {
    console.log('💾 Saving test attempt...');
    // This function correctly sends the entire attemptData object,
    // which now includes the isMockExam field. NO CHANGES NEEDED.
    const response = await api.post('/test-attempts', attemptData);
    console.log('✅ Test attempt saved successfully');
    return response.data;
  } catch (error) {
    console.error('❌ Error saving test attempt:', error);
    throw error.response?.data?.error || error.message || 'Failed to save test result';
  }
};

// ==================== READ ====================

export const getTestAttempts = async (filters = {}) => {
  try {
    console.log('📥 Fetching test attempts with filters:', filters);
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'completedAt', 
      sortOrder = 'desc', 
      result 
    } = filters;
    
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    };

    if (result && result !== 'All') {
      params.result = result;
    }

    const response = await api.get('/test-attempts', { params });
    console.log('✅ Fetched attempts:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching test attempts:', error);
    throw error.response?.data?.error || error.message || 'Failed to load test history';
  }
};

// Alias for backward compatibility
export const getUserTestAttempts = getTestAttempts;

/**
 * Get single test attempt by ID
 */
export const getTestAttemptById = async (id) => {
  try {
    console.log('📥 Fetching test attempt:', id);
    const response = await api.get(`/test-attempts/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching test attempt:', error);
    throw error.response?.data?.error || error.message || 'Failed to load test attempt';
  }
};

/**
 * Get single test attempt for review
 */
export const getTestAttemptForReview = async (attemptId) => {
  try {
    console.log('📥 Fetching test for review:', attemptId);
    const response = await api.get(`/test-attempts/${attemptId}/review`);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching test for review:', error);
    throw error.response?.data?.error || error.message || 'Failed to load test review';
  }
};

/**
 * Get user statistics overview
 */
export const getUserStats = async () => {
  try {
    console.log('📊 Fetching user stats...');
    const response = await api.get('/test-attempts/stats/overview');
    console.log('✅ Stats fetched:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user stats:', error);
    throw error.response?.data?.error || error.message || 'Failed to load statistics';
  }
};

/**
 * Get performance trend
 */
export const getPerformanceTrend = async (limit = 7) => {
  try {
    console.log('📈 Fetching performance trend...');
    const response = await api.get('/test-attempts/stats/trend', {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching performance trend:', error);
    throw error.response?.data?.error || error.message || 'Failed to load performance trend';
  }
};

/**
 * Get section-wise statistics
 */
export const getSectionStats = async () => {
  try {
    console.log('📊 Fetching section stats...');
    const response = await api.get('/test-attempts/stats/sections');
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching section stats:', error);
    throw error.response?.data?.error || error.message || 'Failed to load section statistics';
  }
};

// ==================== UPDATE ====================

/**
 * Update test attempt (name or notes)
 */
export const updateTestAttempt = async (id, updateData) => {
  try {
    console.log('✏️ Updating test attempt:', id);
    const response = await api.put(`/test-attempts/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating test attempt:', error);
    throw error.response?.data?.error || error.message || 'Failed to update test attempt';
  }
};

// ==================== DELETE ====================

/**
 * Delete a single test attempt
 */
export const deleteTestAttempt = async (id) => {
  try {
    console.log('🗑️ Deleting test attempt:', id);
    const response = await api.delete(`/test-attempts/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting test attempt:', error);
    throw error.response?.data?.error || error.message || 'Failed to delete test attempt';
  }
};

/**
 * Delete all test attempts
 */
export const deleteAllTestAttempts = async () => {
  try {
    console.log('🗑️ Deleting all test attempts...');
    const response = await api.delete('/test-attempts/bulk/all');
    return response.data;
  } catch (error) {
    console.error('❌ Error deleting all test attempts:', error);
    throw error.response?.data?.error || error.message || 'Failed to delete all test attempts';
  }
};