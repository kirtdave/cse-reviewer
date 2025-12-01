import React from "react";
import { motion } from "framer-motion";
import { ProfileFormField } from "./ProfileFormField";

export function StudyGoalsCard({ user, editForm, setEditForm, isEditing, isDark }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={`${isDark ? "bg-gray-900/60" : "bg-white/60"} backdrop-blur-xl rounded-2xl p-6 shadow-xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
    >
      <h2 className={`text-xl font-bold mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
        Study Goals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Primary Goal
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.studyGoal || ''}
              onChange={(e) => setEditForm({ ...editForm, studyGoal: e.target.value })}
              placeholder="e.g., Pass CSE Professional Level"
              className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white" : "bg-white border-gray-300 text-gray-900"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          ) : (
            <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {user.studyGoal}
            </p>
          )}
        </div>
        
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            Target Date
          </label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.targetDate || ''}
              onChange={(e) => setEditForm({ ...editForm, targetDate: e.target.value })}
              placeholder="MM/DD/YYYY (e.g., 12/31/2025)"
              className={`w-full px-4 py-3 rounded-xl border ${isDark ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500" : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"} focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          ) : (
            <p className={`px-4 py-3 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"} text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {user.targetDate || 'Not set'}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}