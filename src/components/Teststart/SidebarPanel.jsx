import React from "react";
import { motion } from "framer-motion";
import { Zap, CheckCircle2, XCircle } from "lucide-react";

export default function SidebarPanel({ isDark, correctCount, wrongCount, remainingCount, sampleQuestions, results }) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
      >
        <div className="flex items-center gap-3 mb-4">
          <Zap className={`w-5 h-5 ${isDark ? "text-yellow-400" : "text-yellow-600"}`} />
          <h3 className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}>Live Stats</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Correct</span>
            </div>
            <span className="text-lg font-bold text-green-500">{correctCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Wrong</span>
            </div>
            <span className="text-lg font-bold text-red-500">{wrongCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full ${isDark ? "bg-gray-700" : "bg-gray-300"} flex items-center justify-center`}>
                <span className={`text-xs font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>?</span>
              </div>
              <span className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>Remaining</span>
            </div>
            <span className={`text-lg font-bold ${isDark ? "text-gray-400" : "text-gray-600"}`}>{remainingCount}</span>
          </div>
        </div>

        {Object.keys(results).length > 0 && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className={`mt-4 pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <span className={`text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"} block mb-2`}>Current Score</span>
            <p className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              {((correctCount / Math.max(1, Object.keys(results).length)) * 100).toFixed(0)}%
            </p>
          </motion.div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-6 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}>
        <h3 className={`font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>Question List</h3>
        <div className="grid grid-cols-5 gap-2">
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
              <motion.div key={i} whileHover={{ scale: 1.1 }} className={`aspect-square rounded-lg font-semibold transition-all border-2 flex items-center justify-center ${bgClass} ${textClass} ${borderClass}`}>
                {i + 1}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
