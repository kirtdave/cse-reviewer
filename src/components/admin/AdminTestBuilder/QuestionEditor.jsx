import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Wand2, Loader2 } from 'lucide-react';
import { generateAIAnswerChoicesForQuestion  } from '../../../services/adminTestService';

export default function QuestionEditor({ isOpen, onClose, onSave, editingQuestion, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor } = palette;

  const CSE_CATEGORIES = [
    'Verbal Ability',
    'Numerical Ability',
    'Analytical Ability',
    'General Knowledge',
    'Clerical Ability',
    'Philippine Constitution'
  ];

  const [formData, setFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 'A',
    explanation: '',
    category: 'Verbal Ability',
    difficulty: 'Normal'
  });

  const [generatingChoices, setGeneratingChoices] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setFormData(editingQuestion);
    }
  }, [editingQuestion]);

  const handleGenerateChoices = async () => {
  if (!formData.question.trim()) {
    setError('Please enter a question first');
    return;
  }

  setGeneratingChoices(true);
  setError('');

  try {
    // ✅ FIXED: Use the correct function name that matches the import
    const result = await generateAIAnswerChoicesForQuestion(formData.question, formData.category);
    
    setFormData(prev => ({
      ...prev,
      options: result.choices,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation
    }));
  } catch (err) {
    setError(err.message || 'Failed to generate answer choices');
  } finally {
    setGeneratingChoices(false);
  }
};

  const handleSubmit = () => {
    // Validation
    if (!formData.question.trim()) {
      setError('Question text is required');
      return;
    }

    if (formData.options.some(opt => !opt.trim())) {
      setError('All 4 options are required');
      return;
    }

    if (!formData.explanation.trim()) {
      setError('Explanation is required');
      return;
    }

    onSave(formData);
    setFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 'A',
      explanation: '',
      category: 'Verbal Ability',
      difficulty: 'Normal'
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
          style={{ backgroundColor: cardBg }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold" style={{ color: textColor }}>
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h3>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <X style={{ color: textColor }} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: `${errorColor}20` }}>
              <p style={{ color: errorColor }}>{error}</p>
            </div>
          )}

          {/* Question Text */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Question Text
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              placeholder="Enter your question here..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor,
                color: textColor
              }}
            />
          </div>

          {/* Category & Difficulty */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor,
                  color: textColor
                }}
              >
                {CSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border outline-none"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                  borderColor,
                  color: textColor
                }}
              >
                <option value="Easy">Easy</option>
                <option value="Normal">Normal</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* AI Generate Button */}
          <button
            onClick={handleGenerateChoices}
            disabled={generatingChoices || !formData.question.trim()}
            className="w-full mb-4 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
            style={{
              backgroundColor: `${primaryGradientFrom}20`,
              color: primaryGradientFrom,
              opacity: generatingChoices || !formData.question.trim() ? 0.5 : 1
            }}
          >
            {generatingChoices ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating answer choices...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Answer Choices with AI
              </>
            )}
          </button>

          {/* Answer Options */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Answer Options
            </label>
            <div className="space-y-3">
              {['A', 'B', 'C', 'D'].map((letter, index) => (
                <div key={letter} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correctAnswer"
                    checked={formData.correctAnswer === letter}
                    onChange={() => setFormData({ ...formData, correctAnswer: letter })}
                    className="w-5 h-5"
                    style={{ accentColor: successColor }}
                  />
                  <span className="font-semibold w-6" style={{ color: textColor }}>{letter}.</span>
                  <input
                    type="text"
                    value={formData.options[index]}
                    onChange={(e) => {
                      const newOptions = [...formData.options];
                      newOptions[index] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    placeholder={`Option ${letter}`}
                    className="flex-1 px-4 py-2 rounded-xl border outline-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                      borderColor,
                      color: textColor
                    }}
                  />
                </div>
              ))}
            </div>
            <p className="text-xs mt-2" style={{ color: secondaryText }}>
              Select the correct answer by clicking the radio button
            </p>
          </div>

          {/* Explanation */}
          <div className="mb-6">
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Explanation
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Explain why the correct answer is right..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                borderColor,
                color: textColor
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: textColor
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                color: '#fff'
              }}
            >
              <Save className="w-4 h-4" />
              {editingQuestion ? 'Update Question' : 'Add Question'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}