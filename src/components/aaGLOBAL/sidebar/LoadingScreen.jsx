// ============================================================================
// components/LoadingScreen.jsx
// ============================================================================
import React from 'react';

const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-purple-50">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
      <div className="w-16 h-16 border-4 border-blue-600 rounded-full animate-spin border-t-transparent absolute top-0 left-0"></div>
    </div>
  </div>
);

export default LoadingScreen;