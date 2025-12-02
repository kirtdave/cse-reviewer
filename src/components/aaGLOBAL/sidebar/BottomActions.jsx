// ============================================================================
// components/BottomActions.jsx
// ============================================================================
import React from 'react';
import ThemeToggleSwitch from '../ThemeToggleSwitch';

const BottomActions = ({
  isLoggedIn,
  isDark,
  toggleTheme,
  openLogin,
  openSignup,
  handleLogout,
  isCollapsed,
  isMobile
}) => (
  <div className="px-4 pb-6 space-y-3 border-t pt-4 border-gray-200 dark:border-gray-800">
    <ThemeToggleSwitch isDark={isDark} toggleTheme={toggleTheme} isCollapsed={isCollapsed} />

    {!isLoggedIn ? (
      isMobile || !isCollapsed ? (
        <>
          <button
            onClick={openLogin}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
          >
            <i className="fa-solid fa-right-to-bracket"></i>
            {(!isCollapsed || isMobile) && <span>Login</span>}
          </button>
          {(!isCollapsed || isMobile) && (
            <button
              onClick={openSignup}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-800 transition-all"
            >
              <i className="fa-solid fa-user-plus"></i>
              <span>Sign Up</span>
            </button>
          )}
        </>
      ) : (
        <button
          onClick={openLogin}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        >
          <i className="fa-solid fa-right-to-bracket"></i>
        </button>
      )
    ) : (
      <button
        onClick={handleLogout}
        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all
          ${isCollapsed ? "justify-center" : ""}
          ${isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/30" : "bg-red-50 text-red-600 hover:bg-red-100"}
        `}
      >
        <i className="fa-solid fa-right-from-bracket"></i>
        {(!isCollapsed || isMobile) && <span className="font-medium">Logout</span>}
      </button>
    )}
  </div>
);

export default BottomActions;