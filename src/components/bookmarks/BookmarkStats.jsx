// src/components/Bookmarks/BookmarkStats.jsx

import React from "react";
import { motion } from "framer-motion";
import { Bookmark, TrendingUp, BookOpen } from "lucide-react";

export default function BookmarkStats({ isDark, totalCount, correctCount, wrongCount }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-4 rounded-xl ${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
            <Bookmark className="text-pink-500" size={20} />
          </div>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Total Bookmarks</p>
            <p className="text-2xl font-bold text-pink-500">{totalCount}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`p-4 rounded-xl ${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
            <TrendingUp className="text-green-500" size={20} />
          </div>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Correct</p>
            <p className="text-2xl font-bold text-green-500">{correctCount}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`p-4 rounded-xl ${isDark ? "bg-gray-900/60" : "bg-white"} backdrop-blur-xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
            <BookOpen className="text-red-500" size={20} />
          </div>
          <div>
            <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Need Review</p>
            <p className="text-2xl font-bold text-red-500">{wrongCount}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}