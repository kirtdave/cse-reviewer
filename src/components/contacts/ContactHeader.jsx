import React from "react";
import { motion } from "framer-motion";

export default function ContactHeader({ theme = "dark" }) {
  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border ${isDark ? "border-gray-800" : "border-gray-200"} mb-2 sm:mb-3 lg:mb-6`}
    >
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
        <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-14 lg:h-14 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
          <i className="fa-solid fa-envelope text-white text-sm sm:text-lg lg:text-2xl"></i>
        </div>
        <div className="min-w-0">
          <h1 className={`text-base sm:text-lg lg:text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"} truncate`}>
            Contact Center
          </h1>
          <p className="text-xs sm:text-xs lg:text-sm bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent font-medium truncate">
            Reach out for support
          </p>
        </div>
      </div>
    </motion.header>
  );
}