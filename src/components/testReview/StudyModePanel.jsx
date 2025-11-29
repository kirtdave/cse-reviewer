import React from 'react';
import { motion } from 'framer-motion';

export default function StudyModePanel({ totalQuestions, currentQuestion, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 p-6 rounded-xl ${isDark ? "bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30" : "bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200"} backdrop-blur-xl`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center`}>
            <i className="fa-solid fa-book-open-reader text-white text-xl"></i>
          </div>
          <div>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              📚 Study Mode Active
            </h3>
            <p className={`text-sm ${isDark ? "text-orange-300" : "text-orange-700"}`}>
              Focusing on {totalQuestions} wrong answer{totalQuestions !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {totalQuestions}
          </p>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Questions to Review
          </p>
        </div>
      </div>

      {/* Tips */}
      <div className={`grid md:grid-cols-3 gap-3 mt-4`}>
        <div className={`p-3 rounded-lg ${isDark ? "bg-orange-500/10" : "bg-white/50"}`}>
          <div className="flex items-center gap-2 mb-1">
            <i className="fa-solid fa-shuffle text-orange-500"></i>
            <p className={`text-xs font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>
              Randomized Order
            </p>
          </div>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Questions appear in random order for better learning
          </p>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-orange-500/10" : "bg-white/50"}`}>
          <div className="flex items-center gap-2 mb-1">
            <i className="fa-solid fa-brain text-orange-500"></i>
            <p className={`text-xs font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>
              Focus on Mistakes
            </p>
          </div>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Review only the questions you got wrong
          </p>
        </div>

        <div className={`p-3 rounded-lg ${isDark ? "bg-orange-500/10" : "bg-white/50"}`}>
          <div className="flex items-center gap-2 mb-1">
            <i className="fa-solid fa-lightbulb text-orange-500"></i>
            <p className={`text-xs font-semibold ${isDark ? "text-orange-300" : "text-orange-700"}`}>
              Read Explanations
            </p>
          </div>
          <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Pay attention to why answers are correct
          </p>
        </div>
      </div>
    </motion.div>
  );
}