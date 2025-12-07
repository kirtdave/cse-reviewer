// QuestionBank/QuestionEditor.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionEditor({ show, question, onClose, onSave, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const categories = [
    "Verbal Ability",
    "Numerical Ability", 
    "Analytical Ability",
    "General Knowledge",
    "Clerical Ability",
    "Numerical Reasoning",
    "Philippine Constitution"
  ];

  const difficulties = ["Easy", "Normal", "Hard"];

  const [formData, setFormData] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    explanation: "",
    category: categories[0],
    difficulty: "Normal",
    tags: []
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (question) {
      const options = Array.isArray(question.options) 
        ? question.options 
        : typeof question.options === 'string'
        ? JSON.parse(question.options)
        : ["", "", "", ""];

      const correctIndex = ['A', 'B', 'C', 'D'].indexOf(question.correctAnswer);

      setFormData({
        questionText: question.questionText || "",
        options: options,
        correctAnswer: correctIndex >= 0 ? correctIndex : 0,
        explanation: question.explanation || "",
        category: question.category || categories[0],
        difficulty: question.difficulty || "Normal",
        tags: question.tags || []
      });
    } else {
      setFormData({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        explanation: "",
        category: categories[0],
        difficulty: "Normal",
        tags: []
      });
    }
    setErrors({});
  }, [question]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
    if (errors[`option${index}`]) {
      setErrors(prev => ({ ...prev, [`option${index}`]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = "Question text is required";
    } else if (formData.questionText.trim().length < 10) {
      newErrors.questionText = "Question must be at least 10 characters";
    }

    formData.options.forEach((opt, i) => {
      if (!opt.trim()) {
        newErrors[`option${i}`] = `Option ${String.fromCharCode(65 + i)} required`;
      }
    });

    if (!formData.explanation.trim()) {
      newErrors.explanation = "Explanation is required";
    } else if (formData.explanation.trim().length < 10) {
      newErrors.explanation = "Explanation must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return;
    }

    setSaving(true);
    try {
      const submitData = {
        questionText: formData.questionText.trim(),
        options: formData.options.map(opt => opt.trim()),
        correctAnswer: ['A', 'B', 'C', 'D'][formData.correctAnswer],
        explanation: formData.explanation.trim(),
        category: formData.category,
        difficulty: formData.difficulty,
        tags: formData.tags
      };

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
      setErrors({ submit: error.message || 'Failed to save question' });
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-4 sm:p-6"
          style={{ backgroundColor: cardBg }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div>
              <h3 className="text-base sm:text-xl font-bold" style={{ color: textColor }}>
                {question ? 'Edit Question' : 'Create Question'}
              </h3>
              <p className="text-xs mt-1" style={{ color: secondaryText }}>
                {question ? `ID: ${question.id}` : 'Fill all required fields'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
            >
              <i className="fas fa-times text-sm" style={{ color: textColor }}></i>
            </button>
          </div>

          {/* Form */}
          <div className="space-y-3 sm:space-y-4">
            {/* Question Text */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
                Question Text *
              </label>
              <textarea
                value={formData.questionText}
                onChange={(e) => handleInputChange('questionText', e.target.value)}
                placeholder="Enter your question..."
                rows={3}
                className="w-full px-3 py-2 sm:py-2.5 rounded-xl border outline-none text-xs sm:text-sm resize-none"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  borderColor: errors.questionText ? errorColor : borderColor,
                  color: textColor,
                }}
              />
              {errors.questionText && (
                <p className="text-xs mt-1" style={{ color: errorColor }}>
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.questionText}
                </p>
              )}
            </div>

            {/* Options */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
                Options * <span className="font-normal text-xs" style={{ color: secondaryText }}>(Tap circle for correct)</span>
              </label>
              <div className="space-y-2">
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-start gap-2">
                    {/* Correct answer radio */}
                    <button
                      onClick={() => handleInputChange('correctAnswer', index)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-1.5 sm:mt-2 transition-all ${
                        formData.correctAnswer === index ? 'scale-110' : ''
                      }`}
                      style={{
                        backgroundColor: formData.correctAnswer === index ? successColor : isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                        border: `2px solid ${formData.correctAnswer === index ? successColor : borderColor}`,
                      }}
                    >
                      {formData.correctAnswer === index && (
                        <i className="fas fa-check text-xs text-white"></i>
                      )}
                    </button>

                    {/* Option input */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold" style={{ color: textColor }}>
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          className="flex-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border outline-none text-xs sm:text-sm"
                          style={{
                            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                            borderColor: errors[`option${index}`] ? errorColor : borderColor,
                            color: textColor,
                          }}
                        />
                      </div>
                      {errors[`option${index}`] && (
                        <p className="text-xs mt-1 ml-5" style={{ color: errorColor }}>
                          {errors[`option${index}`]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div>
              <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
                Explanation *
              </label>
              <textarea
                value={formData.explanation}
                onChange={(e) => handleInputChange('explanation', e.target.value)}
                placeholder="Explain the correct answer..."
                rows={2}
                className="w-full px-3 py-2 sm:py-2.5 rounded-xl border outline-none text-xs sm:text-sm resize-none"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                  borderColor: errors.explanation ? errorColor : borderColor,
                  color: textColor,
                }}
              />
              {errors.explanation && (
                <p className="text-xs mt-1" style={{ color: errorColor }}>
                  <i className="fas fa-exclamation-circle mr-1"></i>
                  {errors.explanation}
                </p>
              )}
            </div>

            {/* Category & Difficulty */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <div>
                <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 rounded-xl border outline-none text-xs sm:text-sm"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    borderColor,
                    color: textColor,
                  }}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 rounded-xl border outline-none text-xs sm:text-sm"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    borderColor,
                    color: textColor,
                  }}
                >
                  {difficulties.map(diff => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div
                className="p-2.5 sm:p-3 rounded-xl flex items-start gap-2"
                style={{
                  backgroundColor: `${errorColor}10`,
                  border: `1px solid ${errorColor}30`,
                }}
              >
                <i className="fas fa-exclamation-triangle mt-0.5 flex-shrink-0" style={{ color: errorColor }}></i>
                <p className="text-xs sm:text-sm" style={{ color: errorColor }}>{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-1">
              <button
                onClick={onClose}
                disabled={saving}
                className="py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:scale-105 disabled:opacity-50"
                style={{
                  backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                  color: textColor,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="py-2 sm:py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                  color: "#fff",
                }}
              >
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span className="hidden sm:inline">Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    <span className="hidden sm:inline">{question ? 'Update' : 'Create'}</span>
                    <span className="sm:hidden">{question ? 'Update' : 'Create'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Custom scrollbar */}
          <style>{`
            .overflow-y-auto::-webkit-scrollbar {
              width: 6px;
            }
            .overflow-y-auto::-webkit-scrollbar-track {
              background: transparent;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb {
              background: ${isDark ? '#374151' : '#e5e7eb'};
              border-radius: 3px;
            }
            .overflow-y-auto::-webkit-scrollbar-thumb:hover {
              background: ${isDark ? '#4b5563' : '#d1d5db'};
            }
          `}</style>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}