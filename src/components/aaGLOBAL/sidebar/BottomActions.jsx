import React from 'react';
import { motion } from 'framer-motion';
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
  <div className="px-3 lg:px-4 pb-4 lg:pb-6 space-y-2 lg:space-y-3 border-t pt-3 lg:pt-4 border-gray-200 dark:border-gray-800">
    {/* ✅ Theme Toggle with isMobile support */}
    <ThemeToggleSwitch 
      isDark={isDark} 
      toggleTheme={toggleTheme} 
      isCollapsed={isCollapsed}
      isMobile={isMobile}
    />

    {!isLoggedIn ? (
      isMobile || !isCollapsed ? (
        <>
          {/* Login Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openLogin}
            className="w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm lg:text-base"
          >
            <i className="fa-solid fa-right-to-bracket"></i>
            <span>Login</span>
          </motion.button>

          {/* Sign Up Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openSignup}
            className={`w-full flex items-center justify-center gap-2 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl border-2 font-medium transition-all text-sm lg:text-base ${
              isDark
                ? "border-blue-500 text-blue-400 hover:bg-gray-800"
                : "border-blue-500 text-blue-600 hover:bg-blue-50"
            }`}
          >
            <i className="fa-solid fa-user-plus"></i>
            <span>Sign Up</span>
          </motion.button>
        </>
      ) : (
        // Collapsed desktop view - Icon only
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openLogin}
          className="w-full flex items-center justify-center px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium shadow-lg hover:shadow-xl transition-all group relative"
        >
          <i className="fa-solid fa-right-to-bracket text-lg"></i>
          
          {/* Tooltip for collapsed state */}
          <span className="absolute left-full ml-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium bg-gray-900 text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg z-50">
            Login
          </span>
        </motion.button>
      )
    ) : (
      // Logout Button
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleLogout}
        className={`w-full flex items-center gap-3 lg:gap-4 px-3 lg:px-4 py-2.5 lg:py-3 rounded-xl transition-all text-sm lg:text-base group relative
          ${isCollapsed && !isMobile ? "justify-center" : ""}
          ${isDark ? "bg-red-900/20 text-red-400 hover:bg-red-900/30" : "bg-red-50 text-red-600 hover:bg-red-100"}
        `}
      >
        <i className="fa-solid fa-right-from-bracket"></i>
        {(!isCollapsed || isMobile) && <span className="font-medium">Logout</span>}
        
        {/* Tooltip for collapsed state */}
        {isCollapsed && !isMobile && (
          <span className={`absolute left-full ml-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg z-50 ${
            isDark ? "bg-gray-800 text-white" : "bg-gray-900 text-white"
          }`}>
            Logout
          </span>
        )}
      </motion.button>
    )}
  </div>
);

export default BottomActions;