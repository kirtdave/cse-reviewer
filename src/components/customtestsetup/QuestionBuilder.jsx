// QuestionBuilder.jsx - Mobile-First Layout
import React, { useState, useRef } from "react";
import axios from 'axios';

const getPalette = (theme = "dark") => {
  const isDark = theme === "dark";
  return {
    isDark,
    cardBg: isDark ? "#16213e" : "#ffffff",
    textColor: isDark ? "#e4e4e7" : "#1f2937",
    secondaryText: isDark ? "#9ca3af" : "#6b7280",
    primaryGradientFrom: "#5b7ff5",
    primaryGradientTo: "#a855f7",
    borderColor: isDark ? "#2d3748" : "#e5e7eb",
    errorColor: "#ef4444",
  };
};

const QuestionBuilder = ({
  theme = "dark",
  sets,
  selectedSet,
  setSelectedSet,
  setQuestions,
  questions,
  handleFileUpload,
  file,
  pdfQuestionCategory,
  setPdfQuestionCategory,
  pdfQuestionCount,
  setPdfQuestionCount,
  pdfCommand,
  setPdfCommand,
  handleGenerateFromPDF,
  loading,
  setSuccessMessage
}) => {
  const [questionText, setQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState("Verbal Ability");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [explanation, setExplanation] = useState("");
  const [choiceMode, setChoiceMode] = useState("manual");
  const [choices, setChoices] = useState(["", "", "", ""]);
  const [loadingAI, setLoadingAI] = useState(false);

  const palette = getPalette(theme);
  const { isDark, borderColor, cardBg, textColor, secondaryText, primaryGradientFrom, primaryGradientTo, errorColor } = palette;

  const fileInputRef = useRef(null);

  const categories = [
    'Verbal Ability',
    'Numerical Ability',
    'Analytical Ability',
    'General Knowledge',
    'Clerical Ability',
    'Numerical Reasoning',
    'Philippine Constitution'
  ];

  const handleAddQuestion = () => {
    if (!questionText.trim()) return alert("Enter a question first!");
    if (choices.filter(c => c.trim() !== "").length < 4) {
      return alert("Please provide all 4 answer choices!");
    }
    if (!explanation.trim()) return alert("Please provide an explanation!");
    
    setQuestions((prev) => {
      const newQuestions = { ...prev };
      if (!newQuestions[selectedSet]) newQuestions[selectedSet] = [];
      
      newQuestions[selectedSet] = [
        ...newQuestions[selectedSet],
        {
          category: questionCategory,
          question: questionText.trim(),
          options: choices.map((c, i) => `${String.fromCharCode(65 + i)}) ${c.trim()}`),
          correctAnswer: correctAnswer,
          explanation: explanation.trim(),
          difficulty: 'Normal'
        }
      ];
      
      return newQuestions;
    });
    
    setQuestionText("");
    setChoices(["", "", "", ""]);
    setExplanation("");
    setCorrectAnswer("A");
    setChoiceMode("manual");
    
    setSuccessMessage("Question added! (Auto-saved)");
  };

  const handleAIGenerateChoices = async () => {
    if (!questionText.trim()) return alert("Enter a question first!");
    
    setLoadingAI(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/ai/generate-answer-choices`,
        {
          questionText: questionText.trim(),
          category: questionCategory
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success && response.data.choices) {
        setChoices(response.data.choices);
        setCorrectAnswer(response.data.correctAnswer);
        setExplanation(response.data.explanation);
        
        setSuccessMessage("AI generated choices successfully!");
      }
    } catch (error) {
      console.error('AI generation error:', error);
      alert('AI Error. Please fill manually.');
      setChoiceMode('manual');
    } finally {
      setLoadingAI(false);
    }
  };

  const onLocalFileChange = (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    handleFileUpload(uploadedFile);
  };

  return (
    <div className="w-full">
      {/* ✅ TRULY MOBILE-FIRST Create Question Card */}
      <div 
        className="p-3 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl mb-3 sm:mb-6"
        style={{ 
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <h2 className="text-base sm:text-2xl font-bold mb-3 sm:mb-6 flex items-center gap-2" style={{ color: textColor }}>
          <i className="fas fa-plus-circle text-sm sm:text-xl"></i>
          <span>Create Question</span>
        </h2>

        {/* Category and Set - Stack on mobile */}
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 mb-3 sm:mb-6">
          <div>
            <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
              Category
            </label>
            <select
              value={questionCategory}
              onChange={(e) => setQuestionCategory(e.target.value)}
              className="w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              style={{ borderColor, color: textColor }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} style={{ backgroundColor: cardBg }}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
              Add to Set
            </label>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(Number(e.target.value))}
              className="w-full p-2 sm:p-3 rounded-lg sm:rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              style={{ borderColor, color: textColor }}
            >
              {sets.map((set) => (
                <option key={set.id} value={set.id} style={{ backgroundColor: cardBg }}>
                  {set.title} ({(questions[set.id] || []).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-3 sm:mb-6">
          <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
            rows="3"
            placeholder="Type your question..."
            style={{ borderColor, color: textColor }}
          />
        </div>

        {/* Choice Mode - Mobile Optimized */}
        <div className="mb-3 sm:mb-6">
          <label className="font-semibold text-xs sm:text-sm mb-2 block" style={{ color: textColor }}>
            Answer Choices
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setChoiceMode("manual")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                choiceMode === "manual" ? "ring-2" : ""
              }`}
              style={{
                backgroundColor: choiceMode === "manual" 
                  ? `${primaryGradientFrom}20` 
                  : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                color: choiceMode === "manual" ? primaryGradientFrom : textColor,
                borderColor: choiceMode === "manual" ? primaryGradientFrom : borderColor,
                border: `1px solid`,
              }}
            >
              <i className="fas fa-keyboard mr-1.5"></i>
              Manual
            </button>
            <button
              onClick={() => setChoiceMode("ai")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                choiceMode === "ai" ? "ring-2" : ""
              }`}
              style={{
                backgroundColor: choiceMode === "ai" 
                  ? `${primaryGradientFrom}20` 
                  : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                color: choiceMode === "ai" ? primaryGradientFrom : textColor,
                borderColor: choiceMode === "ai" ? primaryGradientFrom : borderColor,
                border: `1px solid`,
              }}
            >
              <i className="fas fa-wand-magic-sparkles mr-1.5"></i>
              AI
            </button>
          </div>

          {choiceMode === "ai" && (
            <button
              disabled={loadingAI || !questionText.trim()}
              onClick={handleAIGenerateChoices}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm ${loadingAI || !questionText.trim() ? "opacity-50" : ""}`}
              style={{ 
                background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                color: "#fff",
              }}
            >
              {loadingAI ? <><i className="fas fa-spinner fa-spin mr-2"></i>Generating...</> : <><i className="fas fa-magic mr-2"></i>Generate</>}
            </button>
          )}
        </div>

        {/* Choices - Mobile Grid */}
        {choiceMode === "manual" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-4 mb-3 sm:mb-6">
            {choices.map((choice, index) => (
              <div key={index}>
                <label className="text-xs font-semibold mb-1 block" style={{ color: textColor }}>
                  {String.fromCharCode(65 + index)}
                </label>
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => {
                    const updated = [...choices];
                    updated[index] = e.target.value;
                    setChoices(updated);
                  }}
                  className="w-full p-2 sm:p-2.5 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none text-xs sm:text-sm"
                  style={{ borderColor, color: textColor }}
                  placeholder={`Option ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="mb-3 sm:mb-6 p-2.5 sm:p-4 rounded-lg"
            style={{ 
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              border: `1px solid ${borderColor}`
            }}
          >
            {choices.some((c) => c.trim() !== "") ? (
              <ul className="space-y-1.5">
                {choices.map((c, i) => (
                  c.trim() && (
                    <li key={i} className="text-xs sm:text-sm" style={{ color: textColor }}>
                      <span className="font-semibold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                      {c}
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <p className="text-xs text-center" style={{ color: secondaryText }}>
                Click "Generate" to create options
              </p>
            )}
          </div>
        )}

        {/* Correct Answer */}
        <div className="mb-3 sm:mb-6">
          <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
            Correct Answer
          </label>
          <div className="grid grid-cols-4 gap-2">
            {['A', 'B', 'C', 'D'].map((letter) => (
              <button
                key={letter}
                onClick={() => setCorrectAnswer(letter)}
                className={`py-2.5 rounded-lg font-bold text-sm transition-all ${
                  correctAnswer === letter ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: correctAnswer === letter 
                    ? `${primaryGradientFrom}30` 
                    : isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                  color: correctAnswer === letter ? primaryGradientFrom : textColor,
                  borderColor: correctAnswer === letter ? primaryGradientFrom : borderColor,
                  border: `1px solid`,
                }}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <div className="mb-3 sm:mb-6">
          <label className="text-xs sm:text-sm font-semibold mb-1.5 block" style={{ color: textColor }}>
            Explanation
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-2.5 sm:p-4 rounded-lg sm:rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm"
            rows="2"
            placeholder={choiceMode === "ai" ? "AI will generate..." : "Explain the answer..."}
            style={{ borderColor, color: textColor }}
            readOnly={choiceMode === "ai" && loadingAI}
          />
        </div>

        {/* Add Button */}
        <button
          onClick={handleAddQuestion}
          className="w-full px-4 py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg flex items-center justify-center gap-2"
          style={{ 
            background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
            color: "#fff",
          }}
        >
          <i className="fas fa-plus-circle" />
          <span>Add Question</span>
        </button>
      </div>

      {/* ✅ MOBILE-FIRST PDF Generation */}
      <div 
        className="p-3 sm:p-6 lg:p-8 rounded-lg sm:rounded-2xl"
        style={{ 
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
        }}
      >
        <h3 className="font-bold mb-3 sm:mb-4 flex items-center gap-2 text-sm sm:text-xl" style={{ color: textColor }}>
          <i className="fas fa-file-pdf text-red-500 text-sm sm:text-base" /> 
          <span>Extract from PDF</span>
        </h3>

        <div className="space-y-2 sm:space-y-0 sm:flex sm:items-center sm:gap-3 mb-3">
          <input 
            ref={fileInputRef} 
            onChange={onLocalFileChange} 
            accept="application/pdf" 
            type="file" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full sm:w-auto px-3 py-2 sm:py-2.5 rounded-lg border font-semibold text-xs sm:text-sm"
            style={{ 
              borderColor, 
              color: textColor,
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
            }}
          >
            <i className="fas fa-upload mr-1.5"></i> {file ? "Replace" : "Upload PDF"}
          </button>

          {file && (
            <button
              onClick={() => handleFileUpload(null)}
              className="w-full sm:w-auto px-3 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm"
              style={{
                background: `linear-gradient(135deg, ${errorColor}, #dc2626)`,
                color: "#fff",
              }}
            >
              Clear
            </button>
          )}
        </div>

        {file && (
          <div className="mb-3 text-xs p-2 rounded-lg flex items-center gap-2" style={{ 
            backgroundColor: isDark ? "rgba(91,127,245,0.1)" : "rgba(91,127,245,0.05)",
            color: textColor,
            border: `1px solid ${borderColor}`
          }}>
            <i className="fas fa-file-pdf text-red-500 flex-shrink-0 text-xs"></i>
            <span className="truncate text-xs">{file.name}</span>
          </div>
        )}

        <div className="space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-3 mb-3">
          <select
            value={pdfQuestionCategory}
            onChange={(e) => setPdfQuestionCategory(e.target.value)}
            className="w-full p-2 sm:p-2.5 rounded-lg border bg-transparent outline-none text-xs sm:text-sm"
            style={{ borderColor, color: textColor }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} style={{ backgroundColor: cardBg }}>
                {cat}
              </option>
            ))}
          </select>

          <input
            type="number"
            min="1"
            max="100"
            value={pdfQuestionCount}
            onChange={(e) => setPdfQuestionCount(Number(e.target.value))}
            className="w-full p-2 sm:p-2.5 rounded-lg border bg-transparent outline-none text-xs sm:text-sm"
            style={{ borderColor, color: textColor }}
            placeholder="Count"
          />

          <button
            onClick={handleGenerateFromPDF}
            disabled={loading || !file}
            className={`w-full px-3 py-2 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm ${loading || !file ? "opacity-50" : ""}`}
            style={{ 
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: "#fff",
            }}
          >
            <i className="fas fa-wand-magic-sparkles mr-1.5"></i> 
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        <textarea
          rows="2"
          value={pdfCommand}
          onChange={(e) => setPdfCommand(e.target.value)}
          placeholder="Custom instructions (optional)"
          className="w-full p-2.5 sm:p-4 rounded-lg border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none text-xs sm:text-sm"
          style={{ borderColor, color: textColor }}
        />
      </div>
    </div>
  );
};

export default QuestionBuilder;