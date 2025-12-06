// SidebarPanel.jsx - MOBILE-FIRST
import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, XCircle } from "lucide-react";

export default function SidebarPanel({ isDark, correctCount, wrongCount, remainingCount, sampleQuestions, results }) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Live Stats */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-4 sm:p-6 rounded-lg sm:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
      >
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
          <h3 className={`font-bold text-sm sm:text-base ${isDark ? "text-white" : "text-gray-900"}`}>Live Stats</h3>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
              <span className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Correct</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-green-500">{correctCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              <span className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Wrong</span>
            </div>
            <span className="text-base sm:text-lg font-bold text-red-500">{wrongCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>?</span>
              </div>
              <span className={`text-xs sm:text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Remaining</span>
            </div>
            <span className={`text-base sm:text-lg font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>{remainingCount}</span>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: "auto" }} 
            className={`mt-3 sm:mt-4 pt-3 sm:pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}
          >
            <span className={`text-xs sm:text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"} block mb-1.5 sm:mb-2`}>
              Current Score
            </span>
            <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {((correctCount / Math.max(1, Object.keys(results).length)) * 100).toFixed(0)}%
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Question Grid */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ delay: 0.1 }} 
        className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-4 sm:p-6 rounded-lg sm:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
      >
        <h3 className={`font-bold mb-3 sm:mb-4 text-sm sm:text-base ${isDark ? "text-white" : "text-gray-900"}`}>
          Question List
        </h3>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {sampleQuestions.map((_, i) => {
            const status = results[i];

            let bgClass = isDark ? "bg-gray-800" : "bg-gray-100";
            let textClass = isDark ? "text-gray-400" : "text-gray-600";
            let borderClass = isDark ? "border-gray-700" : "border-gray-300";

            if (status === "correct") {
              bgClass = "bg-green-500/20";
              textClass = "text-green-500";
              borderClass = "border-green-500";
            } else if (status === "wrong") {
              bgClass = "bg-red-500/20";
              textClass = "text-red-500";
              borderClass = "border-red-500";
            }

            return (
              <motion.div 
                key={i} 
                whileHover={{ scale: 1.1 }} 
                className={`aspect-square rounded-md sm:rounded-lg font-semibold transition-all border-2 flex items-center justify-center text-xs sm:text-sm ${bgClass} ${textClass} ${borderClass}`}
              >
                {i + 1}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}