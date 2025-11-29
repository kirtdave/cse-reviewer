// src/services/contactService.js

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Submit a contact message
 */
export const submitContactMessage = async (messageData) => {
  try {
    console.log('📨 Submitting contact message:', messageData);
    
    const response = await fetch(`${API_URL}/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(messageData)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to send message');
    }

    console.log('✅ Message sent successfully:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending message:', error);
    throw error.message || 'Failed to send message';
  }
};

/**
 * Get all contact messages (Admin only)
 */
export const getAllContactMessages = async (filters = {}) => {
  try {
    console.log('📥 Fetching contact messages...');
    
    const { page = 1, limit = 20, status, sortBy = 'createdAt', sortOrder = 'desc' } = filters;
    
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sortBy,
      sortOrder
    });

    if (status) {
      params.append('status', status);
    }

    const response = await fetch(`${API_URL}/contact?${params}`, {
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch messages');
    }

    console.log('✅ Messages fetched:', data);
    return data;
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    throw error.message || 'Failed to fetch messages';
  }
};

/**
 * Update message status (Admin only)
 */
export const updateMessageStatus = async (messageId, status) => {
  try {
    console.log('📝 Updating message status:', messageId, status);
    
    const response = await fetch(`${API_URL}/contact/${messageId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update status');
    }

    console.log('✅ Status updated:', data);
    return data;
  } catch (error) {
    console.error('❌ Error updating status:', error);
    throw error.message || 'Failed to update status';
  }
};

/**
 * Delete a contact message (Admin only)
 */
export const deleteContactMessage = async (messageId) => {
  try {
    console.log('🗑️ Deleting message:', messageId);
    
    const response = await fetch(`${API_URL}/contact/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeader()
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete message');
    }

    console.log('✅ Message deleted:', data);
    return data;
  } catch (error) {
    console.error('❌ Error deleting message:', error);
    throw error.message || 'Failed to delete message';
  }
};