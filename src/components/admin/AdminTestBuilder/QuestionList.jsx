import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Wand2, Upload } from 'lucide-react';

export default function QuestionList({ 
  activeSet, 
  onAddQuestion, 
  onEditQuestion, 
  onDeleteQuestion, 
  onShowAIGenerator,
  onShowPDFImporter,
  palette 
}) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, errorColor, successColor } = palette;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return successColor;
      case 'Hard': return errorColor;
      default: return primaryGradientFrom;
    }
  };

  return (
    <div className="p-6 rounded-2xl" style={{ backgroundColor: cardBg, border: `1px solid ${borderColor}` }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: textColor }}>
          <i className="fas fa-question-circle"></i>
          Questions in {activeSet.title}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onShowAIGenerator}
            className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              backgroundColor: `${primaryGradientFrom}20`,
              color: primaryGradientFrom
            }}
          >
            <Wand2 className="w-4 h-4" />
            AI Generate
          </button>
          <button
            onClick={onShowPDFImporter}
            className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              backgroundColor: `${primaryGradientFrom}20`,
              color: primaryGradientFrom
            }}
          >
            <Upload className="w-4 h-4" />
            Import PDF
          </button>
          <button
            onClick={onAddQuestion}
            className="px-4 py-2 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${palette.primaryGradientTo})`,
              color: '#fff'
            }}
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {activeSet.questions.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-inbox text-6xl mb-4" style={{ color: secondaryText, opacity: 0.3 }}></i>
          <p className="text-lg font-semibold mb-2" style={{ color: textColor }}>
            No questions yet
          </p>
          <p style={{ color: secondaryText }}>
            Add questions manually, generate with AI, or import from PDF
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeSet.questions.map((question, index) => (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${borderColor}`
              }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0"
                  style={{
                    backgroundColor: `${primaryGradientFrom}20`,
                    color: primaryGradientFrom
                  }}
                >
                  {index + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: `${primaryGradientFrom}20`,
                        color: primaryGradientFrom
                      }}
                    >
                      {question.category}
                    </span>
                    <span
                      className="px-2 py-1 rounded text-xs font-semibold"
                      style={{
                        backgroundColor: `${getDifficultyColor(question.difficulty)}20`,
                        color: getDifficultyColor(question.difficulty)
                      }}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <p className="font-semibold mb-2" style={{ color: textColor }}>
                    {question.question}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {question.options.map((opt, i) => (
                      <div
                        key={i}
                        className="px-3 py-2 rounded-lg"
                        style={{
                          backgroundColor: question.correctAnswer === String.fromCharCode(65 + i)
                            ? `${successColor}15`
                            : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                          border: question.correctAnswer === String.fromCharCode(65 + i)
                            ? `2px solid ${successColor}`
                            : `1px solid ${borderColor}`
                        }}
                      >
                        <span className="font-semibold" style={{ color: textColor }}>
                          {String.fromCharCode(65 + i)}.
                        </span>{' '}
                        <span style={{ color: secondaryText }}>{opt}</span>
                      </div>
                    ))}
                  </div>

                  {question.explanation && (
                    <div
                      className="mt-2 p-2 rounded-lg text-sm"
                      style={{
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
                      }}
                    >
                      <span className="font-semibold" style={{ color: textColor }}>
                        <i className="fas fa-lightbulb mr-1"></i>
                        Explanation:
                      </span>{' '}
                      <span style={{ color: secondaryText }}>{question.explanation}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEditQuestion(index)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: `${primaryGradientFrom}20`
                    }}
                  >
                    <Edit2 className="w-4 h-4" style={{ color: primaryGradientFrom }} />
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(activeSet.id, index)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                    style={{
                      backgroundColor: `${errorColor}20`
                    }}
                  >
                    <Trash2 className="w-4 h-4" style={{ color: errorColor }} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}