import React from "react";
import { motion } from "framer-motion";
import { Bookmark, TrendingUp, BookOpen } from "lucide-react";

export default function BookmarkStats({ isDark, totalCount, correctCount, wrongCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-3 sm:p-4 rounded-xl ${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
            <Bookmark className="text-pink-500" size={18} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>Total</p>
            <p className="text-xl sm:text-2xl font-bold text-pink-500">{totalCount}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-3 sm:p-4 rounded-xl ${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-green-500" size={18} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>Correct</p>
            <p className="text-xl sm:text-2xl font-bold text-green-500">{correctCount}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-3 sm:p-4 rounded-xl ${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-red-500" size={18} />
          </div>
          <div className="min-w-0">
            <p className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>Review</p>
            <p className="text-xl sm:text-2xl font-bold text-red-500">{wrongCount}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}