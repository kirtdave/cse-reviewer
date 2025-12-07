// src/utils/axiosConfig.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ✅ MAGIC FIX: Global interceptor that catches ALL 401 errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      
      if (isLoggedIn) {
        console.log('🔒 Session expired - logging out');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('isAdmin');
        localStorage.removeItem('adminUser');
        
        alert('Your session has expired. Please login again.');
        window.location.href = '/';
      } else {
        console.log('⚠️ API call made without auth - ignoring error');
      }
      
      return Promise.resolve({
        data: {
          bookmarks: [],
          stats: {
            totalQuestions: 0,
            masteredQuestions: 0,
            learningQuestions: 0,
            needsReviewQuestions: 0
          },
          attempts: [],
        }
      });
    }
    
    return Promise.reject(error);
  }
);

// ✅ Block requests if not logged in
axios.interceptors.request.use(
  (config) => {
    const publicEndpoints = [
      '/auth/login',
      '/auth/register',
      '/auth/forgot-password',
    ];
    
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint)
    );
    
    if (!isPublicEndpoint) {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const token = localStorage.getItem('token');
      
      if (!isLoggedIn || !token) {
        console.log('⚠️ Blocking API call - user not logged in:', config.url);
        
        return Promise.reject({
          response: { status: 401 },
          message: 'User not authenticated'
        });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axios;