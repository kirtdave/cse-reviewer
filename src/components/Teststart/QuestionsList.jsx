// QuestionsList.jsx - MOBILE-FIRST
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
  isLoadingNextQuestion = false
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${isDark ? "bg-gray-900/80" : "bg-white/80"} backdrop-blur-xl p-3 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} shadow-xl`}
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

      {/* Loading indicator */}
      {isLoadingNextQuestion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 sm:mt-8 p-4 sm:p-8 rounded-lg sm:rounded-2xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-100'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col items-center justify-center`}
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
          <p className={`text-sm sm:text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-1 sm:mb-2 text-center`}>
            Loading Next Question...
          </p>
          <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} text-center`}>
            Get ready!
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}