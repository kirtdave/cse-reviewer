import React from 'react';

const SidebarHeader = ({ isCollapsed, setIsCollapsed, isDark }) => (
  <div className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
    {!isCollapsed && (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-book-open-reader text-white text-base sm:text-lg"></i>
        </div>
        <span className="font-bold text-base sm:text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          CSE REVIEWER
        </span>
      </div>
    )}
    <button
      onClick={() => setIsCollapsed(!isCollapsed)}
      className={`${isCollapsed ? "mx-auto" : ""} w-7 h-7 sm:w-8 sm:h-8 rounded-lg ${isDark ? "bg-gray-800 text-gray-400 hover:text-blue-400" : "bg-gray-100 text-gray-600 hover:text-blue-600"} flex items-center justify-center transition-all hover:scale-110`}
    >
      <i className={`fa-solid ${isCollapsed ? "fa-angles-right" : "fa-angles-left"} text-sm`}></i>
    </button>
  </div>
);

export default SidebarHeader;