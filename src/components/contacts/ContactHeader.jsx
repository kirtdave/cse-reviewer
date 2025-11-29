import React from "react";
import { motion } from "framer-motion";

export default function ContactHeader({ theme = "dark" }) {
  const isDark = theme === "dark";

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-envelope text-white text-2xl"></i>
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            Contact Center
          </h1>
          <p className="text-sm bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent font-medium">
            Reach out to us for support or inquiries
          </p>
        </div>
      </div>
    </motion.header>
  );
}