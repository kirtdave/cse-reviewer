import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import ExplanationSection from "./ExplanationSection";
import BookmarkButton from "./BookmarkButton";
import { AICoachWidget } from "../Dashboard/AICoachWidget";

export default function ReviewQuestionCard({
  question,
  questionNumber,
  userAnswer,
  correctAnswer,
  isCorrect,
  isUnanswered,
  isDark,
  index,
  attemptId,
  questionIndex,
  initialBookmarked = false,
  theme = "dark"
}) {
  const [showAIChat, setShowAIChat] = useState(false);

  const formatExplanation = (explanation) => {
    if (!explanation) return null;

    const methodPattern = /(?:Method|Solution|Approach)\s*\d+:/gi;
    const hasMultipleMethods = methodPattern.test(explanation);

    if (hasMultipleMethods) {
      const methods = explanation.split(/(?=(?:Method|Solution|Approach)\s*\d+:)/gi);
      return methods
        .filter((m) => m.trim())
        .map((method, idx) => {
          const [title, ...content] = method.split(/:\s*/);
          return { title: title.trim(), content: content.join(":").trim(), id: idx };
        });
    }

    return [{ title: null, content: explanation, id: 0 }];
  };

  const explanationSections = question.explanation
    ? formatExplanation(question.explanation)
    : null;

  const questionData = {
    questionText: question.question,
    category: question.category,
    isCorrect: isCorrect,
    attemptId: attemptId,
    questionIndex: questionIndex
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ delay: index * 0.05 }}
        className={`print-break p-3 sm:p-6 rounded-lg sm:rounded-xl ${
          isDark ? "bg-gray-900/60" : "bg-white/60"
        } backdrop-blur-xl shadow-sm border-2 ${
          isCorrect
            ? "border-green-500/50"
            : isUnanswered
            ? isDark
              ? "border-gray-800"
              : "border-gray-200"
            : "border-red-500/50"
        } hover:shadow-xl transition-all`}
      >
        {/* Question Header */}
        <div className="flex items-start justify-between mb-2 sm:mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
              <span
                className={`px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                  isDark
                    ? "bg-purple-500/20 text-purple-400"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                {question.category || "General"}
              </span>
              {isCorrect && (
                <div className="flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-green-500/20 text-green-500">
                  <i className="fa-solid fa-circle-check text-[10px] sm:text-xs"></i>
                  <span className="text-[10px] sm:text-xs font-semibold">Correct</span>
                </div>
              )}
              {!isCorrect && !isUnanswered && (
                <div className="flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-red-500/20 text-red-500">
                  <i className="fa-solid fa-circle-xmark text-[10px] sm:text-xs"></i>
                  <span className="text-[10px] sm:text-xs font-semibold">Wrong</span>
                </div>
              )}
              {isUnanswered && (
                <div className="flex items-center gap-1 px-1.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-orange-500/20 text-orange-500">
                  <i className="fa-solid fa-book-open text-[10px] sm:text-xs"></i>
                  <span className="text-[10px] sm:text-xs font-semibold">Unanswered</span>
                </div>
              )}
            </div>
            <h3
              className={`text-sm sm:text-lg font-bold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              {questionNumber}. {question.question}
            </h3>
          </div>

          {/* Bookmark Button */}
          <div className="ml-2 sm:ml-4 no-print flex-shrink-0">
            <BookmarkButton
              attemptId={attemptId}
              questionIndex={questionIndex}
              initialBookmarked={initialBookmarked}
              isDark={isDark}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-1.5 sm:space-y-3">
          {question.options &&
            question.options.map((option, idx) => {
              const isUserAnswer = userAnswer === idx;
              const isCorrectAnswer = correctAnswer === idx;

              let bgClass = isDark
                ? "bg-gray-800/50 border-gray-700"
                : "bg-gray-50 border-gray-200";
              let textClass = isDark ? "text-gray-300" : "text-gray-700";

              if (isCorrectAnswer) {
                bgClass = "bg-green-500/20 border-green-500";
                textClass = "text-green-500 font-semibold";
              } else if (isUserAnswer && !isCorrect) {
                bgClass = "bg-red-500/20 border-red-500";
                textClass = "text-red-500 font-semibold";
              }

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + idx * 0.02 }}
                  className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-4 py-2 sm:py-3 rounded-lg border-2 ${bgClass} transition-all`}
                >
                  <div
                    className={`w-4 h-4 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isCorrectAnswer
                        ? "border-green-500"
                        : isUserAnswer
                        ? "border-red-500"
                        : isDark
                        ? "border-gray-600"
                        : "border-gray-300"
                    }`}
                  >
                    {(isCorrectAnswer || isUserAnswer) && (
                      <div
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          isCorrectAnswer ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                    )}
                  </div>
                  <span className={`flex-1 text-xs sm:text-sm ${textClass}`}>{option}</span>
                  {isCorrectAnswer && (
                    <i className="fa-solid fa-circle-check text-green-500 text-xs sm:text-sm"></i>
                  )}
                  {isUserAnswer && !isCorrect && (
                    <i className="fa-solid fa-circle-xmark text-red-500 text-xs sm:text-sm"></i>
                  )}
                </motion.div>
              );
            })}
        </div>

        {/* Explanation */}
        {explanationSections && explanationSections.length > 0 && (
          <div className="mt-2 sm:mt-4 space-y-1.5 sm:space-y-3">
            {explanationSections.map((section) => (
              <ExplanationSection
                key={section.id}
                title={section.title}
                content={section.content}
                isDark={isDark}
                isMultipleMethod={explanationSections.length > 1}
              />
            ))}
          </div>
        )}

        {/* AI Help Button */}
        {(!isCorrect || isUnanswered) && (
          <div className={`mt-2 sm:mt-4 pt-2 sm:pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} no-print`}>
            <button
              onClick={() => setShowAIChat(true)}
              className="w-full px-3 py-2 sm:py-3 text-xs sm:text-sm rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-1.5 sm:gap-2"
            >
              <Sparkles size={14} className="sm:w-[18px] sm:h-[18px]" />
              Need help? Ask AI
            </button>
          </div>
        )}
      </motion.div>

      {/* AI Chat Modal */}
      {showAIChat && (
        <AICoachWidget
          theme={theme}
          initialQuestion={questionData}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </>
  );
}