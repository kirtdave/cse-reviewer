import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Eye, Sparkles, Flag } from "lucide-react";

export default function QuestionDetailsModal({ bookmark, isDark, onClose, onViewFullTest, onAskAI }) {
  const [showReportModal, setShowReportModal] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-3 lg:p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-xl lg:rounded-2xl ${
            isDark ? "bg-gray-900" : "bg-white"
          } shadow-2xl border ${isDark ? "border-gray-800" : "border-gray-200"}`}
        >
          {/* Header */}
          <div className={`sticky top-0 z-10 p-3 sm:p-4 lg:p-6 border-b ${
            isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
          }`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-2 flex-wrap">
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                    bookmark.isCorrect
                      ? "bg-green-500/20 text-green-500"
                      : "bg-red-500/20 text-red-500"
                  }`}>
                    {bookmark.isCorrect ? "✓ Correct" : "✗ Wrong"}
                  </span>
                  <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-semibold ${
                    isDark ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-700"
                  }`}>
                    {bookmark.category}
                  </span>
                </div>
                <h2 className={`text-base sm:text-lg lg:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
                  Question Details
                </h2>
                <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"} truncate`}>
                  From: {bookmark.attemptName}
                </p>
              </div>
              <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 ${
                  isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <X size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-3 sm:p-4 lg:p-6 space-y-3 sm:space-y-4 lg:space-y-6">
            {/* Question */}
            <div>
              <h3 className={`text-[10px] sm:text-xs lg:text-sm font-semibold mb-2 uppercase ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}>
                QUESTION
              </h3>
              <p className={`text-sm sm:text-base lg:text-lg leading-relaxed ${isDark ? "text-white" : "text-gray-900"}`}>
                {bookmark.questionText}
              </p>
            </div>

            {/* Options */}
            <QuestionOptions 
              bookmark={bookmark}
              isDark={isDark}
            />

            {/* Action Buttons - Mobile Optimized */}
            <div className={`flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              {/* Primary Action - AI Help */}
              <button
                onClick={onAskAI}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg bg-gradient-to-r from-purple-500 to-pink-600 text-white text-sm sm:text-base font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles size={16} className="sm:w-[18px] sm:h-[18px]" />
                Ask AI for Help
              </button>

              {/* Secondary Actions - Stack on mobile, row on desktop */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={onViewFullTest}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all ${
                    isDark
                      ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30"
                      : "bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-200"
                  }`}
                >
                  <Eye size={14} className="inline mr-2 sm:w-4 sm:h-4" />
                  View Full Test
                </button>
                <button
                  onClick={() => setShowReportModal(true)}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all ${
                    isDark
                      ? "bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200 border border-orange-200"
                  }`}
                >
                  <Flag size={14} className="inline mr-2 sm:w-4 sm:h-4" />
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <ReportQuestionModal
            bookmark={bookmark}
            isDark={isDark}
            onClose={() => setShowReportModal(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Report Question Modal Component - Mobile Optimized
function ReportQuestionModal({ bookmark, isDark, onClose }) {
  const [reportData, setReportData] = useState({
    issueType: '',
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

    if (!reportData.issueType || !reportData.description) {
      setErrorMessage('Please select an issue type and provide a description');
      setTimeout(() => setErrorMessage(''), 3000);
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
            questionId: bookmark.questionId,
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
      className="fixed inset-0 z-[60] flex items-center justify-center p-3 lg:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-sm sm:max-w-md max-h-[92vh] sm:max-h-[90vh] overflow-y-auto rounded-xl lg:rounded-2xl ${
          isDark ? "bg-gray-900" : "bg-white"
        } shadow-2xl border ${isDark ? "border-gray-800" : "border-gray-200"} p-3 sm:p-4 lg:p-6`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h3 className={`text-base sm:text-lg lg:text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              Report Issue
            </h3>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Help us improve quality
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 sm:p-2 rounded-lg transition-all flex-shrink-0 ${
              isDark ? "hover:bg-gray-800 text-gray-400" : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-500 text-xs sm:text-sm"
          >
            {successMessage}
          </motion.div>
        )}

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 sm:mb-4 p-2.5 sm:p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-500 text-xs sm:text-sm"
          >
            {errorMessage}
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Issue Type */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}>
              Issue Type
            </label>
            <select
              value={reportData.issueType}
              onChange={(e) => setReportData({ ...reportData, issueType: e.target.value })}
              disabled={isSubmitting}
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white"
                  : "bg-white border-gray-300 text-gray-900"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all disabled:opacity-50`}
              required
            >
              <option value="">Select issue type</option>
              {issueTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${
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
              className={`w-full px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border ${
                isDark
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              } focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none disabled:opacity-50`}
              required
            />
          </div>

          {/* Question Preview */}
          <div className={`p-2.5 sm:p-3 rounded-lg ${
            isDark ? "bg-gray-800/50" : "bg-gray-50"
          }`}>
            <p className={`text-[10px] sm:text-xs font-semibold mb-1 uppercase ${
              isDark ? "text-gray-400" : "text-gray-600"
            }`}>
              QUESTION:
            </p>
            <p className={`text-xs sm:text-sm line-clamp-2 ${isDark ? "text-gray-300" : "text-gray-700"}`}>
              {bookmark.questionText}
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className={`w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl font-medium transition-all ${
                isDark
                  ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:flex-1 px-3 sm:px-4 py-2 sm:py-2.5 lg:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-sm"></i>
                  <span className="hidden sm:inline">Submitting...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <Flag size={14} className="sm:w-4 sm:h-4" />
                  Submit
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Component to fetch and display question options - Mobile Optimized
function QuestionOptions({ bookmark, isDark }) {
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
      const userAnswer = data.userAnswers[bookmark.questionIndex];
      const correctAnswer = data.correctAnswers[bookmark.questionIndex];

      setQuestionData({
        options: question.options || [],
        explanation: question.explanation,
        userAnswer,
        correctAnswer
      });
    } catch (error) {
      console.error('Error fetching question details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6 sm:py-8">
        <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!questionData || !questionData.options.length) {
    return null;
  }

  return (
    <>
      {/* Answer Choices */}
      <div>
        <h3 className={`text-[10px] sm:text-xs lg:text-sm font-semibold mb-2 sm:mb-3 uppercase ${
          isDark ? "text-gray-400" : "text-gray-600"
        }`}>
          ANSWER CHOICES
        </h3>
        <div className="space-y-1.5 sm:space-y-2">
          {questionData.options.map((option, idx) => {
            const isUserAnswer = questionData.userAnswer === idx;
            const isCorrectAnswer = questionData.correctAnswer === idx;

            let bgClass = isDark ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200";
            let textClass = isDark ? "text-gray-300" : "text-gray-700";
            let icon = null;

            if (isCorrectAnswer) {
              bgClass = "bg-green-500/20 border-green-500";
              textClass = "text-green-500 font-semibold";
              icon = <i className="fa-solid fa-circle-check text-green-500 text-xs sm:text-sm"></i>;
            } else if (isUserAnswer && !bookmark.isCorrect) {
              bgClass = "bg-red-500/20 border-red-500";
              textClass = "text-red-500 font-semibold";
              icon = <i className="fa-solid fa-circle-xmark text-red-500 text-xs sm:text-sm"></i>;
            }

            return (
              <div
                key={idx}
                className={`flex items-center gap-2 sm:gap-3 px-2.5 sm:px-3 lg:px-4 py-2 sm:py-2.5 lg:py-3 rounded-lg border-2 ${bgClass} transition-all`}
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isCorrectAnswer ? "border-green-500" : isUserAnswer ? "border-red-500" : isDark ? "border-gray-600" : "border-gray-300"
                }`}>
                  {(isCorrectAnswer || isUserAnswer) && (
                    <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full ${isCorrectAnswer ? "bg-green-500" : "bg-red-500"}`} />
                  )}
                </div>
                <span className={`flex-1 text-xs sm:text-sm lg:text-base break-words ${textClass}`}>{option}</span>
                {icon}
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {questionData.explanation && (
        <div className={`p-2.5 sm:p-3 lg:p-4 rounded-lg ${
          isDark ? "bg-blue-500/10 border border-blue-500/30" : "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex items-start gap-2 sm:gap-3">
            <i className="fa-solid fa-lightbulb text-blue-500 text-base sm:text-lg lg:text-xl mt-0.5 sm:mt-1 flex-shrink-0"></i>
            <div className="flex-1 min-w-0">
              <h3 className={`text-[10px] sm:text-xs lg:text-sm font-semibold mb-1.5 sm:mb-2 uppercase ${
                isDark ? "text-blue-400" : "text-blue-700"
              }`}>
                EXPLANATION
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
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