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
      className={`mb-8 pb-8 ${qIndex < 999 ? `border-b ${isDark ? "border-gray-800" : "border-gray-200"}` : ""}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isDark ? "bg-purple-500/20 text-purple-400" : "bg-purple-100 text-purple-700"}`}>
              {q.category}
            </span>
          </div>
          <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
            {qIndex + 1}. {q.question}
          </h3>
        </div>

        {locked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full ml-4 flex-shrink-0 ${
              selected === correctIndex ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
            }`}
          >
            {selected === correctIndex ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-sm font-semibold">Correct</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Wrong</span>
              </>
            )}
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
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
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 font-medium transition-all duration-200 ${bgClass} ${textClass}`}
            >
              <div className={`w-6 h-6 rounded-full border-2 ${iconColor} flex items-center justify-center flex-shrink-0`}>
                {(isSelected || (locked && isCorrect)) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`w-3 h-3 rounded-full ${locked ? (isCorrect ? "bg-green-500" : "bg-red-500") : "bg-white"}`}
                  />
                )}
              </div>
              <span className="flex-1 text-left">{opt}</span>

              {locked && isCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
              {locked && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-500" />}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
