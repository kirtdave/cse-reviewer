// src/services/authService.js

// Use Vite's import.meta.env instead of hardcoded URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ==================== HELPER FUNCTIONS ====================

/**
 * Fetch full user profile data
 */
const fetchUserProfile = async (token) => {
  try {
    console.log('👤 Fetching full user profile...');
    const response = await fetch(`${API_URL}/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.warn('⚠️ Could not fetch profile, using basic user data');
      return null;
    }

    const data = await response.json();
    console.log('✅ Full profile fetched:', data.profile);
    return data.profile;
  } catch (error) {
    console.error('❌ Error fetching profile:', error);
    return null;
  }
};

// ==================== AUTH ====================

/**
 * Login user
 */
export const login = async (email, password) => {
  try {
    console.log('🔐 Logging in...');
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const { token, user, isAdmin } = data;

    // Store token first
    localStorage.setItem('token', token);
    localStorage.setItem('isLoggedIn', 'true');
    if (isAdmin) {
      localStorage.setItem('isAdmin', 'true');
    }

    // ✅ Fetch full profile data after login
    const fullProfile = await fetchUserProfile(token);
    
    // ✅ Merge auth data with full profile
    const completeUserData = fullProfile ? {
      ...user,
      ...fullProfile,
      // Ensure critical auth fields are preserved
      id: user.id || fullProfile?.id,
      email: user.email || fullProfile?.email,
      name: user.name || fullProfile?.name,
    } : user; // Fallback to basic user data if profile fetch fails

    // Store complete user data
    localStorage.setItem('user', JSON.stringify(completeUserData));

    console.log('✅ Login successful with complete profile');

    // ✅ Dispatch event to notify other components
    window.dispatchEvent(new Event('userLoggedIn'));
    window.dispatchEvent(new Event('userUpdated'));

    return {
      ...data,
      user: completeUserData
    };
  } catch (error) {
    console.error('❌ Login failed:', error);
    throw error.message || 'Login failed';
  }
};

/**
 * Signup new user
 */
export const signup = async (name, email, password) => {
  try {
    console.log('📝 Signing up...');
    const response = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed');
    }

    const { token, user } = data;

    // Store token first
    localStorage.setItem('token', token);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('isAdmin', 'false');

    // ✅ Fetch full profile data after signup
    const fullProfile = await fetchUserProfile(token);
    
    // ✅ Merge auth data with full profile
    const completeUserData = fullProfile ? {
      ...user,
      ...fullProfile,
      // Ensure critical auth fields are preserved
      id: user.id || fullProfile?.id,
      email: user.email || fullProfile?.email,
      name: user.name || fullProfile?.name,
    } : user; // Fallback to basic user data if profile fetch fails

    // Store complete user data
    localStorage.setItem('user', JSON.stringify(completeUserData));

    console.log('✅ Signup successful with complete profile');

    return {
      ...data,
      user: completeUserData
    };
  } catch (error) {
    console.error('❌ Signup failed:', error);
    throw error.message || 'Signup failed';
  }
};

/**
 * Logout user - CLEARS EVERYTHING
 */
export const logout = () => {
  console.log('👋 Logging out...');

  // Clear all authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('isAdmin');

  // Clear cached test data
  localStorage.removeItem('testHistory');
  localStorage.removeItem('analyticsData');
  localStorage.removeItem('userProgress');
  localStorage.removeItem('testAttempts');

  console.log('✅ Logout successful - all data cleared');
};

/**
 * Get current user info
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    console.log('👤 Fetching current user...');
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user');
    }

    return data.user;
  } catch (error) {
    console.error('❌ Failed to get current user:', error);
    throw error.message || 'Failed to get user info';
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  return !!(token && isLoggedIn === 'true');
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};

/**
 * Get auth headers (for manual fetch calls)
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};