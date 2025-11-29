// QuestionBankPage.jsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function QuestionBankPage({ palette }) {
  const { isDark, cardBg, textColor, secondaryText, borderColor, primaryGradientFrom, primaryGradientTo, successColor, errorColor, warningColor } = palette;

  const [questions, setQuestions] = useState([
    {
      id: 1,
      question: "What is the capital of the Philippines?",
      options: ["Cebu", "Davao", "Manila", "Baguio"],
      correctAnswer: 2,
      category: "Verbal Ability",
      difficulty: "Easy",
      explanation: "Manila is the capital city of the Philippines.",
    },
    {
      id: 2,
      question: "2 + 2 * 2 = ?",
      options: ["4", "6", "8", "10"],
      correctAnswer: 1,
      category: "Numerical Ability",
      difficulty: "Easy",
      explanation: "Following order of operations (PEMDAS), multiplication comes before addition: 2 + (2*2) = 2 + 4 = 6",
    },
    {
      id: 3,
      question: "Who wrote 'Noli Me Tangere'?",
      options: ["Andres Bonifacio", "Jose Rizal", "Emilio Aguinaldo", "Apolinario Mabini"],
      correctAnswer: 1,
      category: "General Knowledge",
      difficulty: "Medium",
      explanation: "Jose Rizal wrote the novel 'Noli Me Tangere' in 1887.",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterDifficulty, setFilterDifficulty] = useState("All");

  const [formData, setFormData] = useState({
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    category: "Verbal Ability",
    difficulty: "Easy",
    explanation: "",
  });

  const categories = ["All", "Verbal Ability", "Numerical Ability", "Analytical Ability", "General Knowledge"];
  const difficulties = ["All", "Easy", "Medium", "Hard"];

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.question.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || q.category === filterCategory;
    const matchesDifficulty = filterDifficulty === "All" || q.difficulty === filterDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      category: "Verbal Ability",
      difficulty: "Easy",
      explanation: "",
    });
    setShowModal(true);
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setFormData(question);
    setShowModal(true);
  };

  const handleSaveQuestion = () => {
    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.id === editingQuestion.id ? { ...formData, id: q.id } : q)));
    } else {
      setQuestions([...questions, { ...formData, id: Date.now() }]);
    }
    setShowModal(false);
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      setQuestions(questions.filter((q) => q.id !== id));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return successColor;
      case "Medium": return warningColor;
      case "Hard": return errorColor;
      default: return secondaryText;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1" style={{ color: textColor }}>Question Bank</h2>
          <p style={{ color: secondaryText }}>Manage your exam questions</p>
        </div>
        <button
          onClick={handleAddQuestion}
          className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
            color: "#fff",
            boxShadow: isDark ? "0 4px 12px rgba(59,130,246,0.3)" : "0 4px 12px rgba(59,130,246,0.2)",
          }}
        >
          <i className="fas fa-plus"></i>
          Add New Question
        </button>
      </div>

      {/* Filters */}
      <div
        className="p-6 rounded-2xl"
        style={{
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Search</label>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                borderColor,
                color: textColor,
              }}
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all"
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
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Difficulty</label>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border outline-none transition-all"
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
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl"
            style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${getDifficultyColor(q.difficulty)}20`,
                      color: getDifficultyColor(q.difficulty),
                    }}
                  >
                    {q.difficulty}
                  </span>
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${primaryGradientFrom}20`,
                      color: primaryGradientFrom,
                    }}
                  >
                    {q.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: textColor }}>
                  {q.question}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                  {q.options.map((opt, i) => (
                    <div
                      key={i}
                      className="px-4 py-2 rounded-lg flex items-center gap-2"
                      style={{
                        backgroundColor: i === q.correctAnswer
                          ? `${successColor}15`
                          : isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                        border: i === q.correctAnswer ? `1px solid ${successColor}` : `1px solid ${borderColor}`,
                      }}
                    >
                      {i === q.correctAnswer && (
                        <i className="fas fa-check-circle" style={{ color: successColor }}></i>
                      )}
                      <span style={{ color: textColor }}>{opt}</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm" style={{ color: secondaryText }}>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditQuestion(q)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${primaryGradientFrom}20`,
                    color: primaryGradientFrom,
                  }}
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{
                    backgroundColor: `${errorColor}20`,
                    color: errorColor,
                  }}
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6"
              style={{ backgroundColor: cardBg }}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold" style={{ color: textColor }}>
                  {editingQuestion ? "Edit Question" : "Add New Question"}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110"
                  style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)" }}
                >
                  <i className="fas fa-times" style={{ color: textColor }}></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Question</label>
                  <textarea
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                    placeholder="Enter your question..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {formData.options.map((opt, i) => (
                    <div key={i}>
                      <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                        Option {String.fromCharCode(65 + i)}
                      </label>
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
                          borderColor,
                          color: textColor,
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Correct Answer</label>
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
                        <option key={i} value={i}>Option {String.fromCharCode(65 + i)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Category</label>
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
                      {categories.filter((c) => c !== "All").map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Difficulty</label>
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
                      {difficulties.filter((d) => d !== "All").map((diff) => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>Explanation</label>
                  <textarea
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl border outline-none resize-none"
                    style={{
                      backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                      borderColor,
                      color: textColor,
                    }}
                    placeholder="Provide an explanation for the correct answer..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSaveQuestion}
                    className="flex-1 py-3 rounded-xl font-semibold transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                      color: "#fff",
                    }}
                  >
                    {editingQuestion ? "Update Question" : "Add Question"}
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
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
    </div>
  );
}