import React from "react";
import { motion } from "framer-motion";

export default function FilterButton({ active, onClick, label, count, gradient, isDark }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium transition-all ${
        active
          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
          : isDark
          ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
      }`}
    >
      {label} ({count})
    </motion.button>
  );
}