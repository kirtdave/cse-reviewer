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
  isScheduledPractice = false, // ✅ NEW: Flag for scheduled practice
  scheduleType = "" // ✅ NEW: Display schedule type
}) {
  
  let displayCategories = "Various Topics";

  if (Array.isArray(categories) && categories.length > 0) {
    displayCategories = categories.join(", ");
  }
  
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl border-b ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <BookOpen className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                {/* ✅ NEW: Show schedule type if it's scheduled practice */}
                {isScheduledPractice && scheduleType ? scheduleType : "Civil Service Practice Test"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Brain className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"}`} />
                <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                  {sampleQuestionsCount} Questions • {displayCategories}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 items-center">
            <motion.div
              animate={timeWarning ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: timeWarning ? Infinity : 0 }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
                timeWarning
                  ? "bg-red-500/20 border-red-500"
                  : isDark
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-100 border-gray-200"
              } border-2 shadow-lg`}
            >
              <Clock className={`w-5 h-5 ${timeWarning ? "text-red-500" : isDark ? "text-blue-400" : "text-blue-600"}`} />
              <span className={`font-mono text-lg font-bold ${timeWarning ? "text-red-500" : isDark ? "text-white" : "text-gray-900"}`}>
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </motion.div>

            {/* ✅ UPDATED: Hide submit button in scheduled practice mode */}
            {!submitted && !isScheduledPractice && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSubmit}
                className="px-4 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="hidden sm:inline">Submit Test</span>
              </motion.button>
            )}
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Progress: {answersCount} / {sampleQuestionsCount}
            </span>
            <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              {progress.toFixed(0)}%
            </span>
          </div>
          <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-gray-800" : "bg-gray-200"}`}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* ✅ NEW: Show info banner for scheduled practice */}
        {isScheduledPractice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-3 rounded-xl ${isDark ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"} border`}
          >
            <p className={`text-sm ${isDark ? "text-blue-300" : "text-blue-700"}`}>
              💡 <span className="font-semibold">Scheduled Practice Mode:</span> Questions will load automatically. Timer will stop when time runs out.
            </p>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}