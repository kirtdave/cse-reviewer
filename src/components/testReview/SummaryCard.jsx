
// ============================================
// SummaryCard.jsx - COMPACT MOBILE
// ============================================
import React from "react";
import { motion } from "framer-motion";

export default function SummaryCard({ icon, label, value, gradient, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-2.5 sm:p-6 rounded-lg sm:rounded-xl ${
        isDark ? "bg-gray-900/60" : "bg-white/60"
      } backdrop-blur-xl shadow-sm border ${
        isDark ? "border-gray-800" : "border-gray-200"
      } hover:shadow-xl transition-all`}
    >
      <div className="flex items-center justify-between sm:flex-col sm:items-start">
        <div className="flex items-center gap-1.5 sm:gap-2 sm:w-full sm:justify-between sm:mb-2">
          <div className={`p-1.5 sm:p-3 rounded-lg bg-gradient-to-r ${gradient} flex-shrink-0`}>
            <i className={`fa-solid ${icon} text-white text-sm sm:text-xl`}></i>
          </div>
          <span className={`text-lg sm:text-3xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {value}
          </span>
        </div>
        
        <p className={`text-[10px] sm:text-sm font-medium ${isDark ? "text-gray-400" : "text-gray-600"} sm:w-full`}>
          {label}
        </p>
      </div>
    </motion.div>
  );
}