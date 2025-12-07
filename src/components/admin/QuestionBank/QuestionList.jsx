// QuestionBank/QuestionList.jsx
import React from "react";
import { motion } from "framer-motion";

export default function QuestionList({ 
  questions, 
  loading, 
  viewMode,
  selectedQuestions,
  onToggleSelect,
  onEdit, 
  onDelete,
  palette 
}) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, successColor, errorColor, warningColor } = palette;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return successColor;
      case "Normal": return warningColor;
      case "Hard": return errorColor;
      default: return secondaryText;
    }
  };

  const getCorrectAnswerIndex = (correctAnswer) => {
    return ['A', 'B', 'C', 'D'].indexOf(correctAnswer);
  };

  const parseOptions = (options) => {
    if (Array.isArray(options)) return options;
    if (typeof options === 'string') {
      try {
        const parsed = JSON.parse(options);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-3xl sm:text-4xl mb-4" style={{ color: primaryGradientFrom }}></i>
          <p className="text-sm" style={{ color: secondaryText }}>Loading questions...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div
        className="p-8 sm:p-12 rounded-2xl text-center"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <i className="fas fa-inbox text-4xl sm:text-6xl mb-4" style={{ color: secondaryText, opacity: 0.3 }}></i>
        <h3 className="text-lg sm:text-xl font-bold mb-2" style={{ color: textColor }}>
          No Questions Found
        </h3>
        <p className="text-sm" style={{ color: secondaryText }}>
          Try adjusting your filters or add a new question to get started.
        </p>
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {questions.map((q) => {
          const questionOptions = parseOptions(q.options);
          const correctIndex = getCorrectAnswerIndex(q.correctAnswer);
          const isSelected = selectedQuestions.includes(q.id);

          return (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 sm:p-6 rounded-2xl transition-all cursor-pointer ${
                isSelected ? 'ring-2' : ''
              }`}
              style={{
                backgroundColor: cardBg,
                border: `1px solid ${borderColor}`,
                ringColor: primaryGradientFrom,
              }}
              onClick={() => onToggleSelect(q.id)}
            >
              {/* Selection Checkbox */}
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center transition-all ${
                    isSelected ? 'scale-110' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? primaryGradientFrom : `${borderColor}`,
                    color: "#fff",
                  }}
                >
                  {isSelected && <i className="fas fa-check text-xs"></i>}
                </div>
                <div className="flex gap-2">
                  <span
                    className="px-2 py-0.5 sm:py-1 rounded-lg text-xs font-semibold"
                    style={{
                      backgroundColor: `${getDifficultyColor(q.difficulty)}20`,
                      color: getDifficultyColor(q.difficulty),
                    }}
                  >
                    {q.difficulty}
                  </span>
                </div>
              </div>

              {/* Category */}
              <div className="mb-3">
                <span
                  className="px-2 sm:px-3 py-1 rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: `${primaryGradientFrom}20`,
                    color: primaryGradientFrom,
                  }}
                >
                  {q.category}
                </span>
              </div>

              {/* Question */}
              <h3 
                className="text-sm font-semibold mb-3 line-clamp-2" 
                style={{ color: textColor }}
              >
                {q.questionText}
              </h3>

              {/* Options Count */}
              <div className="mb-4 text-xs" style={{ color: secondaryText }}>
                <i className="fas fa-list mr-1"></i>
                {questionOptions.length} options
              </div>

              {/* Actions */}
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(q);
                  }}
                  className="flex-1 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${primaryGradientFrom}20`,
                    color: primaryGradientFrom,
                  }}
                >
                  <i className="fas fa-edit mr-1"></i>
                  Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(q.id);
                  }}
                  className="px-3 sm:px-4 py-2 rounded-lg transition-all hover:scale-105"
                  style={{
                    backgroundColor: `${errorColor}20`,
                    color: errorColor,
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-3 sm:space-y-4">
      {questions.map((q, index) => {
        const questionOptions = parseOptions(q.options);
        const correctIndex = getCorrectAnswerIndex(q.correctAnswer);
        const isSelected = selectedQuestions.includes(q.id);

        return (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 sm:p-6 rounded-2xl transition-all ${
              isSelected ? 'ring-2' : ''
            }`}
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              ringColor: primaryGradientFrom,
            }}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Selection Checkbox */}
              <button
                onClick={() => onToggleSelect(q.id)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                  isSelected ? 'scale-110' : ''
                }`}
                style={{
                  backgroundColor: isSelected ? primaryGradientFrom : `${borderColor}`,
                  color: "#fff",
                }}
              >
                {isSelected && <i className="fas fa-check text-xs"></i>}
              </button>

              {/* Question Content */}
              <div className="flex-1 min-w-0">
                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${getDifficultyColor(q.difficulty)}20`,
                      color: getDifficultyColor(q.difficulty),
                    }}
                  >
                    {q.difficulty}
                  </span>
                  <span
                    className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-semibold truncate max-w-[150px] sm:max-w-none"
                    style={{
                      backgroundColor: `${primaryGradientFrom}20`,
                      color: primaryGradientFrom,
                    }}
                  >
                    {q.category}
                  </span>
                  <span className="text-xs" style={{ color: secondaryText }}>
                    ID: {q.id}
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-sm sm:text-lg font-semibold mb-3 break-words" style={{ color: textColor }}>
                  {q.questionText}
                </h3>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                  {questionOptions.length > 0 ? (
                    questionOptions.map((opt, i) => (
                      <div
                        key={i}
                        className="px-3 sm:px-4 py-2 rounded-lg flex items-start gap-2"
                        style={{
                          backgroundColor: i === correctIndex
                            ? `${successColor}15`
                            : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          border: i === correctIndex 
                            ? `2px solid ${successColor}` 
                            : `1px solid ${borderColor}`,
                        }}
                      >
                        {i === correctIndex && (
                          <i className="fas fa-check-circle mt-0.5 flex-shrink-0" style={{ color: successColor }}></i>
                        )}
                        <span className="text-xs sm:text-sm font-medium break-words" style={{ color: textColor }}>
                          {String.fromCharCode(65 + i)}. {opt}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-4 text-xs sm:text-sm" style={{ color: secondaryText }}>
                      No options available
                    </div>
                  )}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                    }}
                  >
                    <p className="text-xs sm:text-sm break-words" style={{ color: secondaryText }}>
                      <i className="fas fa-lightbulb mr-2" style={{ color: warningColor }}></i>
                      <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(q);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${primaryGradientFrom}20`,
                    color: primaryGradientFrom,
                  }}
                  title="Edit Question"
                >
                  <i className="fas fa-edit text-sm"></i>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(q.id);
                  }}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${errorColor}20`,
                    color: errorColor,
                  }}
                  title="Delete Question"
                >
                  <i className="fas fa-trash text-sm"></i>
                </button>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}