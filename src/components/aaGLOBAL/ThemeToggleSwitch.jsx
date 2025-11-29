import React from "react";
import { motion } from "framer-motion";

export default function ThemeToggleSwitch({ isDark, toggleTheme, isCollapsed = false }) {
  return (
    <button
      onClick={toggleTheme}
      className={`group relative flex items-center rounded-xl transition-all
        ${isCollapsed ? "justify-center w-full px-4 py-3" : "w-full px-4 py-3 gap-3"}
        ${isDark ? "bg-gray-800/50 hover:bg-gray-800" : "bg-gray-100/50 hover:bg-gray-100"}
      `}
      aria-label="Toggle theme"
    >
      {/* Toggle Switch */}
      <div className={`relative ${isCollapsed ? "" : "flex-shrink-0"}`}>
        <div
          className={`w-12 h-6 rounded-full flex items-center px-0.5 transition-colors duration-300 ${
            isDark
              ? "bg-gradient-to-r from-indigo-600 to-purple-600"
              : "bg-gradient-to-r from-amber-400 to-orange-500"
          }`}
        >
          <motion.div
            className="w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center"
            animate={{
              x: isDark ? 24 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 700,
              damping: 30,
            }}
          >
            {isDark ? (
              <i className="fa-solid fa-moon text-[9px] text-indigo-600"></i>
            ) : (
              <i className="fa-solid fa-sun text-[9px] text-amber-500"></i>
            )}
          </motion.div>
        </div>
      </div>

      {/* Label */}
      {!isCollapsed && (
        <div className="flex flex-col items-start flex-1">
          <span
            className={`text-sm font-semibold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
          <span
            className={`text-xs ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Switch to {isDark ? "light" : "dark"}
          </span>
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <span
          className={`absolute left-full ml-2 px-3 py-1.5 rounded-lg whitespace-nowrap text-sm font-medium
            ${isDark ? "bg-gray-800 text-white" : "bg-gray-900 text-white"}
            opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all shadow-lg z-50
          `}
        >
          {isDark ? "Dark Mode" : "Light Mode"}
        </span>
      )}
    </button>
  );
}