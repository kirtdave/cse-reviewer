import React from "react";
import { motion } from "framer-motion";

export default function SummaryCard({ icon, label, value, gradient, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`p-6 rounded-xl ${
        isDark ? "bg-gray-900/60" : "bg-white/60"
      } backdrop-blur-xl shadow-sm border ${
        isDark ? "border-gray-800" : "border-gray-200"
      } hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-3 rounded-lg bg-gradient-to-r ${gradient}`}>
          <i className={`fa-solid ${icon} text-white text-xl`}></i>
        </div>
        <span
          className={`text-3xl font-bold ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {value}
        </span>
      </div>
      <p
        className={`text-sm font-medium ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}
      >
        {label}
      </p>
    </motion.div>
  );
}