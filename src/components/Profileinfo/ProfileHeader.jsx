import React from "react";
import { motion } from "framer-motion";

export function ProfileHeader({ isDark }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border ${isDark ? "border-gray-800" : "border-gray-200"} mb-2 sm:mb-3 lg:mb-6`}
    >
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <i className="fa-solid fa-user text-white text-sm sm:text-lg lg:text-xl"></i>
        </div>
        <div className="min-w-0">
          <h1 className={`text-base sm:text-lg lg:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
            My Profile
          </h1>
          <p className="text-xs sm:text-xs lg:text-sm bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-medium truncate">
            Manage your account
          </p>
        </div>
      </div>
    </motion.header>
  );
}