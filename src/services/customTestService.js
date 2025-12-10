// services/customTestService.js
import axios from 'axios';

// Use direct URL - adjust if your backend runs on different port
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/custom-tests";

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

// Get all custom tests for current user
export const getAllCustomTests = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}?${params}`, {
      headers: getAuthHeader()
    });
    
    return response.data.tests || [];
  } catch (error) {
    handleApiError(error, 'Failed to fetch custom tests');
  }
};

// Get a specific custom test
export const getCustomTest = async (testId) => {
  try {
    const response = await axios.get(`${API_URL}/${testId}`, {
      headers: getAuthHeader()
    });
    
    return response.data.test;
  } catch (error) {
    handleApiError(error, 'Failed to fetch custom test');
  }
};

// Create a new custom test
export const createCustomTest = async (testData) => {
  try {
    console.log('Creating custom test:', testData);
    
    const response = await axios.post(API_URL, testData, {
      headers: getAuthHeader()
    });
    
    return response.data.test;
  } catch (error) {
    handleApiError(error, 'Failed to create custom test');
  }
};

// Update an existing custom test
export const updateCustomTest = async (testId, testData) => {
  try {
    console.log('Updating custom test:', testId, testData);
    
    const response = await axios.put(`${API_URL}/${testId}`, testData, {
      headers: getAuthHeader()
    });
    
    return response.data.test;
  } catch (error) {
    handleApiError(error, 'Failed to update custom test');
  }
};

// Delete a custom test
export const deleteCustomTest = async (testId) => {
  try {
    const response = await axios.delete(`${API_URL}/${testId}`, {
      headers: getAuthHeader()
    });
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to delete custom test');
  }
};

// Generate questions from PDF
export const generateQuestionsFromPDF = async (file, type, count, command) => {
  try {
    console.log('Generating questions from PDF:', { type, count, fileName: file.name });
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('count', count);
    if (command) formData.append('command', command);

    const response = await axios.post(`${API_URL}/generate-from-pdf`, formData, {
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

// Get test statistics
export const getTestStats = async (testId) => {
  try {
    const response = await axios.get(`${API_URL}/${testId}/stats`, {
      headers: getAuthHeader()
    });
    
    return response.data.stats;
  } catch (error) {
    handleApiError(error, 'Failed to fetch test statistics');
  }
};

// Browse public tests
export const browsePublicTests = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters);
    const response = await axios.get(`${API_URL}/public/browse?${params}`);
    
    return response.data.tests || [];
  } catch (error) {
    handleApiError(error, 'Failed to browse public tests');
  }
};

// Record test attempt
export const recordTestAttempt = async (testId, score) => {
  try {
    const response = await axios.post(
      `${API_URL}/${testId}/attempt`,
      { score },
      { headers: getAuthHeader() }
    );
    
    return response.data;
  } catch (error) {
    handleApiError(error, 'Failed to record test attempt');
  }
};