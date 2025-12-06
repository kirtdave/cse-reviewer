// Header.jsx - ULTRA COMPACT MOBILE-FIRST
import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Brain, Clock, CheckCircle2 } from "lucide-react";

export default function Header({
  isDark,
  sampleQuestionsCount,
  categories,
  minutes,
  seconds,
  timeWarning,
  submitted,
  onSubmit,
  answersCount,
  progress,
  isScheduledPractice = false,
  scheduleType = ""
}) {
  
  let displayCategories = "Various Topics";

  if (Array.isArray(categories) && categories.length > 0) {
    displayCategories = categories.join(", ");
  }
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/95" : "bg-white/95"} backdrop-blur-xl border-b ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg sticky top-0 z-50`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
        {/* ✅ ULTRA COMPACT: Single row on mobile */}
        <div className="flex flex-col gap-2 sm:gap-3">
          {/* Top Row - Everything in one line on mobile */}
          <div className="flex items-center justify-between gap-2">
            {/* Left: Icon + Title (very compact) */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1 hidden sm:block">
                <h1 className={`text-2xl font-bold truncate ${isDark ? "text-white" : "text-gray-900"}`}>
                  {isScheduledPractice && scheduleType ? scheduleType : "CS Practice"}
                </h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <Brain className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                  <p className={`text-sm truncate ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    {sampleQuestionsCount} Q • {displayCategories}
                  </p>
                </div>
              </div>
              {/* Mobile: Just question count */}
              <p className={`text-xs font-medium sm:hidden ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {sampleQuestionsCount} Q
              </p>
            </div>

            {/* Right: Timer + Submit */}
            <div className="flex items-center gap-2">
              {/* Timer - Compact */}
              <motion.div
                animate={timeWarning ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 1, repeat: timeWarning ? Infinity : 0 }}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-md sm:rounded-xl ${
                  timeWarning
                    ? "bg-red-500/20 border-red-500"
                    : isDark
                    ? "bg-gray-800 border-gray-700"
                    : "bg-gray-100 border-gray-200"
                } border sm:border-2 flex-shrink-0`}
              >
                <Clock className={`w-3 h-3 sm:w-5 sm:h-5 ${timeWarning ? "text-red-500" : isDark ? "text-blue-400" : "text-blue-600"}`} />
                <span className={`font-mono text-xs sm:text-lg font-bold ${timeWarning ? "text-red-500" : isDark ? "text-white" : "text-gray-900"}`}>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </motion.div>

              {/* Submit Button - Compact text on mobile */}
              {!submitted && !isScheduledPractice && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onSubmit}
                  className="px-2.5 sm:px-6 py-1.5 sm:py-2.5 rounded-md sm:rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-1 sm:gap-2"
                  title="Submit Test"
                  aria-label="Submit Test"
                >
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-base">Submit</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Progress Bar - Ultra compact */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {answersCount} / {sampleQuestionsCount}
              </span>
              <span className={`text-xs font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <div className={`h-1 sm:h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
              />
            </div>
          </div>

          {/* Info Banner - Only on desktop or when needed */}
          {isScheduledPractice && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-2 sm:p-3 rounded-lg sm:rounded-xl ${isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"} border hidden sm:block`}
            >
              <p className={`text-xs sm:text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
                💡 <span className="font-semibold">Scheduled Practice:</span> Questions load automatically
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}