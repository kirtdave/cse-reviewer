import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExplanationSection({ title, content, isDark, isMultipleMethod }) {
  const [isExpanded, setIsExpanded] = useState(!isMultipleMethod);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`rounded-lg overflow-hidden ${
        isDark
          ? "bg-blue-500/10 border border-blue-500/30"
          : "bg-blue-50 border border-blue-200"
      }`}
    >
      {/* Method Header - Only show if multiple methods */}
      {isMultipleMethod && title && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-full px-4 py-3 flex items-center justify-between transition-colors ${
            isDark ? "hover:bg-blue-500/20" : "hover:bg-blue-100"
          }`}
        >
          <span
            className={`font-semibold text-sm flex items-center gap-2 ${
              isDark ? "text-blue-400" : "text-blue-700"
            }`}
          >
            <span className="text-lg">💡</span>
            {title}
          </span>
          <i
            className={`fa-solid fa-chevron-${isExpanded ? "up" : "down"} text-sm ${
              isDark ? "text-blue-400" : "text-blue-600"
            }`}
          ></i>
        </button>
      )}

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-3">
              {!isMultipleMethod && (
                <p
                  className={`text-sm font-semibold mb-2 flex items-center gap-2 ${
                    isDark ? "text-blue-400" : "text-blue-700"
                  }`}
                >
                  <span className="text-lg">💡</span> Explanation:
                </p>
              )}
              <p
                className={`text-sm leading-relaxed ${
                  isDark ? "text-blue-300" : "text-blue-800"
                }`}
              >
                {content}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}