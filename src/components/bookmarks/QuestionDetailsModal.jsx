import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Sparkles, Flag } from "lucide-react";

export default function QuestionDetailsModal({ bookmark, isDark, onClose, onViewFullTest, onAskAI }) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [fetchedQuestionId, setFetchedQuestionId] = useState(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Helper to safely get the ID
  const activeQuestionId = fetchedQuestionId || bookmark.questionId || bookmark.id;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-md rounded-xl sm:rounded-2xl ${
            isDark ? "bg-gray-900" : "bg-white"
          } shadow-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} overflow-hidden`}
        >
          {/* Header */}
          <div className={`p-2 sm:p-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
            <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  bookmark.isCorrect
                    ? "bg-green-500/20 text-green-500"
                    : "bg-red-500/20 text-red-500"
                }`}>
                  {bookmark.isCorrect ? "✓ Correct" : "✗ Wrong"}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                  isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                }`}>
                  {bookmark.category}
                </span>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                  isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <X size={18} />
              </button>
            </div>
            <h2 className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Question Details
            </h2>
            <p className={`text-[10px] sm:text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
              From: {bookmark.attemptName}
            </p>
          </div>

          {/* Content */}
          <div className="p-2 sm:p-3 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
            <div className="mb-2 sm:mb-3">
              <h3 className={`text-[10px] font-semibold mb-1 sm:mb-1.5 uppercase ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                QUESTION
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? "text-white" : "text-gray-900"}`}>
                {bookmark.questionText}
              </p>
            </div>

            <QuestionOptions 
              bookmark={bookmark}
              isDark={isDark}
              onDetailsLoaded={(id) => {
                setFetchedQuestionId(id);
                setIsLoadingDetails(false);
              }}
              onError={() => setIsLoadingDetails(false)}
            />
          </div>

          {/* Footer */}
          <div className={`p-2 sm:p-3 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <button
              onClick={onAskAI}
              className="w-full px-3 py-2 sm:py-2.5 mb-1.5 sm:mb-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs sm:text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Sparkles size={16} />
              Ask AI for Help
            </button>

            <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
              <button
                onClick={onViewFullTest}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs ${
                  isDark
                    ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                }`}
              >
                <Eye size={14} className="inline mr-1" />
                View Test
              </button>
              
              <button
                onClick={() => setShowReportModal(true)}
                disabled={isLoadingDetails && !activeQuestionId}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all text-xs flex items-center justify-center ${
                  isDark
                    ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    : "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {isLoadingDetails && !activeQuestionId ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Loading...
                  </>
                ) : (
                  <>
                    <Flag size={14} className="inline mr-1" />
                    Report
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportQuestionModal
            bookmark={bookmark}
            realQuestionId={activeQuestionId}
            isDark={isDark}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Report Question Modal Component
function ReportQuestionModal({ bookmark, realQuestionId, isDark, onClose }) {
  const [reportData, setReportData] = useState({
    issueType: 'wrong_answer', 
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const issueTypes = [
    { value: 'wrong_answer', label: 'Wrong Answer/Explanation' },
    { value: 'typo', label: 'Typo or Grammar Error' },
    { value: 'unclear', label: 'Unclear Question' },
    { value: 'duplicate', label: 'Duplicate Question' },
    { value: 'outdated', label: 'Outdated Information' },
    { value: 'other', label: 'Other Issue' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!realQuestionId) {
      setErrorMessage('Critical Error: Question ID missing. Please refresh and try again.');
      return;
    }

    if (!reportData.description) {
      setErrorMessage('Please provide a description');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/question-reports`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            questionId: realQuestionId,
            attemptId: bookmark.attemptId,
            questionText: bookmark.questionText,
            category: bookmark.category,
            issueType: reportData.issueType,
            description: reportData.description
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit report');
      }

      setSuccessMessage('✅ Report submitted successfully!');
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(`❌ ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-xl sm:rounded-2xl ${
          isDark ? "bg-gray-900" : "bg-white"
        } shadow-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} overflow-hidden`}
      >
        <div className={`p-2 sm:p-3 border-b ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className={`text-sm sm:text-base font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                Report Issue
              </h3>
              <p className={`text-[10px] sm:text-xs mt-0.5 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                Help us improve quality
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-all flex-shrink-0 ${
                isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
              }`}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-2 sm:p-3 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 sm:mb-3 p-2 sm:p-2.5 rounded-lg bg-green-500/10 border border-green-500 text-green-500 text-xs"
            >
              {successMessage}
            </motion.div>
          )}

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-2 sm:mb-3 p-2 sm:p-2.5 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-xs"
            >
              {errorMessage}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
            <div>
              <label className={`block text-[10px] sm:text-xs font-medium mb-1 sm:mb-1.5 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Issue Type
              </label>
              <select
                value={reportData.issueType}
                onChange={(e) => setReportData({ ...reportData, issueType: e.target.value })}
                disabled={isSubmitting}
                className={`w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white"
                    : "bg-white border-gray-300 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:opacity-50`}
              >
                {issueTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`block text-[10px] sm:text-xs font-medium mb-1 sm:mb-1.5 ${
                isDark ? "text-gray-300" : "text-gray-700"
              }`}>
                Description
              </label>
              <textarea
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                disabled={isSubmitting}
                rows={3}
                placeholder="Describe the issue..."
                className={`w-full px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg border ${
                  isDark
                    ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none disabled:opacity-50`}
              />
            </div>

            <div className={`p-2 sm:p-2.5 rounded-lg ${
              isDark ? "bg-gray-800/50" : "bg-gray-50"
            }`}>
              <p className={`text-[10px] font-semibold mb-0.5 sm:mb-1 uppercase ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                QUESTION:
              </p>
              <p className={`text-[10px] sm:text-xs line-clamp-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                {bookmark.questionText}
              </p>
              <p className="text-[9px] sm:text-[10px] mt-0.5 sm:mt-1 opacity-50">
                Ref ID: {realQuestionId || "Searching..."}
              </p>
            </div>
          </form>
        </div>

        <div className={`p-2 sm:p-3 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
          <div className="flex gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg font-medium transition-all ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !realQuestionId}
              onClick={handleSubmit}
              className="flex-1 px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-1 sm:gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xs"></i>
                  Submitting...
                </>
              ) : (
                <>
                  <Flag size={14} />
                  Submit
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function QuestionOptions({ bookmark, isDark, onDetailsLoaded, onError }) {
  const [questionData, setQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchQuestionDetails();
  }, []);

  const fetchQuestionDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/test-attempts/${bookmark.attemptId}/review`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch question details');

      const data = await response.json();
      const question = data.questions[bookmark.questionIndex];
      // ✅ FIX: Ensure these are Integers for comparison
      const userAnswer = parseInt(data.userAnswers[bookmark.questionIndex]);
      const correctAnswer = parseInt(data.correctAnswers[bookmark.questionIndex]);

      const foundId = question.id || question.questionId || question._id;

      if (foundId && onDetailsLoaded) {
        onDetailsLoaded(foundId);
      }

      setQuestionData({
        options: question.options || [],
        explanation: question.explanation,
        userAnswer,
        correctAnswer
      });
    } catch (error) {
      console.error('Error fetching question details:', error);
      if (onError) onError();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="w-6 h-6 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!questionData || !questionData.options.length) {
    return null;
  }

  return (
    <>
      <div className="mb-2 sm:mb-3">
        <h3 className={`text-[10px] font-semibold mb-1 sm:mb-1.5 uppercase ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}>
          ANSWER CHOICES
        </h3>
        <div className="space-y-1 sm:space-y-1.5">
          {questionData.options.map((option, idx) => {
            // ✅ FIX: Strict Number comparison
            const isUserAnswer = Number(questionData.userAnswer) === idx;
            const isCorrectAnswer = Number(questionData.correctAnswer) === idx;

            let bgClass = isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200";
            let textClass = isDark ? "text-gray-300" : "text-gray-700";
            let icon = null;

            if (isCorrectAnswer) {
              bgClass = "bg-green-500/20 border-green-500";
              textClass = "text-green-500 font-semibold";
              icon = <i className="fa-solid fa-circle-check text-green-500 text-xs"></i>;
            } else if (isUserAnswer) {
              bgClass = "bg-red-500/20 border-red-500";
              textClass = "text-red-500 font-semibold";
              icon = <i className="fa-solid fa-circle-xmark text-red-500 text-xs"></i>;
            }

            return (
              <div
                key={idx}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg border-2 ${bgClass} transition-all`}
              >
                <div className={`w-3.5 sm:w-4 h-3.5 sm:h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCorrectAnswer ? "border-green-500" : isUserAnswer ? "border-red-500" : isDark ? "border-gray-600" : "border-gray-300"
                }`}>
                  {(isCorrectAnswer || isUserAnswer) && (
                    <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isCorrectAnswer ? "bg-green-500" : "bg-red-500"}`} />
                  )}
                </div>
                <span className={`flex-1 text-[11px] sm:text-xs ${textClass}`}>{option}</span>
                {icon}
              </div>
            );
          })}
        </div>
      </div>

      {questionData.explanation && (
        <div className={`p-2 sm:p-2.5 rounded-lg ${
          isDark ? "bg-blue-500/10 border border-blue-500/30" : "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-start gap-1.5 sm:gap-2">
            <i className="fa-solid fa-lightbulb text-blue-500 text-xs sm:text-sm mt-0.5 flex-shrink-0"></i>
            <div className="flex-1 min-w-0">
              <h3 className={`text-[10px] font-semibold mb-0.5 sm:mb-1 uppercase ${
                isDark ? "text-blue-400" : "text-blue-700"
              }`}>
                EXPLANATION
              </h3>
              <p className={`text-[11px] sm:text-xs leading-relaxed ${
                isDark ? "text-blue-200" : "text-blue-900"
              }`}>
                {questionData.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}