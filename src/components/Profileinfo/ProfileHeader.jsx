import React from "react";
import { motion } from "framer-motion";

export function ProfileHeader({ isDark }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
          <i className="fa-solid fa-user text-white text-2xl"></i>
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            My Profile
          </h1>
          <p className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent font-medium">
            Manage your account settings and preferences
          </p>
        </div>
      </div>
    </motion.header>
  );
}