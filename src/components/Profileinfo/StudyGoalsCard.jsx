import React from "react";
import { motion } from "framer-motion";

export function StudyGoalsCard({ user, editForm, setEditForm, isEditing, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <h2 className={`text-sm sm:text-base lg:text-lg font-bold mb-2 sm:mb-3 lg:mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
        Study Goals
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Primary Goal
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.studyGoal || ''}
              onChange={(e) => setEditForm({ ...editForm, studyGoal: e.target.value })}
              placeholder="e.g., Pass CSE Professional"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          ) : (
            <p className={`px-3 py-2 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"} text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"} break-words`}>
              {user.studyGoal}
            </p>
          )}
        </div>
        
        <div>
          <label className={`block text-xs font-medium mb-1.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Target Date
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.targetDate || ''}
              onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
              placeholder="12/31/2025"
              className={`w-full px-3 py-2 text-sm rounded-lg border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          ) : (
            <p className={`px-3 py-2 rounded-lg ${isDark ? "bg-gray-800/50" : "bg-gray-50"} text-sm font-semibold ${isDark ? "text-white" : "text-gray-900"}`}>
              {user.targetDate || 'Not set'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}