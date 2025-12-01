// QuestionBank/QuestionModal.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createQuestion, updateQuestion } from "../../../services/adminApi";

export default function QuestionModal({ show, onClose, editingQuestion, onSave, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor } = palette;

  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "Verbal Ability",
    difficulty: "Easy",
    explanation: "",
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (editingQuestion) {
      const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(editingQuestion.correctAnswer);
      const options = Array.isArray(editingQuestion.options) 
        ? editingQuestion.options 
        : editingQuestion.options 
          ? JSON.parse(editingQuestion.options) 
          : ["", "", "", ""];
      
      setFormData({
        question: editingQuestion.questionText,
        options: options,
        correctAnswer: correctAnswerIndex >= 0 ? correctAnswerIndex : 0,
        category: editingQuestion.category,
        difficulty: editingQuestion.difficulty,
        explanation: editingQuestion.explanation || "",
      });
    } else {
      setFormData({
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        category: "Verbal Ability",
        difficulty: "Easy",
        explanation: "",
      });
    }
    setErrors({});
  }, [editingQuestion, show]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.question.trim()) {
      newErrors.question = "Question text is required";
    }
    
    if (formData.options.some(opt => !opt.trim())) {
      newErrors.options = "All options must be filled";
    }
    
    if (!formData.explanation.trim()) {
      newErrors.explanation = "Explanation is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    try {
      setSaving(true);
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, formData);
      } else {
        await createQuestion(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
            style={{ backgroundColor: cardBg }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold mb-1" style={{ color: textColor }}>
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </h3>
                <p style={{ color: secondaryText }}>
                  {editingQuestion ? `ID: ${editingQuestion.id}` : "Fill in all fields to create a new question"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
              >
                <i className="fas fa-times" style={{ color: textColor }}></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* Question Text */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                  <i className="fas fa-question-circle mr-2"></i>
                  Question Text *
                </label>
                <textarea
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    borderColor: errors.question ? errorColor : borderColor,
                    color: textColor,
                  }}
                  placeholder="Enter your question..."
                />
                {errors.question && (
                  <p className="text-xs mt-1" style={{ color: errorColor }}>
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.question}
                  </p>
                )}
              </div>

              {/* Options */}
              <div>
                <label className="text-sm font-semibold mb-3 block" style={{ color: textColor }}>
                  <i className="fas fa-list-ol mr-2"></i>
                  Answer Options * <span style={{ color: secondaryText }}>(4 options required)</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formData.options.map((opt, i) => (
                    <div key={i}>
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                          style={{
                            backgroundColor: i === formData.correctAnswer 
                              ? `${successColor}20` 
                              : `${primaryGradientFrom}20`,
                            color: i === formData.correctAnswer ? successColor : primaryGradientFrom,
                          }}
                        >
                          {String.fromCharCode(65 + i)}
                        </div>
                        <label className="text-sm font-medium" style={{ color: textColor }}>
                          Option {String.fromCharCode(65 + i)}
                          {i === formData.correctAnswer && (
                            <span style={{ color: successColor }}> (Correct)</span>
                          )}
                        </label>
                      </div>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...formData.options];
                          newOptions[i] = e.target.value;
                          setFormData({ ...formData, options: newOptions });
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border outline-none"
                        style={{
                          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                          borderColor: errors.options ? errorColor : borderColor,
                          color: textColor,
                        }}
                        placeholder={`Enter option ${String.fromCharCode(65 + i)}...`}
                      />
                    </div>
                  ))}
                </div>
                {errors.options && (
                  <p className="text-xs mt-2" style={{ color: errorColor }}>
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.options}
                  </p>
                )}
              </div>

              {/* Correct Answer, Category, Difficulty */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Correct Answer */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                    <i className="fas fa-check-circle mr-2"></i>
                    Correct Answer *
                  </label>
                  <select
                    value={formData.correctAnswer}
                    onChange={(e) => setFormData({ ...formData, correctAnswer: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                  >
                    {formData.options.map((_, i) => (
                      <option key={i} value={i}>
                        Option {String.fromCharCode(65 + i)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                    <i className="fas fa-folder mr-2"></i>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                    <i className="fas fa-signal mr-2"></i>
                    Difficulty *
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border outline-none"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                  >
                    {difficulties.map((diff) => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Explanation */}
              <div>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                  <i className="fas fa-lightbulb mr-2"></i>
                  Explanation *
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                    borderColor: errors.explanation ? errorColor : borderColor,
                    color: textColor,
                  }}
                  placeholder="Provide a detailed explanation for the correct answer..."
                />
                {errors.explanation && (
                  <p className="text-xs mt-1" style={{ color: errorColor }}>
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    {errors.explanation}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                    color: "#fff",
                  }}
                >
                  {saving ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editingQuestion ? 'fa-save' : 'fa-plus'} mr-2`}></i>
                      {editingQuestion ? "Update Question" : "Add Question"}
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={saving}
                  className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                  style={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    color: textColor,
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}