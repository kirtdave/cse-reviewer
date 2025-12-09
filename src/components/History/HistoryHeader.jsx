import React from "react";
import { motion } from "framer-motion";

export default function HistoryHeader({ theme = "dark", onViewDeleted }) {
  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
            <i className="fa-solid fa-clock-rotate-left text-white text-xl sm:text-2xl"></i>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className={`text-lg sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
              Exam History Center
            </h1>
            <p className="text-xs sm:text-sm bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent font-medium">
              Track your past attempts
            </p>
          </div>
        </div>

        {/* View Deleted Tests Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onViewDeleted}
          className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium hover:shadow-lg transition-all flex items-center gap-2 flex-shrink-0"
        >
          <i className="fa-solid fa-trash-arrow-up"></i>
          <span className="hidden sm:inline">Deleted Tests</span>
        </motion.button>
      </div>
    </motion.header>
  );
}