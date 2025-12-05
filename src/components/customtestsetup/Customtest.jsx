// Customtest.jsx - FIXED VERSION (Mobile-First + Correct Background + No Warnings)
import React, { useState, useContext, useEffect, useCallback } from "react";
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
    // ✅ FIXED: Match Dashboard background colors
    bgColor: isDark ? "#000F08" : "#FBFFFE",
    cardBg: isDark ? "#16213e" : "#ffffff",
    textColor: isDark ? "#e4e4e7" : "#1f2937",
    secondaryText: isDark ? "#9ca3af" : "#6b7280",
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

  const loadSavedTestsAndSelectFirst = useCallback(async () => {
    try {
      const response = await getAllCustomTests();
      setSavedTests(response);
      
      if (response && response.length > 0) {
        loadTest(response[0]);
      }
      
      setInitialLoadDone(true);
    } catch (err) {
      console.error('Error loading tests:', err);
      setInitialLoadDone(true);
    }
  }, []);

  useEffect(() => {
    loadSavedTestsAndSelectFirst();
  }, [loadSavedTestsAndSelectFirst]);

  useEffect(() => {
    if (error || successMessage) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, successMessage]);

  const autoSaveTest = useCallback(async () => {
    if (!currentTestId || !testTitle) {
      console.log('Auto-save skipped: No test ID or title');
      return;
    }
    
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
    } catch (err) {
      console.error('❌ Auto-save failed:', err.message);
    }
  }, [currentTestId, testTitle, sets, questions]);

  useEffect(() => {
    if (!currentTestId || !testTitle) return;
    
    if (currentTestId > 999999) {
      console.warn('⚠️ Skipping auto-save: Test ID looks invalid or not yet saved to database');
      return;
    }

    const timer = setTimeout(() => {
      autoSaveTest();
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [questions, sets, currentTestId, testTitle, autoSaveTest]);

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
    } catch (err) {
      console.error('Error generating questions:', err);
      setError(err.message || "Failed to generate questions from PDF.");
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
    } catch (err) {
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

      {/* ✅ TRULY MOBILE-FIRST HEADER */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-10 py-3 px-3 sm:py-6 sm:px-8 backdrop-blur-md"
        style={{
          backgroundColor: isDark ? 'rgba(22, 33, 62, 0.96)' : 'rgba(255, 255, 255, 0.96)',
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              }}
            >
              <i className="fa-solid fa-pen-to-square text-white text-sm sm:text-xl"></i>
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-2xl lg:text-3xl font-bold truncate" style={{ color: textColor }}>
                {currentTestId ? testTitle : "Custom Builder"}
              </h1>
              <p className="text-xs sm:text-sm truncate" style={{ color: secondaryText }}>
                {currentTestId 
                  ? `${getTotalQuestions()} Q • ${sets.length} Sets` 
                  : "Create tests"
                }
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowManageModal(true)}
            className="px-3 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center gap-2 text-sm sm:text-base flex-shrink-0"
            style={{
              background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
              color: "#fff",
            }}
          >
            <i className="fa-solid fa-sliders text-sm sm:text-base"></i>
            <span className="hidden sm:inline">Manage</span>
          </button>
        </div>
      </motion.header>

      {/* ✅ MOBILE-OPTIMIZED NOTIFICATIONS */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 sm:mx-8 mt-4 p-3 sm:p-4 rounded-xl border-l-4 flex items-center justify-between gap-2"
            style={{
              backgroundColor: isDark ? "rgba(239,68,68,0.1)" : "rgba(239,68,68,0.05)",
              borderColor: "#ef4444",
              color: textColor
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <i className="fa-solid fa-exclamation-circle text-red-500 text-sm sm:text-base flex-shrink-0"></i>
              <span className="text-xs sm:text-sm truncate">{error}</span>
            </div>
            <button onClick={() => setError(null)} className="text-red-500 hover:text-red-600 flex-shrink-0">
              <i className="fa-solid fa-times text-sm"></i>
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mx-4 sm:mx-8 mt-4 p-3 sm:p-4 rounded-xl border-l-4 flex items-center justify-between gap-2"
            style={{
              backgroundColor: isDark ? "rgba(34,197,94,0.1)" : "rgba(34,197,94,0.05)",
              borderColor: "#22c55e",
              color: textColor
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <i className="fa-solid fa-check-circle text-green-500 text-sm sm:text-base flex-shrink-0"></i>
              <span className="text-xs sm:text-sm truncate">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-green-500 hover:text-green-600 flex-shrink-0">
              <i className="fa-solid fa-times text-sm"></i>
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

      {/* ✅ MOBILE-FIRST LAYOUT */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-4 sm:mt-8 pb-10">
        {currentTestId ? (
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Question Builder - Full width on mobile, 2/3 on desktop */}
            <div className="w-full lg:w-2/3">
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

            {/* Sidebar - Full width on mobile below, 1/3 on desktop */}
            <div className="w-full lg:w-1/3 space-y-4 sm:space-y-6">
              {/* Set Selector */}
              <div 
                className="p-4 sm:p-6 rounded-2xl transition-all"
                style={{ 
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-lg sm:text-xl font-bold" style={{ color: textColor }}>
                    Question Sets
                  </h3>
                  <button
                    onClick={handleAddSet}
                    className="px-3 py-2 sm:px-4 rounded-xl font-semibold flex items-center gap-2 transition-all hover:scale-105 text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${primaryGradientFrom}, ${primaryGradientTo})`,
                      color: "#fff",
                      boxShadow: isDark ? "0 4px 12px rgba(91,127,245,0.3)" : "0 4px 12px rgba(91,127,245,0.2)",
                    }}
                  >
                    <i className="fas fa-plus" /> <span className="hidden sm:inline">New Set</span>
                  </button>
                </div>

                <select
                  value={selectedSet}
                  onChange={(e) => setSelectedSet(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm sm:text-base"
                  style={{ borderColor, color: textColor }}
                >
                  {sets.map((set) => (
                    <option key={set.id} value={set.id} style={{ backgroundColor: cardBg }}>
                      {set.title}
                    </option>
                  ))}
                </select>

                <div className="mt-3 sm:mt-4 text-xs sm:text-sm" style={{ color: secondaryText }}>
                  <p>Create multiple sets to organize practice topics or exam modes.</p>
                </div>
              </div>

              {/* Questions List */}
              <div 
                className="p-4 sm:p-6 rounded-2xl"
                style={{ 
                  backgroundColor: cardBg,
                  border: `1px solid ${borderColor}`,
                  boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.3)" : "0 4px 16px rgba(0,0,0,0.08)",
                }}
              >
                <h4 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg" style={{ color: textColor }}>
                  Questions in "{(sets.find((s) => s.id === selectedSet) || {}).title || "Set"}"
                </h4>

                {(questions[selectedSet] || []).length === 0 ? (
                  <p className="text-xs sm:text-sm text-center py-6" style={{ color: secondaryText }}>
                    No questions yet. Add questions using the builder or generate from PDF.
                  </p>
                ) : (
                  <ul className="space-y-2 max-h-96 overflow-auto pr-2">
                    {(questions[selectedSet] || []).map((q, idx) => (
                      <li
                        key={idx}
                        className="text-xs sm:text-sm rounded-xl px-3 sm:px-4 py-2 sm:py-3 transition-all hover:scale-[1.01]"
                        style={{
                          backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                          border: `1px solid ${borderColor}`,
                          color: textColor,
                        }}
                      >
                        <span className="font-semibold mr-2">{idx + 1}.</span> 
                        <span className="break-words">{q.question}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-20 px-4">
            <i className="fas fa-clipboard-list text-4xl sm:text-6xl mb-4" style={{ color: primaryGradientFrom }}></i>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4" style={{ color: textColor }}>No Tests Available</h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base" style={{ color: secondaryText }}>Click "Manage" to create your first test</p>
            <button
              onClick={() => setShowManageModal(true)}
              className="px-5 py-3 sm:px-6 rounded-xl font-semibold text-sm sm:text-base"
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