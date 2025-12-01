import React from "react";
import { motion } from "framer-motion";

export function StatItem({ stat, index, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className={`flex items-center justify-between p-4 rounded-xl ${
        isDark ? "bg-gray-800/50" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
          <i className={`fa-solid ${stat.icon} text-white`}></i>
        </div>
        <span className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
          {stat.label}
        </span>
      </div>
      <span className={`text-lg font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
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
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
        Your Stats
      </h2>
      <div className="space-y-4">
        {stats.map((stat, idx) => (
          <StatItem key={idx} stat={stat} index={idx} isDark={isDark} />
        ))}
      </div>
    </motion.div>
  );
}