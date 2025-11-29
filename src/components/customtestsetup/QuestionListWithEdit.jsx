// QuestionListWithEdit.jsx - COMPLETE
import React, { useState } from 'react';

const QuestionListWithEdit = ({ 
  selectedSet, 
  sets, 
  questions, 
  setQuestions, 
  cardBg, 
  borderColor, 
  textColor, 
  secondaryText, 
  isDark,
  setSuccessMessage 
}) => {
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState(null);

  // ✅ FIX: Get current set name
  const currentSetTitle = sets.find(s => s.id === selectedSet)?.title || "Unknown Set";
  const currentQuestions = questions[selectedSet] || [];

  const startEditing = (index) => {
    setEditingQuestionIndex(index);
    setEditedQuestion({ ...currentQuestions[index] });
  };

  const saveEdit = () => {
    if (!editedQuestion.question.trim()) {
      alert("Question text cannot be empty!");
      return;
    }

    setQuestions((prev) => {
      const newQuestions = { ...prev };
      newQuestions[selectedSet] = [...currentQuestions];
      newQuestions[selectedSet][editingQuestionIndex] = editedQuestion;
      return newQuestions;
    });
    
    setEditingQuestionIndex(null);
    setEditedQuestion(null);
    setSuccessMessage("Question updated successfully!");
  };

  const cancelEdit = () => {
    setEditingQuestionIndex(null);
    setEditedQuestion(null);
  };

  const deleteQuestion = (index) => {
    if (!window.confirm("Delete this question?")) return;
    
    setQuestions((prev) => {
      const newQuestions = { ...prev };
      newQuestions[selectedSet] = newQuestions[selectedSet].filter((_, i) => i !== index);
      return newQuestions;
    });
    
    setSuccessMessage("Question removed");
  };

  const updateEditedOption = (optionIndex, value) => {
    const newOptions = [...editedQuestion.options];
    const letter = String.fromCharCode(65 + optionIndex);
    newOptions[optionIndex] = `${letter}) ${value}`;
    setEditedQuestion({ ...editedQuestion, options: newOptions });
  };

  const getOptionText = (option) => {
    return option.replace(/^[A-D]\)\s*/, '');
  };

  return (
    <div 
      className="p-6 rounded-2xl"
      style={{ 
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
      }}
    >
      <h4 className="font-semibold mb-4 text-lg" style={{ color: textColor }}>
        Questions in "{currentSetTitle}"
      </h4>

      {currentQuestions.length === 0 ? (
        <p className="text-sm" style={{ color: secondaryText }}>
          No questions yet. Add questions using the builder or generate from PDF.
        </p>
      ) : (
        <ul className="space-y-3 max-h-96 overflow-auto pr-2">
          {currentQuestions.map((q, idx) => (
            <li
              key={idx}
              className="text-sm rounded-xl px-4 py-3 transition-all group relative"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                border: `1px solid ${borderColor}`,
                color: textColor,
              }}
            >
              {editingQuestionIndex === idx ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: textColor }}>
                      Question Text
                    </label>
                    <textarea
                      value={editedQuestion.question}
                      onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                      className="w-full p-2 rounded-lg border bg-transparent resize-none text-sm"
                      style={{ borderColor, color: textColor }}
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: textColor }}>
                      Options
                    </label>
                    <div className="space-y-2">
                      {editedQuestion.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className="text-xs font-bold">{String.fromCharCode(65 + optIdx)}.</span>
                          <input
                            type="text"
                            value={getOptionText(opt)}
                            onChange={(e) => updateEditedOption(optIdx, e.target.value)}
                            className="flex-1 p-2 rounded-lg border bg-transparent text-xs"
                            style={{ borderColor, color: textColor }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: textColor }}>
                        Correct Answer
                      </label>
                      <select
                        value={editedQuestion.correctAnswer}
                        onChange={(e) => setEditedQuestion({ ...editedQuestion, correctAnswer: e.target.value })}
                        className="w-full p-2 rounded-lg border bg-transparent text-xs"
                        style={{ borderColor, color: textColor }}
                      >
                        <option value="A">A</option>
                        <option value="B">B</option>
                        <option value="C">C</option>
                        <option value="D">D</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold mb-1 block" style={{ color: textColor }}>
                        Category
                      </label>
                      <input
                        type="text"
                        value={editedQuestion.category || ''}
                        onChange={(e) => setEditedQuestion({ ...editedQuestion, category: e.target.value })}
                        className="w-full p-2 rounded-lg border bg-transparent text-xs"
                        style={{ borderColor, color: textColor }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold mb-1 block" style={{ color: textColor }}>
                      Explanation
                    </label>
                    <textarea
                      value={editedQuestion.explanation || ''}
                      onChange={(e) => setEditedQuestion({ ...editedQuestion, explanation: e.target.value })}
                      className="w-full p-2 rounded-lg border bg-transparent resize-none text-xs"
                      style={{ borderColor, color: textColor }}
                      rows="2"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={saveEdit}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-500 text-white font-semibold text-xs hover:bg-green-600 transition-all"
                    >
                      <i className="fas fa-check mr-1"></i> Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-500 text-white font-semibold text-xs hover:bg-red-600 transition-all"
                    >
                      <i className="fas fa-times mr-1"></i> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{idx + 1}.</span>
                        <span>{q.question}</span>
                      </div>
                      {q.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          backgroundColor: isDark ? "rgba(91,127,245,0.2)" : "rgba(91,127,245,0.1)",
                          color: "#5b7ff5"
                        }}>
                          {q.category}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => startEditing(idx)}
                        className="px-2 py-1 rounded-lg text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                      >
                        <i className="fa-solid fa-edit text-xs"></i>
                      </button>
                      <button
                        onClick={() => deleteQuestion(idx)}
                        className="px-2 py-1 rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-xs mt-2 pl-6" style={{ color: secondaryText }}>
                    Correct: <span className="font-semibold text-green-500">{q.correctAnswer}</span>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionListWithEdit;