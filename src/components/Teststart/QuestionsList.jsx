import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionCard from "./QuestionCard";

export default function QuestionsList({ 
  sampleQuestions, 
  answers, 
  results, 
  fadeQuestions, 
  isDark, 
  onSelect,
  isLoadingNextQuestion = false // ✅ NEW: Loading state
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-6 sm:p-8 rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
    >
      <AnimatePresence>
        {sampleQuestions.map((q, qIndex) => {
          const selected = answers[qIndex];
          const correctIndex = q.answer;
          const isFading = fadeQuestions[qIndex];
          const locked = answers[qIndex] !== undefined;

          return !isFading ? (
            <QuestionCard
              key={qIndex}
              q={q}
              qIndex={qIndex}
              selected={selected}
              locked={locked}
              correctIndex={correctIndex}
              isDark={isDark}
              onSelect={onSelect}
            />
          ) : null;
        })}
      </AnimatePresence>

      {/* ✅ NEW: Loading indicator for next question */}
      {isLoadingNextQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 p-8 rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-center justify-center`}
        >
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
            Loading Next Question...
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Get ready! Your next challenge is coming up.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}