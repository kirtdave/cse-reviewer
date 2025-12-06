import React from "react";
import { motion } from "framer-motion";

export default function FilterButton({ active, onClick, label, count, gradient, isDark }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
        active
          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
          : isDark
          ? "bg-gray-800 text-gray-300 active:bg-gray-700"
          : "bg-white text-gray-700 active:bg-gray-50 border border-gray-300"
      }`}
    >
      {label} ({count})
    </motion.button>
  );
}