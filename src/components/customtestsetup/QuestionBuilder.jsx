// QuestionBuilder.jsx - SIMPLIFIED (Questions auto-save)
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
        'http://localhost:5000/api/ai/generate-answer-choices',
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
    <div className="max-w-4xl mx-auto">
      <div 
        className="p-8 rounded-2xl transition-all mb-6"
        style={{ 
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>
          Create New Question
        </h2>

        {/* Question Category and Set Selection */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Question Category
            </label>
            <select
              value={questionCategory}
              onChange={(e) => setQuestionCategory(e.target.value)}
              className="w-full p-3 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
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
            <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
              Add to Set
            </label>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(Number(e.target.value))}
              className="w-full p-3 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
              style={{ borderColor, color: textColor }}
            >
              {sets.map((set) => (
                <option key={set.id} value={set.id} style={{ backgroundColor: cardBg }}>
                  {set.title} ({(questions[set.id] || []).length} questions)
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Question Text */}
        <div className="mb-6">
          <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            Question Text
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full p-4 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            rows="4"
            placeholder="Type your question here..."
            style={{ borderColor, color: textColor }}
          />
        </div>

        {/* Multiple Choice Options */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="flex items-center gap-4">
            <label className="font-semibold text-sm" style={{ color: textColor }}>
              Answer Choices:
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: textColor }}>
                <input
                  type="radio"
                  name="choiceMode"
                  value="manual"
                  checked={choiceMode === "manual"}
                  onChange={() => setChoiceMode("manual")}
                  className="w-4 h-4 accent-blue-500"
                />
                Manual
              </label>
              <label className="flex items-center gap-2 cursor-pointer" style={{ color: textColor }}>
                <input
                  type="radio"
                  name="choiceMode"
                  value="ai"
                  checked={choiceMode === "ai"}
                  onChange={() => setChoiceMode("ai")}
                  className="w-4 h-4 accent-blue-500"
                />
                AI Generate
              </label>
            </div>
          </div>

          {choiceMode === "ai" && (
            <button
              disabled={loadingAI || !questionText.trim()}
              onClick={handleAIGenerateChoices}
              className={`px-5 py-2 rounded-xl font-semibold transition-all ${loadingAI || !questionText.trim() ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
              style={{ 
                background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                color: "#fff",
                boxShadow: isDark ? "0 4px 12px rgba(91,127,245,0.3)" : "0 4px 12px rgba(91,127,245,0.2)",
              }}
            >
              {loadingAI ? "Generating..." : "Generate with AI"}
            </button>
          )}
        </div>

        {choiceMode === "manual" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {choices.map((choice, index) => (
              <div key={index}>
                <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
                  Choice {String.fromCharCode(65 + index)}
                </label>
                <input
                  type="text"
                  value={choice}
                  onChange={(e) => {
                    const updated = [...choices];
                    updated[index] = e.target.value;
                    setChoices(updated);
                  }}
                  className="w-full p-3 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                  style={{ borderColor, color: textColor }}
                  placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
                />
              </div>
            ))}
          </div>
        ) : (
          <div 
            className="mb-6 p-4 rounded-xl"
            style={{ 
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
              border: `1px solid ${borderColor}`
            }}
          >
            {choices.some((c) => c.trim() !== "") ? (
              <ul className="space-y-2">
                {choices.map((c, i) => (
                  c.trim() && (
                    <li key={i} style={{ color: textColor }}>
                      <span className="font-semibold mr-2">{String.fromCharCode(65 + i)}.</span>
                      {c}
                    </li>
                  )
                ))}
              </ul>
            ) : (
              <p className="text-sm" style={{ color: secondaryText }}>
                Click "Generate with AI" to populate options and explanation.
              </p>
            )}
          </div>
        )}

        {/* Correct Answer Selection */}
        <div className="mb-6">
          <label className="text-sm font-semibold mb-2 block" style={{ color: textColor }}>
            Correct Answer
          </label>
          <select
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            className="w-full p-3 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
            style={{ borderColor, color: textColor }}
          >
            <option value="A" style={{ backgroundColor: cardBg }}>A</option>
            <option value="B" style={{ backgroundColor: cardBg }}>B</option>
            <option value="C" style={{ backgroundColor: cardBg }}>C</option>
            <option value="D" style={{ backgroundColor: cardBg }}>D</option>
          </select>
        </div>

        {/* Explanation */}
        <div className="mb-6">
          <label className="text-sm font-semibold mb-2 flex items-center gap-2" style={{ color: textColor }}>
            Explanation
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="w-full p-4 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            rows="3"
            placeholder={choiceMode === "ai" ? "AI will generate explanation..." : "Explain why this is the correct answer..."}
            style={{ borderColor, color: textColor }}
            readOnly={choiceMode === "ai" && loadingAI}
          />
        </div>

        {/* Add Question Button */}
        <button
          onClick={handleAddQuestion}
          className="w-full px-6 py-4 rounded-xl font-bold text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          style={{ 
            background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
            color: "#fff",
            boxShadow: isDark ? "0 4px 16px rgba(91,127,245,0.4)" : "0 4px 16px rgba(91,127,245,0.3)",
          }}
        >
          <i className="fas fa-plus-circle" />
          Add Question (Auto-Saves)
        </button>
      </div>

      {/* PDF Generation */}
      <div 
        className="p-8 rounded-2xl"
        style={{ 
          backgroundColor: cardBg,
          border: `1px solid ${borderColor}`,
          boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
        }}
      >
        <h3 className="font-bold mb-4 flex items-center gap-2 text-xl" style={{ color: textColor }}>
          <i className="fas fa-file-pdf text-red-500" /> Extract Questions from PDF
        </h3>

        <div className="flex items-center gap-3 mb-4">
          <input 
            ref={fileInputRef} 
            onChange={onLocalFileChange} 
            accept="application/pdf" 
            type="file" 
            className="hidden" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-3 rounded-xl border transition-all hover:scale-105 font-semibold"
            style={{ 
              borderColor, 
              color: textColor,
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"
            }}
          >
            <i className="fas fa-upload mr-2" /> {file ? "Replace PDF" : "Upload PDF"}
          </button>

          {file && (
            <button
              onClick={() => handleFileUpload(null)}
              className="px-4 py-3 rounded-xl transition-all hover:scale-105 font-semibold"
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
          <div className="mb-4 text-sm p-3 rounded-xl flex items-center gap-2" style={{ 
            backgroundColor: isDark ? "rgba(91,127,245,0.1)" : "rgba(91,127,245,0.05)",
            color: textColor,
            border: `1px solid ${borderColor}`
          }}>
            <i className="fas fa-file-pdf text-red-500" />
            <span>Selected: <span className="font-semibold">{file.name}</span></span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <select
            value={pdfQuestionCategory}
            onChange={(e) => setPdfQuestionCategory(e.target.value)}
            className="p-3 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
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
            className="p-3 rounded-xl border bg-transparent outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor, color: textColor }}
            placeholder="Number of questions"
          />

          <button
            onClick={handleGenerateFromPDF}
            disabled={loading || !file}
            className={`px-4 py-3 rounded-xl font-semibold transition-all ${loading || !file ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
            style={{ 
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: "#fff",
            }}
          >
            <i className="fas fa-wand-magic-sparkles mr-2" /> 
            {loading ? "Generating..." : "Generate"}
          </button>
        </div>

        <textarea
          rows="3"
          value={pdfCommand}
          onChange={(e) => setPdfCommand(e.target.value)}
          placeholder="e.g., Focus on Philippine Constitution topics"
          className="w-full p-4 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          style={{ borderColor, color: textColor }}
        />
      </div>
    </div>
  );
};

export default QuestionBuilder;