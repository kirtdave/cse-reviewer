import React from 'react';
import { motion } from 'framer-motion';

export default function StudyModePanel({ totalQuestions, currentQuestion, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-3 sm:mb-6 p-3 sm:p-6 rounded-lg sm:rounded-xl ${isDark ? "bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30" : "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"} backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0`}>
            <i className="fa-solid fa-book-open-reader text-white text-base sm:text-xl"></i>
          </div>
          <div className="min-w-0">
            <h3 className={`text-sm sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
              📚 Study Mode
            </h3>
            <p className={`text-[10px] sm:text-sm ${isDark ? "text-orange-300" : "text-orange-700"} truncate`}>
              {totalQuestions} wrong answer{totalQuestions !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="text-right flex-shrink-0">
          <p className={`text-lg sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {totalQuestions}
          </p>
          <p className={`text-[10px] sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Questions
          </p>
        </div>
      </div>

      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3`}>
        <div className={`p-2 sm:p-3 rounded-lg ${isDark ? "bg-orange-500/10" : "bg-white/50"}`}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <i className="fa-solid fa-shuffle text-orange-500 text-xs sm:text-sm"></i>
            <p className={`text-[10px] sm:text-xs font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>
              Randomized
            </p>
          </div>
          <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Random order
          </p>
        </div>

        <div className={`p-2 sm:p-3 rounded-lg ${isDark ? "bg-orange-500/10" : "bg-white/50"}`}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <i className="fa-solid fa-brain text-orange-500 text-xs sm:text-sm"></i>
            <p className={`text-[10px] sm:text-xs font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>
              Focus
            </p>
          </div>
          <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Wrong only
          </p>
        </div>

        <div className={`p-2 sm:p-3 rounded-lg ${isDark ? "bg-orange-500/10" : "bg-white/50"}`}>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1">
            <i className="fa-solid fa-lightbulb text-orange-500 text-xs sm:text-sm"></i>
            <p className={`text-[10px] sm:text-xs font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>
              Learn
            </p>
          </div>
          <p className={`text-[10px] sm:text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Read answers
          </p>
        </div>
      </div>
    </motion.div>
  );
}