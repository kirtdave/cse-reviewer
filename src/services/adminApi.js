// services/adminApi.js
import axios from 'axios';

// ✅ Use Vite's import.meta.env instead of process.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('isAdmin');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== DASHBOARD ====================
export const getDashboardStats = async () => {
  const { data } = await api.get('/admin/stats');
  return data;
};

// ==================== USERS ====================
export const getUsers = async (params = {}) => {
  const { data } = await api.get('/admin/users', { params });
  return data;
};

export const getUserById = async (id) => {
  const { data } = await api.get(`/admin/users/${id}`);
  return data;
};

export const suspendUser = async (id) => {
  const { data } = await api.post(`/admin/users/${id}/suspend`);
  return data;
};

// ==================== QUESTIONS ====================
export const getQuestions = async (params = {}) => {
  const { data } = await api.get('/admin/questions', { params });
  return data;
};

export const createQuestion = async (questionData) => {
  const { data } = await api.post('/admin/questions', questionData);
  return data;
};

export const updateQuestion = async (id, questionData) => {
  const { data } = await api.put(`/admin/questions/${id}`, questionData);
  return data;
};

export const deleteQuestion = async (id) => {
  const { data } = await api.delete(`/admin/questions/${id}`);
  return data;
};

// ==================== REPORTS ====================
export const getReports = async (params = {}) => {
  const { data } = await api.get('/admin/reports', { params });
  return data;
};

export const updateReportStatus = async (id, status) => {
  const { data } = await api.put(`/admin/reports/${id}`, { status });
  return data;
};

export const deleteReport = async (id) => {
  const { data } = await api.delete(`/admin/reports/${id}`);
  return data;
};

// ==================== MESSAGES (Contact Messages) ====================
export const getMessages = async (filters = {}) => {
  try {
    const { page = 1, limit = 10, status } = filters;
    
    const params = {
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };

    // Map status filter to backend format
    if (status && status !== 'All') {
      const statusMap = {
        'Unread': 'pending',
        'Read': 'read',
        'Replied': 'replied'
      };
      params.status = statusMap[status] || status.toLowerCase();
    }

    const { data } = await api.get('/contact', { params });

    // Transform backend data to match frontend expectations
    const transformedMessages = data.messages.map(msg => ({
      id: msg.id,
      sender: msg.name,
      email: msg.email,
      subject: 'Contact Form Submission',
      message: msg.message,
      status: msg.status === 'pending' ? 'Unread' : msg.status === 'replied' ? 'Read' : 'Read',
      priority: 'Normal',
      receivedDate: new Date(msg.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      avatar: msg.name.charAt(0).toUpperCase(),
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt
    }));

    return {
      messages: transformedMessages,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

export const markMessageAsRead = async (id) => {
  const { data } = await api.patch(`/contact/${id}/status`, { status: 'read' });
  return data;
};

export const deleteMessage = async (id) => {
  const { data } = await api.delete(`/contact/${id}`);
  return data;
};

export const replyToMessage = async (id, replyText) => {
  try {
    // Send reply to the new endpoint
    const { data } = await api.post(`/contact/${id}/reply`, { replyText });
    return data;
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
};

// Get contact statistics
export const getContactStats = async () => {
  try {
    const { data } = await api.get('/contact/stats');
    return data;
  } catch (error) {
    console.error('Error fetching contact stats:', error);
    // Return default values if fetch fails
    return {
      success: false,
      stats: {
        messagesReceivedPct: 100,
        activeInquiriesPct: 30,
        avgResponseTimePct: 60
      }
    };
  }
};

// ==================== NOTIFICATIONS ====================
export const getNotifications = async (params = {}) => {
  const { data } = await api.get('/admin/notifications', { params });
  return data;
};

export const createNotification = async (notificationData) => {
  const { data } = await api.post('/admin/notifications', notificationData);
  return data;
};

export const updateNotification = async (id, notificationData) => {
  const { data } = await api.put(`/admin/notifications/${id}`, notificationData);
  return data;
};

export const deleteNotification = async (id) => {
  const { data } = await api.delete(`/admin/notifications/${id}`);
  return data;
};

export const publishNotification = async (id) => {
  const { data } = await api.post(`/admin/notifications/${id}/publish`);
  return data;
};

export default {
  getDashboardStats,
  getUsers,
  getUserById,
  suspendUser,
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getReports,
  updateReportStatus,
  deleteReport,
  getMessages,
  markMessageAsRead,
  deleteMessage,
  replyToMessage,
  getContactStats,
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  publishNotification,
};