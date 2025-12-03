// services/adminTestService.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Get auth token
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Handle API errors consistently
const handleApiError = (error, fallbackMessage) => {
  console.error(fallbackMessage, error);
  
  if (error.response) {
    throw new Error(error.response.data.error || error.response.data.message || fallbackMessage);
  } else if (error.request) {
    throw new Error('Server is not responding. Please try again later.');
  } else {
    throw new Error(error.message || fallbackMessage);
  }
};

// ==================== ADMIN FUNCTIONS ====================

// Get all admin tests (admin only)
export const getAllAdminTests = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}/admin-tests?${params}`, {
      headers: getAuthHeader()
    });
    
    return response.data.tests || [];
  } catch (error) {
    handleApiError(error, 'Failed to fetch admin tests');
  }
};

// Get a specific admin test
export const getAdminTest = async (testId) => {
  try {
    const response = await axios.get(`${API_URL}/admin-tests/${testId}`, {
      headers: getAuthHeader()
    });
    
    return response.data.test;
  } catch (error) {
    handleApiError(error, 'Failed to fetch admin test');
  }
};

// Create a new admin test (admin only)
export const createAdminTest = async (testData) => {
  try {
    console.log('Creating admin test:', testData);
    
    const response = await axios.post(`${API_URL}/admin-tests`, testData, {
      headers: getAuthHeader()
    });
    
    return response.data.test;
  } catch (error) {
    handleApiError(error, 'Failed to create admin test');
  }
};

// Update an existing admin test (admin only)
export const updateAdminTest = async (testId, testData) => {
  try {
    console.log('Updating admin test:', testId, testData);
    
    const response = await axios.put(`${API_URL}/admin-tests/${testId}`, testData, {
      headers: getAuthHeader()
    });
    
    return response.data.test;
  } catch (error) {
    handleApiError(error, 'Failed to update admin test');
  }
};

// Delete an admin test (admin only)
export const deleteAdminTest = async (testId) => {
  try {
    const response = await axios.delete(`${API_URL}/admin-tests/${testId}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to delete admin test');
  }
};

// Toggle publish status (admin only)
export const togglePublishAdminTest = async (testId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/admin-tests/${testId}/publish`,
      {},
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to toggle publish status');
  }
};

// Generate questions from PDF (admin only)
export const generateQuestionsFromPDF = async (file, type, count, command) => {
  try {
    console.log('Generating questions from PDF:', { type, count, fileName: file.name });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('count', count);
    if (command) formData.append('command', command);

    const response = await axios.post(`${API_URL}/admin-tests/generate-from-pdf`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      },
      timeout: 60000
    });
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to generate questions from PDF');
  }
};

// Get test statistics (admin only)
export const getAdminTestStats = async (testId) => {
  try {
    const response = await axios.get(`${API_URL}/admin-tests/${testId}/stats`, {
      headers: getAuthHeader()
    });
    
    return response.data.stats;
  } catch (error) {
    handleApiError(error, 'Failed to fetch test statistics');
  }
};

// ==================== USER FUNCTIONS (Browse Published Tests) ====================

// Get published tests by type (Practice or Mock)
export const getPublishedTestsByType = async (testType, filters = {}) => {
  try {
    if (!['Practice', 'Mock'].includes(testType)) {
      throw new Error('Invalid test type. Must be "Practice" or "Mock"');
    }

    const params = new URLSearchParams(filters);
    const response = await axios.get(
      `${API_URL}/admin-tests/published/${testType}?${params}`,
      { headers: getAuthHeader() }
    );
    
    return response.data.tests || [];
  } catch (error) {
    handleApiError(error, 'Failed to fetch published tests');
  }
};

// Record test attempt (for analytics)
export const recordAdminTestAttempt = async (testId, score) => {
  try {
    const response = await axios.post(
      `${API_URL}/admin-tests/${testId}/attempt`,
      { score },
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to record test attempt');
  }
};

// ==================== AI FUNCTIONS ====================

// Generate multiple AI questions (batch generation for AIQuestionGenerator)
export const generateAIQuestions = async (params) => {
  try {
    const response = await axios.post(
      `${API_URL}/ai/generate-questions`,
      params,  // { topic, difficulty, count }
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to generate questions');
  }
};

// Generate AI answer choices for a SINGLE question (for QuestionEditor)
export const generateAIAnswerChoicesForQuestion = async (questionText, category) => {
  try {
    console.log('Generating answer choices for question:', { 
      questionText: questionText.substring(0, 50), 
      category 
    });
    
    const response = await axios.post(
      `${API_URL}/ai/generate-answer-choices`,
      { questionText, category },
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to generate answer choices');
  }
};