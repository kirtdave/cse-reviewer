// ============================================================================
// components/MobileHeader.jsx
// ============================================================================
import React from 'react';

const MobileHeader = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => (
  <div className="lg:hidden fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
        <i className="fa-solid fa-book-open-reader text-white text-lg"></i>
      </div>
      <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        CSE REVIEWER
      </span>
    </div>
    <button
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all"
    >
      <i className={`fa-solid ${isMobileMenuOpen ? "fa-xmark" : "fa-bars"} text-lg`}></i>
    </button>
  </div>
);

export default MobileHeader;