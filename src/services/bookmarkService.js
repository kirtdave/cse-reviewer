// src/services/bookmarkService.js
import axios from 'axios';

// Prefer build-time Vite var; fall back to current origin in production to avoid localhost in deployed builds
const API_URL = import.meta.env.VITE_API_URL || `${window.location.origin}/api`;

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * Toggle bookmark for a question
 */
export const toggleBookmark = async (attemptId, questionIndex, note = '') => {
  try {
    const response = await api.post(
      `/test-attempts/${attemptId}/bookmark/${questionIndex}`,
      { note }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    throw error.response?.data?.error || 'Failed to toggle bookmark';
  }
};

/**
 * Get all bookmarks for current user
 */
export const getAllBookmarks = async () => {
  try {
    const response = await api.get('/test-attempts/bookmarks/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    throw error.response?.data?.error || 'Failed to load bookmarks';
  }
};

/**
 * Update bookmark note
 */
export const updateBookmarkNote = async (attemptId, questionIndex, note) => {
  try {
    const response = await api.put(
      `/test-attempts/${attemptId}/bookmark/${questionIndex}/note`,
      { note }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating note:', error);
    throw error.response?.data?.error || 'Failed to update note';
  }
};

/**
 * Check if a question is bookmarked
 */
export const isQuestionBookmarked = async (attemptId, questionIndex) => {
  try {
    const response = await api.get(
      `/test-attempts/${attemptId}/bookmark/${questionIndex}/status`
    );
    return response.data;
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    return { bookmarked: false, note: '' };
  }
};