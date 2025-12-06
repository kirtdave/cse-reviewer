import React from "react";
import { motion } from "framer-motion";

function StatItem({ stat, index, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg ${
        isDark ? "bg-gray-800/50" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center flex-shrink-0`}>
          <i className={`fa-solid ${stat.icon} text-white text-sm`}></i>
        </div>
        <span className={`text-xs font-medium ${isDark ? "text-gray-300" : "text-gray-700"} truncate`}>
          {stat.label}
        </span>
      </div>
      <span className={`text-base font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent flex-shrink-0 ml-2`}>
        {stat.value}
      </span>
    </motion.div>
  );
}

export function StatsCard({ stats, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <h2 className={`text-sm sm:text-base lg:text-lg font-bold mb-2 sm:mb-3 lg:mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
        Your Stats
      </h2>
      <div className="space-y-2 sm:space-y-3 lg:space-y-4">
        {stats.map((stat, idx) => (
          <StatItem key={idx} stat={stat} index={idx} isDark={isDark} />
        ))}
      </div>
    </motion.div>
  );
}