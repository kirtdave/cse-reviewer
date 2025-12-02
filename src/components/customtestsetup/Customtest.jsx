// Customtest.jsx - FIXED VERSION
import React, { useState, useContext, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "@fortawesome/fontawesome-free/css/all.min.css";
import QuestionBuilder from "./QuestionBuilder";
import ManageModal from "./ManageModal";
import { ThemeContext } from "../aaGLOBAL/ThemeContext";
import { 
  createCustomTest, 
  updateCustomTest, 
  getAllCustomTests,
  generateQuestionsFromPDF,
  deleteCustomTest 
} from "../../services/customTestService";

const getPalette = (theme = "dark") => {
  const isDark = theme === "dark";
  return {
    isDark,
    bgColor: isDark ? "#1a1a2e" : "#f5f7fa",
    cardBg: isDark ? "#16213e" : "#ffffff",
    textColor: isDark ? "#e4e4e7" : "#1f2937",
    secondaryText: isDark ? "#9ca3af" : "#6b7280",
    accentColor: "#5b7ff5",
    primaryGradientFrom: "#5b7ff5",
    primaryGradientTo: "#a855f7",
    borderColor: isDark ? "#2d3748" : "#e5e7eb",
  };
};

const Customtest = () => {
  const { theme } = useContext(ThemeContext);
  
  const [sets, setSets] = useState([{ id: 1, title: "Set 1" }]);
  const [selectedSet, setSelectedSet] = useState(1);
  const [questions, setQuestions] = useState({});
  const [file, setFile] = useState(null);
  const [pdfQuestionCategory, setPdfQuestionCategory] = useState("Verbal Ability");
  const [pdfQuestionCount, setPdfQuestionCount] = useState(10);
  const [pdfCommand, setPdfCommand] = useState("");
  const [testTitle, setTestTitle] = useState("");
  const [currentTestId, setCurrentTestId] = useState(null);
  const [savedTests, setSavedTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const palette = getPalette(theme);
  const { isDark, bgColor, cardBg, textColor, secondaryText, primaryGradientFrom, primaryGradientTo, borderColor } = palette;

  useEffect(() => {
    loadSavedTestsAndSelectFirst();
  }, []);

  const loadSavedTestsAndSelectFirst = async () => {
    try {
      const response = await getAllCustomTests();
      setSavedTests(response);
      
      if (response && response.length > 0) {
        loadTest(response[0]);
      }
      
      setInitialLoadDone(true);
    } catch (error) {
      console.error('Error loading tests:', error);
      setInitialLoadDone(true);
    }
  };

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  // ✅ FIXED: Add validation to prevent auto-save with invalid IDs
  useEffect(() => {
    // Only auto-save if we have a VALID test ID (not a timestamp)
    // Database IDs are typically small integers (1, 2, 3, etc.)
    // Timestamps are 13 digits (e.g., 1764641666076)
    if (!currentTestId || !testTitle) return;
    
    // Skip auto-save if ID looks like a timestamp (probably not saved to DB yet)
    if (currentTestId > 999999) {
      console.warn('⚠️ Skipping auto-save: Test ID looks invalid or not yet saved to database');
      return;
    }

    const timer = setTimeout(() => {
      autoSaveTest();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [questions, sets, currentTestId, testTitle]);

  // ✅ FIXED: Add validation in autoSaveTest function
  const autoSaveTest = async () => {
    // Safety checks
    if (!currentTestId || !testTitle) {
      console.log('Auto-save skipped: No test ID or title');
      return;
    }
    
    // Validate ID format
    if (currentTestId > 999999) {
      console.warn('Auto-save skipped: Invalid test ID format');
      return;
    }

    const transformedSets = sets.map(set => ({
      id: set.id,
      title: set.title,
      questions: (questions[set.id] || [])
    }));

    const allQuestions = transformedSets.flatMap(set => set.questions);
    if (allQuestions.length === 0) {
      console.log('Auto-save skipped: No questions to save');
      return;
    }

    const categoryCounts = {};
    allQuestions.forEach(q => {
      categoryCounts[q.category] = (categoryCounts[q.category] || 0) + 1;
    });
    const detectedCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b
    );

    try {
      console.log('🔄 Auto-saving test ID:', currentTestId);
      
      await updateCustomTest(currentTestId, {
        title: testTitle,
        description: "",
        sets: transformedSets,
        category: detectedCategory || "Custom",
        difficulty: "Mixed",
        timeLimit: null,
        isPublic: false
      });
      
      console.log('✅ Auto-saved successfully');
    } catch (error) {
      console.error('❌ Auto-save failed:', error.message);
      // Don't show error to user for auto-save failures
      // They'll see errors when manually saving
    }
  };

  const handleAddSet = () => {
    const newSetId = Math.max(...sets.map(s => s.id), 0) + 1;
    const newSet = { id: newSetId, title: `Set ${newSetId}` };
    setSets((s) => [...s, newSet]);
    setSelectedSet(newSet.id);
    setSuccessMessage(`Created ${newSet.title}`);
  };

  const handleRenameSet = (setId, newTitle) => {
    setSets((prevSets) => 
      prevSets.map(set => 
        set.id === setId ? { ...set, title: newTitle } : set
      )
    );
  };

  const handleDeleteSet = (setId) => {
    if (sets.length === 1) {
      setError("Cannot delete the last set");
      return;
    }
    
    setSets((prevSets) => prevSets.filter(set => set.id !== setId));
    
    setQuestions((prev) => {
      const newQuestions = { ...prev };
      delete newQuestions[setId];
      return newQuestions;
    });
    
    if (selectedSet === setId) {
      setSelectedSet(sets[0].id === setId ? sets[1].id : sets[0].id);
    }
    
    setSuccessMessage("Set deleted");
  };

  const handleFileUpload = (fileObj) => {
    if (!fileObj) {
      setFile(null);
      return;
    }
    if (fileObj.type !== "application/pdf") {
      setError("Please upload a valid PDF file.");
      return;
    }
    setFile(fileObj);
    setSuccessMessage(`Uploaded: ${fileObj.name}`);
  };

  const handleGenerateFromPDF = async () => {
    if (!file) {
      setError("Please upload a PDF first.");
      return;
    }

    setLoading(true);
    
    try {
      const result = await generateQuestionsFromPDF(
        file,
        pdfQuestionCategory,
        pdfQuestionCount,
        pdfCommand
      );

      if (result.success && result.questions && result.questions.length > 0) {
        setQuestions((prev) => ({
          ...prev,
          [selectedSet]: [...(prev[selectedSet] || []), ...result.questions],
        }));
        
        setSuccessMessage(`Added ${result.questions.length} questions!`);
        setFile(null);
        setPdfCommand("");
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      setError(error.message || "Failed to generate questions from PDF.");
    } finally {
      setLoading(false);
    }
  };

  const loadTest = (test) => {
    setTestTitle(test.title);
    setCurrentTestId(test.id);
    
    const setsArray = Array.isArray(test.sets) ? test.sets : [];
    
    const loadedSets = setsArray.length > 0 
      ? setsArray.map(set => ({
          id: set.id,
          title: set.title
        }))
      : [{ id: 1, title: "Set 1" }];
    
    setSets(loadedSets);

    const loadedQuestions = {};
    setsArray.forEach(set => {
      loadedQuestions[set.id] = Array.isArray(set.questions) ? set.questions : [];
    });
    setQuestions(loadedQuestions);

    if (loadedSets.length > 0) {
      setSelectedSet(loadedSets[0].id);
    }

    setSuccessMessage(`Loaded: ${test.title}`);
  };

  const handleDeleteTest = async (testId) => {
    if (!window.confirm("Delete this test permanently?")) return;

    try {
      await deleteCustomTest(testId);
      
      const response = await getAllCustomTests();
      setSavedTests(response);
      
      if (currentTestId === testId) {
        if (response && response.length > 0) {
          loadTest(response[0]);
        } else {
          setTestTitle("");
          setCurrentTestId(null);
          setSets([{ id: 1, title: "Set 1" }]);
          setQuestions({});
        }
      }
      
      setSuccessMessage("Test deleted");
    } catch (error) {
      setError("Failed to delete test");
    }
  };

  const getTotalQuestions = () => {
    return Object.values(questions).reduce((sum, qs) => sum + (qs?.length || 0), 0);
  };

  if (!initialLoadDone) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: bgColor }}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl mb-4" style={{ color: primaryGradientFrom }}></i>
          <p style={{ color: textColor }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen transition-colors duration-500 font-sans relative"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(91,127,245,0.1)_1px,_transparent_1px)] bg-[size:30px_30px]" />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 py-6 px-8 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center"
        style={{
          backgroundColor: cardBg,
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              boxShadow: isDark ? "0 4px 12px rgba(91,127,245,0.3)" : "0 4px 12px rgba(91,127,245,0.2)",
            }}
          >
            <i className="fa-solid fa-pen-to-square text-white text-xl"></i>
          </motion.div>

          <div>
            <h1 className="text-2xl lg:text-3xl font-bold" style={{ color: textColor }}>
              Custom Questionnaire Builder
            </h1>
            <p className="text-sm mt-1" style={{ color: secondaryText }}>
              {currentTestId 
                ? `Editing: ${testTitle} • ${getTotalQuestions()} questions in ${sets.length} ${sets.length === 1 ? 'set' : 'sets'}` 
                : "Create and manage question sets or upload a PDF for AI-assisted generation"
              }
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowManageModal(true)}
          className="px-6 py-3 rounded-xl font-semibold transition-all hover:scale-105 flex items-center gap-2"
          style={{
            background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
            color: "#fff",
            boxShadow: isDark ? "0 4px 12px rgba(91,127,245,0.3)" : "0 4px 12px rgba(91,127,245,0.2)",
          }}
        >
          <i className="fa-solid fa-sliders"></i>
          <span>Manage</span>
        </button>
      </motion.header>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-8 mt-4 p-4 rounded-xl border-l-4 flex items-center justify-between"
            style={{
              backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)",
              borderColor: "#ef4444",
              color: textColor
            }}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-exclamation-circle text-red-500"></i>
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-600">
              <i className="fa-solid fa-times"></i>
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-8 mt-4 p-4 rounded-xl border-l-4 flex items-center justify-between"
            style={{
              backgroundColor: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.05)",
              borderColor: "#22c55e",
              color: textColor
            }}
          >
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-check-circle text-green-500"></i>
              <span>{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-600">
              <i className="fa-solid fa-times"></i>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showManageModal && (
        <ManageModal
          sets={sets}
          questions={questions}
          testTitle={testTitle}
          savedTests={savedTests}
          currentTestId={currentTestId}
          theme={theme}
          onClose={() => setShowManageModal(false)}
          onRenameSet={handleRenameSet}
          onDeleteSet={handleDeleteSet}
          onAddSet={handleAddSet}
          onLoadTest={loadTest}
          onDeleteTest={handleDeleteTest}
          setQuestions={setQuestions}
          setSelectedSet={setSelectedSet}
          setSavedTests={setSavedTests}
        />
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-10">
        {currentTestId ? (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3 w-full">
              <QuestionBuilder
                theme={theme}
                sets={sets}
                selectedSet={selectedSet}
                setSelectedSet={setSelectedSet}
                setQuestions={setQuestions}
                questions={questions}
                handleAddSet={handleAddSet}
                handleFileUpload={handleFileUpload}
                file={file}
                pdfQuestionCategory={pdfQuestionCategory}
                setPdfQuestionCategory={setPdfQuestionCategory}
                pdfQuestionCount={pdfQuestionCount}
                setPdfQuestionCount={setPdfQuestionCount}
                pdfCommand={pdfCommand}
                setPdfCommand={setPdfCommand}
                handleGenerateFromPDF={handleGenerateFromPDF}
                loading={loading}
                setSuccessMessage={setSuccessMessage}
              />
            </div>

            <div className="lg:w-1/3 w-full space-y-6">
              {/* Set Selector */}
              <div 
                className="p-6 rounded-2xl transition-all"
                style={{ 
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold" style={{ color: textColor }}>
                    Question Sets
                  </h3>
                  <button
                    onClick={handleAddSet}
                    className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                      color: "#fff",
                      boxShadow: isDark ? "0 4px 12px rgba(91,127,245,0.3)" : "0 4px 12px rgba(91,127,245,0.2)",
                    }}
                  >
                    <i className="fas fa-plus" /> New Set
                  </button>
                </div>

                <select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  style={{ borderColor, color: textColor }}
                >
                  {sets.map((set) => (
                    <option key={set.id} value={set.id} style={{ backgroundColor: cardBg }}>
                      {set.title}
                    </option>
                  ))}
                </select>

                <div className="mt-4 text-sm" style={{ color: secondaryText }}>
                  <p>Create multiple sets to organize practice topics or exam modes.</p>
                </div>
              </div>

              {/* Questions List */}
              <div 
                className="p-6 rounded-2xl"
                style={{ 
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <h4 className="font-semibold mb-4 text-lg" style={{ color: textColor }}>
                  Questions in "{(sets.find((s) => s.id === selectedSet) || {}).title || "Set"}"
                </h4>

                {(questions[selectedSet] || []).length === 0 ? (
                  <p className="text-sm" style={{ color: secondaryText }}>
                    No questions yet. Add questions using the builder or generate from PDF.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-auto pr-2">
                    {(questions[selectedSet] || []).map((q, idx) => (
                      <li
                        key={idx}
                        className="text-sm rounded-xl px-4 py-3 transition-all hover:scale-[1.01]"
                        style={{
                          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                      >
                        <span className="font-semibold mr-2">{idx + 1}.</span> {q.question}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <i className="fas fa-clipboard-list text-6xl mb-4" style={{ color: primaryGradientFrom }}></i>
            <h2 className="text-2xl font-bold mb-4" style={{ color: textColor }}>No Tests Available</h2>
            <p className="mb-6" style={{ color: secondaryText }}>Click "Manage" to create your first test</p>
            <button
              onClick={() => setShowManageModal(true)}
              className="px-6 py-3 rounded-xl font-semibold"
              style={{
                background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                color: "#fff"
              }}
            >
              <i className="fas fa-sliders mr-2"></i> Open Manage Panel
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Customtest;