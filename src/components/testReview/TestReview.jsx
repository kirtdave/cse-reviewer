import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { getTestAttemptForReview } from "../../services/testAttemptService";
import { getAllBookmarks } from "../../services/bookmarkService";

// Import sub-components
import ReviewHeader from "./ReviewHeader";
// ✅ REMOVED: PrintHeader import - no longer needed
import SummaryCard from "./SummaryCard";
import FilterButton from "./FilterButton";
import ReviewQuestionCard from "./ReviewQuestionCard";
import StudyModePanel from "./StudyModePanel";

export default function TestReview({ theme = "dark" }) {
  const isDark = theme === "dark";
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMode, setFilterMode] = useState("all");
  
  // Study Mode State
  const [studyMode, setStudyMode] = useState(false);
  const [studyQuestions, setStudyQuestions] = useState([]);
  
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState(new Set());

  useEffect(() => {
    loadTestData();
  }, [attemptId]);

  const loadTestData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [data, allBookmarks] = await Promise.all([
        getTestAttemptForReview(attemptId),
        getAllBookmarks() 
      ]);

      setTestData(data);

      if (allBookmarks && Array.isArray(allBookmarks)) {
        const relevantBookmarks = allBookmarks.filter(
          (bookmark) => bookmark.attemptId === attemptId
        );
        const bookmarkedIndices = new Set(
          relevantBookmarks.map((bookmark) => bookmark.questionIndex)
        );
        setBookmarkedQuestions(bookmarkedIndices);
      }

    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleStartStudyMode = () => {
    const { questions, userAnswers, correctAnswers } = testData;
    
    const wrongQuestions = questions
      .map((q, idx) => ({ question: q, index: idx }))
      .filter(({ index }) => 
        userAnswers[index] !== correctAnswers[index] && 
        userAnswers[index] !== null
      );

    const shuffled = wrongQuestions.sort(() => Math.random() - 0.5);
    
    setStudyQuestions(shuffled);
    setStudyMode(true);
    setFilterMode("all");
  };

  const handleExitStudyMode = () => {
    setStudyMode(false);
    setStudyQuestions([]);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>Loading test review...</p>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-gray-950" : "bg-gray-50"}`}>
        <div className="text-center">
          <i className="fa-solid fa-circle-xmark text-red-500 text-6xl mb-4"></i>
          <p className={`text-xl mb-4 ${isDark ? "text-white" : "text-gray-900"}`}>
            {error || "Test not found"}
          </p>
          <button
            onClick={() => navigate("/history")}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <i className="fa-solid fa-arrow-left mr-2"></i>
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const {
    questions,
    userAnswers,
    correctAnswers,
    score,
    totalQuestions,
    accuracy,
    timeSpent,
    name,
  } = testData;

  const correctCount = userAnswers.filter(
    (ans, idx) => ans === correctAnswers[idx] && ans !== null
  ).length;
  const wrongCount = userAnswers.filter(
    (ans, idx) => ans !== correctAnswers[idx] && ans !== null
  ).length;
  const unansweredCount = userAnswers.filter(
    (ans) => ans === null || ans === undefined
  ).length;

  const displayQuestions = studyMode 
    ? studyQuestions 
    : questions.filter((q, idx) => {
        if (filterMode === "all") return true;
        if (filterMode === "correct")
          return userAnswers[idx] === correctAnswers[idx] && userAnswers[idx] !== null;
        if (filterMode === "wrong")
          return userAnswers[idx] !== correctAnswers[idx] && userAnswers[idx] !== null;
        if (filterMode === "unanswered")
          return userAnswers[idx] === null || userAnswers[idx] === undefined;
        return true;
      }).map((q, idx) => ({ question: q, index: questions.indexOf(q) }));

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-950" : "bg-gray-50"} transition-colors duration-300`}>
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(63,167,214,0.08)_1px,_transparent_1px)] bg-[size:40px_40px]"
        />
      </div>

      {/* Header - No longer needs handlePrint or isPrinting */}
      <ReviewHeader
        name={name}
        score={score}
        totalQuestions={totalQuestions}
        accuracy={accuracy}
        isDark={isDark}
        testData={testData}
        studyMode={studyMode}
        onStartStudyMode={handleStartStudyMode}
        onExitStudyMode={handleExitStudyMode}
        wrongCount={wrongCount}
      />

      {/* ✅ REMOVED: PrintHeader component - no longer needed */}

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        {/* Study Mode Panel */}
        {studyMode && (
          <StudyModePanel 
            totalQuestions={studyQuestions.length}
            currentQuestion={1}
            isDark={isDark}
          />
        )}

        {/* Summary Cards */}
        {!studyMode && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <SummaryCard
              icon="fa-circle-check"
              label="Correct"
              value={correctCount}
              gradient="from-green-500 to-emerald-600"
              isDark={isDark}
            />
            <SummaryCard
              icon="fa-circle-xmark"
              label="Wrong"
              value={wrongCount}
              gradient="from-red-500 to-pink-600"
              isDark={isDark}
            />
            <SummaryCard
              icon="fa-book-open"
              label="Unanswered"
              value={unansweredCount}
              gradient="from-orange-500 to-yellow-600"
              isDark={isDark}
            />
            <SummaryCard
              icon="fa-clock"
              label="Time Spent"
              value={`${timeSpent}m`}
              gradient="from-blue-500 to-purple-600"
              isDark={isDark}
            />
          </div>
        )}

        {/* Filter Buttons */}
        {!studyMode && (
          <div
            className={`flex flex-wrap gap-3 mb-6 p-4 rounded-xl ${
              isDark ? "bg-gray-900/60" : "bg-white/60"
            } backdrop-blur-xl border ${
              isDark ? "border-gray-800" : "border-gray-200"
            } shadow-sm`}
          >
            <div className="flex items-center gap-2 mr-4">
              <i className="fa-solid fa-filter text-blue-500"></i>
              <span className={`font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                Filter Questions:
              </span>
            </div>
            <FilterButton
              active={filterMode === "all"}
              onClick={() => setFilterMode("all")}
              label="All Questions"
              count={questions.length}
              gradient="from-purple-500 to-pink-600"
              isDark={isDark}
            />
            <FilterButton
              active={filterMode === "correct"}
              onClick={() => setFilterMode("correct")}
              label="Correct"
              count={correctCount}
              gradient="from-green-500 to-emerald-600"
              isDark={isDark}
            />
            <FilterButton
              active={filterMode === "wrong"}
              onClick={() => setFilterMode("wrong")}
              label="Wrong"
              count={wrongCount}
              gradient="from-red-500 to-pink-600"
              isDark={isDark}
            />
            <FilterButton
              active={filterMode === "unanswered"}
              onClick={() => setFilterMode("unanswered")}
              label="Unanswered"
              count={unansweredCount}
              gradient="from-orange-500 to-yellow-600"
              isDark={isDark}
            />
          </div>
        )}

        {/* Questions Review */}
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {displayQuestions.map(({ question, index: originalIdx }, idx) => {
              const userAnswer = userAnswers[originalIdx];
              const correctAnswer = correctAnswers[originalIdx];
              const isCorrect = userAnswer === correctAnswer && userAnswer !== null;
              const isUnanswered = userAnswer === null || userAnswer === undefined;

              return (
                <ReviewQuestionCard
                  key={`${studyMode ? 'study' : 'normal'}-${originalIdx}`}
                  question={question}
                  questionNumber={originalIdx + 1}
                  userAnswer={userAnswer}
                  correctAnswer={correctAnswer}
                  isCorrect={isCorrect}
                  isUnanswered={isUnanswered}
                  isDark={isDark}
                  index={idx}
                  attemptId={attemptId}
                  questionIndex={originalIdx}
                  initialBookmarked={bookmarkedQuestions.has(originalIdx)}
                  theme={theme}
                />
              );
            })}
          </AnimatePresence>
        </div>

        {displayQuestions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <i className={`fa-solid fa-inbox text-6xl mb-4 ${isDark ? "text-gray-700" : "text-gray-300"}`}></i>
            <p className={`text-lg ${isDark ? "text-gray-500" : "text-gray-600"}`}>
              {studyMode ? "No wrong answers to study!" : "No questions match this filter"}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}