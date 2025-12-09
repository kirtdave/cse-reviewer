// ============================================================
// FILE: services/adminApi.js - UPDATED TO USE CORRECT ROUTES
// ============================================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// ==================== REPORTS (UPDATED TO USE /question-reports) ====================
export const getReports = async (params = {}) => {
  try {
    // ✅ CHANGED: Use /question-reports instead of /admin/reports
    const { data } = await api.get('/question-reports', { params });
    
    // ✅ Transform data to match frontend expectations
    const transformedReports = data.reports.map(report => ({
      id: report.id,
      questionId: report.questionId || `Q-${report.id}`,
      questionText: report.questionText,
      reportedBy: report.reporter?.name || 'Unknown',
      reportType: formatIssueType(report.issueType),
      description: report.description,
      status: capitalizeFirst(report.status),
      priority: getPriorityFromIssueType(report.issueType),
      submittedDate: getTimeAgo(report.createdAt),
      category: report.category,
      userId: report.userId // ✅ Include userId for notifications
    }));

    return {
      reports: transformedReports,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('❌ Error fetching reports:', error);
    throw error;
  }
};

export const updateReportStatus = async (reportId, status) => {
  try {
    console.log(`📝 Updating report ${reportId} to status: ${status}`);
    
    // ✅ CHANGED: Use /question-reports/:id/status
    const response = await api.patch(`/question-reports/${reportId}/status`, { 
      status: status.toLowerCase() // Convert "Resolved" to "resolved"
    });
    
    console.log('✅ Report status updated:', response.data);
    return response.data; // Returns { success, message, data, notificationSent }
  } catch (error) {
    console.error('❌ Error updating report status:', error);
    throw error.response?.data?.message || error.message || 'Failed to update report status';
  }
};

export const deleteReport = async (reportId) => {
  try {
    // ✅ CHANGED: Use /question-reports/:id
    const { data } = await api.delete(`/question-reports/${reportId}`);
    return data;
  } catch (error) {
    console.error('❌ Error deleting report:', error);
    throw error.response?.data?.message || error.message || 'Failed to delete report';
  }
};

// ==================== HELPER FUNCTIONS ====================
function formatIssueType(type) {
  const map = {
    'wrong_answer': 'Incorrect Answer',
    'typo': 'Typo Error',
    'unclear': 'Unclear Wording',
    'duplicate': 'Duplicate Question',
    'outdated': 'Outdated Content',
    'other': 'Other'
  };
  return map[type] || type;
}

function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getPriorityFromIssueType(type) {
  const highPriority = ['wrong_answer', 'outdated'];
  const mediumPriority = ['typo', 'unclear'];
  
  if (highPriority.includes(type)) return 'High';
  if (mediumPriority.includes(type)) return 'Medium';
  return 'Low';
}

function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
    }
  }
  
  return 'Just now';
}

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

    if (status && status !== 'All') {
      const statusMap = {
        'Unread': 'pending',
        'Read': 'read',
        'Replied': 'replied'
      };
      params.status = statusMap[status] || status.toLowerCase();
    }

    const { data } = await api.get('/contact', { params });

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
    const { data } = await api.post(`/contact/${id}/reply`, { replyText });
    return data;
  } catch (error) {
    console.error('Error sending reply:', error);
    throw error;
  }
};

export const getContactStats = async () => {
  try {
    const { data } = await api.get('/contact/stats');
    return data;
  } catch (error) {
    console.error('Error fetching contact stats:', error);
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