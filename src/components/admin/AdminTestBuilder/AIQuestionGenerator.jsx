import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wand2, Loader2, CheckCircle } from 'lucide-react';
import { generateAIQuestions  } from '../../../services/adminTestService';

export default function AIQuestionGenerator({ isOpen, onClose, onGenerated, palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor } = palette;

  const CSE_CATEGORIES = [
    'Verbal Ability',
    'Numerical Ability',
    'Analytical Ability',
    'General Knowledge',
    'Clerical Ability',
    'Philippine Constitution'
  ];

  const [category, setCategory] = useState('Verbal Ability');
  const [difficulty, setDifficulty] = useState('Normal');
  const [count, setCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');

    try {
      // ✅ Use the service function instead of manual fetch
      const data = await generateAIQuestionChoices({
        topic: category,
        difficulty,
        count
      });

      if (!data.success) {
        throw new Error(data.message || 'Failed to generate questions');
      }

      // Format questions for the test builder
      const formattedQuestions = data.questions.map(q => ({
        question: q.question,
        options: Array.isArray(q.options) ? q.options : [q.options.A, q.options.B, q.options.C, q.options.D],
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || 'No explanation provided',
        category: category,
        difficulty: difficulty
      }));

      onGenerated(formattedQuestions);

    } catch (err) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 md:p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-lg rounded-2xl p-4 md:p-6 max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: cardBg }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})` }}
              >
                <Wand2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold" style={{ color: textColor }}>
                  AI Question Generator
                </h3>
                <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
                  Generate questions using AI
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
            >
              <X className="w-5 h-5 md:w-6 md:h-6" style={{ color: textColor }} />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm" style={{ backgroundColor: `${errorColor}20` }}>
              <i className="fas fa-exclamation-circle" style={{ color: errorColor }}></i>
              <p style={{ color: errorColor }}>{error}</p>
            </div>
          )}

          {/* Category */}
          <div className="mb-4">
            <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={generating}
              className="w-full px-3 md:px-4 py-2.5 md:py-3 rounded-xl border outline-none text-sm md:text-base"
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

          {/* Difficulty */}
          <div className="mb-4">
            <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Easy', 'Normal', 'Hard'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  disabled={generating}
                  className={`py-2 md:py-2.5 rounded-xl font-semibold transition-all text-sm md:text-base ${difficulty === diff ? 'ring-2' : ''}`}
                  style={{
                    backgroundColor: difficulty === diff 
                      ? `${primaryGradientFrom}20` 
                      : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                    color: difficulty === diff ? primaryGradientFrom : textColor,
                    ringColor: primaryGradientFrom
                  }}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="mb-4 md:mb-6">
            <label className="text-xs md:text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Number of Questions: {count}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              disabled={generating}
              className="w-full"
              style={{ accentColor: primaryGradientFrom }}
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: secondaryText }}>
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full px-4 py-2.5 md:py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm md:text-base"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: '#fff',
              opacity: generating ? 0.6 : 1
            }}
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                <span>Generating {count} questions...</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4 md:w-5 md:h-5" />
                <span>Generate Questions</span>
              </>
            )}
          </button>

          {/* Info */}
          <div
            className="mt-4 p-3 rounded-lg"
            style={{
              backgroundColor: `${primaryGradientFrom}10`,
              border: `1px solid ${primaryGradientFrom}30`
            }}
          >
            <p className="text-xs md:text-sm" style={{ color: secondaryText }}>
              <i className="fas fa-info-circle mr-2" style={{ color: primaryGradientFrom }}></i>
              AI will generate {count} unique {difficulty.toLowerCase()} questions for {category}
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}