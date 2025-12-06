// QuestionCard.jsx - MOBILE-FIRST
import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";

export default function QuestionCard({ q, qIndex, selected, locked, correctIndex, isDark, onSelect }) {
  return (
    <motion.div
      key={qIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4 }}
      className={`mb-4 sm:mb-8 pb-4 sm:pb-8 ${qIndex < 999 ? `border-b ${isDark ? "border-gray-800" : "border-gray-200"}` : ""}`}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
              {q.category}
            </span>
          </div>
          <h3 className={`text-sm sm:text-lg font-bold ${isDark ? "text-white" : "text-gray-900"} break-words`}>
            {qIndex + 1}. {q.question}
          </h3>
        </div>

        {/* Result Badge */}
        {locked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full flex-shrink-0 ${
              selected === correctIndex ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {selected === correctIndex ? (
              <>
                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-semibold hidden xs:inline">Correct</span>
                <span className="text-xs sm:text-sm font-semibold xs:hidden">✓</span>
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-semibold hidden xs:inline">Wrong</span>
                <span className="text-xs sm:text-sm font-semibold xs:hidden">✗</span>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2 sm:space-y-3">
        {q.options.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrect = i === correctIndex;

          let bgClass = isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200";
          let textClass = isDark ? "text-gray-300" : "text-gray-700";
          let iconColor = isDark ? "border-gray-600" : "border-gray-300";

          if (locked) {
            if (isCorrect) {
              bgClass = "bg-green-500/20 border-green-500";
              textClass = "text-green-400";
              iconColor = "border-green-500";
            } else if (isSelected && !isCorrect) {
              bgClass = "bg-red-500/20 border-red-500";
              textClass = "text-red-400";
              iconColor = "border-red-500";
            } else {
              bgClass = isDark ? "bg-gray-800/30 border-gray-700" : "bg-gray-100 border-gray-300";
              textClass = isDark ? "text-gray-500" : "text-gray-600";
            }
          } else if (isSelected) {
            bgClass = "bg-gradient-to-r from-blue-500 to-purple-600 border-blue-500";
            textClass = "text-white";
            iconColor = "border-white";
          }

          return (
            <motion.button
              key={i}
              whileHover={{ scale: locked ? 1 : 1.02, x: locked ? 0 : 5 }}
              whileTap={{ scale: locked ? 1 : 0.98 }}
              onClick={() => onSelect(qIndex, i)}
              disabled={locked}
              className={`w-full flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 sm:py-4 rounded-lg sm:rounded-xl border-2 font-medium transition-all duration-200 ${bgClass} ${textClass} text-xs sm:text-base text-left`}
            >
              {/* Radio Circle */}
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 ${iconColor} flex items-center justify-center flex-shrink-0`}>
                {(isSelected || (locked && isCorrect)) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${locked ? (isCorrect ? "bg-green-500" : "bg-red-500") : "bg-white"}`}
                  />
                )}
              </div>
              
              {/* Option Text */}
              <span className="flex-1 break-words">{opt}</span>

              {/* Result Icons */}
              {locked && isCorrect && <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />}
              {locked && isSelected && !isCorrect && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}